import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const signAccessToken = (payload: { id: number; role: string }) => {
  return jwt.sign(payload, env.accessSecret, { expiresIn: env.accessTtl as jwt.SignOptions['expiresIn'] });
};

export const signRefreshToken = (payload: { id: number; role: string }) => {
  return jwt.sign(payload, env.refreshSecret, { expiresIn: env.refreshTtl as jwt.SignOptions['expiresIn'] });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, env.accessSecret) as { id: number; role: string };
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, env.refreshSecret) as { id: number; role: string };
};
