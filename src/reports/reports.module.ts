import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module.js';
import { ReportsService } from './reports.service.js';
import { LegacyAnalyticsController, ReportsController } from './reports.controller.js';
import { DailySummaryJob } from './daily-summary.job.js';

@Module({
  imports: [OrdersModule],
  controllers: [ReportsController, LegacyAnalyticsController],
  providers: [ReportsService, DailySummaryJob],
  exports: [ReportsService],
})
export class ReportsModule {}
