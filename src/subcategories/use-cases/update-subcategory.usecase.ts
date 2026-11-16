import { Injectable } from '@nestjs/common';
import { SubCategoryRepository } from '../repository/subcategory.repository.js';
import { CategoryRepository } from '../../categories/repository/category.repository.js';
import { UpdateSubCategoryDto } from '../dtos/update-subcategory.dto.js';
import { SubCategoryResponseDto } from '../dtos/subcategory-response.dto.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { plainToInstance } from 'class-transformer';
import slugify from 'slugify';

@Injectable()
export class UpdateSubCategoryUseCase {
  constructor(
    private readonly subCategoryRepository: SubCategoryRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(id: string, dto: UpdateSubCategoryDto): Promise<SubCategoryResponseDto> {
    if (dto.category) {
      const categoryExists = await this.categoryRepository.findById(dto.category);
      if (!categoryExists) {
        throw new NotFoundException('No category found for this id');
      }
    }

    const updateData: any = { ...dto };
    if (dto.name) {
      updateData.slug = slugify(dto.name, { lower: true });
    }

    const updated = await this.subCategoryRepository.findByIdAndUpdate(id, updateData);
    if (!updated) {
      throw new NotFoundException(`No subcategory found for id: ${id}`);
    }

    const obj = (updated as any).toObject ? (updated as any).toObject() : updated;
    return plainToInstance(SubCategoryResponseDto, obj);
  }
}
