import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from '../common/data-accsess/model-names.enum.js';
import { Brand, BrandSchema } from './schema/brand.schema.js';
import { BrandRepository } from './repository/brand.repository.js';
import { BrandsController } from './brands.controller.js';
import { BrandsService } from './brands.service.js';
import { CreateBrandUseCase } from './use-cases/create-brand.usecase.js';
import { FindAllBrandsUseCase } from './use-cases/find-all-brands.usecase.js';
import { FindBrandByIdUseCase } from './use-cases/find-brand-by-id.usecase.js';
import { UpdateBrandUseCase } from './use-cases/update-brand.usecase.js';
import { DeleteBrandUseCase } from './use-cases/delete-brand.usecase.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ModelNames.Brands, schema: BrandSchema }]),
  ],
  controllers: [BrandsController],
  providers: [
    BrandsService,
    BrandRepository,
    CreateBrandUseCase,
    FindAllBrandsUseCase,
    FindBrandByIdUseCase,
    UpdateBrandUseCase,
    DeleteBrandUseCase,
  ],
  exports: [BrandsService, BrandRepository],
})
export class BrandsModule {}
