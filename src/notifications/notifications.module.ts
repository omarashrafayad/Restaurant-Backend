import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from '../common/data-accsess/model-names.enum.js';
import { DeviceTokenSchema } from './schema/device-token.schema.js';
import { NotificationSchema } from './schema/notification.schema.js';
import { NotificationsService } from './notifications.service.js';
import { NotificationsController } from './notifications.controller.js';
import { PushService } from './push.service.js';
import { OrderNotificationsListener } from './order-notifications.listener.js';
import { UsersModule } from '../users/users.module.js';
import { OrdersModule } from '../orders/orders.module.js';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.DeviceTokens, schema: DeviceTokenSchema },
      { name: ModelNames.Notifications, schema: NotificationSchema },
    ]),
    UsersModule,
    OrdersModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, PushService, OrderNotificationsListener],
  exports: [NotificationsService, PushService],
})
export class NotificationsModule {}
