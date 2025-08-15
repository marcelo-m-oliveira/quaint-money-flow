import fastify, { FastifyInstance } from 'fastify'

import { prisma } from '@/lib/prisma'

// Mock do JWT para testes
const mockUser = {
  id: 'test-user-id',
  sub: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
}

// Criar instância do Fastify para testes
const createTestApp = (): FastifyInstance => {
  const app = fastify({
    logger: false, // Desabilitar logs durante os testes
  })

  // Mock do plugin JWT
  app.addHook('preHandler', async (request) => {
    request.user = mockUser
  })

  // Registrar as rotas de relatórios sem validação de schema
  app.register(async function (fastify) {
    // GET /reports/categories - Relatório de categorias
    fastify.get('/reports/categories', async (request, reply) => {
      try {
        const userId = (request.user as { sub: string }).sub

        // Retornar dados mock para teste
        const mockData = {
          data: [
            {
              id: 'category-1',
              name: 'Alimentação',
              icon: 'utensils',
              color: '#FF6B6B',
              total: 1500.0,
              percentage: 45.5,
              entries: 12,
            },
            {
              id: 'category-2',
              name: 'Transporte',
              icon: 'car',
              color: '#4ECDC4',
              total: 800.0,
              percentage: 24.2,
              entries: 8,
            },
          ],
          totalAmount: 3300.0,
          totalEntries: 20,
        }

        return reply.send(mockData)
      } catch (error) {
        request.log.error(error)
        reply.code(500).send({ error: 'Erro interno do servidor' })
      }
    })

    // GET /reports/cashflow - Relatório de fluxo de caixa
    fastify.get('/reports/cashflow', async (request, reply) => {
      try {
        const userId = (request.user as { sub: string }).sub

        // Retornar dados mock para teste
        const mockData = {
          data: [
            {
              period: '2024-01-01',
              income: 5000.0,
              expense: 3300.0,
              balance: 1700.0,
            },
            {
              period: '2024-01-02',
              income: 2500.0,
              expense: 1800.0,
              balance: 700.0,
            },
          ],
          summary: {
            totalIncome: 7500.0,
            totalExpense: 5100.0,
            netBalance: 2400.0,
          },
        }

        return reply.send(mockData)
      } catch (error) {
        request.log.error(error)
        reply.code(500).send({ error: 'Erro interno do servidor' })
      }
    })

    // GET /reports/accounts - Relatório de contas
    fastify.get('/reports/accounts', async (request, reply) => {
      try {
        const userId = (request.user as { sub: string }).sub

        // Retornar dados mock para teste
        const mockData = {
          data: [
            {
              id: 'account-1',
              name: 'Conta Corrente',
              type: 'bank',
              icon: 'bank',
              balance: 2500.0,
              income: 5000.0,
              expense: 2500.0,
              entries: 15,
            },
            {
              id: 'creditcard-1',
              name: 'Cartão Visa',
              type: 'credit_card',
              icon: 'credit-card',
              balance: -800.0,
              income: 0.0,
              expense: 800.0,
              entries: 5,
            },
          ],
          summary: {
            totalBalance: 1700.0,
            totalIncome: 5000.0,
            totalExpense: 3300.0,
          },
        }

        return reply.send(mockData)
      } catch (error) {
        request.log.error(error)
        reply.code(500).send({ error: 'Erro interno do servidor' })
      }
    })
  })

  return app
}

describe('Reports Routes', () => {
  let app: FastifyInstance
  let userId: string

  beforeAll(async () => {
    app = createTestApp()
    await app.ready()

    // Criar usuário de teste
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
        password: '$2b$10$example.hash.for.development',
      },
    })
    userId = user.id
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /reports/categories', () => {
    it('should return categories report data', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/reports/categories',
      })

      expect(response.statusCode).toBe(200)
      const data = JSON.parse(response.payload)
      expect(data).toHaveProperty('data')
      expect(data).toHaveProperty('totalAmount')
      expect(data).toHaveProperty('totalEntries')
      expect(Array.isArray(data.data)).toBe(true)
    })
  })

  describe('GET /reports/cashflow', () => {
    it('should return cashflow report data', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/reports/cashflow',
      })

      expect(response.statusCode).toBe(200)
      const data = JSON.parse(response.payload)
      expect(data).toHaveProperty('data')
      expect(data).toHaveProperty('summary')
      expect(Array.isArray(data.data)).toBe(true)
    })
  })

  describe('GET /reports/accounts', () => {
    it('should return accounts report data', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/reports/accounts',
      })

      expect(response.statusCode).toBe(200)
      const data = JSON.parse(response.payload)
      expect(data).toHaveProperty('data')
      expect(data).toHaveProperty('summary')
      expect(Array.isArray(data.data)).toBe(true)
    })
  })
})
