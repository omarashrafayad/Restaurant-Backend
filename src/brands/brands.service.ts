import { Injectable } from '@nestjs/common';
import { CreateBrandUseCase } from './use-cases/create-brand.usecase.js';
import { FindAllBrandsUseCase } from './use-cases/find-all-brands.usecase.js';
import { FindBrandByIdUseCase } from './use-cases/find-brand-by-id.usecase.js';
import { UpdateBrandUseCase } from './use-cases/update-brand.usecase.js';
import { DeleteBrandUseCase } from './use-cases/delete-brand.usecase.js';
import { CreateBrandDto } from './dtos/create-brand.dto.js';
import { UpdateBrandDto } from './dtos/update-brand.dto.js';
import { PaginationDto } from '../common/data-accsess/dto/pagination.dto.js';
import { BrandRepository } from './repository/brand.repository.js';

@Injectable()
export class BrandsService {
  constructor(
    private readonly createBrandUseCase: CreateBrandUseCase,
    private readonly findAllBrandsUseCase: FindAllBrandsUseCase,
    private readonly findBrandByIdUseCase: FindBrandByIdUseCase,
    private readonly updateBrandUseCase: UpdateBrandUseCase,
    private readonly deleteBrandUseCase: DeleteBrandUseCase,
    private readonly brandRepository: BrandRepository,
  ) {}

  create(dto: CreateBrandDto) {
    return this.createBrandUseCase.execute(dto);
  }

  findAll(query: PaginationDto) {
    return this.findAllBrandsUseCase.execute(query);
  }

  findById(id: string) {
    return this.findBrandByIdUseCase.execute(id);
  }

  update(id: string, dto: UpdateBrandDto) {
    return this.updateBrandUseCase.execute(id, dto);
  }

  delete(id: string) {
    return this.deleteBrandUseCase.execute(id);
  }

  findRaw(filter: Record<string, any> = {}, options: any = {}) {
    return this.brandRepository.find(filter, options);
  }
}
