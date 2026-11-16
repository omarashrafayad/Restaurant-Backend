import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from '../common/data-accsess/model-names.enum.js';
import { SubCategory, SubCategorySchema } from './schema/subcategory.schema.js';
import { SubCategoryRepository } from './repository/subcategory.repository.js';
import { SubcategoriesController } from './subcategories.controller.js';
import { SubcategoriesService } from './subcategories.service.js';
import { CreateSubCategoryUseCase } from './use-cases/create-subcategory.usecase.js';
import { FindAllSubCategoriesUseCase } from './use-cases/find-all-subcategories.usecase.js';
import { FindSubCategoryByIdUseCase } from './use-cases/find-subcategory-by-id.usecase.js';
import { UpdateSubCategoryUseCase } from './use-cases/update-subcategory.usecase.js';
import { DeleteSubCategoryUseCase } from './use-cases/delete-subcategory.usecase.js';
import { CategoriesModule } from '../categories/categories.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ModelNames.SubCategories, schema: SubCategorySchema }]),
    CategoriesModule,
  ],
  controllers: [SubcategoriesController],
  providers: [
    SubcategoriesService,
    SubCategoryRepository,
    CreateSubCategoryUseCase,
    FindAllSubCategoriesUseCase,
    FindSubCategoryByIdUseCase,
    UpdateSubCategoryUseCase,
    DeleteSubCategoryUseCase,
  ],
  exports: [SubcategoriesService, SubCategoryRepository],
})
export class SubcategoriesModule {}
