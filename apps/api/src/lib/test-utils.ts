import { PrismaClient } from '@prisma/client'
import { FastifyInstance } from 'fastify'

import { createApp } from '@/server'

// Mock do package @saas/env para testes
const mockEnv = {
  PORT: 3333,
  API_VERSION: 'v1',
  API_PREFIX: '/api',
  RATE_LIMIT_WINDOW_MS: 900000,
  RATE_LIMIT_MAX: 100,
  CORS_ORIGIN: 'http://localhost:3000',
  DATABASE_URL: 'postgresql://docker:docker@localhost:5432/saas-quaint-money',
  DATABASE_URL_TEST:
    'postgresql://docker:docker@localhost:5432/saas-quaint-money-test',
  JWT_SECRET: 'your-super-secret-jwt-key-change-this-in-production',
  JWT_EXPIRES_IN: '7d',
  REFRESH_TOKEN_EXPIRES_IN: '30d',
  GOOGLE_CLIENT_ID:
    '800618207324-q718np1big2b75ic1dgu0aaihpls0ab2.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: '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',
  GOOGLE_REDIRECT_URI: 'http://localhost:3000/auth/google/callback',
  REDIS_HOST: 'localhost',
  REDIS_PORT: 6379,
  REDIS_PASSWORD: undefined,
  REDIS_DB: 0,
  NODE_ENV: 'test',
  SWAGGER_ENABLED: true,
  SWAGGER_PATH: '/docs',
  CI: false,
  NEXT_PUBLIC_API_URL: 'http://localhost:3333/api/v1',
  NEXTAUTH_SECRET: 'your-super-secret-jwt-key-change-this-in-production',
  NEXTAUTH_URL: 'http://localhost:3000',
}

// Mock do import do @saas/env
// eslint-disable-next-line no-use-before-define
jest.mock('@saas/env', () => ({
  env: mockEnv,
}))

// Importar Jest para testes
declare const jest: any
declare const expect: any

/**
 * Utilitários para testes de integração
 */
export class TestUtils {
  private static app: FastifyInstance | null = null
  private static prisma: PrismaClient | null = null

  /**
   * Inicializa o app para testes
   */
  static async initApp(): Promise<FastifyInstance> {
    if (!this.app) {
      this.app = await createApp()
    }
    return this.app
  }

  /**
   * Obtém instância do Prisma para testes
   */
  static getPrisma(): PrismaClient {
    if (!this.prisma) {
      this.prisma = new PrismaClient({
        datasources: {
          db: {
            url: mockEnv.DATABASE_URL_TEST || mockEnv.DATABASE_URL,
          },
        },
      })
    }
    return this.prisma
  }

  /**
   * Limpa todos os dados de teste
   */
  static async cleanDatabase(): Promise<void> {
    const prisma = this.getPrisma()

    // Limpar em ordem para evitar problemas de foreign key
    await prisma.entry.deleteMany()
    await prisma.creditCard.deleteMany()
    await prisma.category.deleteMany()
    await prisma.account.deleteMany()
    await prisma.userPreferences.deleteMany()
  }

  /**
   * Gera token de autenticação para testes
   */
  static generateAuthToken(userId: string = 'test-user-id'): string {
    // Gera um JWT válido para testes (assinado pela instância do app)
    // Observação: como utilitário isolado, quando não houver app disponível,
    // os testes podem optar por fazer login via rota /auth/login.
    const secret = mockEnv.JWT_SECRET
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const jwt = require('jsonwebtoken') as typeof import('jsonwebtoken')
    return jwt.sign(
      { sub: userId, email: 'test@example.com', name: 'Test User' },
      secret,
      {
        expiresIn: '15m',
        subject: userId,
      },
    )
  }

  /**
   * Headers padrão para requisições autenticadas
   */
  static getAuthHeaders(userId: string = 'test-user-id') {
    return {
      authorization: `Bearer ${this.generateAuthToken(userId)}`,
      'content-type': 'application/json',
    }
  }

  /**
   * Fecha conexões de teste
   */
  static async cleanup(): Promise<void> {
    if (this.app) {
      await this.app.close()
      this.app = null
    }

    if (this.prisma) {
      await this.prisma.$disconnect()
      this.prisma = null
    }
  }

  /**
   * Aguarda um tempo específico (útil para testes assíncronos)
   */
  static async wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Retry para operações que podem falhar temporariamente
   */
  static async retry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 100,
  ): Promise<T> {
    let lastError: Error

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error

        if (attempt === maxAttempts) {
          throw lastError
        }

        await this.wait(delay * attempt)
      }
    }

    // eslint-disable-next-line no-throw-literal
    throw lastError!
  }

  /**
   * Valida se uma resposta da API está no formato correto
   */
  static validateApiResponse(response: any): void {
    expect(response).toHaveProperty('success')
    expect(typeof response.success).toBe('boolean')

    if (response.success) {
      expect(response).toHaveProperty('data')
      expect(response).toHaveProperty('meta')
      expect(response.meta).toHaveProperty('timestamp')
      expect(response.meta).toHaveProperty('version')
    } else {
      expect(response).toHaveProperty('message')
      expect(typeof response.message).toBe('string')
    }
  }

  /**
   * Valida se uma resposta paginada está no formato correto
   */
  static validatePaginatedResponse(response: any): void {
    this.validateApiResponse(response)

    if (response.success) {
      expect(response).toHaveProperty('pagination')
      expect(response.pagination).toHaveProperty('page')
      expect(response.pagination).toHaveProperty('limit')
      expect(response.pagination).toHaveProperty('total')
      expect(response.pagination).toHaveProperty('totalPages')
      expect(response.pagination).toHaveProperty('hasNext')
      expect(response.pagination).toHaveProperty('hasPrev')
    }
  }

  /**
   * Cria um mock de usuário para testes
   */
  static createMockUser(userId: string = 'test-user-id') {
    return {
      sub: userId,
      email: 'test@example.com',
      name: 'Test User',
    }
  }

  /**
   * Cria um mock de request para testes
   */
  static createMockRequest(overrides: any = {}) {
    return {
      user: this.createMockUser(),
      method: 'GET',
      url: '/test',
      query: {},
      params: {},
      body: {},
      headers: {},
      log: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
      },
      ...overrides,
    }
  }

  /**
   * Cria um mock de reply para testes
   */
  static createMockReply() {
    const reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      header: jest.fn().mockReturnThis(),
      headers: jest.fn().mockReturnThis(),
    }

    return reply
  }
}

/**
 * Fixtures para dados de teste
 */
export const testFixtures = {
  accounts: {
    valid: {
      name: 'Conta Bancária',
      type: 'bank' as const,
      balance: 1000,
      description: 'Conta principal',
      icon: 'bank-icon',
      color: '#000000',
      active: true,
      includeInGeneralBalance: true,
    },
    invalid: {
      name: '', // Nome vazio
      type: 'invalid-type' as any, // Tipo inválido
      balance: -100, // Saldo negativo
    },
  },
  categories: {
    valid: {
      name: 'Alimentação',
      type: 'expense' as const,
      icon: 'food-icon',
      color: '#ff0000',
      active: true,
    },
  },
  entries: {
    valid: {
      amount: 100,
      type: 'expense' as const,
      description: 'Compras',
      date: new Date(),
    },
  },
}

/**
 * Helpers para assertions específicas
 */
export const testAssertions = {
  /**
   * Verifica se uma resposta de erro está no formato correto
   */
  expectErrorResponse: (
    response: any,
    statusCode: number,
    message?: string,
  ) => {
    expect(response.statusCode).toBe(statusCode)

    const body = JSON.parse(response.body)
    expect(body.success).toBe(false)
    expect(body.message).toBeDefined()

    if (message) {
      expect(body.message).toContain(message)
    }
  },

  /**
   * Verifica se uma resposta de sucesso está no formato correto
   */
  expectSuccessResponse: (response: any, statusCode: number = 200) => {
    expect(response.statusCode).toBe(statusCode)

    const body = JSON.parse(response.body)
    expect(body.success).toBe(true)
    expect(body.data).toBeDefined()
    expect(body.meta).toBeDefined()
  },

  /**
   * Verifica se os headers de cache estão presentes
   */
  expectCacheHeaders: (response: any) => {
    expect(response.headers['x-cache']).toBeDefined()
    expect(response.headers['x-cache-key']).toBeDefined()
  },

  /**
   * Verifica se os headers de rate limiting estão presentes
   */
  expectRateLimitHeaders: (response: any) => {
    expect(response.headers['x-ratelimit-limit']).toBeDefined()
    expect(response.headers['x-ratelimit-remaining']).toBeDefined()
    expect(response.headers['x-ratelimit-reset']).toBeDefined()
  },
}
