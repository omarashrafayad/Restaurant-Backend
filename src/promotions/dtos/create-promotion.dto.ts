import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HHMM_REGEX } from '../../common/utils/time.util.js';

export class CreatePromotionDto {
  @ApiProperty({ example: 'Friday Burger Deal' })
  @IsNotEmpty({ message: 'Promotion title is required' })
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({ example: 'خصم 20% على كل البرجر يوم الجمعة' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 20 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(90)
  discountPercentage: number;

  @ApiPropertyOptional({ enum: ['all', 'category', 'products'], default: 'all', description: 'all = whole menu' })
  @IsOptional()
  @IsIn(['all', 'category', 'products'])
  target?: 'all' | 'category' | 'products';

  @ApiPropertyOptional({ example: ['60d0fe4f5311236168a109ca'], description: 'Required when target = category' })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsMongoId({ each: true })
  categories?: string[];

  @ApiPropertyOptional({ example: ['60d0fe4f5311236168a109cb'], description: 'Required when target = products' })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsMongoId({ each: true })
  products?: string[];

  @ApiPropertyOptional({ example: [5], description: '0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat; empty = every day' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(7)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  daysOfWeek?: number[];

  @ApiPropertyOptional({ example: '18:00', description: 'Daily start time (restaurant local time)' })
  @IsOptional()
  @Matches(HHMM_REGEX, { message: 'startTime must be HH:mm' })
  startTime?: string;

  @ApiPropertyOptional({ example: '23:00', description: 'Daily end time; earlier than startTime = past midnight' })
  @IsOptional()
  @Matches(HHMM_REGEX, { message: 'endTime must be HH:mm' })
  endTime?: string;

  @ApiPropertyOptional({ example: '2026-12-01T00:00:00.000Z', description: 'Defaults to now' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: true, default: true, description: 'Push notification to all customers when it starts' })
  @IsOptional()
  @IsBoolean()
  notifyCustomers?: boolean;
}
