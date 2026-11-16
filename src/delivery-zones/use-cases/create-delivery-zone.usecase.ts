import { Injectable } from '@nestjs/common';
import { DeliveryZoneRepository } from '../repository/delivery-zone.repository.js';
import { CreateDeliveryZoneDto } from '../dtos/create-delivery-zone.dto.js';
import { DeliveryZoneResponseDto } from '../dtos/delivery-zone-response.dto.js';
import { BadRequestException } from '../../common/error-handling/custom-excepction/bad-request.exceprions.js';
import { plainToInstance } from 'class-transformer';
import { exactRegex } from '../../common/utils/regex.util.js';

@Injectable()
export class CreateDeliveryZoneUseCase {
  constructor(private readonly zoneRepository: DeliveryZoneRepository) {}

  async execute(dto: CreateDeliveryZoneDto): Promise<DeliveryZoneResponseDto> {
    const existing = await this.zoneRepository.findOne({
      name: exactRegex(dto.name.trim()),
    });

    if (existing) {
      throw new BadRequestException(`Delivery zone "${dto.name}" already exists`);
    }

    const created = await this.zoneRepository.create({
      name: dto.name.trim(),
      nameAr: dto.nameAr?.trim(),
      deliveryFee: dto.deliveryFee,
      estimatedDeliveryMinutes: dto.estimatedDeliveryMinutes || 40,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      minOrderAmount: dto.minOrderAmount || 0,
    });

    const obj = (created as any).toObject ? (created as any).toObject() : created;
    return plainToInstance(DeliveryZoneResponseDto, obj);
  }
}
