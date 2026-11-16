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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { imageUploadOptions } from '../common/files/upload-options.js';
import { ApiTags } from '@nestjs/swagger';
import { QueryProductsDto } from './dtos/query-products.dto.js';
import { APi_TAGS } from '../common/swagger/constant.js';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dtos/create-product.dto.js';
import { UpdateProductDto } from './dtos/update-product.dto.js';
import { Public } from '../auth/decorator/public.decorator.js';
import { Authorize } from '../auth/decorator/roles.decorator.js';
import { Roles } from '../common/constants/roles.constant.js';
import { processAndSaveImage } from '../common/files/utils/file.util.js';
import {
  CreateProductSwagger,
  FindAllProductsSwagger,
  FindProductByIdSwagger,
  UpdateProductSwagger,
  DeleteProductSwagger,
} from './swagger/index.js';

@ApiTags(APi_TAGS.PRODUCTS)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @FindAllProductsSwagger()
  @Public()
  @Get()
  async getAllProducts(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }

  @FindAllProductsSwagger()
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Get('manage')
  async getAllProductsForStaff(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query, true);
  }

  @FindProductByIdSwagger()
  @Public()
  @Get(':id')
  async getProductById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @CreateProductSwagger()
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'imageCover', maxCount: 1 },
        { name: 'images', maxCount: 5 },
      ],
      imageUploadOptions,
    ),
  )
  async createProduct(
    @Body() body: CreateProductDto,
    @UploadedFiles()
    files?: {
      imageCover?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    if (files?.imageCover && files.imageCover[0]) {
      body.imageCover = await processAndSaveImage(
        files.imageCover[0].buffer,
        'products',
        'product',
        2000,
        1333,
      );
    }

    if (files?.images && files.images.length > 0) {
      body.images = await Promise.all(
        files.images.map((f, i) =>
          processAndSaveImage(f.buffer, 'products', `product-${i + 1}`, 2000, 1333),
        ),
      );
    }

    return this.productsService.create(body);
  }

  @UpdateProductSwagger()
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'imageCover', maxCount: 1 },
        { name: 'images', maxCount: 5 },
      ],
      imageUploadOptions,
    ),
  )
  async updateProduct(
    @Param('id') id: string,
    @Body() body: UpdateProductDto,
    @UploadedFiles()
    files?: {
      imageCover?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    if (files?.imageCover && files.imageCover[0]) {
      body.imageCover = await processAndSaveImage(
        files.imageCover[0].buffer,
        'products',
        'product',
        2000,
        1333,
      );
    }

    if (files?.images && files.images.length > 0) {
      body.images = await Promise.all(
        files.images.map((f, i) =>
          processAndSaveImage(f.buffer, 'products', `product-${i + 1}`, 2000, 1333),
        ),
      );
    }

    return this.productsService.update(id, body);
  }

  @DeleteProductSwagger()
  @Authorize(Roles.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProduct(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}
