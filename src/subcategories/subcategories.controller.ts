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
import { SubcategoriesService } from './subcategories.service.js';
import { CreateSubCategoryDto } from './dtos/create-subcategory.dto.js';
import { UpdateSubCategoryDto } from './dtos/update-subcategory.dto.js';
import { PaginationDto } from '../common/data-accsess/dto/pagination.dto.js';
import { Public } from '../auth/decorator/public.decorator.js';
import { Authorize } from '../auth/decorator/roles.decorator.js';
import { Roles } from '../common/constants/roles.constant.js';
import {
  CreateSubCategorySwagger,
  FindAllSubCategoriesSwagger,
  FindSubCategoryByIdSwagger,
  UpdateSubCategorySwagger,
  DeleteSubCategorySwagger,
} from './swagger/index.js';

@ApiTags(APi_TAGS.SUBCATEGORIES)
@Controller()
export class SubcategoriesController {
  constructor(private readonly subcategoriesService: SubcategoriesService) {}

  @FindAllSubCategoriesSwagger()
  @Public()
  @Get('subcategories')
  async getAllSubCategories(@Query() query: PaginationDto) {
    return this.subcategoriesService.findAll(query);
  }

  // Nested route: /categories/:categoryId/subcategories
  @ApiOperation({ summary: 'Subcategories of a category' })
  @Public()
  @Get('categories/:categoryId/subcategories')
  async getCategorySubCategories(
    @Param('categoryId') categoryId: string,
    @Query() query: PaginationDto,
  ) {
    return this.subcategoriesService.findAll(query, categoryId);
  }

  @CreateSubCategorySwagger()
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Post('subcategories')
  async createSubCategory(@Body() body: CreateSubCategoryDto) {
    return this.subcategoriesService.create(body);
  }

  // Nested route: POST /categories/:categoryId/subcategories
  @ApiOperation({ summary: 'Create a subcategory under a category' })
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Post('categories/:categoryId/subcategories')
  async createCategorySubCategory(
    @Param('categoryId') categoryId: string,
    @Body() body: CreateSubCategoryDto,
  ) {
    return this.subcategoriesService.create(body, categoryId);
  }

  @FindSubCategoryByIdSwagger()
  @Public()
  @Get('subcategories/:id')
  async getSubCategoryById(@Param('id') id: string) {
    return this.subcategoriesService.findById(id);
  }

  @UpdateSubCategorySwagger()
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Patch('subcategories/:id')
  async updateSubCategory(
    @Param('id') id: string,
    @Body() body: UpdateSubCategoryDto,
  ) {
    return this.subcategoriesService.update(id, body);
  }

  @DeleteSubCategorySwagger()
  @Authorize(Roles.ADMIN)
  @Delete('subcategories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSubCategory(@Param('id') id: string) {
    return this.subcategoriesService.delete(id);
  }
}
