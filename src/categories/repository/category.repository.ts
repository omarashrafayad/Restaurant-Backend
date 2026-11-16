import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../schema/category.schema.js';
import { BaseRepository } from '../../common/data-accsess/base-repository.js';
import { ModelNames } from '../../common/data-accsess/model-names.enum.js';

@Injectable()
export class CategoryRepository extends BaseRepository<Category> {
  constructor(
    @InjectModel(ModelNames.Categories)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {
    super(categoryModel as unknown as Model<Category>);
  }
}
