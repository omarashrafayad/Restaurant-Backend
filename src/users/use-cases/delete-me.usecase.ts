import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';

@Injectable()
export class DeleteMeUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<void> {
    const updated = await this.userRepository.findByIdAndUpdate(userId, { active: false });
    if (!updated) {
      throw new NotFoundException('User not found');
    }
  }
}
