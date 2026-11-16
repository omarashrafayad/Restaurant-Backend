import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { APi_TAGS } from './constant.js';

export class swaggerConfig {
  static setup(app: INestApplication): void {
    const config = new DocumentBuilder()
      .setTitle('Take Five Restaurant API')
      .setDescription('Backend for the Take Five customer app and restaurant dashboard. Realtime events are documented in docs/REALTIME.md')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter JWT access token (Bearer <token>)',
          in: 'header',
        },
        'access-token',
      )
      .addSecurityRequirements('access-token')
      .addTag(APi_TAGS.AUTH, 'Authentication and password management')
      .addTag(APi_TAGS.USERS, 'User management and personal profile')
      .addTag(APi_TAGS.CATEGORIES, 'Product category management')
      .addTag(APi_TAGS.SUBCATEGORIES, 'Product subcategory management')
      .addTag(APi_TAGS.BRANDS, 'Product brand management')
      .addTag(APi_TAGS.PRODUCTS, 'Product catalog, search, and filtering')
      .addTag(APi_TAGS.HOME, 'Homepage featured items and collections')
      .addTag(APi_TAGS.REVIEWS, 'Customer reviews and ratings')
      .addTag(APi_TAGS.WISHLIST, 'Customer wishlist management')
      .addTag(APi_TAGS.ADDRESSES, 'User delivery addresses')
      .addTag(APi_TAGS.COUPONS, 'Discounts and promotional coupons')
      .addTag(APi_TAGS.CART, 'Customer shopping cart operations')
      .addTag(APi_TAGS.ORDERS, 'Order placement, lifecycle, and analytics')
      .addTag(APi_TAGS.DELIVERY_ZONES, 'Delivery zones, fees, and validation')
      .addTag(APi_TAGS.PROMOTIONS, 'Promotions, campaign discounts, and active deals')
      .addTag(APi_TAGS.SETTINGS, 'Restaurant profile, contact numbers, opening hours')
      .addTag(APi_TAGS.NOTIFICATIONS, 'Push notifications, device tokens and inbox')
      .addTag(APi_TAGS.REPORTS, 'Sales reports for the restaurant')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, () => document, {
      swaggerOptions: {
        filter: true,
        displayRequestDuration: true,
      },
    });
    // Also expose /api-docs for compatibility with original project
    SwaggerModule.setup('api-docs', app, () => document, {
      swaggerOptions: {
        filter: true,
        displayRequestDuration: true,
      },
    });
  }
}
