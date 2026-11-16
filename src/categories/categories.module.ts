import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from '../common/data-accsess/model-names.enum.js';
import { Category, CategorySchema } from './schema/category.schema.js';
import { CategoryRepository } from './repository/category.repository.js';
import { CategoriesController } from './categories.controller.js';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryUseCase } from './use-cases/create-category.usecase.js';
import { FindAllCategoriesUseCase } from './use-cases/find-all-categories.usecase.js';
import { FindCategoryByIdUseCase } from './use-cases/find-category-by-id.usecase.js';
import { UpdateCategoryUseCase } from './use-cases/update-category.usecase.js';
import { DeleteCategoryUseCase } from './use-cases/delete-category.usecase.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ModelNames.Categories, schema: CategorySchema }]),
  ],
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    CategoryRepository,
    CreateCategoryUseCase,
    FindAllCategoriesUseCase,
    FindCategoryByIdUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
  ],
  exports: [CategoriesService, CategoryRepository],
})
export class CategoriesModule {}
