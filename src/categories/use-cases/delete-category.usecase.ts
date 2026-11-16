import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repository/category.repository.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';

@Injectable()
export class DeleteCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.categoryRepository.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException(`No category found for id: ${id}`);
    }
  }
}
