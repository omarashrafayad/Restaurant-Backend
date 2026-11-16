import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository.js';
import { CreateUserDto } from '../dto/create-user.dto.js';
import { UserResponseDto } from '../dto/user-response.dto.js';
import { BadRequestException } from '../../common/error-handling/custom-excepction/bad-request.exceprions.js';
import { plainToInstance } from 'class-transformer';
import slugify from 'slugify';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.userRepository.findOne({ email: dto.email.toLowerCase() });
    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const slug = slugify(dto.name, { lower: true });
    const user = await this.userRepository.create({
      ...dto,
      slug,
      email: dto.email.toLowerCase(),
    });

    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    return plainToInstance(UserResponseDto, userObj, { excludeExtraneousValues: true });
  }
}
