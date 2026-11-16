import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from '../common/data-accsess/model-names.enum.js';
import { Coupon, CouponSchema } from './schema/coupon.schema.js';
import { CouponRepository } from './repository/coupon.repository.js';
import { CouponsController } from './coupons.controller.js';
import { CouponsService } from './coupons.service.js';
import { CreateCouponUseCase } from './use-cases/create-coupon.usecase.js';
import { FindAllCouponsUseCase } from './use-cases/find-all-coupons.usecase.js';
import { FindCouponByIdUseCase } from './use-cases/find-coupon-by-id.usecase.js';
import { UpdateCouponUseCase } from './use-cases/update-coupon.usecase.js';
import { DeleteCouponUseCase } from './use-cases/delete-coupon.usecase.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ModelNames.Coupons, schema: CouponSchema }]),
  ],
  controllers: [CouponsController],
  providers: [
    CouponsService,
    CouponRepository,
    CreateCouponUseCase,
    FindAllCouponsUseCase,
    FindCouponByIdUseCase,
    UpdateCouponUseCase,
    DeleteCouponUseCase,
  ],
  exports: [CouponsService, CouponRepository],
})
export class CouponsModule {}
