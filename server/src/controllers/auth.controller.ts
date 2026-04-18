import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { User } from '../models/User.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { validationResult } from 'express-validator';

function publicUser(u: { _id: unknown; name: string; email: string; role: string }) {
  return { id: String(u._id), name: u.name, email: u.email, role: u.role };
}

export async function signup(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendError(res, 'VALIDATION_ERROR', errors.array()[0]?.msg ?? 'Validation failed', 422);
    return;
  }
  const { name, email, password } = req.body as { name: string; email: string; password: string };
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    sendError(res, 'DUPLICATE_EMAIL', 'Email already registered', 409);
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const apiKey = randomUUID();
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: 'user',
    apiKey,
  });
  const payload = { id: String(user._id), role: user.role as 'admin' | 'user' };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  user.refreshToken = refreshToken;
  await user.save();
  sendSuccess(
    res,
    {
      user: publicUser(user),
      accessToken,
      refreshToken,
      apiKey,
    },
    201
  );
}

export async function login(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendError(res, 'VALIDATION_ERROR', errors.array()[0]?.msg ?? 'Validation failed', 422);
    return;
  }
  const { email, password } = req.body as { email: string; password: string };
  const user = await User.findOne({ email: email.toLowerCase(), isActive: true });
  if (!user) {
    sendError(res, 'INVALID_CREDENTIALS', 'Invalid email or password', 401);
    return;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    sendError(res, 'INVALID_CREDENTIALS', 'Invalid email or password', 401);
    return;
  }
  const payload = { id: String(user._id), role: user.role as 'admin' | 'user' };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  user.refreshToken = refreshToken;
  await user.save();
  sendSuccess(res, {
    user: publicUser(user),
    accessToken,
    refreshToken,
  });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) {
    sendError(res, 'VALIDATION_ERROR', 'refreshToken is required', 422);
    return;
  }
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    sendError(res, 'INVALID_TOKEN', 'Invalid refresh token', 401);
    return;
  }
  const user = await User.findById(payload.id);
  if (!user || user.refreshToken !== refreshToken) {
    sendError(res, 'INVALID_TOKEN', 'Invalid refresh token', 401);
    return;
  }
  const newAccess = signAccessToken({ id: String(user._id), role: user.role as 'admin' | 'user' });
  sendSuccess(res, { accessToken: newAccess });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) {
    sendError(res, 'VALIDATION_ERROR', 'refreshToken is required', 422);
    return;
  }
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    sendError(res, 'INVALID_TOKEN', 'Invalid refresh token', 401);
    return;
  }
  const user = await User.findById(payload.id);
  if (user && user.refreshToken === refreshToken) {
    user.refreshToken = undefined;
    await user.save();
  }
  sendSuccess(res, { ok: true });
}
