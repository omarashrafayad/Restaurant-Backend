import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ProductRepository } from '../repository/product.repository.js';
import { ProductResponseDto } from '../dtos/product-response.dto.js';
import { QueryProductsDto } from '../dtos/query-products.dto.js';
import { PaginatedResult } from '../../common/data-accsess/base-repository.js';
import { containsRegex } from '../../common/utils/regex.util.js';
import { PricingService } from '../../pricing/pricing.service.js';

@Injectable()
export class FindAllProductsUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly pricing: PricingService,
  ) {}

  async execute(query: QueryProductsDto, isStaff = false): Promise<PaginatedResult<ProductResponseDto>> {
    const filter: Record<string, any> = {};

    // Customers never see disabled items; staff may list everything.
    if (!isStaff || query.available !== undefined) {
      filter.isAvailable = isStaff ? query.available : true;
    }
    if (query.category) filter.category = query.category;
    if (query.subcategory) filter.subcategories = query.subcategory;
    if (query.brand) filter.brand = query.brand;
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.price = {
        ...(query.minPrice !== undefined && { $gte: query.minPrice }),
        ...(query.maxPrice !== undefined && { $lte: query.maxPrice }),
      };
    }
    if (query.minRating !== undefined) filter.ratingsAverage = { $gte: query.minRating };
    if (query.keyword) {
      filter.$or = [
        { title: containsRegex(query.keyword) },
        { titleAr: containsRegex(query.keyword) },
        { description: containsRegex(query.keyword) },
      ];
    }

    const result = await this.productRepository.findPaginated(filter, {
      page: query.page,
      limit: query.limit,
      ignoreLimit: query.ignoreLimit,
      sort: query.sort,
      populate: [
        { path: 'category', select: 'name image _id' },
        { path: 'brand', select: 'name image _id' },
        { path: 'subcategories', select: 'name _id' },
      ],
    });

    const priced = await this.pricing.decorateProducts(result.data as any[]);
    result.data = priced.map((p) =>
      plainToInstance(ProductResponseDto, p, { excludeExtraneousValues: true }),
    ) as any;
    return result as unknown as PaginatedResult<ProductResponseDto>;
  }
}
