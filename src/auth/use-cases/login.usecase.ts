import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../users/repository/user.repository.js';
import { LoginDto } from '../dtos/login.dto.js';
import { AuthResponseDto } from '../dtos/auth-response.dto.js';
import { UserResponseDto } from '../../users/dto/user-response.dto.js';
import { UnAuthorizedException } from '../../common/error-handling/custom-excepction/un-authorized.exception.js';
import bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.model
      .findOne({ email: dto.email.toLowerCase() })
      .select('+password');

    if (!user || !user.password) {
      throw new UnAuthorizedException('Incorrect email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnAuthorizedException('Incorrect email or password');
    }

    if (!user.active) {
      throw new UnAuthorizedException('This account has been deactivated');
    }

    const userId = user._id.toString();
    const token = this.jwtService.sign({
      userId,
      _id: userId,
      role: user.role,
    });

    const userObj = user.toObject();
    const userResponse = plainToInstance(UserResponseDto, userObj, {
      excludeExtraneousValues: true,
    });

    return {
      message: 'login successfully',
      data: userResponse,
      token,
    };
  }
}
