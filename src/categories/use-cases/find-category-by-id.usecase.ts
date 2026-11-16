import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repository/category.repository.js';
import { CategoryResponseDto } from '../dtos/category-response.dto.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class FindCategoryByIdUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`No category found for id: ${id}`);
    }

    const obj = (category as any).toObject ? (category as any).toObject() : category;
    return plainToInstance(CategoryResponseDto, obj);
  }
}
