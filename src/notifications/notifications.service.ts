import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ModelNames } from '../common/data-accsess/model-names.enum.js';
import { DeviceToken } from './schema/device-token.schema.js';
import { Notification, NotificationType } from './schema/notification.schema.js';
import { RegisterDeviceDto, InboxQueryDto } from './dtos/notification.dto.js';
import { CUSTOMERS_TOPIC, PushMessage, PushService } from './push.service.js';
import { RealtimeGateway } from '../realtime/realtime.gateway.js';
import { SocketEvents } from '../realtime/realtime.events.js';
import { UserRepository } from '../users/repository/user.repository.js';
import { Roles } from '../common/constants/roles.constant.js';
import { NotFoundException } from '../common/error-handling/custom-excepction/not-found.exception.js';

export interface NotifyInput {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(ModelNames.DeviceTokens) private readonly deviceModel: Model<DeviceToken>,
    @InjectModel(ModelNames.Notifications) private readonly notificationModel: Model<Notification>,
    private readonly push: PushService,
    private readonly realtime: RealtimeGateway,
    private readonly userRepository: UserRepository,
  ) {}

  // ---------------- devices ----------------

  /** Upserts the device; a token moves to whoever logged in last on that phone. */
  async registerDevice(userId: string, dto: RegisterDeviceDto) {
    const device = await this.deviceModel.findOneAndUpdate(
      { token: dto.token },
      {
        $set: {
          user: new Types.ObjectId(userId),
          platform: dto.platform ?? 'android',
          app: dto.app ?? 'customer',
          lang: dto.lang ?? 'ar',
        },
      },
      { upsert: true, returnDocument: 'after' },
    );
    if (device.app === 'customer') await this.push.subscribe([dto.token], CUSTOMERS_TOPIC);
    return { status: 'success', data: { _id: device._id, platform: device.platform, app: device.app } };
  }

  /** Call on logout so the phone stops receiving this account's notifications. */
  async removeDevice(userId: string, token: string) {
    const removed = await this.deviceModel.findOneAndDelete({ token, user: new Types.ObjectId(userId) });
    if (removed) await this.push.unsubscribe([token], CUSTOMERS_TOPIC);
  }

  private async pushToUsers(userIds: string[], app: 'customer' | 'dashboard', msg: PushMessage) {
    const devices = await this.deviceModel
      .find({ user: { $in: userIds.map((id) => new Types.ObjectId(id)) }, app })
      .select('token')
      .lean();
    const invalid = await this.push.sendToTokens(devices.map((d) => d.token), msg);
    if (invalid.length) await this.deviceModel.deleteMany({ token: { $in: invalid } });
  }

  // ---------------- sending ----------------

  /** Personal notification: inbox + socket + push to the customer's phones. */
  async notifyUser(userId: string, input: NotifyInput) {
    const doc = await this.notificationModel.create({
      audience: 'user',
      user: new Types.ObjectId(userId),
      ...input,
      data: input.data ?? {},
    });
    this.realtime.toUser(userId, SocketEvents.NOTIFICATION, doc.toObject());
    await this.pushToUsers([userId], 'customer', { title: input.title, body: input.body, data: input.data });
    return doc;
  }

  /** Loud alert on every staff device (cashier / manager phones and tablets). */
  async alertStaff(msg: PushMessage) {
    const staff = await this.userRepository.model
      .find({ role: { $in: [Roles.ADMIN, Roles.MANAGER] }, active: true })
      .select('_id')
      .lean();
    await this.pushToUsers(staff.map((s) => s._id.toString()), 'dashboard', msg);
  }

  /** Promotion / announcement for every customer: one inbox entry + topic push. */
  async broadcast(input: NotifyInput) {
    const doc = await this.notificationModel.create({ audience: 'all', ...input, data: input.data ?? {} });
    this.realtime.toAll(SocketEvents.NOTIFICATION, doc.toObject());
    await this.push.sendToTopic(CUSTOMERS_TOPIC, { title: input.title, body: input.body, data: input.data });
    return { status: 'success', data: doc.toObject() };
  }

  // ---------------- inbox ----------------

  private async inboxFilter(userId: string) {
    const user = await this.userRepository.model.findById(userId).select('createdAt notificationsSeenAt').lean();
    if (!user) throw new NotFoundException('User not found');
    const filter: Record<string, any> = {
        $or: [
          { audience: 'user', user: new Types.ObjectId(userId) },
          { audience: 'all', createdAt: { $gte: user.createdAt } },
        ],
    };
    return { user, filter };
  }

  async inbox(userId: string, query: InboxQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { user, filter } = await this.inboxFilter(userId);
    const seenAt = user.notificationsSeenAt?.getTime() ?? 0;

    const [items, total, unreadCount] = await Promise.all([
      this.notificationModel.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit).lean(),
      this.notificationModel.countDocuments(filter),
      this.unreadCount(userId),
    ]);

    return {
      data: items.map((n) => ({
        ...n,
        isRead: n.audience === 'all' ? (n.createdAt?.getTime() ?? 0) <= seenAt : !!n.readAt,
      })),
      meta: { totalCount: total, page, limit, pageCount: Math.ceil(total / limit), unreadCount },
    };
  }

  async unreadCount(userId: string) {
    const { user } = await this.inboxFilter(userId);
    const since = user.notificationsSeenAt ?? user.createdAt;
    return this.notificationModel.countDocuments({
      $or: [
        { audience: 'user', user: new Types.ObjectId(userId), readAt: { $exists: false } },
        { audience: 'all', createdAt: { $gt: since, $gte: user.createdAt } },
      ],
    });
  }

  async markRead(userId: string, id: string) {
    await this.notificationModel.updateOne(
      { _id: id, audience: 'user', user: new Types.ObjectId(userId), readAt: { $exists: false } },
      { $set: { readAt: new Date() } },
    );
    return { status: 'success', unreadCount: await this.unreadCount(userId) };
  }

  async markAllRead(userId: string) {
    const now = new Date();
    await Promise.all([
      this.notificationModel.updateMany(
        { audience: 'user', user: new Types.ObjectId(userId), readAt: { $exists: false } },
        { $set: { readAt: now } },
      ),
      this.userRepository.model.updateOne({ _id: userId }, { $set: { notificationsSeenAt: now } }),
    ]);
    return { status: 'success', unreadCount: 0 };
  }
}
