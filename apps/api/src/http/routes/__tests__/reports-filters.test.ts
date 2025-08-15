import fastify, { FastifyInstance } from 'fastify'

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

  // Registrar as rotas de relatórios com validação de parâmetros
  app.register(async function (fastify) {
    // GET /reports/cashflow - Relatório de fluxo de caixa
    fastify.get(
      '/reports/cashflow',
      {
        schema: {
          querystring: {
            type: 'object',
            properties: {
              startDate: { type: 'string', format: 'date' },
              endDate: { type: 'string', format: 'date' },
              viewMode: {
                type: 'string',
                enum: ['daily', 'weekly', 'monthly'],
              },
            },
            required: ['startDate', 'endDate', 'viewMode'],
          },
        },
      },
      async (request, reply) => {
        try {
          const { startDate, endDate, viewMode } = request.query as {
            startDate: string
            endDate: string
            viewMode: 'daily' | 'weekly' | 'monthly'
          }

          // Validar se startDate não é posterior a endDate
          if (new Date(startDate) > new Date(endDate)) {
            return reply
              .code(400)
              .send({ error: 'startDate deve ser anterior ou igual a endDate' })
          }

          // Retornar dados mock para teste
          const mockData = {
            data: [
              {
                period:
                  viewMode === 'daily'
                    ? startDate
                    : viewMode === 'weekly'
                      ? '2024-W01'
                      : '2024-01',
                income: 5000.0,
                expense: 3300.0,
                balance: 1700.0,
              },
            ],
            summary: {
              totalIncome: 5000.0,
              totalExpense: 3300.0,
              netBalance: 1700.0,
            },
          }

          return reply.send(mockData)
        } catch (error) {
          request.log.error(error)
          reply.code(500).send({ error: 'Erro interno do servidor' })
        }
      },
    )

    // GET /reports/categories - Relatório de categorias
    fastify.get(
      '/reports/categories',
      {
        schema: {
          querystring: {
            type: 'object',
            properties: {
              startDate: { type: 'string', format: 'date' },
              endDate: { type: 'string', format: 'date' },
            },
            required: ['startDate', 'endDate'],
          },
        },
      },
      async (request, reply) => {
        try {
          const { startDate, endDate } = request.query as {
            startDate: string
            endDate: string
          }

          // Validar se startDate não é posterior a endDate
          if (new Date(startDate) > new Date(endDate)) {
            return reply
              .code(400)
              .send({ error: 'startDate deve ser anterior ou igual a endDate' })
          }

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
            ],
            totalAmount: 1500.0,
            totalEntries: 12,
          }

          return reply.send(mockData)
        } catch (error) {
          request.log.error(error)
          reply.code(500).send({ error: 'Erro interno do servidor' })
        }
      },
    )
  })

  return app
}

describe('Reports Filters Tests', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = createTestApp()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('Period Filters (startDate and endDate)', () => {
    it('should accept valid date range parameters', async () => {
      const startDate = '2024-01-01'
      const endDate = '2024-01-31'
      const viewMode = 'daily'

      const response = await app.inject({
        method: 'GET',
        url: `/reports/cashflow?startDate=${startDate}&endDate=${endDate}&viewMode=${viewMode}`,
      })

      // Should not return validation error (400)
      expect(response.statusCode).not.toBe(400)
    })

    it('should accept valid date range for categories report', async () => {
      const startDate = '2024-01-01'
      const endDate = '2024-01-31'

      const response = await app.inject({
        method: 'GET',
        url: `/reports/categories?startDate=${startDate}&endDate=${endDate}`,
      })

      // Should not return validation error (400)
      expect(response.statusCode).not.toBe(400)
    })

    it('should return 400 for invalid date format', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/reports/cashflow?startDate=invalid-date&endDate=2024-01-31&viewMode=daily',
      })

      expect(response.statusCode).toBe(400)
    })
  })

  // Test 2: Validar agrupamento por viewMode
  describe('ViewMode Grouping', () => {
    it('should accept daily viewMode', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/reports/cashflow?startDate=2024-01-01&endDate=2024-01-07&viewMode=daily',
      })

      expect(response.statusCode).not.toBe(400)
    })

    it('should accept weekly viewMode', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/reports/cashflow?startDate=2024-01-01&endDate=2024-01-31&viewMode=weekly',
      })

      expect(response.statusCode).not.toBe(400)
    })

    it('should accept monthly viewMode', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/reports/cashflow?startDate=2024-01-01&endDate=2024-12-31&viewMode=monthly',
      })

      expect(response.statusCode).not.toBe(400)
    })

    it('should return 400 for invalid viewMode', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/reports/cashflow?startDate=2024-01-01&endDate=2024-01-31&viewMode=invalid',
      })

      expect(response.statusCode).toBe(400)
    })
  })

  // Test 3: Validar parâmetros obrigatórios
  describe('Required Parameters', () => {
    it('should return 400 when missing required parameters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/reports/cashflow',
      })

      expect(response.statusCode).toBe(400)
    })
  })
})
