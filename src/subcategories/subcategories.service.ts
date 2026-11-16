import { Injectable } from '@nestjs/common';
import { CreateSubCategoryUseCase } from './use-cases/create-subcategory.usecase.js';
import { FindAllSubCategoriesUseCase } from './use-cases/find-all-subcategories.usecase.js';
import { FindSubCategoryByIdUseCase } from './use-cases/find-subcategory-by-id.usecase.js';
import { UpdateSubCategoryUseCase } from './use-cases/update-subcategory.usecase.js';
import { DeleteSubCategoryUseCase } from './use-cases/delete-subcategory.usecase.js';
import { CreateSubCategoryDto } from './dtos/create-subcategory.dto.js';
import { UpdateSubCategoryDto } from './dtos/update-subcategory.dto.js';
import { PaginationDto } from '../common/data-accsess/dto/pagination.dto.js';
import { SubCategoryRepository } from './repository/subcategory.repository.js';

@Injectable()
export class SubcategoriesService {
  constructor(
    private readonly createSubCategoryUseCase: CreateSubCategoryUseCase,
    private readonly findAllSubCategoriesUseCase: FindAllSubCategoriesUseCase,
    private readonly findSubCategoryByIdUseCase: FindSubCategoryByIdUseCase,
    private readonly updateSubCategoryUseCase: UpdateSubCategoryUseCase,
    private readonly deleteSubCategoryUseCase: DeleteSubCategoryUseCase,
    private readonly subCategoryRepository: SubCategoryRepository,
  ) {}

  create(dto: CreateSubCategoryDto, categoryId?: string) {
    return this.createSubCategoryUseCase.execute(dto, categoryId);
  }

  findAll(query: PaginationDto, categoryId?: string) {
    return this.findAllSubCategoriesUseCase.execute(query, categoryId);
  }

  findById(id: string) {
    return this.findSubCategoryByIdUseCase.execute(id);
  }

  update(id: string, dto: UpdateSubCategoryDto) {
    return this.updateSubCategoryUseCase.execute(id, dto);
  }

  delete(id: string) {
    return this.deleteSubCategoryUseCase.execute(id);
  }

  findRaw(filter: Record<string, any> = {}, options: any = {}) {
    return this.subCategoryRepository.find(filter, options);
  }
}
