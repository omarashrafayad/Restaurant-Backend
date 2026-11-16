import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../repository/product.repository.js';
import { CategoryRepository } from '../../categories/repository/category.repository.js';
import { SubCategoryRepository } from '../../subcategories/repository/subcategory.repository.js';
import { CreateProductDto } from '../dtos/create-product.dto.js';
import { ProductResponseDto } from '../dtos/product-response.dto.js';
import { BadRequestException } from '../../common/error-handling/custom-excepction/bad-request.exceprions.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { plainToInstance } from 'class-transformer';
import slugify from 'slugify';

@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly subCategoryRepository: SubCategoryRepository,
  ) {}

  async execute(dto: CreateProductDto): Promise<ProductResponseDto> {
    // 1) Validate Category exists
    const categoryDoc = await this.categoryRepository.findById(dto.category);
    if (!categoryDoc) {
      throw new NotFoundException('No category for this id');
    }

    // 2) Validate Subcategories belong to Category
    if (dto.subcategories && dto.subcategories.length > 0) {
      const subcats = await this.subCategoryRepository.find({
        _id: { $in: dto.subcategories },
      });

      if (subcats.length !== dto.subcategories.length) {
        throw new BadRequestException('Invalid subcategories ids');
      }

      const invalidSub = subcats.some(
        (sub: any) => sub.category.toString() !== dto.category.toString(),
      );

      if (invalidSub) {
        throw new BadRequestException('Some subcategories do not belong to this category');
      }
    }

    // 3) Validate priceAfterDiscount < price
    if (
      dto.priceAfterDiscount !== undefined &&
      dto.priceAfterDiscount >= dto.price
    ) {
      throw new BadRequestException('priceAfterDiscount must be lower than price');
    }

    const slug = slugify(dto.title, { lower: true });
    const product = await this.productRepository.create({
      ...dto,
      slug,
    });

    const obj = (product as any).toObject ? (product as any).toObject() : product;
    return plainToInstance(ProductResponseDto, obj);
  }
}
