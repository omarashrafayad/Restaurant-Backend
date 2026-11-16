import { IsIn, IsMongoId, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AddressDto } from '../../users/dto/address.dto.js';

/** Where to deliver: a saved address, a one-off address, or the default address. */
export class CheckoutPreviewDto {
  @ApiPropertyOptional({ example: '665f1c2e9b1e8a0012345678', description: 'Saved address id' })
  @IsOptional()
  @IsMongoId()
  addressId?: string;

  @ApiPropertyOptional({ type: AddressDto, description: 'One-off address (not saved)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;
}

export class CreateOrderDto extends CheckoutPreviewDto {
  @ApiPropertyOptional({ example: 'من فضلك متضربش الجرس، كلمني أول ما توصل' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({ enum: ['cash'], default: 'cash' })
  @IsOptional()
  @IsIn(['cash'])
  paymentMethod?: 'cash';
}
