import { EventEmitter2 } from '@nestjs/event-emitter';
import { SESSIONS_REVOKED } from '../../auth/auth.events.js';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository.js';
import { NotFoundException } from '../../common/error-handling/custom-excepction/not-found.exception.js';

@Injectable()
export class DeleteMeUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly events: EventEmitter2,
  ) {}

  async execute(userId: string): Promise<void> {
    const updated = await this.userRepository.findByIdAndUpdate(userId, { active: false });
    if (!updated) {
      throw new NotFoundException('User not found');
    }
    this.events.emit(SESSIONS_REVOKED, { userId: userId });
  }
}
