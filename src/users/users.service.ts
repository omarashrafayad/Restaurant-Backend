import { Injectable } from '@nestjs/common';
import { CreateUserUseCase } from './use-cases/create-user.usecase.js';
import { FindAllUsersUseCase } from './use-cases/find-all-users.usecase.js';
import { FindUserByIdUseCase } from './use-cases/find-user-by-id.usecase.js';
import { UpdateUserUseCase } from './use-cases/update-user.usecase.js';
import { DeleteUserUseCase } from './use-cases/delete-user.usecase.js';
import { ChangePasswordUseCase } from './use-cases/change-password.usecase.js';
import { UpdateMeUseCase } from './use-cases/update-me.usecase.js';
import { DeleteMeUseCase } from './use-cases/delete-me.usecase.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { ChangeMyPasswordDto, ChangePasswordDto } from './dto/change-password.dto.js';
import { UpdateMeDto } from './dto/update-me.dto.js';
import { PaginationDto } from '../common/data-accsess/dto/pagination.dto.js';
import { UserRepository } from './repository/user.repository.js';
import { User } from './schema/user.schema.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly findAllUsersUseCase: FindAllUsersUseCase,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly updateMeUseCase: UpdateMeUseCase,
    private readonly deleteMeUseCase: DeleteMeUseCase,
    private readonly userRepository: UserRepository,
  ) {}

  create(dto: CreateUserDto) {
    return this.createUserUseCase.execute(dto);
  }

  findAll(query: PaginationDto) {
    return this.findAllUsersUseCase.execute(query);
  }

  findById(id: string) {
    return this.findUserByIdUseCase.execute(id);
  }

  update(id: string, dto: UpdateUserDto) {
    return this.updateUserUseCase.execute(id, dto);
  }

  delete(id: string) {
    return this.deleteUserUseCase.execute(id);
  }

  changePassword(id: string, dto: ChangePasswordDto) {
    return this.changePasswordUseCase.execute(id, dto);
  }

  changeMyPassword(userId: string, dto: ChangeMyPasswordDto) {
    return this.changePasswordUseCase.changeMine(userId, dto);
  }

  updateMe(userId: string, dto: UpdateMeDto) {
    return this.updateMeUseCase.execute(userId, dto);
  }

  deleteMe(userId: string) {
    return this.deleteMeUseCase.execute(userId);
  }

  // Repository helper methods for auth & internal modules
  findOne(filter: Record<string, any>) {
    return this.userRepository.findOne(filter);
  }

  findByIdRaw(id: string) {
    return this.userRepository.findById(id, { lean: false });
  }

  updateRaw(id: string, updateQuery: any) {
    return this.userRepository.findByIdAndUpdate(id, updateQuery);
  }
}
