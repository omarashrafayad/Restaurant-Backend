import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../../products/repository/product.repository.js';
import { RemoveQuickDiscountDto } from '../dtos/quick-discount.dto.js';
import { BadRequestException } from '../../common/error-handling/custom-excepction/bad-request.exceprions.js';

@Injectable()
export class RemoveQuickDiscountUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(dto: RemoveQuickDiscountDto) {
    const filter: Record<string, any> = {};

    if (dto.target === 'category') {
      if (!dto.categoryId) {
        throw new BadRequestException('categoryId is required when target is category');
      }
      filter.category = dto.categoryId;
    } else if (dto.target === 'products') {
      if (!dto.productIds || !Array.isArray(dto.productIds) || dto.productIds.length === 0) {
        throw new BadRequestException('productIds array is required when target is products');
      }
      filter._id = { $in: dto.productIds };
    }

    const result = await this.productRepository.updateMany(filter, {
      $unset: { priceAfterDiscount: 1 },
    });

    return {
      status: 'success',
      message: 'Discounts removed successfully',
      modifiedCount: result.modifiedCount,
    };
  }
}
