import { Injectable } from '@nestjs/common';
import { DeliveryZoneRepository } from '../repository/delivery-zone.repository.js';
import { UpdateDeliveryZoneDto } from '../dtos/update-delivery-zone.dto.js';
import { DeliveryZoneResponseDto } from '../dtos/delivery-zone-response.dto.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UpdateDeliveryZoneUseCase {
  constructor(private readonly zoneRepository: DeliveryZoneRepository) {}

  async execute(id: string, dto: UpdateDeliveryZoneDto): Promise<DeliveryZoneResponseDto> {
    const updated = await this.zoneRepository.findByIdAndUpdate(id, dto);
    if (!updated) {
      throw new NotFoundException(`No delivery zone found for id: ${id}`);
    }

    const obj = (updated as any).toObject ? (updated as any).toObject() : updated;
    return plainToInstance(DeliveryZoneResponseDto, obj);
  }
}
