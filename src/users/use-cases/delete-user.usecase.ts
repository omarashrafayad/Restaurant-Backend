import { EventEmitter2 } from '@nestjs/event-emitter';
import { SESSIONS_REVOKED } from '../../auth/auth.events.js';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly events: EventEmitter2,
  ) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.userRepository.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException(`No user found for id: ${id}`);
    }
    this.events.emit(SESSIONS_REVOKED, { userId: id });
  }
}
