import { Injectable } from '@nestjs/common';
import { CouponRepository } from '../repository/coupon.repository.js';
import { CouponResponseDto } from '../dtos/coupon-response.dto.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class FindCouponByIdUseCase {
  constructor(private readonly couponRepository: CouponRepository) {}

  async execute(id: string): Promise<CouponResponseDto> {
    const coupon = await this.couponRepository.findById(id);
    if (!coupon) {
      throw new NotFoundException(`No coupon found for id: ${id}`);
    }

    const obj = (coupon as any).toObject ? (coupon as any).toObject() : coupon;
    return plainToInstance(CouponResponseDto, obj);
  }
}
