import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../users/repository/user.repository.js';
import { SignupDto } from '../dtos/signup.dto.js';
import { AuthResponseDto } from '../dtos/auth-response.dto.js';
import { UserResponseDto } from '../../users/dto/user-response.dto.js';
import { BadRequestException } from '../../common/error-handling/custom-excepction/bad-request.exceprions.js';
import { plainToInstance } from 'class-transformer';
import slugify from 'slugify';

@Injectable()
export class SignupUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: SignupDto): Promise<AuthResponseDto> {
    const existing = await this.userRepository.findOne({
      email: dto.email.toLowerCase(),
    });

    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    if (dto.passwordConfirm && dto.password !== dto.passwordConfirm) {
      throw new BadRequestException('Password Confirmation incorrect');
    }

    const userData: any = {
      name: dto.name,
      slug: slugify(dto.name, { lower: true }),
      email: dto.email.toLowerCase(),
      password: dto.password,
    };

    if (dto.phone) {
      userData.phone = dto.phone;
    }

    if (dto.address) {
      userData.addresses = [dto.address];
    } else if (dto.addresses && Array.isArray(dto.addresses)) {
      userData.addresses = dto.addresses;
    }

    const createdUser = await this.userRepository.create(userData);
    const userId = createdUser._id.toString();

    const token = this.jwtService.sign({
      userId,
      _id: userId,
      role: createdUser.role,
    });

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
