import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateProductDto } from '../dtos/create-product.dto.js';
import { UpdateProductDto } from '../dtos/update-product.dto.js';
import { ProductResponseDto } from '../dtos/product-response.dto.js';

export function CreateProductSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new product with imageCover and images' }),
    ApiBody({ type: CreateProductDto }),
    ApiResponse({ status: 201, type: ProductResponseDto }),
    ApiResponse({ status: 400, description: 'Validation error / Subcategories do not belong to Category' }),
  );
}

export function FindAllProductsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all products with filtering, search, sorting, and pagination' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'sort', required: false, type: String }),
    ApiQuery({ name: 'fields', required: false, type: String }),
    ApiQuery({ name: 'keyword', required: false, type: String }),
    ApiQuery({ name: 'category', required: false, type: String }),
    ApiQuery({ name: 'brand', required: false, type: String }),
    ApiResponse({ status: 200, description: 'Paginated list of products' }),
  );
}

export function FindProductByIdSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get product by id' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 200, type: ProductResponseDto }),
    ApiResponse({ status: 404, description: 'Product not found' }),
  );
}

export function UpdateProductSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Update product by id' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiBody({ type: UpdateProductDto }),
    ApiResponse({ status: 200, type: ProductResponseDto }),
    ApiResponse({ status: 404, description: 'Product not found' }),
  );
}

export function DeleteProductSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete product by id' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 204, description: 'Product deleted' }),
    ApiResponse({ status: 404, description: 'Product not found' }),
  );
}
