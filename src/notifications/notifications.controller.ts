import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { APi_TAGS } from '../common/swagger/constant.js';
import { CurrentAccount, Principal } from '../auth/decorator/current-account.decorator.js';
import { Authorize } from '../auth/decorator/roles.decorator.js';
import { Roles } from '../common/constants/roles.constant.js';
import { NotificationsService } from './notifications.service.js';
import { BroadcastDto, InboxQueryDto, RegisterDeviceDto } from './dtos/notification.dto.js';
import { NotificationType } from './schema/notification.schema.js';

@ApiTags(APi_TAGS.NOTIFICATIONS)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @ApiOperation({ summary: 'Register this device FCM token (call after login and on token refresh)' })
  @Post('devices')
  registerDevice(@CurrentAccount() principal: Principal, @Body() body: RegisterDeviceDto) {
    return this.notifications.registerDevice(principal.user._id, body);
  }

  @ApiOperation({ summary: 'Unregister a device token (call on logout)' })
  @Delete('devices/:token')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeDevice(@CurrentAccount() principal: Principal, @Param('token') token: string) {
    return this.notifications.removeDevice(principal.user._id, token);
  }

  @ApiOperation({ summary: 'Notification inbox (order updates + offers), newest first' })
  @Get()
  inbox(@CurrentAccount() principal: Principal, @Query() query: InboxQueryDto) {
    return this.notifications.inbox(principal.user._id, query);
  }

  @ApiOperation({ summary: 'Unread badge count' })
  @Get('unread-count')
  async unreadCount(@CurrentAccount() principal: Principal) {
    return { data: { unreadCount: await this.notifications.unreadCount(principal.user._id) } };
  }

  @ApiOperation({ summary: 'Mark every notification as read' })
  @Patch('read-all')
  markAllRead(@CurrentAccount() principal: Principal) {
    return this.notifications.markAllRead(principal.user._id);
  }

  @ApiOperation({ summary: 'Mark one notification as read' })
  @Patch(':id/read')
  markRead(@CurrentAccount() principal: Principal, @Param('id') id: string) {
    return this.notifications.markRead(principal.user._id, id);
  }

  @ApiOperation({ summary: 'Send an announcement / offer to every customer (push + inbox)' })
  @Authorize(Roles.ADMIN, Roles.MANAGER)
  @Post('broadcast')
  broadcast(@Body() body: BroadcastDto) {
    return this.notifications.broadcast({ type: NotificationType.ANNOUNCEMENT, ...body });
  }
}
