import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';

@Injectable()
export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.userRepository.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException(`No user found for id: ${id}`);
    }
  }
}
