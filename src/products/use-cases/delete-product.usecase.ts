import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../repository/product.repository.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';

@Injectable()
export class DeleteProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.productRepository.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException(`No product found for id: ${id}`);
    }
  }
}
