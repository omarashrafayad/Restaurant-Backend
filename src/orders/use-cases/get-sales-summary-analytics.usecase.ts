import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../repository/order.repository.js';

@Injectable()
export class GetSalesSummaryAnalyticsUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute() {
    const todayStr = new Date().toISOString().split('T')[0];
    const startOfToday = new Date(`${todayStr}T00:00:00.000Z`);

    const allOrders = await this.orderRepository.find();

    let lifetimeSales = 0;
    let todaySales = 0;
    let totalDelivered = 0;
    let totalRejected = 0;

    const zoneOrdersMap: Record<string, { orderCount: number; revenue: number }> = {};

    allOrders.forEach((o: any) => {
      if (o.status !== 'rejected' && o.status !== 'cancelled') {
        lifetimeSales += o.totalOrderPrice || 0;
        if (new Date(o.createdAt) >= startOfToday) {
          todaySales += o.totalOrderPrice || 0;
        }
        if (o.status === 'delivered') totalDelivered++;

        const city = o.shippingAddress?.city || 'Unknown';
        if (!zoneOrdersMap[city]) {
          zoneOrdersMap[city] = { orderCount: 0, revenue: 0 };
        }
        zoneOrdersMap[city].orderCount++;
        zoneOrdersMap[city].revenue += o.totalOrderPrice || 0;
      } else if (o.status === 'rejected') {
        totalRejected++;
      }
    });

    return {
      status: 'success',
      data: {
        lifetimeSales: Number(lifetimeSales.toFixed(2)),
        todaySales: Number(todaySales.toFixed(2)),
        totalOrders: allOrders.length,
        totalDelivered,
        totalRejected,
        zonesBreakdown: zoneOrdersMap,
      },
    };
  }
}
