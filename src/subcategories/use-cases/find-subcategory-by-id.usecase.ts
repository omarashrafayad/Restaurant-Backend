import { Injectable } from '@nestjs/common';
import { SubCategoryRepository } from '../repository/subcategory.repository.js';
import { SubCategoryResponseDto } from '../dtos/subcategory-response.dto.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class FindSubCategoryByIdUseCase {
  constructor(private readonly subCategoryRepository: SubCategoryRepository) {}

  async execute(id: string): Promise<SubCategoryResponseDto> {
    const subcategory = await this.subCategoryRepository.findById(id, {
      populate: { path: 'category', select: 'name image' },
    });
    if (!subcategory) {
      throw new NotFoundException(`No subcategory found for id: ${id}`);
    }

    const obj = (subcategory as any).toObject ? (subcategory as any).toObject() : subcategory;
    return plainToInstance(SubCategoryResponseDto, obj);
  }
}
