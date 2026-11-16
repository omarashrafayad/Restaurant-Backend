import { Injectable } from '@nestjs/common';
import { CreateDeliveryZoneUseCase } from './use-cases/create-delivery-zone.usecase.js';
import { FindAllDeliveryZonesUseCase } from './use-cases/find-all-delivery-zones.usecase.js';
import { FindDeliveryZoneByIdUseCase } from './use-cases/find-delivery-zone-by-id.usecase.js';
import { UpdateDeliveryZoneUseCase } from './use-cases/update-delivery-zone.usecase.js';
import { DeleteDeliveryZoneUseCase } from './use-cases/delete-delivery-zone.usecase.js';
import { CheckDeliveryFeeUseCase } from './use-cases/check-delivery-fee.usecase.js';
import { CreateDeliveryZoneDto } from './dtos/create-delivery-zone.dto.js';
import { UpdateDeliveryZoneDto } from './dtos/update-delivery-zone.dto.js';
import { PaginationDto } from '../common/data-accsess/dto/pagination.dto.js';
import { DeliveryZoneRepository } from './repository/delivery-zone.repository.js';

@Injectable()
export class DeliveryZonesService {
  constructor(
    private readonly createZoneUseCase: CreateDeliveryZoneUseCase,
    private readonly findAllZonesUseCase: FindAllDeliveryZonesUseCase,
    private readonly findZoneByIdUseCase: FindDeliveryZoneByIdUseCase,
    private readonly updateZoneUseCase: UpdateDeliveryZoneUseCase,
    private readonly deleteZoneUseCase: DeleteDeliveryZoneUseCase,
    private readonly checkFeeUseCase: CheckDeliveryFeeUseCase,
    private readonly zoneRepository: DeliveryZoneRepository,
  ) {}

  create(dto: CreateDeliveryZoneDto) {
    return this.createZoneUseCase.execute(dto);
  }

  findAll(query: PaginationDto) {
    return this.findAllZonesUseCase.execute(query);
  }

  findById(id: string) {
    return this.findZoneByIdUseCase.execute(id);
  }

  update(id: string, dto: UpdateDeliveryZoneDto) {
    return this.updateZoneUseCase.execute(id, dto);
  }

  delete(id: string) {
    return this.deleteZoneUseCase.execute(id);
  }

  checkDeliveryFee(city: string) {
    return this.checkFeeUseCase.execute(city);
  }

  findOne(filter: Record<string, any>) {
    return this.zoneRepository.findOne(filter);
  }

  findRaw(filter: Record<string, any> = {}, options: any = {}) {
    return this.zoneRepository.find(filter, options);
  }
}
