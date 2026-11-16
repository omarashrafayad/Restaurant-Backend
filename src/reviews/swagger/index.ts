import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateReviewDto } from '../dtos/create-review.dto.js';
import { UpdateReviewDto } from '../dtos/update-review.dto.js';
import { ReviewResponseDto } from '../dtos/review-response.dto.js';

export function CreateReviewSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a customer review for a product' }),
    ApiBody({ type: CreateReviewDto }),
    ApiResponse({ status: 201, type: ReviewResponseDto }),
    ApiResponse({ status: 400, description: 'Already reviewed product / validation error' }),
  );
}

export function FindAllReviewsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all reviews' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiResponse({ status: 200, description: 'List of reviews' }),
  );
}

export function FindReviewByIdSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get review by id' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 200, type: ReviewResponseDto }),
    ApiResponse({ status: 404, description: 'Review not found' }),
  );
}

export function UpdateReviewSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Update customer review by id' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiBody({ type: UpdateReviewDto }),
    ApiResponse({ status: 200, type: ReviewResponseDto }),
    ApiResponse({ status: 403, description: 'Not authorized to update this review' }),
  );
}

export function DeleteReviewSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete review by id' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 204, description: 'Review deleted' }),
    ApiResponse({ status: 403, description: 'Not authorized to delete this review' }),
  );
}
