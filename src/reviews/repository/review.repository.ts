import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from '../schema/review.schema.js';
import { BaseRepository } from '../../common/data-accsess/base-repository.js';
import { ModelNames } from '../../common/data-accsess/model-names.enum.js';

@Injectable()
export class ReviewRepository extends BaseRepository<Review> {
  constructor(
    @InjectModel(ModelNames.Reviews)
    private readonly reviewModel: Model<ReviewDocument>,
  ) {
    super(reviewModel as unknown as Model<Review>);
  }

  async calcAverageRatingsAndQuantity(productId: string) {
    const model = this.model as any;
    if (typeof model.calcAverageRatingsAndQuantity === 'function') {
      await model.calcAverageRatingsAndQuantity(productId);
    }
  }
}
