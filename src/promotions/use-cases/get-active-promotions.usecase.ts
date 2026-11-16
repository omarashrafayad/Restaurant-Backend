import { Injectable } from '@nestjs/common';
import { PromotionRepository } from '../repository/promotion.repository.js';

@Injectable()
export class GetActivePromotionsUseCase {
  constructor(private readonly promotionRepository: PromotionRepository) {}

  async execute() {
    const now = new Date();
    const todayDayOfWeek = now.getDay(); // 0 = Sunday .. 6 = Saturday

    const promotions = await this.promotionRepository.model
      .find({
        isActive: true,
        $and: [
          {
            $or: [
              { startDate: { $exists: false } },
              { startDate: null },
              { startDate: { $lte: now } },
            ],
          },
          {
            $or: [
              { endDate: { $exists: false } },
              { endDate: null },
              { endDate: { $gte: now } },
            ],
          },
          {
            $or: [
              { daysOfWeek: { $size: 0 } },
              { daysOfWeek: { $in: [todayDayOfWeek] } },
            ],
          },
        ],
      })
      .populate('categories', 'name')
      .populate('products', 'title price priceAfterDiscount');

    return {
      status: 'success',
      results: promotions.length,
      currentDayOfWeek: todayDayOfWeek,
      data: promotions,
    };
  }
}
