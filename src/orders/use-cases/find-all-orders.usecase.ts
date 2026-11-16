import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../repository/order.repository.js';
import { PaginationDto } from '../../common/data-accsess/dto/pagination.dto.js';
import { Roles } from '../../common/constants/roles.constant.js';

@Injectable()
export class FindAllOrdersUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(userId: string, role: string, query: PaginationDto) {
    const filterQuery: Record<string, any> = {};

    if (role === Roles.USER) {
      filterQuery.user = userId;
    }

    if (query.keyword) {
      filterQuery['shippingAddress.city'] = { $regex: query.keyword, $options: 'i' };
    }

    const result = await this.orderRepository.findPaginated(filterQuery, {
      page: query.page,
      limit: query.limit,
      ignoreLimit: query.ignoreLimit,
      sort: query.sort,
      populate: [
        { path: 'user', select: 'name email phone addresses' },
        { path: 'cartItems.product', select: 'title imageCover price priceAfterDiscount' },
      ],
    });

    return result;
  }
}
