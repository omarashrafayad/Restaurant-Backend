import { Injectable } from '@nestjs/common';
import { PromotionRepository } from '../repository/promotion.repository.js';
import { UpdatePromotionDto } from '../dtos/update-promotion.dto.js';
import { PromotionResponseDto } from '../dtos/promotion-response.dto.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UpdatePromotionUseCase {
  constructor(private readonly promotionRepository: PromotionRepository) {}

  async execute(id: string, dto: UpdatePromotionDto): Promise<PromotionResponseDto> {
    const updateData: any = { ...dto };
    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate) updateData.endDate = new Date(dto.endDate);

    const updated = await this.promotionRepository.findByIdAndUpdate(id, updateData, {
      populate: [
        { path: 'categories', select: 'name image' },
        { path: 'products', select: 'title price priceAfterDiscount imageCover' },
      ],
    });

    if (!updated) {
      throw new NotFoundException(`No promotion found for id: ${id}`);
    }

    const obj = (updated as any).toObject ? (updated as any).toObject() : updated;
    return plainToInstance(PromotionResponseDto, obj);
  }
}
