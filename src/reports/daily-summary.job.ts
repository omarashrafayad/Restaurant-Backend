import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { ReportsService } from './reports.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { restaurantTz } from '../common/utils/time.util.js';

/** Sends the owner/managers the day's sales at 23:59 restaurant time. */
@Injectable()
export class DailySummaryJob implements OnModuleInit {
  private readonly logger = new Logger(DailySummaryJob.name);

  constructor(
    private readonly reports: ReportsService,
    private readonly notifications: NotificationsService,
    private readonly scheduler: SchedulerRegistry,
  ) {}

  onModuleInit() {
    const job = CronJob.from({
      cronTime: '0 59 23 * * *',
      timeZone: restaurantTz(),
      onTick: () => void this.run(),
      start: true,
    });
    this.scheduler.addCronJob('daily-sales-summary', job as any);
  }

  async run(date?: string) {
    try {
      const r = await this.reports.daily(date);
      const top = r.topItems[0] ? ` • الأكثر طلباً: ${r.topItems[0].title}` : '';
      await this.notifications.alertStaff({
        title: `📊 ملخص مبيعات اليوم ${r.date}`,
        body: `${r.salesOrders} طلب • ${r.grossSales.toLocaleString('en-US')} ج.م${top}`,
        data: { type: 'daily_report', date: r.date },
      });
      return r;
    } catch (err: any) {
      this.logger.error(`Daily summary failed: ${err.message}`);
      return null;
    }
  }
}
