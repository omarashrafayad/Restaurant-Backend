import { Injectable } from '@nestjs/common';
import { CategoriesService } from '../categories/categories.service.js';
import { ProductsService } from '../products/products.service.js';

@Injectable()
export class HomeService {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,
  ) {}

  async getHomeData() {
    const [shopByCategory, newCollections, trendingNow] = await Promise.all([
      this.categoriesService.findRaw({}, { limit: 3 }),
      this.productsService.findRaw({}, { sort: '-createdAt', limit: 3 }),
      this.productsService.findRaw({}, { sort: '-ratingsAverage', limit: 4 }),
    ]);

    return {
      shopByCategory,
      newCollections,
      trendingNow,
    };
  }
}
