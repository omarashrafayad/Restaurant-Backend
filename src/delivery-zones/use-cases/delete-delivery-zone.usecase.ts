import { Injectable } from '@nestjs/common';
import { DeliveryZoneRepository } from '../repository/delivery-zone.repository.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';

@Injectable()
export class DeleteDeliveryZoneUseCase {
  constructor(private readonly zoneRepository: DeliveryZoneRepository) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.zoneRepository.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException(`No delivery zone found for id: ${id}`);
    }
  }
}
