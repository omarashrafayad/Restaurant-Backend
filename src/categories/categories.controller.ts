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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageUploadOptions } from '../common/files/upload-options.js';
import { ApiTags } from '@nestjs/swagger';
import { APi_TAGS } from '../common/swagger/constant.js';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dtos/create-category.dto.js';
import { UpdateCategoryDto } from './dtos/update-category.dto.js';
import { PaginationDto } from '../common/data-accsess/dto/pagination.dto.js';
import { Public } from '../auth/decorator/public.decorator.js';
import { Authorize } from '../auth/decorator/roles.decorator.js';
import { Roles } from '../common/constants/roles.constant.js';
import { processAndSaveImage } from '../common/files/utils/file.util.js';
import {
  CreateCategorySwagger,
  FindAllCategoriesSwagger,
  FindCategoryByIdSwagger,
  UpdateCategorySwagger,
  DeleteCategorySwagger,
} from './swagger/index.js';

@ApiTags(APi_TAGS.CATEGORIES)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @FindAllCategoriesSwagger()
  @Public()
  @Get()
  async getAllCategories(@Query() query: PaginationDto) {
    return this.categoriesService.findAll(query);
  }

  @FindCategoryByIdSwagger()
  @Public()
  @Get(':id')
  async getCategoryById(@Param('id') id: string) {
    return this.categoriesService.findById(id);
  }

  @CreateCategorySwagger()
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Post()
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  async createCategory(
    @Body() body: CreateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      body.image = await processAndSaveImage(file.buffer, 'categories', 'category', 600, 600);
    }
    return this.categoriesService.create(body);
  }

  @UpdateCategorySwagger()
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  async updateCategory(
    @Param('id') id: string,
    @Body() body: UpdateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      body.image = await processAndSaveImage(file.buffer, 'categories', 'category', 600, 600);
    }
    return this.categoriesService.update(id, body);
  }

  @DeleteCategorySwagger()
  @Authorize(Roles.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCategory(@Param('id') id: string) {
    return this.categoriesService.delete(id);
  }
}
