import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { APi_TAGS } from '../common/swagger/constant.js';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dtos/create-order.dto.js';
import {
  AcceptOrderDto,
  AddOrderReviewDto,
  RejectOrderDto,
  UpdateOrderStatusDto,
} from './dtos/order-actions.dto.js';
import { PaginationDto } from '../common/data-accsess/dto/pagination.dto.js';
import { CurrentAccount, Principal } from '../auth/decorator/current-account.decorator.js';
import { Authorize } from '../auth/decorator/roles.decorator.js';
import { Roles } from '../common/constants/roles.constant.js';
import {
  CreateOrderSwagger,
  FindAllOrdersSwagger,
  FindOrderByIdSwagger,
  AcceptOrderSwagger,
  RejectOrderSwagger,
  UpdateOrderStatusSwagger,
  UpdateOrderPaidSwagger,
  UpdateOrderDeliveredSwagger,
  AddOrderReviewSwagger,
  DailySalesAnalyticsSwagger,
  SalesSummaryAnalyticsSwagger,
} from './swagger/index.js';

@ApiTags(APi_TAGS.ORDERS)
@Controller('order')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @DailySalesAnalyticsSwagger()
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Get('analytics/daily-sales')
  async getDailySalesAnalytics(@Query('date') date?: string) {
    return this.ordersService.getDailySalesAnalytics(date);
  }

  @SalesSummaryAnalyticsSwagger()
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Get('analytics/summary')
  async getSalesSummaryAnalytics() {
    return this.ordersService.getSalesSummaryAnalytics();
  }

  @CreateOrderSwagger()
  @Post(':cartId')
  async createCashOrder(
    @CurrentAccount() principal: Principal,
    @Param('cartId') cartId: string,
    @Body() body: CreateOrderDto,
  ) {
    return this.ordersService.createCashOrder(principal.user._id, cartId, body);
  }

  @FindAllOrdersSwagger()
  @Get()
  async findAllOrders(
    @CurrentAccount() principal: Principal,
    @Query() query: PaginationDto,
  ) {
    return this.ordersService.findAll(principal.user._id, principal.role, query);
  }

  @FindOrderByIdSwagger()
  @Get(':id')
  async findSpecificOrder(
    @CurrentAccount() principal: Principal,
    @Param('id') id: string,
  ) {
    return this.ordersService.findById(id, principal.user._id, principal.role);
  }

  @Authorize(Roles.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOrder(@Param('id') id: string) {
    return this.ordersService.delete(id);
  }

  @UpdateOrderPaidSwagger()
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Patch(':id/pay')
  async updateOrderToPaid(@Param('id') id: string) {
    return this.ordersService.updateToPaid(id);
  }

  @UpdateOrderDeliveredSwagger()
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Patch(':id/deliver')
  async updateOrderToDelivered(@Param('id') id: string) {
    return this.ordersService.updateToDelivered(id);
  }

  @AcceptOrderSwagger()
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Patch(':id/accept')
  async acceptOrder(
    @Param('id') id: string,
    @Body() body: AcceptOrderDto,
  ) {
    return this.ordersService.acceptOrder(id, body);
  }

  @RejectOrderSwagger()
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Patch(':id/reject')
  async rejectOrder(
    @Param('id') id: string,
    @Body() body: RejectOrderDto,
  ) {
    return this.ordersService.rejectOrder(id, body);
  }

  @UpdateOrderStatusSwagger()
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Patch(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() body: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, body);
  }

  @AddOrderReviewSwagger()
  @Post(':id/review')
  async addOrderReview(
    @CurrentAccount() principal: Principal,
    @Param('id') id: string,
    @Body() body: AddOrderReviewDto,
  ) {
    return this.ordersService.addReview(id, principal.user._id, body);
  }
}
