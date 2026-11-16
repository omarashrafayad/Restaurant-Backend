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
import { BrandsService } from './brands.service.js';
import { CreateBrandDto } from './dtos/create-brand.dto.js';
import { UpdateBrandDto } from './dtos/update-brand.dto.js';
import { PaginationDto } from '../common/data-accsess/dto/pagination.dto.js';
import { Public } from '../auth/decorator/public.decorator.js';
import { Authorize } from '../auth/decorator/roles.decorator.js';
import { Roles } from '../common/constants/roles.constant.js';
import { processAndSaveImage } from '../common/files/utils/file.util.js';
import {
  CreateBrandSwagger,
  FindAllBrandsSwagger,
  FindBrandByIdSwagger,
  UpdateBrandSwagger,
  DeleteBrandSwagger,
} from './swagger/index.js';

@ApiTags(APi_TAGS.BRANDS)
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @FindAllBrandsSwagger()
  @Public()
  @Get()
  async getAllBrands(@Query() query: PaginationDto) {
    return this.brandsService.findAll(query);
  }

  @FindBrandByIdSwagger()
  @Public()
  @Get(':id')
  async getBrandById(@Param('id') id: string) {
    return this.brandsService.findById(id);
  }

  @CreateBrandSwagger()
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Post()
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  async createBrand(
    @Body() body: CreateBrandDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      body.image = await processAndSaveImage(file.buffer, 'brands', 'brand', 600, 600);
    }
    return this.brandsService.create(body);
  }

  @UpdateBrandSwagger()
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  async updateBrand(
    @Param('id') id: string,
    @Body() body: UpdateBrandDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      body.image = await processAndSaveImage(file.buffer, 'brands', 'brand', 600, 600);
    }
    return this.brandsService.update(id, body);
  }

  @DeleteBrandSwagger()
  @Authorize(Roles.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBrand(@Param('id') id: string) {
    return this.brandsService.delete(id);
  }
}
