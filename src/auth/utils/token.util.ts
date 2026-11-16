import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface.js';

/** Signs the access token used by the mobile apps and the dashboard. */
export function signAccessToken(
  jwtService: JwtService,
  user: { _id: { toString(): string }; role: string },
): string {
  const userId = user._id.toString();
  const payload: JwtPayload = { userId, _id: userId, role: user.role };
  return jwtService.sign(payload);
}
