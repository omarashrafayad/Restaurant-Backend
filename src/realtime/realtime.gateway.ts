import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import type { Server, Socket } from 'socket.io';
import { UserRepository } from '../users/repository/user.repository.js';
import { Roles } from '../common/constants/roles.constant.js';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface.js';
import { Rooms, SocketEvents } from './realtime.events.js';
import { OnEvent } from '@nestjs/event-emitter';
import { SETTINGS_STATUS_CHANGED } from '../settings/settings.service.js';
import { SESSIONS_REVOKED } from '../auth/auth.events.js';

const corsOrigins = () => {
  const list = (process.env.CORS_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean);
  return list.length ? list : true;
};

/**
 * Single Socket.IO endpoint at /realtime.
 * Clients connect with `io(BASE_URL + '/realtime', { auth: { token } })`.
 * Staff join the "staff" room; every user joins "user:<id>".
 */
@WebSocketGateway({ namespace: '/realtime', cors: { origin: corsOrigins(), credentials: true } })
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
  ) {}

  afterInit(server: any) {
    // Authenticate during the handshake so unauthenticated sockets never connect.
    server.use(async (socket: Socket, next: (err?: Error) => void) => {
      try {
        const raw =
          (socket.handshake.auth?.token as string | undefined) ||
          (socket.handshake.headers.authorization as string | undefined);
        const token = raw?.replace(/^Bearer\s+/i, '');
        if (!token) return next(new Error('Unauthorized'));

        const payload = this.jwtService.verify<JwtPayload>(token);
        const userId = payload.userId || payload._id;
        const user = await this.userRepository.model.findById(userId).select('role active passwordChangedAt').lean();
        if (!user || !user.active) return next(new Error('Unauthorized'));
        if (user.passwordChangedAt && payload.iat && Math.floor(user.passwordChangedAt.getTime() / 1000) > payload.iat) {
          return next(new Error('Unauthorized'));
        }
        socket.data.userId = user._id.toString();
        socket.data.role = user.role;
        next();
      } catch {
        next(new Error('Unauthorized'));
      }
    });
  }

  async handleConnection(socket: Socket) {
    const { userId, role } = socket.data;
    await socket.join(Rooms.user(userId));
    if (role === Roles.ADMIN || role === Roles.MANAGER) await socket.join(Rooms.STAFF);
    this.logger.debug(`socket connected user=${userId} role=${role}`);
  }

  toStaff(event: string, payload: unknown) {
    this.server?.to(Rooms.STAFF).emit(event, payload);
  }

  toUser(userId: string, event: string, payload: unknown) {
    this.server?.to(Rooms.user(userId)).emit(event, payload);
  }

  /** Password changed / deactivated / role changed: drop live sockets now. */
  @OnEvent(SESSIONS_REVOKED)
  onSessionsRevoked({ userId }: { userId: string }) {
    this.server?.in(Rooms.user(userId)).disconnectSockets(true);
  }

  @OnEvent(SETTINGS_STATUS_CHANGED)
  onRestaurantStatus(status: unknown) {
    this.toAll(SocketEvents.RESTAURANT_STATUS, status);
  }

  toAll(event: string, payload: unknown) {
    this.server?.emit(event, payload);
  }
}
