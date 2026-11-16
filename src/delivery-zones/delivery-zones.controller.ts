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
import { DeliveryZonesService } from './delivery-zones.service.js';
import { CreateDeliveryZoneDto } from './dtos/create-delivery-zone.dto.js';
import { UpdateDeliveryZoneDto } from './dtos/update-delivery-zone.dto.js';
import { CheckDeliveryFeeDto } from './dtos/check-delivery-fee.dto.js';
import { PaginationDto } from '../common/data-accsess/dto/pagination.dto.js';
import { Public } from '../auth/decorator/public.decorator.js';
import { Authorize } from '../auth/decorator/roles.decorator.js';
import { Roles } from '../common/constants/roles.constant.js';
import {
  CreateDeliveryZoneSwagger,
  FindAllDeliveryZonesSwagger,
  FindDeliveryZoneByIdSwagger,
  UpdateDeliveryZoneSwagger,
  DeleteDeliveryZoneSwagger,
  CheckDeliveryFeeSwagger,
} from './swagger/index.js';

@ApiTags(APi_TAGS.DELIVERY_ZONES)
@Controller('delivery-zones')
export class DeliveryZonesController {
  constructor(private readonly deliveryZonesService: DeliveryZonesService) {}

  @CheckDeliveryFeeSwagger()
  @Public()
  @Get('check')
  async checkDeliveryFeeGet(@Query('city') city: string) {
    return this.deliveryZonesService.checkDeliveryFee(city);
  }

  @Public()
  @Post('check-fee')
  async checkDeliveryFeePost(@Body() body: CheckDeliveryFeeDto) {
    return this.deliveryZonesService.checkDeliveryFee(body.city);
  }

  @FindAllDeliveryZonesSwagger()
  @Public()
  @Get()
  async getAllDeliveryZones(@Query() query: PaginationDto) {
    return this.deliveryZonesService.findAll(query);
  }

  @CreateDeliveryZoneSwagger()
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Post()
  async createDeliveryZone(@Body() body: CreateDeliveryZoneDto) {
    return this.deliveryZonesService.create(body);
  }

  @FindDeliveryZoneByIdSwagger()
  @Public()
  @Get(':id')
  async getDeliveryZoneById(@Param('id') id: string) {
    return this.deliveryZonesService.findById(id);
  }

  @UpdateDeliveryZoneSwagger()
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Patch(':id')
  async updateDeliveryZone(
    @Param('id') id: string,
    @Body() body: UpdateDeliveryZoneDto,
  ) {
    return this.deliveryZonesService.update(id, body);
  }

  @DeleteDeliveryZoneSwagger()
  @Authorize(Roles.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDeliveryZone(@Param('id') id: string) {
    return this.deliveryZonesService.delete(id);
  }
}
