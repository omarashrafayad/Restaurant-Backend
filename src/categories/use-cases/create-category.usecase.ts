import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repository/category.repository.js';
import { CreateCategoryDto } from '../dtos/create-category.dto.js';
import { CategoryResponseDto } from '../dtos/category-response.dto.js';
import { BadRequestException } from '../../common/error-handling/custom-excepction/bad-request.exceprions.js';
import { plainToInstance } from 'class-transformer';
import slugify from 'slugify';

@Injectable()
export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const exists = await this.categoryRepository.findOne({ name: dto.name.trim() });
    if (exists) {
      throw new BadRequestException('Category already exists');
    }

    const slug = slugify(dto.name, { lower: true });
    const created = await this.categoryRepository.create({
      ...dto,
      name: dto.name.trim(),
      slug,
    });

    const obj = (created as any).toObject ? (created as any).toObject() : created;
    return plainToInstance(CategoryResponseDto, obj);
  }
}
