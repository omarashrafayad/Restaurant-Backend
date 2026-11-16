import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repository/category.repository.js';
import { UpdateCategoryDto } from '../dtos/update-category.dto.js';
import { CategoryResponseDto } from '../dtos/category-response.dto.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { plainToInstance } from 'class-transformer';
import slugify from 'slugify';

@Injectable()
export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: string, dto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    const updateData: any = { ...dto };
    if (dto.name) {
      updateData.slug = slugify(dto.name, { lower: true });
    }

    const updated = await this.categoryRepository.findByIdAndUpdate(id, updateData);
    if (!updated) {
      throw new NotFoundException(`No category found for id: ${id}`);
    }

    const obj = (updated as any).toObject ? (updated as any).toObject() : updated;
    return plainToInstance(CategoryResponseDto, obj);
  }
}
