import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../repository/order.repository.js';

@Injectable()
export class GetDailySalesAnalyticsUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(targetDateStr?: string) {
    const dateStr = targetDateStr || new Date().toISOString().split('T')[0];
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

    const orders = await this.orderRepository.find(
      {
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      },
      {
        populate: [
          { path: 'user', select: 'name phone' },
          { path: 'cartItems.product', select: 'title price' },
        ],
      },
    );

    const totalOrdersCount = orders.length;

    let totalSales = 0;
    let cashSales = 0;
    let cardSales = 0;
    let acceptedCount = 0;
    let deliveredCount = 0;
    let preparingCount = 0;
    let onTheWayCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;
    let cancelledCount = 0;

    const productSalesMap: Record<string, { title: string; quantity: number; revenue: number }> = {};

    orders.forEach((order: any) => {
      switch (order.status) {
        case 'delivered':
          deliveredCount++;
          break;
        case 'accepted':
          acceptedCount++;
          break;
        case 'preparing':
          preparingCount++;
          break;
        case 'on_the_way':
          onTheWayCount++;
          break;
        case 'pending':
          pendingCount++;
          break;
        case 'rejected':
          rejectedCount++;
          break;
        case 'cancelled':
          cancelledCount++;
          break;
      }

      if (order.status !== 'rejected' && order.status !== 'cancelled') {
        totalSales += order.totalOrderPrice || 0;

        if (order.paymentMethodType === 'cash') {
          cashSales += order.totalOrderPrice || 0;
        } else if (order.paymentMethodType === 'card') {
          cardSales += order.totalOrderPrice || 0;
        }

        order.cartItems.forEach((item: any) => {
          const prodId = item.product?._id?.toString() || item.product?.toString() || 'unknown';
          const prodTitle = item.product?.title || 'Product';
          if (!productSalesMap[prodId]) {
            productSalesMap[prodId] = {
              title: prodTitle,
              quantity: 0,
              revenue: 0,
            };
          }
          productSalesMap[prodId].quantity += item.quantity;
          productSalesMap[prodId].revenue += item.price * item.quantity;
        });
      }
    });

    const activeOrdersCount = totalOrdersCount - rejectedCount - cancelledCount;
    const averageOrderValue =
      activeOrdersCount > 0 ? Number((totalSales / activeOrdersCount).toFixed(2)) : 0;

    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    const ordersSummary = orders.map((o: any) => ({
      _id: o._id,
      customerName: o.user?.name || 'Guest',
      customerPhone: o.user?.phone || o.shippingAddress?.phone || 'N/A',
      city: o.shippingAddress?.city,
      totalPrice: o.totalOrderPrice,
      status: o.status,
      rejectionReason: o.rejectionReason,
      paymentMethod: o.paymentMethodType,
      isPaid: o.isPaid,
      createdAt: o.createdAt,
    }));

    return {
      status: 'success',
      date: dateStr,
      summary: {
        totalSales: Number(totalSales.toFixed(2)),
        totalOrdersCount,
        activeOrdersCount,
        deliveredOrdersCount: deliveredCount,
        acceptedOrdersCount: acceptedCount,
        preparingOrdersCount: preparingCount,
        onTheWayOrdersCount: onTheWayCount,
        pendingOrdersCount: pendingCount,
        rejectedOrdersCount: rejectedCount,
        cancelledOrdersCount: cancelledCount,
        cashSales: Number(cashSales.toFixed(2)),
        cardSales: Number(cardSales.toFixed(2)),
        averageOrderValue,
      },
      topSellingProducts,
      orders: ordersSummary,
    };
  }
}
