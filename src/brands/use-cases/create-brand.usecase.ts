import { Injectable } from '@nestjs/common';
import { BrandRepository } from '../repository/brand.repository.js';
import { CreateBrandDto } from '../dtos/create-brand.dto.js';
import { BrandResponseDto } from '../dtos/brand-response.dto.js';
import { BadRequestException } from '../../common/error-handling/custom-excepction/bad-request.exceprions.js';
import { plainToInstance } from 'class-transformer';
import slugify from 'slugify';

@Injectable()
export class CreateBrandUseCase {
  constructor(private readonly brandRepository: BrandRepository) {}

  async execute(dto: CreateBrandDto): Promise<BrandResponseDto> {
    const exists = await this.brandRepository.findOne({ name: dto.name.trim() });
    if (exists) {
      throw new BadRequestException('Brand already exists');
    }

    const slug = slugify(dto.name, { lower: true });
    const created = await this.brandRepository.create({
      ...dto,
      name: dto.name.trim(),
      slug,
    });

    const obj = (created as any).toObject ? (created as any).toObject() : created;
    return plainToInstance(BrandResponseDto, obj);
  }
}
