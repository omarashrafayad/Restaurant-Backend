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
import { PromotionsService } from './promotions.service.js';
import { CreatePromotionDto } from './dtos/create-promotion.dto.js';
import { UpdatePromotionDto } from './dtos/update-promotion.dto.js';
import { ApplyQuickDiscountDto, RemoveQuickDiscountDto } from './dtos/quick-discount.dto.js';
import { PaginationDto } from '../common/data-accsess/dto/pagination.dto.js';
import { Public } from '../auth/decorator/public.decorator.js';
import { Authorize } from '../auth/decorator/roles.decorator.js';
import { Roles } from '../common/constants/roles.constant.js';
import {
  CreatePromotionSwagger,
  FindAllPromotionsSwagger,
  FindPromotionByIdSwagger,
  UpdatePromotionSwagger,
  DeletePromotionSwagger,
  ActivePromotionsSwagger,
  QuickApplySwagger,
  QuickRemoveSwagger,
} from './swagger/index.js';

@ApiTags(APi_TAGS.PROMOTIONS)
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @ActivePromotionsSwagger()
  @Public()
  @Get('active')
  async getActivePromotions() {
    return this.promotionsService.getActive();
  }

  @QuickApplySwagger()
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Post('quick-apply')
  async applyQuickDiscount(@Body() body: ApplyQuickDiscountDto) {
    return this.promotionsService.applyQuick(body);
  }

  @QuickRemoveSwagger()
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Post('quick-remove')
  async removeQuickDiscount(@Body() body: RemoveQuickDiscountDto) {
    return this.promotionsService.removeQuick(body);
  }

  @FindAllPromotionsSwagger()
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Get()
  async getAllPromotions(@Query() query: PaginationDto) {
    return this.promotionsService.findAll(query);
  }

  @CreatePromotionSwagger()
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Post()
  async createPromotion(@Body() body: CreatePromotionDto) {
    return this.promotionsService.create(body);
  }

  @FindPromotionByIdSwagger()
  @Public()
  @Get(':id')
  async getPromotionById(@Param('id') id: string) {
    return this.promotionsService.findById(id);
  }

  @UpdatePromotionSwagger()
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Patch(':id')
  async updatePromotion(
    @Param('id') id: string,
    @Body() body: UpdatePromotionDto,
  ) {
    return this.promotionsService.update(id, body);
  }

  @DeletePromotionSwagger()
  @Authorize(Roles.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePromotion(@Param('id') id: string) {
    return this.promotionsService.delete(id);
  }
}
