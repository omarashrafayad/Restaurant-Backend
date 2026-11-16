import { Injectable } from '@nestjs/common';
import { BrandRepository } from '../repository/brand.repository.js';
import { BrandResponseDto } from '../dtos/brand-response.dto.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class FindBrandByIdUseCase {
  constructor(private readonly brandRepository: BrandRepository) {}

  async execute(id: string): Promise<BrandResponseDto> {
    const brand = await this.brandRepository.findById(id);
    if (!brand) {
      throw new NotFoundException(`No brand found for id: ${id}`);
    }

    const obj = (brand as any).toObject ? (brand as any).toObject() : brand;
    return plainToInstance(BrandResponseDto, obj);
  }
}
