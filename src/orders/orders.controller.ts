import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { APi_TAGS } from '../common/swagger/constant.js';
import { OrdersService } from './orders.service.js';
import { CheckoutPreviewDto, CreateOrderDto } from './dtos/create-order.dto.js';
import {
  AcceptOrderDto,
  AddOrderReviewDto,
  CancelOrderDto,
  RejectOrderDto,
  UpdateOrderStatusDto,
} from './dtos/order-actions.dto.js';
import { QueryOrdersDto } from './dtos/query-orders.dto.js';
import { CurrentAccount, Principal } from '../auth/decorator/current-account.decorator.js';
import { Authorize } from '../auth/decorator/roles.decorator.js';
import { Roles } from '../common/constants/roles.constant.js';
import { OrderStatus } from './order-status.js';
import {
  AcceptOrderSwagger,
  AddOrderReviewSwagger,
  CreateOrderSwagger,
  FindAllOrdersSwagger,
  FindOrderByIdSwagger,
  RejectOrderSwagger,
  UpdateOrderDeliveredSwagger,
  UpdateOrderPaidSwagger,
  UpdateOrderStatusSwagger,
} from './swagger/index.js';

const viewer = (p: Principal) => ({ userId: p.user._id, role: p.role });
const restaurant = (p: Principal) => ({ userId: p.user._id, type: 'restaurant' as const });

@ApiTags(APi_TAGS.ORDERS)
@Controller('order')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ---------------- Customer ----------------

  @ApiOperation({ summary: 'Checkout screen: totals, delivery fee, minimum order and blocking issues' })
  @Post('preview')
  @HttpCode(HttpStatus.OK)
  preview(@CurrentAccount() principal: Principal, @Body() body: CheckoutPreviewDto) {
    return this.ordersService.preview(principal.user._id, body);
  }

  @CreateOrderSwagger()
  @Post()
  create(@CurrentAccount() principal: Principal, @Body() body: CreateOrderDto) {
    return this.ordersService.create(principal.user._id, body);
  }

  @ApiOperation({ summary: "Customer's orders that are still in progress (tracking banner)" })
  @Get('active')
  active(@CurrentAccount() principal: Principal) {
    return this.ordersService.active(principal.user._id);
  }

  @FindAllOrdersSwagger()
  @Get()
  findAll(@CurrentAccount() principal: Principal, @Query() query: QueryOrdersDto) {
    return this.ordersService.findAll(viewer(principal), query);
  }

  @FindOrderByIdSwagger()
  @Get(':id')
  findOne(@CurrentAccount() principal: Principal, @Param('id') id: string) {
    return this.ordersService.findById(id, viewer(principal));
  }

  @ApiOperation({ summary: 'Customer cancels their order (only while pending)' })
  @Patch(':id/cancel')
  cancel(@CurrentAccount() principal: Principal, @Param('id') id: string, @Body() body: CancelOrderDto) {
    return this.ordersService.transition(
      id,
      OrderStatus.CANCELLED,
      { userId: principal.user._id, type: 'customer' },
      { reason: body.reason },
    );
  }

  @AddOrderReviewSwagger()
  @Post(':id/review')
  addReview(@CurrentAccount() principal: Principal, @Param('id') id: string, @Body() body: AddOrderReviewDto) {
    return this.ordersService.addReview(id, principal.user._id, body);
  }

  @ApiOperation({ summary: 'Add the items of a previous order to the cart' })
  @Post(':id/reorder')
  reorder(@CurrentAccount() principal: Principal, @Param('id') id: string) {
    return this.ordersService.reorder(id, principal.user._id);
  }

  // ---------------- Restaurant ----------------

  @AcceptOrderSwagger()
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Patch(':id/accept')
  accept(@CurrentAccount() principal: Principal, @Param('id') id: string, @Body() body: AcceptOrderDto) {
    return this.ordersService.transition(id, OrderStatus.ACCEPTED, restaurant(principal), {
      estimatedDeliveryMinutes: body.estimatedDeliveryMinutes,
    });
  }

  @RejectOrderSwagger()
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Patch(':id/reject')
  reject(@CurrentAccount() principal: Principal, @Param('id') id: string, @Body() body: RejectOrderDto) {
    return this.ordersService.transition(id, OrderStatus.REJECTED, restaurant(principal), { reason: body.reason });
  }

  @UpdateOrderStatusSwagger()
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Patch(':id/status')
  updateStatus(@CurrentAccount() principal: Principal, @Param('id') id: string, @Body() body: UpdateOrderStatusDto) {
    return this.ordersService.transition(id, body.status as OrderStatus, restaurant(principal), {
      reason: body.reason,
    });
  }

  @UpdateOrderDeliveredSwagger()
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Patch(':id/deliver')
  deliver(@CurrentAccount() principal: Principal, @Param('id') id: string) {
    return this.ordersService.transition(id, OrderStatus.DELIVERED, restaurant(principal));
  }

  @UpdateOrderPaidSwagger()
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Patch(':id/pay')
  pay(@Param('id') id: string) {
    return this.ordersService.markPaid(id);
  }

  @Authorize(Roles.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.ordersService.delete(id);
  }
}
