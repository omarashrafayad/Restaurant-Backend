import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CoreModule } from './core.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { SubcategoriesModule } from './subcategories/subcategories.module.js';
import { BrandsModule } from './brands/brands.module.js';
import { ProductsModule } from './products/products.module.js';
import { HomeModule } from './home/home.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';
import { WishlistModule } from './wishlist/wishlist.module.js';
import { AddressesModule } from './addresses/addresses.module.js';
import { CouponsModule } from './coupons/coupons.module.js';
import { CartModule } from './cart/cart.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { DeliveryZonesModule } from './delivery-zones/delivery-zones.module.js';
import { PromotionsModule } from './promotions/promotions.module.js';
import { MailModule } from './mail/mail.module.js';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard.js';
import { RolesGuard } from './auth/guards/roles.guard.js';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor.js';

@Module({
  imports: [
    CoreModule,
    UsersModule,
    AuthModule,
    CategoriesModule,
    SubcategoriesModule,
    BrandsModule,
    ProductsModule,
    HomeModule,
    ReviewsModule,
    WishlistModule,
    AddressesModule,
    CouponsModule,
    CartModule,
    OrdersModule,
    DeliveryZonesModule,
    PromotionsModule,
    MailModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: TransformResponseInterceptor },
  ],
})
export class AppModule {}
