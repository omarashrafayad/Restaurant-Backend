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
import { CouponsService } from './coupons.service.js';
import { CreateCouponDto } from './dtos/create-coupon.dto.js';
import { UpdateCouponDto } from './dtos/update-coupon.dto.js';
import { PaginationDto } from '../common/data-accsess/dto/pagination.dto.js';
import { Authorize } from '../auth/decorator/roles.decorator.js';
import { Roles } from '../common/constants/roles.constant.js';
import {
  CreateCouponSwagger,
  FindAllCouponsSwagger,
  FindCouponByIdSwagger,
  UpdateCouponSwagger,
  DeleteCouponSwagger,
} from './swagger/index.js';

@ApiTags(APi_TAGS.COUPONS)
@Controller('coupon')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @FindAllCouponsSwagger()
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Get()
  async getAllCoupons(@Query() query: PaginationDto) {
    return this.couponsService.findAll(query);
  }

  @FindCouponByIdSwagger()
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Get(':id')
  async getCouponById(@Param('id') id: string) {
    return this.couponsService.findById(id);
  }

  @CreateCouponSwagger()
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Post()
  async createCoupon(@Body() body: CreateCouponDto) {
    return this.couponsService.create(body);
  }

  @UpdateCouponSwagger()
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Patch(':id')
  async updateCoupon(
    @Param('id') id: string,
    @Body() body: UpdateCouponDto,
  ) {
    return this.couponsService.update(id, body);
  }

  @DeleteCouponSwagger()
  @Authorize(Roles.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCoupon(@Param('id') id: string) {
    return this.couponsService.delete(id);
  }
}
