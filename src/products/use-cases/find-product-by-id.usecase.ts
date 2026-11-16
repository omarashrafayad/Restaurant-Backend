import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../repository/product.repository.js';
import { ProductResponseDto } from '../dtos/product-response.dto.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class FindProductByIdUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findById(id, {
      populate: [
        { path: 'category', select: 'name image _id' },
        { path: 'brand', select: 'name image _id' },
        { path: 'subcategories', select: 'name _id' },
      ],
    });

    if (!product) {
      throw new NotFoundException(`No product found for id: ${id}`);
    }

    const obj = (product as any).toObject ? (product as any).toObject() : product;
    return plainToInstance(ProductResponseDto, obj);
  }
}
