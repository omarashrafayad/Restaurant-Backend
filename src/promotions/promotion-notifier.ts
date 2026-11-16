import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PromotionRepository } from './repository/promotion.repository.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { NotificationType } from '../notifications/schema/notification.schema.js';
import { activeWindowKey, dateRangeFilter } from './promotion-schedule.js';

/**
 * Every minute: for each promotion whose window just opened, notify all
 * customers once. The conditional update on `lastNotifiedKey` makes this safe
 * when several API instances run the same cron.
 */
@Injectable()
export class PromotionNotifier {
  private readonly logger = new Logger(PromotionNotifier.name);

  constructor(
    private readonly promotionRepository: PromotionRepository,
    private readonly notifications: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE, { name: 'promotion-notifier' })
  async tick(now: Date = new Date()): Promise<number> {
    let sent = 0;
    try {
      const candidates = await this.promotionRepository.model
        .find({ ...dateRangeFilter(now), notifyCustomers: true })
        .lean();

      for (const promo of candidates) {
        const key = activeWindowKey(promo, now);
        if (!key || promo.lastNotifiedKey === key) continue;

        const claimed = await this.promotionRepository.model.updateOne(
          { _id: promo._id, lastNotifiedKey: { $ne: key } },
          { $set: { lastNotifiedKey: key } },
        );
        if (claimed.modifiedCount === 0) continue;

        await this.notifications.broadcast({
          type: NotificationType.PROMOTION,
          title: `🔥 ${promo.title}`,
          body: promo.description || `خصم ${promo.discountPercentage}% متاح دلوقتي في Take Five!`,
          data: { promotionId: promo._id.toString() },
        });
        sent++;
      }
    } catch (err: any) {
      this.logger.error(`Promotion notifier failed: ${err.message}`);
    }
    return sent;
  }
}
