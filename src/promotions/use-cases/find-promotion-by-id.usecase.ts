import { Injectable } from '@nestjs/common';
import { PromotionRepository } from '../repository/promotion.repository.js';
import { PromotionResponseDto } from '../dtos/promotion-response.dto.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class FindPromotionByIdUseCase {
  constructor(private readonly promotionRepository: PromotionRepository) {}

  async execute(id: string): Promise<PromotionResponseDto> {
    const promotion = await this.promotionRepository.findById(id, {
      populate: [
        { path: 'categories', select: 'name image' },
        { path: 'products', select: 'title price priceAfterDiscount imageCover' },
      ],
    });

    if (!promotion) {
      throw new NotFoundException(`No promotion found for id: ${id}`);
    }

    const obj = (promotion as any).toObject ? (promotion as any).toObject() : promotion;
    return plainToInstance(PromotionResponseDto, obj);
  }
}
