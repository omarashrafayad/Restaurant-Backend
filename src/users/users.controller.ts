import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { APi_TAGS } from '../common/swagger/constant.js';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { UpdateMeDto } from './dto/update-me.dto.js';
import { PaginationDto } from '../common/data-accsess/dto/pagination.dto.js';
import { CurrentAccount, Principal } from '../auth/decorator/current-account.decorator.js';
import { Authorize } from '../auth/decorator/roles.decorator.js';
import { Roles } from '../common/constants/roles.constant.js';
import { processAndSaveImage } from '../common/files/utils/file.util.js';
import {
  CreateUserSwagger,
  FindAllUsersSwagger,
  FindUserByIdSwagger,
  UpdateUserSwagger,
  DeleteUserSwagger,
  ChangePasswordSwagger,
  GetMeSwagger,
  UpdateMeSwagger,
  ChangeMyPasswordSwagger,
  DeleteMeSwagger,
} from './swagger/index.js';

@ApiTags(APi_TAGS.USERS)
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @GetMeSwagger()
  @Get('getMe')
  async getMe(@CurrentAccount() principal: Principal) {
    return this.usersService.findById(principal.user._id);
  }

  @UpdateMeSwagger()
  @Patch('updateMe')
  @UseInterceptors(FileInterceptor('profileImg'))
  async updateMe(
    @CurrentAccount() principal: Principal,
    @Body() body: UpdateMeDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      body.profileImg = await processAndSaveImage(file.buffer, 'user', 'user', 600, 600);
    }
    return this.usersService.updateMe(principal.user._id, body);
  }

  @ChangeMyPasswordSwagger()
  @Patch('changeMyPassword')
  async changeMyPassword(
    @CurrentAccount() principal: Principal,
    @Body() body: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(principal.user._id, body);
  }

  @DeleteMeSwagger()
  @Delete('deleteMe')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMe(@CurrentAccount() principal: Principal) {
    return this.usersService.deleteMe(principal.user._id);
  }

  @FindAllUsersSwagger()
  @Get()
  async getAllUsers(@Query() query: PaginationDto) {
    return this.usersService.findAll(query);
  }

  @CreateUserSwagger()
  @Post()
  @UseInterceptors(FileInterceptor('profileImg'))
  async createUser(
    @Body() body: CreateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      body.profileImg = await processAndSaveImage(file.buffer, 'user', 'user', 600, 600);
    }
    return this.usersService.create(body);
  }

  @FindUserByIdSwagger()
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @UpdateUserSwagger()
  @Patch(':id')
  @UseInterceptors(FileInterceptor('profileImg'))
  async updateUser(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      body.profileImg = await processAndSaveImage(file.buffer, 'user', 'user', 600, 600);
    }
    return this.usersService.update(id, body);
  }

  @DeleteUserSwagger()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Authorize(Roles.ADMIN)
  async deleteUser(@Param('id') id: string) {
    return this.usersService.delete(id);
  }

  @ChangePasswordSwagger()
  @Patch('changePassword/:id')
  async changeUserPassword(
    @Param('id') id: string,
    @Body() body: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(id, body);
  }
}
