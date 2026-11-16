import { Injectable } from '@nestjs/common';
import { CreateCategoryUseCase } from './use-cases/create-category.usecase.js';
import { FindAllCategoriesUseCase } from './use-cases/find-all-categories.usecase.js';
import { FindCategoryByIdUseCase } from './use-cases/find-category-by-id.usecase.js';
import { UpdateCategoryUseCase } from './use-cases/update-category.usecase.js';
import { DeleteCategoryUseCase } from './use-cases/delete-category.usecase.js';
import { CreateCategoryDto } from './dtos/create-category.dto.js';
import { UpdateCategoryDto } from './dtos/update-category.dto.js';
import { PaginationDto } from '../common/data-accsess/dto/pagination.dto.js';
import { CategoryRepository } from './repository/category.repository.js';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly findAllCategoriesUseCase: FindAllCategoriesUseCase,
    private readonly findCategoryByIdUseCase: FindCategoryByIdUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  create(dto: CreateCategoryDto) {
    return this.createCategoryUseCase.execute(dto);
  }

  findAll(query: PaginationDto) {
    return this.findAllCategoriesUseCase.execute(query);
  }

  findById(id: string) {
    return this.findCategoryByIdUseCase.execute(id);
  }

  update(id: string, dto: UpdateCategoryDto) {
    return this.updateCategoryUseCase.execute(id, dto);
  }

  delete(id: string) {
    return this.deleteCategoryUseCase.execute(id);
  }

  findOne(filter: Record<string, any>) {
    return this.categoryRepository.findOne(filter);
  }

  findRaw(filter: Record<string, any> = {}, options: any = {}) {
    return this.categoryRepository.find(filter, options);
  }
}
