import { Injectable } from '@nestjs/common';
import { CouponRepository } from '../repository/coupon.repository.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';

@Injectable()
export class DeleteCouponUseCase {
  constructor(private readonly couponRepository: CouponRepository) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.couponRepository.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException(`No coupon found for id: ${id}`);
    }
  }
}
