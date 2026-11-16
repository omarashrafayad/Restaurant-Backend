import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schema/user.schema.js';
import { BaseRepository } from '../../common/data-accsess/base-repository.js';
import { ModelNames } from '../../common/data-accsess/model-names.enum.js';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(
    @InjectModel(ModelNames.Users)
    private readonly userModel: Model<UserDocument>,
  ) {
    super(userModel as unknown as Model<User>);
  }
}
