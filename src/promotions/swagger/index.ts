import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreatePromotionDto } from '../dtos/create-promotion.dto.js';
import { UpdatePromotionDto } from '../dtos/update-promotion.dto.js';
import { ApplyQuickDiscountDto, RemoveQuickDiscountDto } from '../dtos/quick-discount.dto.js';
import { PromotionResponseDto } from '../dtos/promotion-response.dto.js';

export function CreatePromotionSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new promotion' }),
    ApiBody({ type: CreatePromotionDto }),
    ApiResponse({ status: 201, type: PromotionResponseDto }),
    ApiResponse({ status: 400, description: 'Validation error' }),
  );
}

export function FindAllPromotionsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all promotions' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'keyword', required: false, type: String }),
    ApiResponse({ status: 200, description: 'List of promotions' }),
  );
}

export function FindPromotionByIdSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get promotion by id' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 200, type: PromotionResponseDto }),
    ApiResponse({ status: 404, description: 'Promotion not found' }),
  );
}

export function UpdatePromotionSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Update promotion by id' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiBody({ type: UpdatePromotionDto }),
    ApiResponse({ status: 200, type: PromotionResponseDto }),
    ApiResponse({ status: 404, description: 'Promotion not found' }),
  );
}

export function DeletePromotionSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete promotion by id' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 204, description: 'Promotion deleted' }),
    ApiResponse({ status: 404, description: 'Promotion not found' }),
  );
}

export function ActivePromotionsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get currently active promotions for today' }),
    ApiResponse({ status: 200, description: 'List of active promotions' }),
  );
}

export function QuickApplySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Quickly apply percentage discount to products or categories' }),
    ApiBody({ type: ApplyQuickDiscountDto }),
    ApiResponse({ status: 200, description: 'Discount applied to products' }),
  );
}

export function QuickRemoveSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Quickly remove percentage discounts from products' }),
    ApiBody({ type: RemoveQuickDiscountDto }),
    ApiResponse({ status: 200, description: 'Discounts removed from products' }),
  );
}
