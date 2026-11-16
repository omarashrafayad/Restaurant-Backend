import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { APi_TAGS } from '../common/swagger/constant.js';
import { Authorize } from '../auth/decorator/roles.decorator.js';
import { Roles } from '../common/constants/roles.constant.js';
import { ReportsService } from './reports.service.js';
import { DailyReportQueryDto, RangeReportQueryDto, ReviewsQueryDto } from './dtos/report-query.dto.js';

@ApiTags(APi_TAGS.REPORTS)
@Authorize(Roles.ADMIN, Roles.MANAGER)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @ApiOperation({ summary: 'Daily report: sales, orders by status, top items, zones, hours, rejection reasons, ratings' })
  @Get('daily')
  daily(@Query() query: DailyReportQueryDto) {
    return this.reports.daily(query.date);
  }

  @ApiOperation({ summary: 'Totals and per-day series between two dates (max 92 days, default last 7 days)' })
  @Get('range')
  range(@Query() query: RangeReportQueryDto) {
    return this.reports.range(query.from, query.to);
  }

  @ApiOperation({ summary: 'Today + lifetime totals for dashboard cards' })
  @Get('summary')
  summary() {
    return this.reports.summary();
  }

  @ApiOperation({ summary: 'Customer ratings & comments (filter low ratings to follow up)' })
  @Get('reviews')
  reviews(@Query() query: ReviewsQueryDto) {
    return this.reports.reviews(query.page, query.limit, query.maxRating);
  }
}

/** Old analytics URLs kept working for the first dashboard version. */
@ApiTags(APi_TAGS.REPORTS)
@Authorize(Roles.ADMIN, Roles.MANAGER)
@Controller('order/analytics')
export class LegacyAnalyticsController {
  constructor(private readonly reports: ReportsService) {}

  @ApiOperation({ summary: 'Deprecated: use GET /reports/daily', deprecated: true })
  @Get('daily-sales')
  daily(@Query() query: DailyReportQueryDto) {
    return this.reports.daily(query.date);
  }

  @ApiOperation({ summary: 'Deprecated: use GET /reports/summary', deprecated: true })
  @Get('summary')
  summary() {
    return this.reports.summary();
  }
}
