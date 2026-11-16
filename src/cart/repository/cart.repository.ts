import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from '../schema/cart.schema.js';
import { BaseRepository } from '../../common/data-accsess/base-repository.js';
import { ModelNames } from '../../common/data-accsess/model-names.enum.js';

@Injectable()
export class CartRepository extends BaseRepository<Cart> {
  constructor(
    @InjectModel(ModelNames.Cart)
    private readonly cartModel: Model<CartDocument>,
  ) {
    super(cartModel as unknown as Model<Cart>);
  }
}
