import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../schema/order.schema.js';
import { BaseRepository } from '../../common/data-accsess/base-repository.js';
import { ModelNames } from '../../common/data-accsess/model-names.enum.js';

@Injectable()
export class OrderRepository extends BaseRepository<Order> {
  constructor(
    @InjectModel(ModelNames.Orders)
    private readonly orderModel: Model<OrderDocument>,
  ) {
    super(orderModel as unknown as Model<Order>);
  }
}
