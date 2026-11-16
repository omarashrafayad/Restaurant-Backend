import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../../products/repository/product.repository.js';
import { ApplyQuickDiscountDto } from '../dtos/quick-discount.dto.js';
import { BadRequestException } from '../../common/error-handling/custom-excepction/bad-request.exceprions.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';

@Injectable()
export class ApplyQuickDiscountUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(dto: ApplyQuickDiscountDto) {
    if (!dto.discountPercentage || dto.discountPercentage < 1 || dto.discountPercentage > 100) {
      throw new BadRequestException('Valid discount percentage (1-100) is required');
    }

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

    const productsToUpdate = await this.productRepository.find(filter);
    if (productsToUpdate.length === 0) {
      throw new NotFoundException('No products found matching the criteria');
    }

    const bulkOps = productsToUpdate.map((product: any) => {
      const discountedPrice = Number(
        (product.price * (1 - dto.discountPercentage / 100)).toFixed(2),
      );
      return {
        updateOne: {
          filter: { _id: product._id },
          update: { $set: { priceAfterDiscount: discountedPrice } },
        },
      };
    });

    await this.productRepository.bulkWrite(bulkOps);

    return {
      status: 'success',
      message: `Successfully applied ${dto.discountPercentage}% discount to ${productsToUpdate.length} products`,
      updatedCount: productsToUpdate.length,
    };
  }
}
