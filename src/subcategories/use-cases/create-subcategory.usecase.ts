import { Injectable } from '@nestjs/common';
import { SubCategoryRepository } from '../repository/subcategory.repository.js';
import { CategoryRepository } from '../../categories/repository/category.repository.js';
import { CreateSubCategoryDto } from '../dtos/create-subcategory.dto.js';
import { SubCategoryResponseDto } from '../dtos/subcategory-response.dto.js';
import { BadRequestException } from '../../common/error-handling/custom-excepction/bad-request.exceprions.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { plainToInstance } from 'class-transformer';
import slugify from 'slugify';

@Injectable()
export class CreateSubCategoryUseCase {
  constructor(
    private readonly subCategoryRepository: SubCategoryRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(dto: CreateSubCategoryDto, categoryIdFromParam?: string): Promise<SubCategoryResponseDto> {
    const categoryId = dto.category || categoryIdFromParam;
    if (!categoryId) {
      throw new BadRequestException('SubCategory must belong to a parent category');
    }

    const categoryExists = await this.categoryRepository.findById(categoryId);
    if (!categoryExists) {
      throw new NotFoundException('No category found for this id');
    }

    const exists = await this.subCategoryRepository.findOne({ name: dto.name.trim() });
    if (exists) {
      throw new BadRequestException('SubCategory already exists');
    }

    const slug = slugify(dto.name, { lower: true });
    const created = await this.subCategoryRepository.create({
      name: dto.name.trim(),
      slug,
      category: categoryId as any,
    });

    const obj = (created as any).toObject ? (created as any).toObject() : created;
    return plainToInstance(SubCategoryResponseDto, obj);
  }
}
