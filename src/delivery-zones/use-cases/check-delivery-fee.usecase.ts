import { Injectable } from '@nestjs/common';
import { DeliveryZoneRepository } from '../repository/delivery-zone.repository.js';
import { BadRequestException } from '../../common/error-handling/custom-excepction/bad-request.exceprions.js';
import { exactRegex } from '../../common/utils/regex.util.js';

@Injectable()
export class CheckDeliveryFeeUseCase {
  constructor(private readonly zoneRepository: DeliveryZoneRepository) {}

  async execute(cityName: string) {
    if (!cityName || !cityName.trim()) {
      throw new BadRequestException('City name is required');
    }

    const trimmed = cityName.trim();
    const zone = await this.zoneRepository.findOne({
      isActive: true,
      $or: [
        { name: exactRegex(trimmed) },
        { nameAr: exactRegex(trimmed) },
      ],
    });

    if (!zone) {
      const activeZones = await this.zoneRepository.find(
        { isActive: true },
        { fields: 'name nameAr deliveryFee' },
      );
      const allowedCities = activeZones.map(
        (z: any) => `${z.name} (${z.nameAr || ''}) - ${z.deliveryFee} EGP`,
      );

      return {
        available: false,
        message: `Delivery is currently not available for "${cityName}".`,
        allowedZones: activeZones,
        allowedCitiesText: allowedCities.join(', '),
      };
    }

    return {
      available: true,
      data: {
        zoneId: (zone as any)._id,
        name: (zone as any).name,
        nameAr: (zone as any).nameAr,
        deliveryFee: (zone as any).deliveryFee,
        estimatedDeliveryMinutes: (zone as any).estimatedDeliveryMinutes,
        minOrderAmount: (zone as any).minOrderAmount,
      },
    };
  }
}
