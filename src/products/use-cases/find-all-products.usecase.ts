import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../repository/product.repository.js';
import { ProductResponseDto } from '../dtos/product-response.dto.js';
import { PaginatedResult } from '../../common/data-accsess/base-repository.js';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class FindAllProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(queryParams: Record<string, any>): Promise<PaginatedResult<ProductResponseDto>> {
    const page = Number(queryParams.page) || 1;
    const limit = Number(queryParams.limit) || 10;
    const ignoreLimit = queryParams.ignoreLimit === 'true' || queryParams.ignoreLimit === true;
    const sort = queryParams.sort;
    const fields = queryParams.fields;
    const keyword = queryParams.keyword;

    const filterObj: Record<string, any> = {};

    // Copy and filter out excluded fields
    const excludedFields = ['page', 'fields', 'sort', 'limit', 'keyword', 'ignoreLimit'];
    for (const key of Object.keys(queryParams)) {
      if (excludedFields.includes(key)) continue;

      const value = queryParams[key];

      // Handle bracket notation: price[gte]=100
      const bracketMatch = key.match(/^(.+)\[(.+)\]$/);
      if (bracketMatch) {
        const [, fieldName, operator] = bracketMatch;
        if (!filterObj[fieldName]) filterObj[fieldName] = {};
        const numVal = Number(value);
        filterObj[fieldName][`$${operator}`] = isNaN(numVal) ? value : numVal;
      } else if (typeof value === 'object' && value !== null) {
        filterObj[key] = {};
        for (const opKey of Object.keys(value)) {
          const numVal = Number(value[opKey]);
          filterObj[key][`$${opKey}`] = isNaN(numVal) ? value[opKey] : numVal;
        }
      } else {
        filterObj[key] = value;
      }
    }

    // Keyword search in title or description
    if (keyword) {
      filterObj.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }

    const result = await this.productRepository.findPaginated(filterObj, {
      page,
      limit,
      ignoreLimit,
      sort,
      fields,
      populate: [
        { path: 'category', select: 'name image _id' },
        { path: 'brand', select: 'name image _id' },
        { path: 'subcategories', select: 'name _id' },
      ],
      lean: true,
    });

    return plainToInstance(PaginatedResult<ProductResponseDto>, result);
  }
}
