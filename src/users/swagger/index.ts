import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateUserDto } from '../dto/create-user.dto.js';
import { UpdateUserDto } from '../dto/update-user.dto.js';
import { ChangePasswordDto } from '../dto/change-password.dto.js';
import { UpdateMeDto } from '../dto/update-me.dto.js';
import { UserResponseDto } from '../dto/user-response.dto.js';

export function CreateUserSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new user', description: 'Admin/Manager creates a new user' }),
    ApiBody({ type: CreateUserDto }),
    ApiResponse({ status: 201, type: UserResponseDto }),
    ApiResponse({ status: 400, description: 'Bad Request / Email already exists' }),
  );
}

export function FindAllUsersSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all users', description: 'Retrieve paginated list of all users' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'keyword', required: false, type: String }),
    ApiResponse({ status: 200, description: 'Paginated users returned' }),
  );
}

export function FindUserByIdSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get user by id' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 200, type: UserResponseDto }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );
}

export function UpdateUserSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Update user by id' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiBody({ type: UpdateUserDto }),
    ApiResponse({ status: 200, type: UserResponseDto }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );
}

export function DeleteUserSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete user by id' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 204, description: 'User deleted' }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );
}

export function ChangePasswordSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Change user password' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiBody({ type: ChangePasswordDto }),
    ApiResponse({ status: 200, type: UserResponseDto }),
  );
}

export function GetMeSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get logged in user profile' }),
    ApiResponse({ status: 200, type: UserResponseDto }),
  );
}

export function UpdateMeSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Update logged in user profile' }),
    ApiBody({ type: UpdateMeDto }),
    ApiResponse({ status: 200, type: UserResponseDto }),
  );
}

export function ChangeMyPasswordSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Change password for logged in user' }),
    ApiBody({ type: ChangePasswordDto }),
    ApiResponse({ status: 200, description: 'Password changed successfully' }),
  );
}

export function DeleteMeSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Deactivate logged in user account' }),
    ApiResponse({ status: 204, description: 'Account deactivated' }),
  );
}
