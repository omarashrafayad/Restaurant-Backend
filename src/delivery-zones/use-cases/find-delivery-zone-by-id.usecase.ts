import { Injectable } from '@nestjs/common';
import { DeliveryZoneRepository } from '../repository/delivery-zone.repository.js';
import { DeliveryZoneResponseDto } from '../dtos/delivery-zone-response.dto.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class FindDeliveryZoneByIdUseCase {
  constructor(private readonly zoneRepository: DeliveryZoneRepository) {}

  async execute(id: string): Promise<DeliveryZoneResponseDto> {
    const zone = await this.zoneRepository.findById(id);
    if (!zone) {
      throw new NotFoundException(`No delivery zone found for id: ${id}`);
    }

    const obj = (zone as any).toObject ? (zone as any).toObject() : zone;
    return plainToInstance(DeliveryZoneResponseDto, obj);
  }
}
