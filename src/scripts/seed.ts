/**
 * Bootstrap data for a fresh installation:
 *   - admin account from ADMIN_EMAIL / ADMIN_PASSWORD (promotes it if it exists)
 *   - restaurant settings document (Take Five defaults)
 *   - starter delivery zones (inactive until the owner sets their fees)
 *
 * Usage: npm run build && ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run seed
 */
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { UserRepository } from '../users/repository/user.repository.js';
import { DeliveryZoneRepository } from '../delivery-zones/repository/delivery-zone.repository.js';
import { SettingsService } from '../settings/settings.service.js';
import { Roles } from '../common/constants/roles.constant.js';

const STARTER_ZONES = [
  { name: 'Madinaty', nameAr: 'مدينتي' },
  { name: 'El Shorouk', nameAr: 'الشروق' },
];

async function seed() {
  const logger = new Logger('Seed');
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });

  try {
    const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const password = process.env.ADMIN_PASSWORD;
    const users = app.get(UserRepository);

    if (!email || !password) {
      logger.warn('ADMIN_EMAIL / ADMIN_PASSWORD not set - skipping admin account');
    } else if (password.length < 8) {
      throw new Error('ADMIN_PASSWORD must be at least 8 characters');
    } else {
      const existing = await users.model.findOne({ email });
      if (existing) {
        existing.role = Roles.ADMIN;
        existing.active = true;
        await existing.save();
        logger.log(`Promoted existing account ${email} to admin`);
      } else {
        await users.create({
          name: process.env.ADMIN_NAME || 'Take Five Admin',
          email,
          password, // hashed by the schema pre-save hook
          phone: process.env.ADMIN_PHONE,
          role: Roles.ADMIN,
        });
        logger.log(`Created admin account ${email}`);
      }
    }

    const settings = await app.get(SettingsService).get();
    logger.log(`Settings ready for "${settings.name}"`);

    const zones = app.get(DeliveryZoneRepository);
    if ((await zones.count()) === 0) {
      for (const zone of STARTER_ZONES) {
        await zones.create({ ...zone, deliveryFee: 0, minOrderAmount: 0, estimatedDeliveryMinutes: 45, isActive: false });
      }
      logger.warn('Starter zones created INACTIVE: set their delivery fee and activate them from the dashboard');
    }
  } finally {
    await app.close();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
