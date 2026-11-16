import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CategoriesService } from '../categories/categories.service.js';
import { ProductRepository } from '../products/repository/product.repository.js';
import { ProductResponseDto } from '../products/dtos/product-response.dto.js';
import { PricingService } from '../pricing/pricing.service.js';
import { PromotionsService } from '../promotions/promotions.service.js';
import { SettingsService } from '../settings/settings.service.js';

const CARD_FIELDS = 'title titleAr imageCover price priceAfterDiscount category ratingsAverage ratingsQuantity sold isAvailable';

@Injectable()
export class HomeService {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly productRepository: ProductRepository,
    private readonly pricing: PricingService,
    private readonly promotionsService: PromotionsService,
    private readonly settingsService: SettingsService,
  ) {}

  private async cards(sort: string, limit: number) {
    const products = await this.productRepository.model
      .find({ isAvailable: true })
      .select(CARD_FIELDS)
      .sort(sort)
      .limit(limit)
      .lean();
    const priced = await this.pricing.decorateProducts(products as any[]);
    return priced.map((p) => plainToInstance(ProductResponseDto, p, { excludeExtraneousValues: true }));
  }

  /** Everything the customer home screen needs in one round trip. */
  async getHomeData() {
    const [restaurant, offers, categories, bestSellers, newArrivals, topRated] = await Promise.all([
      this.settingsService.getPublic(),
      this.promotionsService.getActive(),
      this.categoriesService.findRaw({}, { sort: 'name' }),
      this.cards('-sold', 8),
      this.cards('-createdAt', 8),
      this.cards('-ratingsAverage -ratingsQuantity', 8),
    ]);

    return {
      restaurant,
      offers: offers.data,
      categories,
      bestSellers,
      newArrivals,
      topRated,
      // Legacy keys used by the first version of the app.
      shopByCategory: categories.slice(0, 3),
      newCollections: newArrivals.slice(0, 3),
      trendingNow: topRated.slice(0, 4),
    };
  }
}
