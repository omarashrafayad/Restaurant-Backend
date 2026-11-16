import { Injectable } from '@nestjs/common';
import { PromotionRepository } from '../repository/promotion.repository.js';
import { CreatePromotionDto } from '../dtos/create-promotion.dto.js';
import { PromotionResponseDto } from '../dtos/promotion-response.dto.js';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CreatePromotionUseCase {
  constructor(private readonly promotionRepository: PromotionRepository) {}

  async execute(dto: CreatePromotionDto): Promise<PromotionResponseDto> {
    const created = await this.promotionRepository.create({
      title: dto.title.trim(),
      description: dto.description?.trim(),
      discountPercentage: dto.discountPercentage,
      target: dto.target || 'all',
      categories: (dto.categories || []) as any,
      products: (dto.products || []) as any,
      daysOfWeek: dto.daysOfWeek || [],
      startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });

    const obj = (created as any).toObject ? (created as any).toObject() : created;
    return plainToInstance(PromotionResponseDto, obj);
  }
}
