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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { APi_TAGS } from '../common/swagger/constant.js';
import { ReviewsService } from './reviews.service.js';
import { CreateReviewDto } from './dtos/create-review.dto.js';
import { UpdateReviewDto } from './dtos/update-review.dto.js';
import { PaginationDto } from '../common/data-accsess/dto/pagination.dto.js';
import { Public } from '../auth/decorator/public.decorator.js';
import { CurrentAccount, Principal } from '../auth/decorator/current-account.decorator.js';
import {
  CreateReviewSwagger,
  FindAllReviewsSwagger,
  FindReviewByIdSwagger,
  UpdateReviewSwagger,
  DeleteReviewSwagger,
} from './swagger/index.js';

@ApiTags(APi_TAGS.REVIEWS)
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @FindAllReviewsSwagger()
  @Public()
  @Get('review')
  async getAllReviews(@Query() query: PaginationDto) {
    return this.reviewsService.findAll(query);
  }

  // Nested route: GET /products/:productId/reviews
  @ApiOperation({ summary: 'Reviews of a product' })
  @Public()
  @Get('products/:productId/reviews')
  async getProductReviews(
    @Param('productId') productId: string,
    @Query() query: PaginationDto,
  ) {
    return this.reviewsService.findAll(query, productId);
  }

  @CreateReviewSwagger()
  @Post('review')
  async createReview(
    @CurrentAccount() principal: Principal,
    @Body() body: CreateReviewDto,
  ) {
    return this.reviewsService.create(principal.user._id, body);
  }

  // Nested route: POST /products/:productId/reviews
  @ApiOperation({ summary: 'Review a product' })
  @Post('products/:productId/reviews')
  async createProductReview(
    @Param('productId') productId: string,
    @CurrentAccount() principal: Principal,
    @Body() body: CreateReviewDto,
  ) {
    return this.reviewsService.create(principal.user._id, body, productId);
  }

  @FindReviewByIdSwagger()
  @Public()
  @Get('review/:id')
  async getReviewById(@Param('id') id: string) {
    return this.reviewsService.findById(id);
  }

  @UpdateReviewSwagger()
  @Patch('review/:id')
  async updateReview(
    @Param('id') id: string,
    @CurrentAccount() principal: Principal,
    @Body() body: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, principal.user._id, body);
  }

  @DeleteReviewSwagger()
  @Delete('review/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReview(
    @Param('id') id: string,
    @CurrentAccount() principal: Principal,
  ) {
    return this.reviewsService.delete(id, principal.user._id, principal.role);
  }
}
