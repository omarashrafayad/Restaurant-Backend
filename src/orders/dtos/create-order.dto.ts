import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AddressInputDto } from '../../auth/dtos/signup.dto.js';

export class CreateOrderDto {
  @ApiPropertyOptional({ type: AddressInputDto })
  @IsOptional()
  shippingAddress?: AddressInputDto;

  @ApiPropertyOptional({ example: 'Please do not ring the bell' })
  @IsOptional()
  @IsString()
  notes?: string;


  @ApiPropertyOptional({ example: 'Please do not ring the bell' })
  @IsOptional()
  @IsString()
  orderNotes?: string;
}
