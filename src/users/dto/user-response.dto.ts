import { Exclude, Expose, Transform } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  _id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  phone?: string;

  @Expose()
  profileImg?: string;

  @Expose()
  role: string;

  @Expose()
  active: boolean;

  @Expose()
  addresses?: any[];

  @Exclude()
  password?: string;

  @Exclude()
  passwordResetCode?: string;

  @Exclude()
  passwordResetExpires?: Date;

  @Exclude()
  passwordResetVerified?: boolean;

  @Expose()
  createdAt?: Date;

  @Expose()
  updatedAt?: Date;
}
