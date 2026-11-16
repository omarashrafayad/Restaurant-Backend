import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from '../common/data-accsess/model-names.enum.js';
import { User, UserSchema } from './schema/user.schema.js';
import { UserRepository } from './repository/user.repository.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { CreateUserUseCase } from './use-cases/create-user.usecase.js';
import { FindAllUsersUseCase } from './use-cases/find-all-users.usecase.js';
import { FindUserByIdUseCase } from './use-cases/find-user-by-id.usecase.js';
import { UpdateUserUseCase } from './use-cases/update-user.usecase.js';
import { DeleteUserUseCase } from './use-cases/delete-user.usecase.js';
import { ChangePasswordUseCase } from './use-cases/change-password.usecase.js';
import { UpdateMeUseCase } from './use-cases/update-me.usecase.js';
import { DeleteMeUseCase } from './use-cases/delete-me.usecase.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ModelNames.Users, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserRepository,
    CreateUserUseCase,
    FindAllUsersUseCase,
    FindUserByIdUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    ChangePasswordUseCase,
    UpdateMeUseCase,
    DeleteMeUseCase,
  ],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
