import { Injectable } from '@nestjs/common';
import { CreateProductUseCase } from './use-cases/create-product.usecase.js';
import { FindAllProductsUseCase } from './use-cases/find-all-products.usecase.js';
import { FindProductByIdUseCase } from './use-cases/find-product-by-id.usecase.js';
import { UpdateProductUseCase } from './use-cases/update-product.usecase.js';
import { DeleteProductUseCase } from './use-cases/delete-product.usecase.js';
import { CreateProductDto } from './dtos/create-product.dto.js';
import { UpdateProductDto } from './dtos/update-product.dto.js';
import { ProductRepository } from './repository/product.repository.js';

@Injectable()
export class ProductsService {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly findAllProductsUseCase: FindAllProductsUseCase,
    private readonly findProductByIdUseCase: FindProductByIdUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
    private readonly productRepository: ProductRepository,
  ) {}

  create(dto: CreateProductDto) {
    return this.createProductUseCase.execute(dto);
  }

  findAll(queryParams: Record<string, any>) {
    return this.findAllProductsUseCase.execute(queryParams);
  }

  findById(id: string) {
    return this.findProductByIdUseCase.execute(id);
  }

  update(id: string, dto: UpdateProductDto) {
    return this.updateProductUseCase.execute(id, dto);
  }

  delete(id: string) {
    return this.deleteProductUseCase.execute(id);
  }

  findRaw(filter: Record<string, any> = {}, options: any = {}) {
    return this.productRepository.find(filter, options);
  }

  bulkWrite(ops: any[], options?: any) {
    return this.productRepository.bulkWrite(ops, options);
  }

  updateMany(filter: any, updateQuery: any) {
    return this.productRepository.updateMany(filter, updateQuery);
  }
}
