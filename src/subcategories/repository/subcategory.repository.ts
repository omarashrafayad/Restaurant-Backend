import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubCategory, SubCategoryDocument } from '../schema/subcategory.schema.js';
import { BaseRepository } from '../../common/data-accsess/base-repository.js';
import { ModelNames } from '../../common/data-accsess/model-names.enum.js';

@Injectable()
export class SubCategoryRepository extends BaseRepository<SubCategory> {
  constructor(
    @InjectModel(ModelNames.SubCategories)
    private readonly subCategoryModel: Model<SubCategoryDocument>,
  ) {
    super(subCategoryModel as unknown as Model<SubCategory>);
  }
}
