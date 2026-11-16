import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../repository/product.repository.js';
import { CategoryRepository } from '../../categories/repository/category.repository.js';
import { SubCategoryRepository } from '../../subcategories/repository/subcategory.repository.js';
import { UpdateProductDto } from '../dtos/update-product.dto.js';
import { ProductResponseDto } from '../dtos/product-response.dto.js';
import { BadRequestException } from '../../common/error-handling/custom-excepction/bad-request.exceprions.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { plainToInstance } from 'class-transformer';
import slugify from 'slugify';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly subCategoryRepository: SubCategoryRepository,
  ) {}

  async execute(id: string, dto: UpdateProductDto): Promise<ProductResponseDto> {
    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`No product found for id: ${id}`);
    }

    const categoryId = dto.category || (existing as any).category?._id || (existing as any).category;

    if (dto.category) {
      const categoryDoc = await this.categoryRepository.findById(dto.category);
      if (!categoryDoc) {
        throw new NotFoundException('No category for this id');
      }
    }

    if (dto.subcategories && dto.subcategories.length > 0) {
      const subcats = await this.subCategoryRepository.find({
        _id: { $in: dto.subcategories },
      });

      if (subcats.length !== dto.subcategories.length) {
        throw new BadRequestException('Invalid subcategories ids');
      }

      const invalid = subcats.some(
        (sub: any) => sub.category.toString() !== categoryId.toString(),
      );

      if (invalid) {
        throw new BadRequestException('Some subcategories do not belong to this category');
      }
    }

    const price = dto.price !== undefined ? dto.price : (existing as any).price;
    if (
      dto.priceAfterDiscount !== undefined &&
      dto.priceAfterDiscount >= price
    ) {
      throw new BadRequestException('priceAfterDiscount must be lower than price');
    }

    const updateData: any = { ...dto };
    if (dto.title) {
      updateData.slug = slugify(dto.title, { lower: true });
    }

    const updated = await this.productRepository.findByIdAndUpdate(id, updateData, {
      populate: [
        { path: 'category', select: 'name image _id' },
        { path: 'brand', select: 'name image _id' },
        { path: 'subcategories', select: 'name _id' },
      ],
    });

    const obj = (updated as any).toObject ? (updated as any).toObject() : updated;
    return plainToInstance(ProductResponseDto, obj);
  }
}
