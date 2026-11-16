import { Injectable } from '@nestjs/common';
import { CouponRepository } from '../repository/coupon.repository.js';
import { UpdateCouponDto } from '../dtos/update-coupon.dto.js';
import { CouponResponseDto } from '../dtos/coupon-response.dto.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UpdateCouponUseCase {
  constructor(private readonly couponRepository: CouponRepository) {}

  async execute(id: string, dto: UpdateCouponDto): Promise<CouponResponseDto> {
    const updateData: any = { ...dto };
    if (dto.name) {
      updateData.name = dto.name.toUpperCase().trim();
    }
    if (dto.expire) {
      updateData.expire = new Date(dto.expire);
    }

    const updated = await this.couponRepository.findByIdAndUpdate(id, updateData);
    if (!updated) {
      throw new NotFoundException(`No coupon found for id: ${id}`);
    }

    const obj = (updated as any).toObject ? (updated as any).toObject() : updated;
    return plainToInstance(CouponResponseDto, obj);
  }
}
