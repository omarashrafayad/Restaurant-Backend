import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand, BrandDocument } from '../schema/brand.schema.js';
import { BaseRepository } from '../../common/data-accsess/base-repository.js';
import { ModelNames } from '../../common/data-accsess/model-names.enum.js';

@Injectable()
export class BrandRepository extends BaseRepository<Brand> {
  constructor(
    @InjectModel(ModelNames.Brands)
    private readonly brandModel: Model<BrandDocument>,
  ) {
    super(brandModel as unknown as Model<Brand>);
  }
}
