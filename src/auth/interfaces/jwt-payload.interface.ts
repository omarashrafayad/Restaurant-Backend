export interface JwtPayload {
  userId?: string;
  _id?: string;
  role: string;
  iat?: number;
  exp?: number;
}
