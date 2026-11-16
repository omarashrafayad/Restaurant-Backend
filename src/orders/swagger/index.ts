import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateOrderDto } from '../dtos/create-order.dto.js';
import {
  AcceptOrderDto,
  AddOrderReviewDto,
  RejectOrderDto,
  UpdateOrderStatusDto,
} from '../dtos/order-actions.dto.js';

export function CreateOrderSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Place a cash-on-delivery order from the logged-in customer cart' }),
    ApiBody({ type: CreateOrderDto }),
    ApiResponse({ status: 201, description: 'Order created; includes restaurant contact numbers' }),
    ApiResponse({ status: 400, description: 'Restaurant closed / cart empty / area not covered / below minimum order' }),
  );
}

export function FindAllOrdersSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Orders list: customers see their own, staff see all (filters: status, scope, date, keyword)' }),
    ApiResponse({ status: 200, description: 'Paginated orders returned' }),
  );
}

export function FindOrderByIdSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get specific order by id' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Order details' }),
    ApiResponse({ status: 404, description: 'Order not found' }),
  );
}

export function AcceptOrderSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Admin/Manager accepts order and estimates delivery time' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiBody({ type: AcceptOrderDto }),
    ApiResponse({ status: 200, description: 'Order accepted' }),
  );
}

export function RejectOrderSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Admin/Manager rejects order and restores inventory' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiBody({ type: RejectOrderDto }),
    ApiResponse({ status: 200, description: 'Order rejected, stock restored' }),
  );
}

export function UpdateOrderStatusSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Admin/Manager updates order status workflow' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiBody({ type: UpdateOrderStatusDto }),
    ApiResponse({ status: 200, description: 'Order status updated' }),
  );
}

export function UpdateOrderPaidSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Mark order as paid' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Order marked as paid' }),
  );
}

export function UpdateOrderDeliveredSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Mark order as delivered' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Order marked as delivered' }),
  );
}

export function AddOrderReviewSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Customer rates and reviews a delivered order' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiBody({ type: AddOrderReviewDto }),
    ApiResponse({ status: 200, description: 'Order review saved' }),
  );
}

export function DailySalesAnalyticsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get daily sales and orders analytics report' }),
    ApiQuery({ name: 'date', required: false, type: String, example: '2026-11-16' }),
    ApiResponse({ status: 200, description: 'Daily analytics report returned' }),
  );
}

export function SalesSummaryAnalyticsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get overall lifetime and today sales summary analytics' }),
    ApiResponse({ status: 200, description: 'Sales summary returned' }),
  );
}
