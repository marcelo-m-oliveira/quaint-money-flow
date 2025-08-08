declare namespace NodeJS {
  interface ProcessEnv {
    // Database
    DATABASE_URL: string

    // Server
    PORT?: string
    NODE_ENV: 'development' | 'production' | 'test'

    // JWT
    JWT_SECRET: string
    JWT_EXPIRES_IN?: string

    // API
    API_VERSION?: string
    API_PREFIX?: string

    // CORS
    CORS_ORIGIN?: string

    // Rate Limiting
    RATE_LIMIT_MAX?: string
    RATE_LIMIT_WINDOW_MS?: string

    // Swagger
    SWAGGER_ENABLED?: string
    SWAGGER_PATH?: string
  }
}
