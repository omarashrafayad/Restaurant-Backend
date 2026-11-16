import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateBrandDto } from '../dtos/create-brand.dto.js';
import { UpdateBrandDto } from '../dtos/update-brand.dto.js';
import { BrandResponseDto } from '../dtos/brand-response.dto.js';

export function CreateBrandSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new brand' }),
    ApiBody({ type: CreateBrandDto }),
    ApiResponse({ status: 201, type: BrandResponseDto }),
    ApiResponse({ status: 400, description: 'Brand already exists / validation error' }),
  );
}

export function FindAllBrandsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all brands with pagination' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'keyword', required: false, type: String }),
    ApiResponse({ status: 200, description: 'List of brands' }),
  );
}

export function FindBrandByIdSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get brand by id' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 200, type: BrandResponseDto }),
    ApiResponse({ status: 404, description: 'Brand not found' }),
  );
}

export function UpdateBrandSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Update brand by id' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiBody({ type: UpdateBrandDto }),
    ApiResponse({ status: 200, type: BrandResponseDto }),
    ApiResponse({ status: 404, description: 'Brand not found' }),
  );
}

export function DeleteBrandSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete brand by id' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 204, description: 'Brand deleted' }),
    ApiResponse({ status: 404, description: 'Brand not found' }),
  );
}
