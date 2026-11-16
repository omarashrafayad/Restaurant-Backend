import { IsIn, IsOptional, IsString, Matches, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DATE_REGEX } from '../../common/utils/time.util.js';

export class QueryOrdersDto {
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

  @ApiPropertyOptional({ example: 'pending,accepted', description: 'Comma separated statuses' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'active', enum: ['active', 'history'] })
  @IsOptional()
  @IsIn(['active', 'history'])
  scope?: 'active' | 'history';

  @ApiPropertyOptional({ example: '2026-11-16', description: 'Restaurant-local day' })
  @IsOptional()
  @Matches(DATE_REGEX, { message: 'date must be YYYY-MM-DD' })
  date?: string;

  @ApiPropertyOptional({ example: '1024 or 0101234 or name', description: 'Order number, customer phone or name (staff)' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ example: '-createdAt', enum: ['createdAt', '-createdAt'] })
  @IsOptional()
  @IsIn(['createdAt', '-createdAt'])
  sort?: string;
}
