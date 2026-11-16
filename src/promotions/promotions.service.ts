import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Types } from 'mongoose';
import { PromotionRepository } from './repository/promotion.repository.js';
import { ProductRepository } from '../products/repository/product.repository.js';
import { CategoryRepository } from '../categories/repository/category.repository.js';
import { PricingService } from '../pricing/pricing.service.js';
import { CreatePromotionDto } from './dtos/create-promotion.dto.js';
import { UpdatePromotionDto } from './dtos/update-promotion.dto.js';
import { ApplyQuickDiscountDto, RemoveQuickDiscountDto } from './dtos/quick-discount.dto.js';
import { PromotionResponseDto } from './dtos/promotion-response.dto.js';
import { PaginationDto } from '../common/data-accsess/dto/pagination.dto.js';
import { PaginatedResult } from '../common/data-accsess/base-repository.js';
import { BadRequestException } from '../common/error-handling/custom-excepction/bad-request.exceprions.js';
import { NotFoundException } from '../common/error-handling/custom-excepction/not-found.exception.js';
import { containsRegex } from '../common/utils/regex.util.js';
import { startOfZonedDay, todayStr } from '../common/utils/time.util.js';
import { dateRangeFilter, isPromotionActive } from './promotion-schedule.js';
import { Promotion } from './schema/promotion.schema.js';

const POPULATE = [
  { path: 'categories', select: 'name image' },
  { path: 'products', select: 'title titleAr price imageCover' },
];

@Injectable()
export class PromotionsService {
  constructor(
    private readonly promotionRepository: PromotionRepository,
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly pricing: PricingService,
  ) {}

  private toResponse(doc: any, now = new Date()): PromotionResponseDto {
    const obj = typeof doc?.toObject === 'function' ? doc.toObject() : doc;
    return plainToInstance(
      PromotionResponseDto,
      { ...obj, isRunning: isPromotionActive(obj, now) },
      { excludeExtraneousValues: true },
    );
  }

  /** Validates target/ids/dates of the merged promotion before saving. */
  private async validate(p: Partial<Promotion> & { categories?: any[]; products?: any[] }) {
    const target = p.target ?? 'all';
    if (target === 'category') {
      if (!p.categories?.length) throw new BadRequestException('Choose at least one category for this offer');
      const count = await this.categoryRepository.count({ _id: { $in: p.categories } });
      if (count !== p.categories.length) throw new BadRequestException('Some categories do not exist');
    }
    if (target === 'products') {
      if (!p.products?.length) throw new BadRequestException('Choose at least one item for this offer');
      const count = await this.productRepository.count({ _id: { $in: p.products } });
      if (count !== p.products.length) throw new BadRequestException('Some items do not exist');
    }
    if ((p.startTime && !p.endTime) || (!p.startTime && p.endTime)) {
      throw new BadRequestException('Provide both startTime and endTime, or neither');
    }
    if (p.startTime && p.startTime === p.endTime) {
      throw new BadRequestException('startTime and endTime cannot be equal');
    }
    if (p.startDate && p.endDate && new Date(p.endDate) <= new Date(p.startDate)) {
      throw new BadRequestException('endDate must be after startDate');
    }
  }

  private normalize(dto: Partial<CreatePromotionDto>) {
    const data: Record<string, any> = { ...dto };
    if (dto.title) data.title = dto.title.trim();
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    // Keep only the ids relevant to the chosen target.
    if (dto.target === 'all') Object.assign(data, { categories: [], products: [] });
    if (dto.target === 'category') data.products = [];
    if (dto.target === 'products') data.categories = [];
    // A changed schedule may start a new window that deserves a notification.
    if (['startDate', 'daysOfWeek', 'startTime', 'endTime', 'isActive'].some((k) => k in dto)) {
      data.$unset = { lastNotifiedKey: 1 };
    }
    return data;
  }

  async create(dto: CreatePromotionDto) {
    const data = this.normalize({ ...dto, target: dto.target ?? 'all' });
    delete data.$unset;
    data.startDate ??= new Date();
    await this.validate(data);
    const created = await this.promotionRepository.create(data);
    this.pricing.invalidate();
    return this.toResponse(await created.populate(POPULATE));
  }

  async update(id: string, dto: UpdatePromotionDto) {
    const existing = await this.promotionRepository.model.findById(id).lean();
    if (!existing) throw new NotFoundException(`No promotion found for id: ${id}`);

    const { $unset, ...set } = this.normalize(dto);
    await this.validate({ ...existing, ...set } as any);
    const updated = await this.promotionRepository.model
      .findByIdAndUpdate(id, { $set: set, ...($unset && { $unset }) }, { returnDocument: 'after', runValidators: true })
      .populate(POPULATE);
    this.pricing.invalidate();
    return this.toResponse(updated);
  }

  async delete(id: string) {
    const deleted = await this.promotionRepository.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException(`No promotion found for id: ${id}`);
    this.pricing.invalidate();
  }

  async findById(id: string) {
    const doc = await this.promotionRepository.model.findById(id).populate(POPULATE).lean();
    if (!doc) throw new NotFoundException(`No promotion found for id: ${id}`);
    return this.toResponse(doc);
  }

  async findAll(query: PaginationDto): Promise<PaginatedResult<PromotionResponseDto>> {
    const filter: Record<string, any> = {};
    if (query.keyword) filter.title = containsRegex(query.keyword);
    const result = await this.promotionRepository.findPaginated(filter, {
      page: query.page,
      limit: query.limit,
      ignoreLimit: query.ignoreLimit,
      sort: query.sort,
      populate: POPULATE,
    });
    const now = new Date();
    result.data = result.data.map((p) => this.toResponse(p, now)) as any;
    return result as unknown as PaginatedResult<PromotionResponseDto>;
  }

  /** Offers running right now (home banners / "deals" screen). */
  async getActive() {
    const now = new Date();
    const candidates = await this.promotionRepository.model
      .find(dateRangeFilter(now))
      .populate(POPULATE)
      .sort('-discountPercentage')
      .lean();
    const running = candidates.filter((p) => isPromotionActive(p as any, now)).map((p) => this.toResponse(p, now));
    return { status: 'success', results: running.length, data: running };
  }

  /** "Discount now" button: creates a promotion that starts immediately. */
  async applyQuick(dto: ApplyQuickDiscountDto) {
    const target = dto.target ?? 'all';
    const tomorrow = new Date(startOfZonedDay(todayStr()).getTime() + 24 * 3600 * 1000);
    return this.create({
      title: dto.title ?? `خصم ${dto.discountPercentage}%`,
      discountPercentage: dto.discountPercentage,
      target,
      categories: target === 'category' && dto.categoryId ? [dto.categoryId] : undefined,
      products: target === 'products' ? dto.productIds : undefined,
      endDate: dto.endDate ?? new Date(tomorrow.getTime() - 1000).toISOString(),
    });
  }

  /** Stops the running promotions that match the given target. */
  async removeQuick(dto: RemoveQuickDiscountDto) {
    const filter: Record<string, any> = dateRangeFilter();
    if (dto.target) filter.target = dto.target;
    if (dto.categoryId) filter.categories = new Types.ObjectId(dto.categoryId);
    if (dto.productIds?.length) filter.products = { $in: dto.productIds.map((id) => new Types.ObjectId(id)) };

    // Only stop promotions running *now*; scheduled/recurring ones (e.g. every
    // Friday) are left untouched.
    const now = new Date();
    const candidates = await this.promotionRepository.model.find(filter).lean();
    const running = candidates.filter((p) => isPromotionActive(p, now)).map((p) => p._id);
    const result = await this.promotionRepository.model.updateMany(
      { _id: { $in: running } },
      { $set: { isActive: false, endDate: now } },
    );
    this.pricing.invalidate();
    return { status: 'success', message: 'Discounts stopped', data: { modifiedCount: result.modifiedCount } };
  }
}
