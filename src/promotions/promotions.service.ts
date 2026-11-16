import { Injectable } from '@nestjs/common';
import { CreatePromotionUseCase } from './use-cases/create-promotion.usecase.js';
import { FindAllPromotionsUseCase } from './use-cases/find-all-promotions.usecase.js';
import { FindPromotionByIdUseCase } from './use-cases/find-promotion-by-id.usecase.js';
import { UpdatePromotionUseCase } from './use-cases/update-promotion.usecase.js';
import { DeletePromotionUseCase } from './use-cases/delete-promotion.usecase.js';
import { GetActivePromotionsUseCase } from './use-cases/get-active-promotions.usecase.js';
import { ApplyQuickDiscountUseCase } from './use-cases/apply-quick-discount.usecase.js';
import { RemoveQuickDiscountUseCase } from './use-cases/remove-quick-discount.usecase.js';
import { CreatePromotionDto } from './dtos/create-promotion.dto.js';
import { UpdatePromotionDto } from './dtos/update-promotion.dto.js';
import { ApplyQuickDiscountDto, RemoveQuickDiscountDto } from './dtos/quick-discount.dto.js';
import { PaginationDto } from '../common/data-accsess/dto/pagination.dto.js';
import { PromotionRepository } from './repository/promotion.repository.js';

@Injectable()
export class PromotionsService {
  constructor(
    private readonly createPromotionUseCase: CreatePromotionUseCase,
    private readonly findAllPromotionsUseCase: FindAllPromotionsUseCase,
    private readonly findPromotionByIdUseCase: FindPromotionByIdUseCase,
    private readonly updatePromotionUseCase: UpdatePromotionUseCase,
    private readonly deletePromotionUseCase: DeletePromotionUseCase,
    private readonly getActivePromotionsUseCase: GetActivePromotionsUseCase,
    private readonly applyQuickDiscountUseCase: ApplyQuickDiscountUseCase,
    private readonly removeQuickDiscountUseCase: RemoveQuickDiscountUseCase,
    private readonly promotionRepository: PromotionRepository,
  ) {}

  create(dto: CreatePromotionDto) {
    return this.createPromotionUseCase.execute(dto);
  }

  findAll(query: PaginationDto) {
    return this.findAllPromotionsUseCase.execute(query);
  }

  findById(id: string) {
    return this.findPromotionByIdUseCase.execute(id);
  }

  update(id: string, dto: UpdatePromotionDto) {
    return this.updatePromotionUseCase.execute(id, dto);
  }

  delete(id: string) {
    return this.deletePromotionUseCase.execute(id);
  }

  getActivePromotions() {
    return this.getActivePromotionsUseCase.execute();
  }

  applyQuickDiscount(dto: ApplyQuickDiscountDto) {
    return this.applyQuickDiscountUseCase.execute(dto);
  }

  removeQuickDiscount(dto: RemoveQuickDiscountDto) {
    return this.removeQuickDiscountUseCase.execute(dto);
  }

  findRaw(filter: Record<string, any> = {}, options: any = {}) {
    return this.promotionRepository.find(filter, options);
  }
}
