import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateCategoryDto } from '../dtos/create-category.dto.js';
import { UpdateCategoryDto } from '../dtos/update-category.dto.js';
import { CategoryResponseDto } from '../dtos/category-response.dto.js';

export function CreateCategorySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new category' }),
    ApiBody({ type: CreateCategoryDto }),
    ApiResponse({ status: 201, type: CategoryResponseDto }),
    ApiResponse({ status: 400, description: 'Category already exists / validation error' }),
  );
}

export function FindAllCategoriesSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all categories with pagination' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'keyword', required: false, type: String }),
    ApiResponse({ status: 200, description: 'List of categories' }),
  );
}

export function FindCategoryByIdSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get category by id' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 200, type: CategoryResponseDto }),
    ApiResponse({ status: 404, description: 'Category not found' }),
  );
}

export function UpdateCategorySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Update category by id' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiBody({ type: UpdateCategoryDto }),
    ApiResponse({ status: 200, type: CategoryResponseDto }),
    ApiResponse({ status: 404, description: 'Category not found' }),
  );
}

export function DeleteCategorySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete category by id' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 204, description: 'Category deleted' }),
    ApiResponse({ status: 404, description: 'Category not found' }),
  );
}
