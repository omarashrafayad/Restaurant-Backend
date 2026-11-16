import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { roundMoney } from '../common/utils/money.util.js';
import { ModelNames } from '../common/data-accsess/model-names.enum.js';
import { Promotion } from '../promotions/schema/promotion.schema.js';
import { isPromotionActive } from '../promotions/promotion-schedule.js';
import { PricableProduct, ProductPrice } from './pricing.types.js';

// Short so other API instances pick up promotion changes quickly.
const CACHE_TTL_MS = 10_000;

const idOf = (v: any): string | undefined => (v?._id ?? v)?.toString();

/**
 * Single source of truth for "how much does this item cost right now".
 * Used by the menu, the cart and checkout so the three never disagree.
 *
 * Final price = the cheapest of:
 *   - the menu price
 *   - the product's permanent sale price (priceAfterDiscount)
 *   - the best running promotion (whole menu / category / specific items)
 */
@Injectable()
export class PricingService {
  private cache?: { at: number; promotions: Promotion[] };

  constructor(
    @InjectModel(ModelNames.Promotions) private readonly promotionModel: Model<Promotion>,
  ) {}

  /** Call after creating/updating/deleting promotions. */
  invalidate() {
    this.cache = undefined;
  }

  /** Promotions inside their date range (day/time rules are evaluated per call). */
  private async candidates(): Promise<Promotion[]> {
    if (this.cache && Date.now() - this.cache.at < CACHE_TTL_MS) return this.cache.promotions;
    const promotions = await this.promotionModel
      .find({ isActive: true, $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: new Date() } }] })
      .select('title discountPercentage target categories products daysOfWeek startTime endTime startDate endDate isActive')
      .lean<Promotion[]>();
    this.cache = { at: Date.now(), promotions };
    return promotions;
  }

  async runningPromotions(at: Date = new Date()): Promise<Promotion[]> {
    return (await this.candidates()).filter((p) => isPromotionActive(p, at));
  }

  /** Prices a batch of products at the given instant. */
  async priceProducts(products: PricableProduct[], at: Date = new Date()): Promise<Map<string, ProductPrice>> {
    const running = await this.runningPromotions(at);
    const result = new Map<string, ProductPrice>();

    for (const product of products) {
      const id = product._id.toString();
      const categoryId = idOf(product.category);
      const base = this.basePricing(product);

      let best: Promotion | undefined;
      for (const promo of running) {
        const applies =
          promo.target === 'all' ||
          (promo.target === 'category' && !!categoryId && promo.categories.some((c) => c.toString() === categoryId)) ||
          (promo.target === 'products' && promo.products.some((p) => p.toString() === id));
        if (applies && (!best || promo.discountPercentage > best.discountPercentage)) best = promo;
      }

      if (best) {
        const promoPrice = roundMoney(base.basePrice * (1 - best.discountPercentage / 100));
        if (promoPrice < base.finalPrice) {
          result.set(id, {
            basePrice: base.basePrice,
            finalPrice: promoPrice,
            discount: roundMoney(base.basePrice - promoPrice),
            promotion: {
              _id: best._id.toString(),
              title: best.title,
              discountPercentage: best.discountPercentage,
              endDate: best.endDate,
            },
          });
          continue;
        }
      }
      result.set(id, base);
    }
    return result;
  }

  async priceProduct(product: PricableProduct, at: Date = new Date()): Promise<ProductPrice> {
    return (await this.priceProducts([product], at)).get(product._id.toString())!;
  }

  /** Adds finalPrice / activePromotion to product objects (menu responses). */
  async decorateProducts<T extends PricableProduct>(products: T[]): Promise<(T & { finalPrice: number; activePromotion?: ProductPrice['promotion'] })[]> {
    const plain = products.map((p: any) => (typeof p?.toObject === 'function' ? p.toObject() : p)) as T[];
    const prices = await this.priceProducts(plain);
    return plain.map((p) => {
      const price = prices.get(p._id.toString())!;
      return { ...p, finalPrice: price.finalPrice, activePromotion: price.promotion };
    });
  }

  /** Permanent sale price set on the product itself. */
  protected basePricing(product: PricableProduct): ProductPrice {
    const basePrice = roundMoney(product.price);
    const sale = product.priceAfterDiscount;
    const finalPrice = sale && sale > 0 && sale < basePrice ? roundMoney(sale) : basePrice;
    return { basePrice, finalPrice, discount: roundMoney(basePrice - finalPrice) };
  }
}
