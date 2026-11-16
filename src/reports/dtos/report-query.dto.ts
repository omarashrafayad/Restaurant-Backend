import { IsOptional, Matches, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DATE_REGEX } from '../../common/utils/time.util.js';

export class DailyReportQueryDto {
  @ApiPropertyOptional({ example: '2026-11-16', description: 'Restaurant-local day (default: today)' })
  @IsOptional()
  @Matches(DATE_REGEX, { message: 'date must be YYYY-MM-DD' })
  date?: string;
}

export class RangeReportQueryDto {
  @ApiPropertyOptional({ example: '2026-11-01' })
  @IsOptional()
  @Matches(DATE_REGEX, { message: 'from must be YYYY-MM-DD' })
  from?: string;

  @ApiPropertyOptional({ example: '2026-11-30' })
  @IsOptional()
  @Matches(DATE_REGEX, { message: 'to must be YYYY-MM-DD' })
  to?: string;
}

export class ReviewsQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ example: 2, description: 'Only ratings <= this value (find unhappy customers)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  maxRating?: number;
}
