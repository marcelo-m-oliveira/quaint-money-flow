import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { FastifyInstance } from 'fastify'

import { prisma } from '@/lib/prisma'
import { createApp } from '@/server'

// Mock do Redis para evitar dependências externas
jest.mock('@/lib/redis', () => ({
  getRedisClient: jest.fn(() => ({
    get: jest.fn(),
    setex: jest.fn(),
    ping: jest.fn(() => Promise.resolve('PONG')),
  })),
  isRedisConnected: jest.fn(() => Promise.resolve(true)),
}))

// Mock do middleware de autenticação
jest.mock('@/middleware/auth', () => ({
  authMiddleware: jest.fn((request: any, reply: any, done: any) => {
    // Simular usuário autenticado
    request.user = { sub: 'test-user-id' }
    done()
  }),
}))

describe('Accounts Routes Integration', () => {
  let app: FastifyInstance
  let testAccountId: string

  beforeEach(async () => {
    // Limpar banco de dados de teste
    await prisma.entry.deleteMany()
    await prisma.account.deleteMany()

    // Criar app para teste
    app = await createApp()

    // Criar conta de teste
    const testAccount = await prisma.account.create({
      data: {
        name: 'Conta Teste',
        type: 'bank',
        balance: 1000,
        userId: 'test-user-id',
        includeInGeneralBalance: true,
        active: true,
      },
    })
    testAccountId = testAccount.id
  })

  afterEach(async () => {
    // Limpar dados de teste
    await prisma.entry.deleteMany()
    await prisma.account.deleteMany()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /accounts', () => {
    it('should return paginated accounts', async () => {
      // Act
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/accounts',
        headers: {
          authorization: 'Bearer test-token',
        },
      })

      // Assert
      expect(response.statusCode).toBe(200)

      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data).toBeInstanceOf(Array)
      expect(body.data).toHaveLength(1)
      expect(body.data[0]).toEqual(
        expect.objectContaining({
          id: testAccountId,
          name: 'Conta Teste',
          type: 'bank',
          balance: 1000,
        }),
      )
      expect(body.pagination).toEqual(
        expect.objectContaining({
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        }),
      )
    })

    it('should filter accounts by type', async () => {
      // Arrange - Criar conta adicional
      await prisma.account.create({
        data: {
          name: 'Poupança',
          type: 'savings',
          balance: 2000,
          userId: 'test-user-id',
          includeInGeneralBalance: true,
          active: true,
        },
      })

      // Act
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/accounts?type=bank',
        headers: {
          authorization: 'Bearer test-token',
        },
      })

      // Assert
      expect(response.statusCode).toBe(200)

      const body = JSON.parse(response.body)
      expect(body.data).toHaveLength(1)
      expect(body.data[0].type).toBe('bank')
    })

    it('should handle pagination correctly', async () => {
      // Arrange - Criar múltiplas contas
      const accounts = []
      for (let i = 0; i < 25; i++) {
        accounts.push({
          name: `Conta ${i + 1}`,
          type: 'bank' as const,
          balance: 1000,
          userId: 'test-user-id',
          includeInGeneralBalance: true,
          active: true,
        })
      }
      await prisma.account.createMany({ data: accounts })

      // Act
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/accounts?page=2&limit=10',
        headers: {
          authorization: 'Bearer test-token',
        },
      })

      // Assert
      expect(response.statusCode).toBe(200)

      const body = JSON.parse(response.body)
      expect(body.data).toHaveLength(10)
      expect(body.pagination).toEqual(
        expect.objectContaining({
          page: 2,
          limit: 10,
          total: 26, // 25 + 1 conta inicial
          totalPages: 3,
          hasNext: true,
          hasPrev: true,
        }),
      )
    })
  })

  describe('GET /accounts/select-options', () => {
    it('should return formatted select options', async () => {
      // Act
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/accounts/select-options',
        headers: {
          authorization: 'Bearer test-token',
        },
      })

      // Assert
      expect(response.statusCode).toBe(200)

      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data).toBeInstanceOf(Array)
      expect(body.data[0]).toEqual(
        expect.objectContaining({
          value: testAccountId,
          label: 'Conta Teste',
        }),
      )
    })
  })

  describe('GET /accounts/:id', () => {
    it('should return account by id', async () => {
      // Act
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/accounts/${testAccountId}`,
        headers: {
          authorization: 'Bearer test-token',
        },
      })

      // Assert
      expect(response.statusCode).toBe(200)

      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data).toEqual(
        expect.objectContaining({
          id: testAccountId,
          name: 'Conta Teste',
          type: 'bank',
          balance: 1000,
        }),
      )
    })

    it('should return 404 for non-existent account', async () => {
      // Act
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/accounts/non-existent-id',
        headers: {
          authorization: 'Bearer test-token',
        },
      })

      // Assert
      expect(response.statusCode).toBe(404)

      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
      expect(body.message).toContain('não encontrada')
    })
  })

  describe('POST /accounts', () => {
    it('should create account successfully', async () => {
      // Arrange
      const accountData = {
        name: 'Nova Conta',
        type: 'bank',
        balance: 1500,
        description: 'Conta bancária',
        icon: 'bank-icon',
        color: '#000000',
        active: true,
        includeInGeneralBalance: true,
      }

      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/accounts',
        headers: {
          authorization: 'Bearer test-token',
          'content-type': 'application/json',
        },
        payload: accountData,
      })

      // Assert
      expect(response.statusCode).toBe(201)

      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data).toEqual(
        expect.objectContaining({
          name: 'Nova Conta',
          type: 'bank',
          balance: 1500,
          description: 'Conta bancária',
        }),
      )
      expect(body.message).toBe('Conta criado com sucesso')

      // Verificar se foi criada no banco
      const createdAccount = await prisma.account.findFirst({
        where: { name: 'Nova Conta' },
      })
      expect(createdAccount).toBeTruthy()
    })

    it('should validate required fields', async () => {
      // Arrange
      const invalidData = {
        // name is missing
        type: 'bank',
        balance: 1000,
      }

      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/accounts',
        headers: {
          authorization: 'Bearer test-token',
          'content-type': 'application/json',
        },
        payload: invalidData,
      })

      // Assert
      expect(response.statusCode).toBe(400)

      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
      expect(body.message).toContain('validação')
    })
  })

  describe('PUT /accounts/:id', () => {
    it('should update account successfully', async () => {
      // Arrange
      const updateData = {
        name: 'Conta Atualizada',
        type: 'bank',
        balance: 2000,
        description: 'Descrição atualizada',
      }

      // Act
      const response = await app.inject({
        method: 'PUT',
        url: `/api/v1/accounts/${testAccountId}`,
        headers: {
          authorization: 'Bearer test-token',
          'content-type': 'application/json',
        },
        payload: updateData,
      })

      // Assert
      expect(response.statusCode).toBe(200)

      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data).toEqual(
        expect.objectContaining({
          id: testAccountId,
          name: 'Conta Atualizada',
          balance: 2000,
          description: 'Descrição atualizada',
        }),
      )
      expect(body.message).toBe('Conta atualizado com sucesso')

      // Verificar se foi atualizada no banco
      const updatedAccount = await prisma.account.findUnique({
        where: { id: testAccountId },
      })
      expect(updatedAccount?.name).toBe('Conta Atualizada')
    })

    it('should return 404 for non-existent account', async () => {
      // Arrange
      const updateData = {
        name: 'Conta Atualizada',
        type: 'bank',
        balance: 2000,
      }

      // Act
      const response = await app.inject({
        method: 'PUT',
        url: '/api/v1/accounts/non-existent-id',
        headers: {
          authorization: 'Bearer test-token',
          'content-type': 'application/json',
        },
        payload: updateData,
      })

      // Assert
      expect(response.statusCode).toBe(404)

      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
      expect(body.message).toContain('não encontrada')
    })
  })

  describe('DELETE /accounts/:id', () => {
    it('should delete account successfully', async () => {
      // Act
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/accounts/${testAccountId}`,
        headers: {
          authorization: 'Bearer test-token',
        },
      })

      // Assert
      expect(response.statusCode).toBe(204)
      expect(response.body).toBe('')

      // Verificar se foi deletada do banco
      const deletedAccount = await prisma.account.findUnique({
        where: { id: testAccountId },
      })
      expect(deletedAccount).toBeNull()
    })

    it('should return 404 for non-existent account', async () => {
      // Act
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/v1/accounts/non-existent-id',
        headers: {
          authorization: 'Bearer test-token',
        },
      })

      // Assert
      expect(response.statusCode).toBe(404)

      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
      expect(body.message).toContain('não encontrada')
    })
  })

  describe('GET /accounts/:id/balance', () => {
    it('should return account balance', async () => {
      // Arrange - Criar algumas entradas para a conta
      await prisma.entry.createMany({
        data: [
          {
            accountId: testAccountId,
            categoryId: 'test-category',
            amount: 1000,
            type: 'income',
            description: 'Salário',
            date: new Date(),
            userId: 'test-user-id',
          },
          {
            accountId: testAccountId,
            categoryId: 'test-category',
            amount: 500,
            type: 'expense',
            description: 'Compras',
            date: new Date(),
            userId: 'test-user-id',
          },
        ],
      })

      // Act
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/accounts/${testAccountId}/balance`,
        headers: {
          authorization: 'Bearer test-token',
        },
      })

      // Assert
      expect(response.statusCode).toBe(200)

      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data).toEqual({
        balance: '500', // 1000 (initial) + 1000 (income) - 500 (expense)
      })
    })

    it('should return 404 for non-existent account', async () => {
      // Act
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/accounts/non-existent-id/balance',
        headers: {
          authorization: 'Bearer test-token',
        },
      })

      // Assert
      expect(response.statusCode).toBe(404)

      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
      expect(body.message).toContain('não encontrada')
    })
  })

  describe('Authentication', () => {
    it('should return 401 without authorization header', async () => {
      // Act
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/accounts',
      })

      // Assert
      expect(response.statusCode).toBe(401)
    })

    it('should return 401 with invalid token', async () => {
      // Act
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/accounts',
        headers: {
          authorization: 'Bearer invalid-token',
        },
      })

      // Assert
      expect(response.statusCode).toBe(401)
    })
  })

  describe('Rate Limiting', () => {
    it('should handle rate limiting', async () => {
      // Act - Fazer múltiplas requisições rapidamente
      const promises = Array.from({ length: 10 }, () =>
        app.inject({
          method: 'GET',
          url: '/api/v1/accounts',
          headers: {
            authorization: 'Bearer test-token',
          },
        }),
      )

      const responses = await Promise.all(promises)

      // Assert - Verificar se algumas requisições foram limitadas
      const rateLimitedResponses = responses.filter(
        (response) => response.statusCode === 429,
      )
      expect(rateLimitedResponses.length).toBeGreaterThan(0)
    })
  })

  describe('Cache Headers', () => {
    it('should include cache headers in GET requests', async () => {
      // Act
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/accounts',
        headers: {
          authorization: 'Bearer test-token',
        },
      })

      // Assert
      expect(response.statusCode).toBe(200)
      expect(response.headers['x-cache']).toBeDefined()
      expect(response.headers['x-cache-key']).toBeDefined()
    })
  })
})
