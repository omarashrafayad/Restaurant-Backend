import { Injectable } from '@nestjs/common';
import { BrandRepository } from '../repository/brand.repository.js';
import { UpdateBrandDto } from '../dtos/update-brand.dto.js';
import { BrandResponseDto } from '../dtos/brand-response.dto.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';
import { plainToInstance } from 'class-transformer';
import slugify from 'slugify';

@Injectable()
export class UpdateBrandUseCase {
  constructor(private readonly brandRepository: BrandRepository) {}

  async execute(id: string, dto: UpdateBrandDto): Promise<BrandResponseDto> {
    const updateData: any = { ...dto };
    if (dto.name) {
      updateData.slug = slugify(dto.name, { lower: true });
    }

    const updated = await this.brandRepository.findByIdAndUpdate(id, updateData);
    if (!updated) {
      throw new NotFoundException(`No brand found for id: ${id}`);
    }

    const obj = (updated as any).toObject ? (updated as any).toObject() : updated;
    return plainToInstance(BrandResponseDto, obj);
  }
}
