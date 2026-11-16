import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateCouponDto } from '../dtos/create-coupon.dto.js';
import { UpdateCouponDto } from '../dtos/update-coupon.dto.js';
import { CouponResponseDto } from '../dtos/coupon-response.dto.js';

export function CreateCouponSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new coupon' }),
    ApiBody({ type: CreateCouponDto }),
    ApiResponse({ status: 201, type: CouponResponseDto }),
    ApiResponse({ status: 400, description: 'Coupon already exists / validation error' }),
  );
}

export function FindAllCouponsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all coupons' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'keyword', required: false, type: String }),
    ApiResponse({ status: 200, description: 'List of coupons' }),
  );
}

export function FindCouponByIdSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get coupon by id' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 200, type: CouponResponseDto }),
    ApiResponse({ status: 404, description: 'Coupon not found' }),
  );
}

export function UpdateCouponSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Update coupon by id' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiBody({ type: UpdateCouponDto }),
    ApiResponse({ status: 200, type: CouponResponseDto }),
    ApiResponse({ status: 404, description: 'Coupon not found' }),
  );
}

export function DeleteCouponSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete coupon by id' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 204, description: 'Coupon deleted' }),
    ApiResponse({ status: 404, description: 'Coupon not found' }),
  );
}
