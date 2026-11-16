import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types, Model } from 'mongoose';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true })
export class Review {
  _id: Types.ObjectId;

  @Prop()
  title?: string;

  @Prop({
    required: [true, 'review ratings required'],
    min: [1, 'Min ratings value is 1.0'],
    max: [5, 'Max ratings value is 5.0'],
  })
  ratings: number;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to user'],
  })
  user: Types.ObjectId;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Product',
    required: [true, 'Review must belong to product'],
  })
  product: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

ReviewSchema.pre(/^find/, function () {
  (this as any)
    .populate({ path: 'user', select: 'name _id' })
    .populate({ path: 'product', select: 'title _id' });
});

ReviewSchema.statics.calcAverageRatingsAndQuantity = async function (
  productId: Types.ObjectId | string,
) {
  const result = await this.aggregate([
    { $match: { product: new Types.ObjectId(productId.toString()) } },
    {
      $group: {
        _id: '$product',
        avgRatings: { $avg: '$ratings' },
        ratingsQuantity: { $sum: 1 },
      },
    },
  ]);

  const productModel = this.db.model('Product');
  if (result.length > 0) {
    await productModel.findByIdAndUpdate(productId, {
      ratingsAverage: Math.round(result[0].avgRatings * 10) / 10,
      ratingsQuantity: result[0].ratingsQuantity,
    });
  } else {
    await productModel.findByIdAndUpdate(productId, {
      ratingsAverage: 1,
      ratingsQuantity: 0,
    });
  }
};

ReviewSchema.post('save', async function () {
  const reviewModel = this.constructor as any;
  if (typeof reviewModel.calcAverageRatingsAndQuantity === 'function') {
    await reviewModel.calcAverageRatingsAndQuantity(this.product);
  }
});

ReviewSchema.post('findOneAndDelete', async function (doc: any) {
  if (doc && doc.product) {
    const reviewModel = (this as any).model;
    if (typeof reviewModel.calcAverageRatingsAndQuantity === 'function') {
      await reviewModel.calcAverageRatingsAndQuantity(doc.product);
    }
  }
});
