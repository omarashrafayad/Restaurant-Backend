import { Injectable } from '@nestjs/common';
import { CouponRepository } from '../repository/coupon.repository.js';
import { CreateCouponDto } from '../dtos/create-coupon.dto.js';
import { CouponResponseDto } from '../dtos/coupon-response.dto.js';
import { BadRequestException } from '../../common/error-handling/custom-excepction/bad-request.exceprions.js';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CreateCouponUseCase {
  constructor(private readonly couponRepository: CouponRepository) {}

  async execute(dto: CreateCouponDto): Promise<CouponResponseDto> {
    const existing = await this.couponRepository.findOne({ name: dto.name.toUpperCase().trim() });
    if (existing) {
      throw new BadRequestException('Coupon with this name already exists');
    }

    const created = await this.couponRepository.create({
      name: dto.name.toUpperCase().trim(),
      expire: new Date(dto.expire),
      discount: dto.discount,
    });

    const obj = (created as any).toObject ? (created as any).toObject() : created;
    return plainToInstance(CouponResponseDto, obj);
  }
}
