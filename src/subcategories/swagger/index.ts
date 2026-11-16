import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateSubCategoryDto } from '../dtos/create-subcategory.dto.js';
import { UpdateSubCategoryDto } from '../dtos/update-subcategory.dto.js';
import { SubCategoryResponseDto } from '../dtos/subcategory-response.dto.js';

export function CreateSubCategorySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new subcategory' }),
    ApiBody({ type: CreateSubCategoryDto }),
    ApiResponse({ status: 201, type: SubCategoryResponseDto }),
    ApiResponse({ status: 400, description: 'SubCategory already exists / validation error' }),
  );
}

export function FindAllSubCategoriesSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all subcategories' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'keyword', required: false, type: String }),
    ApiResponse({ status: 200, description: 'List of subcategories' }),
  );
}

export function FindSubCategoryByIdSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get subcategory by id' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 200, type: SubCategoryResponseDto }),
    ApiResponse({ status: 404, description: 'Subcategory not found' }),
  );
}

export function UpdateSubCategorySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Update subcategory by id' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiBody({ type: UpdateSubCategoryDto }),
    ApiResponse({ status: 200, type: SubCategoryResponseDto }),
    ApiResponse({ status: 404, description: 'Subcategory not found' }),
  );
}

export function DeleteSubCategorySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete subcategory by id' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 204, description: 'Subcategory deleted' }),
    ApiResponse({ status: 404, description: 'Subcategory not found' }),
  );
}
