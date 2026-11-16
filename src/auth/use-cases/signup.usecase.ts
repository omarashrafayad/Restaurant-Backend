import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../users/repository/user.repository.js';
import { SignupDto } from '../dtos/signup.dto.js';
import { AuthResponseDto } from '../dtos/auth-response.dto.js';
import { UserResponseDto } from '../../users/dto/user-response.dto.js';
import { BadRequestException } from '../../common/error-handling/custom-excepction/bad-request.exceprions.js';
import { plainToInstance } from 'class-transformer';
import { signAccessToken } from '../utils/token.util.js';
import slugify from 'slugify';
import { AddressesService } from '../../addresses/addresses.service.js';

@Injectable()
export class SignupUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly addressesService: AddressesService,
  ) {}

  async execute(dto: SignupDto): Promise<AuthResponseDto> {
    const existing = await this.userRepository.findOne({
      email: dto.email.toLowerCase().trim(),
    });

    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    if (dto.passwordConfirm && dto.password !== dto.passwordConfirm) {
      throw new BadRequestException('Password Confirmation incorrect');
    }

    const userData: Record<string, any> = {
      name: dto.name.trim(),
      slug: slugify(dto.name, { lower: true }),
      email: dto.email.toLowerCase().trim(),
      password: dto.password,
      phone: dto.phone,
    };

    if (dto.address) {
      const address = await this.addressesService.buildAddress(dto.address);
      userData.addresses = [{ ...address, phone: address.phone || dto.phone, isDefault: true }];
    }

    const createdUser = await this.userRepository.create(userData);
    const token = signAccessToken(this.jwtService, createdUser);

    const userObj = (createdUser as any).toObject ? (createdUser as any).toObject() : createdUser;
    const userResponse = plainToInstance(UserResponseDto, userObj, {
      excludeExtraneousValues: true,
    });

    return {
      message: 'signUp successfully',
      data: userResponse,
      token,
    };
  }
}
