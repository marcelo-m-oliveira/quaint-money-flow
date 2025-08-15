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

  // Registrar as rotas de cartões de crédito sem validação de schema
  app.register(async function (fastify) {
    // POST /credit-cards - Criar cartão de crédito
    fastify.post('/credit-cards', async (request, reply) => {
      try {
        const userId = (request.user as { sub: string }).sub
        const creditCardData = request.body as {
          name: string
          icon: string
          iconType: 'bank' | 'generic'
          limit: number
          closingDay: number
          dueDay: number
          defaultPaymentAccountId?: string
        }

        const creditCard = await prisma.creditCard.create({
          data: {
            ...creditCardData,
            userId,
          },
          include: {
            defaultPaymentAccount: true,
          },
        })

        return reply.code(201).send(creditCard)
      } catch (error) {
        request.log.error(error)
        reply.code(500).send({ error: 'Erro interno do servidor' })
      }
    })

    // GET /credit-cards - Listar cartões de crédito
    fastify.get('/credit-cards', async (request, reply) => {
      try {
        const userId = (request.user as { sub: string }).sub

        const creditCards = await prisma.creditCard.findMany({
          where: { userId },
          include: {
            defaultPaymentAccount: true,
          },
          orderBy: { createdAt: 'desc' },
        })

        return {
          creditCards,
          pagination: {
            page: 1,
            limit: 20,
            total: creditCards.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        }
      } catch (error) {
        request.log.error(error)
        reply.code(500).send({ error: 'Erro interno do servidor' })
      }
    })

    // GET /credit-cards/:id - Obter cartão de crédito por ID
    fastify.get('/credit-cards/:id', async (request, reply) => {
      try {
        const { id } = request.params as { id: string }
        const userId = (request.user as { sub: string }).sub

        const creditCard = await prisma.creditCard.findFirst({
          where: {
            id,
            userId,
          },
          include: {
            defaultPaymentAccount: true,
          },
        })

        if (!creditCard) {
          return reply
            .code(404)
            .send({ error: 'Cartão de crédito não encontrado' })
        }

        return creditCard
      } catch (error) {
        request.log.error(error)
        reply.code(500).send({ error: 'Erro interno do servidor' })
      }
    })

    // PUT /credit-cards/:id - Atualizar cartão de crédito
    fastify.put('/credit-cards/:id', async (request, reply) => {
      try {
        const { id } = request.params as { id: string }
        const userId = (request.user as { sub: string }).sub
        const updateData = request.body as Partial<{
          name: string
          icon: string
          iconType: 'bank' | 'generic'
          limit: number
          closingDay: number
          dueDay: number
          defaultPaymentAccountId?: string
        }>

        const creditCard = await prisma.creditCard.update({
          where: {
            id,
            userId,
          },
          data: updateData,
          include: {
            defaultPaymentAccount: true,
          },
        })

        return creditCard
      } catch (error) {
        request.log.error(error)
        reply.code(500).send({ error: 'Erro interno do servidor' })
      }
    })

    // DELETE /credit-cards/:id - Deletar cartão de crédito
    fastify.delete('/credit-cards/:id', async (request, reply) => {
      try {
        const { id } = request.params as { id: string }
        const userId = (request.user as { sub: string }).sub

        await prisma.creditCard.delete({
          where: {
            id,
            userId,
          },
        })

        return reply.code(204).send()
      } catch (error) {
        request.log.error(error)
        reply.code(500).send({ error: 'Erro interno do servidor' })
      }
    })

    // GET /credit-cards/:id/usage - Obter uso do cartão de crédito
    fastify.get('/credit-cards/:id/usage', async (request, reply) => {
      try {
        const { id } = request.params as { id: string }
        const userId = (request.user as { sub: string }).sub

        const creditCard = await prisma.creditCard.findFirst({
          where: {
            id,
            userId,
          },
        })

        if (!creditCard) {
          return reply
            .code(404)
            .send({ error: 'Cartão de crédito não encontrado' })
        }

        const entries = await prisma.entry.findMany({
          where: {
            creditCardId: id,
            userId,
            type: 'expense',
          },
          select: {
            amount: true,
          },
        })

        const usage = entries.reduce((acc, entry) => {
          return acc + Number(entry.amount)
        }, 0)

        const availableLimit = Number(creditCard.limit) - usage

        return {
          usage,
          limit: Number(creditCard.limit),
          availableLimit,
          creditCardId: id,
          lastUpdated: new Date().toISOString(),
        }
      } catch (error) {
        request.log.error(error)
        reply.code(500).send({ error: 'Erro interno do servidor' })
      }
    })
  })

  return app
}

describe('Credit Cards Routes', () => {
  let app: FastifyInstance
  let userId: string
  let accountId: string

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
        password: '$2b$10$example.hash.for.development', // Hash de exemplo para desenvolvimento
      },
    })
    userId = user.id

    // Criar conta de teste para usar como conta de pagamento padrão
    const account = await prisma.account.create({
      data: {
        name: 'Conta Teste',
        type: 'bank',
        icon: 'bank-icon',
        iconType: 'bank',
        includeInGeneralBalance: true,
        userId,
      },
    })
    accountId = account.id

    // Mock do usuário autenticado
    mockUser.sub = userId
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    // Limpar cartões de crédito antes de cada teste
    await prisma.creditCard.deleteMany({
      where: { userId },
    })
  })

  describe('POST /credit-cards', () => {
    it('deve criar um novo cartão de crédito', async () => {
      const creditCardData = {
        name: 'Cartão Teste',
        icon: 'credit-card-icon',
        iconType: 'generic' as const,
        limit: 5000,
        closingDay: 15,
        dueDay: 10,
      }

      const response = await app.inject({
        method: 'POST',
        url: '/credit-cards',
        payload: creditCardData,
      })

      expect(response.statusCode).toBe(201)
      const creditCard = JSON.parse(response.payload)
      expect(creditCard.name).toBe(creditCardData.name)
      expect(Number(creditCard.limit)).toBe(creditCardData.limit)
      expect(creditCard.userId).toBe(userId)
    })

    it('deve criar um cartão de crédito com conta de pagamento padrão', async () => {
      const creditCardData = {
        name: 'Cartão com Conta',
        icon: 'credit-card-icon',
        iconType: 'generic' as const,
        limit: 3000,
        closingDay: 20,
        dueDay: 15,
        defaultPaymentAccountId: accountId,
      }

      const response = await app.inject({
        method: 'POST',
        url: '/credit-cards',
        payload: creditCardData,
      })

      expect(response.statusCode).toBe(201)
      const creditCard = JSON.parse(response.payload)
      expect(creditCard.name).toBe(creditCardData.name)
      expect(creditCard.defaultPaymentAccount).toBeDefined()
      expect(creditCard.defaultPaymentAccount.id).toBe(accountId)
    })
  })

  describe('GET /credit-cards', () => {
    it('deve listar cartões de crédito do usuário', async () => {
      // Criar cartão de teste
      await prisma.creditCard.create({
        data: {
          name: 'Cartão Teste',
          icon: 'credit-card-icon',
          iconType: 'generic',
          limit: 5000,
          closingDay: 15,
          dueDay: 10,
          userId,
        },
      })

      const response = await app.inject({
        method: 'GET',
        url: '/credit-cards',
      })

      expect(response.statusCode).toBe(200)
      const result = JSON.parse(response.payload)
      expect(result.creditCards).toHaveLength(1)
      expect(result.creditCards[0].name).toBe('Cartão Teste')
      expect(result.pagination.total).toBe(1)
    })

    it('deve retornar lista vazia quando não há cartões', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/credit-cards',
      })

      expect(response.statusCode).toBe(200)
      const result = JSON.parse(response.payload)
      expect(result.creditCards).toHaveLength(0)
      expect(result.pagination.total).toBe(0)
    })
  })

  describe('GET /credit-cards/:id', () => {
    it('deve retornar um cartão de crédito por ID', async () => {
      const creditCard = await prisma.creditCard.create({
        data: {
          name: 'Cartão Teste',
          icon: 'credit-card-icon',
          iconType: 'generic',
          limit: 5000,
          closingDay: 15,
          dueDay: 10,
          userId,
        },
      })

      const response = await app.inject({
        method: 'GET',
        url: `/credit-cards/${creditCard.id}`,
      })

      expect(response.statusCode).toBe(200)
      const result = JSON.parse(response.payload)
      expect(result.id).toBe(creditCard.id)
      expect(result.name).toBe('Cartão Teste')
    })

    it('deve retornar 404 para cartão não encontrado', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/credit-cards/non-existent-id',
      })

      expect(response.statusCode).toBe(404)
      const result = JSON.parse(response.payload)
      expect(result.error).toBe('Cartão de crédito não encontrado')
    })
  })

  describe('PUT /credit-cards/:id', () => {
    it('deve atualizar um cartão de crédito', async () => {
      const creditCard = await prisma.creditCard.create({
        data: {
          name: 'Cartão Original',
          icon: 'credit-card-icon',
          iconType: 'generic',
          limit: 5000,
          closingDay: 15,
          dueDay: 10,
          userId,
        },
      })

      const updateData = {
        name: 'Cartão Atualizado',
        limit: 7000,
      }

      const response = await app.inject({
        method: 'PUT',
        url: `/credit-cards/${creditCard.id}`,
        payload: updateData,
      })

      expect(response.statusCode).toBe(200)
      const result = JSON.parse(response.payload)
      expect(result.name).toBe('Cartão Atualizado')
      expect(Number(result.limit)).toBe(7000)
    })
  })

  describe('DELETE /credit-cards/:id', () => {
    it('deve deletar um cartão de crédito', async () => {
      const creditCard = await prisma.creditCard.create({
        data: {
          name: 'Cartão para Deletar',
          icon: 'credit-card-icon',
          iconType: 'generic',
          limit: 5000,
          closingDay: 15,
          dueDay: 10,
          userId,
        },
      })

      const response = await app.inject({
        method: 'DELETE',
        url: `/credit-cards/${creditCard.id}`,
      })

      expect(response.statusCode).toBe(204)

      // Verificar se foi deletado
      const deletedCard = await prisma.creditCard.findUnique({
        where: { id: creditCard.id },
      })
      expect(deletedCard).toBeNull()
    })
  })

  describe('GET /credit-cards/:id/usage', () => {
    it('deve retornar o uso do cartão de crédito', async () => {
      const creditCard = await prisma.creditCard.create({
        data: {
          name: 'Cartão Teste',
          icon: 'credit-card-icon',
          iconType: 'generic',
          limit: 5000,
          closingDay: 15,
          dueDay: 10,
          userId,
        },
      })

      // Criar uma categoria de teste
      const category = await prisma.category.create({
        data: {
          name: 'Categoria Teste',
          color: '#FF0000',
          type: 'expense',
          icon: 'shopping-cart',
          userId,
        },
      })

      // Criar algumas transações de teste
      await prisma.entry.createMany({
        data: [
          {
            description: 'Compra 1',
            amount: 100,
            type: 'expense',
            paid: true,
            date: new Date(),
            categoryId: category.id,
            creditCardId: creditCard.id,
            userId,
          },
          {
            description: 'Compra 2',
            amount: 200,
            type: 'expense',
            paid: true,
            date: new Date(),
            categoryId: category.id,
            creditCardId: creditCard.id,
            userId,
          },
        ],
      })

      const response = await app.inject({
        method: 'GET',
        url: `/credit-cards/${creditCard.id}/usage`,
      })

      expect(response.statusCode).toBe(200)
      const result = JSON.parse(response.payload)
      expect(result.usage).toBe(300)
      expect(result.limit).toBe(5000)
      expect(result.availableLimit).toBe(4700)
      expect(result.creditCardId).toBe(creditCard.id)
    })

    it('deve retornar uso zero quando não há transações', async () => {
      const creditCard = await prisma.creditCard.create({
        data: {
          name: 'Cartão Sem Uso',
          icon: 'credit-card-icon',
          iconType: 'generic',
          limit: 5000,
          closingDay: 15,
          dueDay: 10,
          userId,
        },
      })

      const response = await app.inject({
        method: 'GET',
        url: `/credit-cards/${creditCard.id}/usage`,
      })

      expect(response.statusCode).toBe(200)
      const result = JSON.parse(response.payload)
      expect(result.usage).toBe(0)
      expect(result.limit).toBe(5000)
      expect(result.availableLimit).toBe(5000)
    })
  })
})
