import dotenv from 'dotenv';

dotenv.config();

const required = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'CLAIM_ADMIN_SECRET'
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3001),
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  isProd: (process.env.NODE_ENV ?? 'development') === 'production',
  databaseUrl: process.env.DATABASE_URL as string,
  accessSecret: process.env.JWT_ACCESS_SECRET as string,
  refreshSecret: process.env.JWT_REFRESH_SECRET as string,
  claimAdminSecret: process.env.CLAIM_ADMIN_SECRET as string,
  reservedUsernames: (process.env.RESERVED_USERNAMES ?? 'admin,root,system')
    .split(',')
    .map((name) => name.trim().toLowerCase())
    .filter(Boolean),
  refreshCookieName: process.env.REFRESH_COOKIE_NAME ?? 'refreshToken',
  accessTtl: process.env.ACCESS_TOKEN_TTL ?? '15m',
  refreshTtl: process.env.REFRESH_TOKEN_TTL ?? '7d'
};
