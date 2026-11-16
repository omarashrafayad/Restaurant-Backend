import { Injectable } from '@nestjs/common';
import { CreateCouponUseCase } from './use-cases/create-coupon.usecase.js';
import { FindAllCouponsUseCase } from './use-cases/find-all-coupons.usecase.js';
import { FindCouponByIdUseCase } from './use-cases/find-coupon-by-id.usecase.js';
import { UpdateCouponUseCase } from './use-cases/update-coupon.usecase.js';
import { DeleteCouponUseCase } from './use-cases/delete-coupon.usecase.js';
import { CreateCouponDto } from './dtos/create-coupon.dto.js';
import { UpdateCouponDto } from './dtos/update-coupon.dto.js';
import { PaginationDto } from '../common/data-accsess/dto/pagination.dto.js';
import { CouponRepository } from './repository/coupon.repository.js';

@Injectable()
export class CouponsService {
  constructor(
    private readonly createCouponUseCase: CreateCouponUseCase,
    private readonly findAllCouponsUseCase: FindAllCouponsUseCase,
    private readonly findCouponByIdUseCase: FindCouponByIdUseCase,
    private readonly updateCouponUseCase: UpdateCouponUseCase,
    private readonly deleteCouponUseCase: DeleteCouponUseCase,
    private readonly couponRepository: CouponRepository,
  ) {}

  create(dto: CreateCouponDto) {
    return this.createCouponUseCase.execute(dto);
  }

  findAll(query: PaginationDto) {
    return this.findAllCouponsUseCase.execute(query);
  }

  findById(id: string) {
    return this.findCouponByIdUseCase.execute(id);
  }

  update(id: string, dto: UpdateCouponDto) {
    return this.updateCouponUseCase.execute(id, dto);
  }

  delete(id: string) {
    return this.deleteCouponUseCase.execute(id);
  }

  findOne(filter: Record<string, any>) {
    return this.couponRepository.findOne(filter);
  }
}
