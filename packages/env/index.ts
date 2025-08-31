import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    // SERVER
    PORT: z.coerce.number().default(3333),

    API_VERSION: z.string().default('v1'),
    API_PREFIX: z.string().default('/api'),

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
    RATE_LIMIT_MAX: z.coerce.number().default(100),

    // CORS
    CORS_ORIGIN: z.url().default('http://localhost:3000'),

    // DB
    DATABASE_URL: z
      .url()
      .default('postgresql://docker:docker@localhost:5432/saas-quaint-money'),
    DATABASE_URL_TEST: z
      .url()
      .optional()
      .default(
        'postgresql://docker:docker@localhost:5432/saas-quaint-money-test',
      ),

    // JWT
    JWT_SECRET: z
      .string()
      .default('your-super-secret-jwt-key-change-this-in-production'),
    JWT_EXPIRES_IN: z.string().default('7d'),

    // Refresh Tokens
    REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),

    // Google OAuth2
    GOOGLE_CLIENT_ID: z
      .string()
      .default(
        '800618207324-q718np1big2b75ic1dgu0aaihpls0ab2.apps.googleusercontent.com',
      ),
    GOOGLE_CLIENT_SECRET: z
      .string()
      .default('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'),
    GOOGLE_REDIRECT_URI: z
      .string()
      .default('http://localhost:3000/auth/google/callback'),

    // Redis
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.coerce.number().default(6379),
    REDIS_PASSWORD: z.string().optional(),
    REDIS_DB: z.coerce.number().default(0),

    // Environment
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),

    // Swagger
    SWAGGER_ENABLED: z.coerce.boolean().default(true),
    SWAGGER_PATH: z.string().default('/docs'),

    // CI/CD
    CI: z.coerce.boolean().default(false),
  },
  client: {},
  shared: {
    NEXT_PUBLIC_API_URL: z.url().default('http://localhost:3333/api/v1'),
    NEXT_PUBLIC_BACKEND_API_URL: z
      .url()
      .default('http://localhost:3333/api/v1'),
    NEXTAUTH_SECRET: z
      .string()
      .default('your-super-secret-jwt-key-change-this-in-production'),
    NEXTAUTH_URL: z.string().default('http://localhost:3000'),
  },
  runtimeEnv: {
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URL_TEST: process.env.DATABASE_URL_TEST,
    JWT_SECRET: process.env.JWT_SECRET,
    SWAGGER_ENABLED: process.env.SWAGGER_ENABLED,
    SWAGGER_PATH: process.env.SWAGGER_PATH,
    API_VERSION: process.env.API_VERSION,
    API_PREFIX: process.env.API_PREFIX,
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_DB: process.env.REDIS_DB,
    NODE_ENV: process.env.NODE_ENV,
    CI: process.env.CI,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_BACKEND_API_URL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  emptyStringAsUndefined: true,
})
