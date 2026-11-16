import { Injectable } from '@nestjs/common';
import { BrandRepository } from '../repository/brand.repository.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';

@Injectable()
export class DeleteBrandUseCase {
  constructor(private readonly brandRepository: BrandRepository) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.brandRepository.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException(`No brand found for id: ${id}`);
    }
  }
}
