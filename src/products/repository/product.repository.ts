import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../schema/product.schema.js';
import { BaseRepository } from '../../common/data-accsess/base-repository.js';
import { ModelNames } from '../../common/data-accsess/model-names.enum.js';

@Injectable()
export class ProductRepository extends BaseRepository<Product> {
  constructor(
    @InjectModel(ModelNames.Products)
    private readonly productModel: Model<ProductDocument>,
  ) {
    super(productModel as unknown as Model<Product>);
  }
}
