import type { SignOptions } from 'jsonwebtoken';

type Expiry = SignOptions['expiresIn'];

export const JWT_CONFIG = {
  accessTokenSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
  accessTokenExpiration: (process.env.JWT_EXPIRATION || '15m') as Expiry,
  refreshTokenExpiration: (process.env.JWT_REFRESH_EXPIRATION || '7d') as Expiry,
};
