import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateDeliveryZoneDto } from '../dtos/create-delivery-zone.dto.js';
import { UpdateDeliveryZoneDto } from '../dtos/update-delivery-zone.dto.js';
import { CheckDeliveryFeeDto } from '../dtos/check-delivery-fee.dto.js';
import { DeliveryZoneResponseDto } from '../dtos/delivery-zone-response.dto.js';

export function CreateDeliveryZoneSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new delivery zone' }),
    ApiBody({ type: CreateDeliveryZoneDto }),
    ApiResponse({ status: 201, type: DeliveryZoneResponseDto }),
    ApiResponse({ status: 400, description: 'Zone already exists / validation error' }),
  );
}

export function FindAllDeliveryZonesSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all delivery zones' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'keyword', required: false, type: String }),
    ApiResponse({ status: 200, description: 'List of delivery zones' }),
  );
}

export function FindDeliveryZoneByIdSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get delivery zone by id' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 200, type: DeliveryZoneResponseDto }),
    ApiResponse({ status: 404, description: 'Delivery zone not found' }),
  );
}

export function UpdateDeliveryZoneSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Update delivery zone by id' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiBody({ type: UpdateDeliveryZoneDto }),
    ApiResponse({ status: 200, type: DeliveryZoneResponseDto }),
    ApiResponse({ status: 404, description: 'Delivery zone not found' }),
  );
}

export function DeleteDeliveryZoneSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete delivery zone by id' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 204, description: 'Delivery zone deleted' }),
    ApiResponse({ status: 404, description: 'Delivery zone not found' }),
  );
}

export function CheckDeliveryFeeSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Check delivery availability and fee for a city' }),
    ApiQuery({ name: 'city', required: false, type: String }),
    ApiResponse({ status: 200, description: 'Delivery availability and fee details returned' }),
  );
}
