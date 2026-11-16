import { Injectable } from '@nestjs/common';
import { SubCategoryRepository } from '../repository/subcategory.repository.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';

@Injectable()
export class DeleteSubCategoryUseCase {
  constructor(private readonly subCategoryRepository: SubCategoryRepository) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.subCategoryRepository.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException(`No subcategory found for id: ${id}`);
    }
  }
}
