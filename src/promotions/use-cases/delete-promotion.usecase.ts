import { Injectable } from '@nestjs/common';
import { PromotionRepository } from '../repository/promotion.repository.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';

@Injectable()
export class DeletePromotionUseCase {
  constructor(private readonly promotionRepository: PromotionRepository) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.promotionRepository.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException(`No promotion found for id: ${id}`);
    }
  }
}
