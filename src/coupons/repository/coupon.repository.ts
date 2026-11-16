import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon, CouponDocument } from '../schema/coupon.schema.js';
import { BaseRepository } from '../../common/data-accsess/base-repository.js';
import { ModelNames } from '../../common/data-accsess/model-names.enum.js';

@Injectable()
export class CouponRepository extends BaseRepository<Coupon> {
  constructor(
    @InjectModel(ModelNames.Coupons)
    private readonly couponModel: Model<CouponDocument>,
  ) {
    super(couponModel as unknown as Model<Coupon>);
  }
}
