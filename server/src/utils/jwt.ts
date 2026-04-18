import jwt, { type SignOptions } from 'jsonwebtoken';
import type { AuthUserPayload } from '../types/express.js';

const ACCESS_SECRET = () => process.env.JWT_SECRET ?? '';
const REFRESH_SECRET = () => process.env.JWT_REFRESH_SECRET ?? '';

export function signAccessToken(payload: AuthUserPayload): string {
  const expiresIn = process.env.ACCESS_TOKEN_EXPIRES ?? '15m';
  return jwt.sign({ sub: payload.id, role: payload.role }, ACCESS_SECRET(), {
    expiresIn,
  } as SignOptions);
}

export function signRefreshToken(payload: AuthUserPayload): string {
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES ?? '7d';
  return jwt.sign({ sub: payload.id, role: payload.role, typ: 'refresh' }, REFRESH_SECRET(), {
    expiresIn,
  } as SignOptions);
}

export function verifyAccessToken(token: string): AuthUserPayload {
  const decoded = jwt.verify(token, ACCESS_SECRET()) as jwt.JwtPayload;
  return { id: String(decoded.sub), role: decoded.role as 'admin' | 'user' };
}

export function verifyRefreshToken(token: string): AuthUserPayload {
  const decoded = jwt.verify(token, REFRESH_SECRET()) as jwt.JwtPayload;
  if (decoded.typ !== 'refresh') throw new Error('invalid');
  return { id: String(decoded.sub), role: decoded.role as 'admin' | 'user' };
}
