import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from '../common/data-accsess/model-names.enum.js';
import { SettingsSchema } from './schema/settings.schema.js';
import { SettingsService } from './settings.service.js';
import { SettingsController } from './settings.controller.js';

@Global()
@Module({
  imports: [MongooseModule.forFeature([{ name: ModelNames.Settings, schema: SettingsSchema }])],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
