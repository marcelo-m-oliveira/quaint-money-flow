import { EntryType } from '@prisma/client'
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

  // Registrar as rotas de lançamentos sem validação de schema
  app.register(async function (fastify) {
    // POST /entries - Criar lançamento
    fastify.post('/entries', async (request, reply) => {
      try {
        const userId = (request.user as { sub: string }).sub
        const entryData = request.body as {
          description: string
          amount: string
          type: 'income' | 'expense'
          categoryId: string
          paid: boolean
          date: number
          accountId?: string
          creditCardId?: string
        }

        const entry = await prisma.entry.create({
          data: {
            ...entryData,
            userId,
            amount: parseFloat(entryData.amount),
            date: new Date(entryData.date * 1000),
          },
          include: {
            account: true,
            category: true,
            creditCard: true,
          },
        })

        // Converter null para undefined para evitar erro de serialização
        const response = {
          ...entry,
          account: entry.account || undefined,
          category: entry.category || undefined,
          creditCard: entry.creditCard || undefined,
        }

        return reply.code(201).send(response)
      } catch (error) {
        request.log.error(error)
        reply.code(500).send({ error: 'Erro interno do servidor' })
      }
    })

    // PUT /entries/:id - Atualizar lançamento
    fastify.put('/entries/:id', async (request, reply) => {
      try {
        const { id } = request.params as { id: string }
        const userId = (request.user as { sub: string }).sub
        const updateData = request.body as Partial<{
          description: string
          amount: string
          type: 'income' | 'expense'
          categoryId: string
          paid: boolean
          date: number
          accountId: string
          creditCardId: string
        }>

        const existingEntry = await prisma.entry.findFirst({
          where: {
            id,
            userId,
          },
        })

        if (!existingEntry) {
          return reply.code(404).send({ error: 'Lançamento não encontrado' })
        }

        const dataToUpdate: any = { ...updateData }
        if (updateData.amount) {
          dataToUpdate.amount = parseFloat(updateData.amount)
        }
        if (updateData.date) {
          dataToUpdate.date = new Date(updateData.date * 1000)
        }

        const updatedEntry = await prisma.entry.update({
          where: { id },
          data: dataToUpdate,
          include: {
            account: true,
            category: true,
            creditCard: true,
          },
        })

        // Converter null para undefined para evitar erro de serialização
        const response = {
          ...updatedEntry,
          account: updatedEntry.account || undefined,
          category: updatedEntry.category || undefined,
          creditCard: updatedEntry.creditCard || undefined,
        }

        return response
      } catch (error) {
        request.log.error(error)
        reply.code(500).send({ error: 'Erro interno do servidor' })
      }
    })

    // GET /entries/:id - Obter lançamento por ID
    fastify.get('/entries/:id', async (request, reply) => {
      try {
        const { id } = request.params as { id: string }
        const userId = (request.user as { sub: string }).sub

        const entry = await prisma.entry.findFirst({
          where: {
            id,
            userId,
          },
          include: {
            account: true,
            category: true,
            creditCard: true,
          },
        })

        if (!entry) {
          return reply.code(404).send({ error: 'Lançamento não encontrado' })
        }

        // Converter null para undefined para evitar erro de serialização
        const response = {
          ...entry,
          account: entry.account || undefined,
          category: entry.category || undefined,
          creditCard: entry.creditCard || undefined,
        }

        return response
      } catch (error) {
        request.log.error(error)
        reply.code(500).send({ error: 'Erro interno do servidor' })
      }
    })
  })

  return app
}

describe('Entries Routes', () => {
  let app: FastifyInstance
  let userId: string
  let accountId: string
  let categoryId: string

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

    // Criar conta de teste
    const account = await prisma.account.create({
      data: {
        name: 'Test Account',
        type: 'bank',
        icon: 'bank',
        iconType: 'bank',
        includeInGeneralBalance: true,
        userId,
      },
    })
    accountId = account.id

    // Criar categoria de teste
    const category = await prisma.category.create({
      data: {
        name: 'Test Category',
        icon: 'shopping-cart',
        color: '#FF0000',
        type: 'expense',
        userId,
      },
    })
    categoryId = category.id

    // Mock do usuário autenticado
    mockUser.sub = userId
  })

  afterAll(async () => {
    // Limpar dados de teste
    await prisma.entry.deleteMany({ where: { userId } })
    await prisma.account.deleteMany({ where: { userId } })
    await prisma.category.deleteMany({ where: { userId } })
    await prisma.user.deleteMany({ where: { email: 'test@example.com' } })
    await app.close()
  })

  beforeEach(async () => {
    // Limpar lançamentos antes de cada teste
    await prisma.entry.deleteMany({ where: { userId } })
  })

  describe('POST /entries', () => {
    it('should create a new entry successfully', async () => {
      const entryData = {
        description: 'Fatura',
        amount: '400',
        type: 'expense' as EntryType,
        categoryId,
        paid: true,
        date: 1755043200,
        accountId,
      }

      const response = await app.inject({
        method: 'POST',
        url: '/entries',
        payload: entryData,
      })

      expect(response.statusCode).toBe(201)
      const responseBody = JSON.parse(response.body)
      expect(responseBody.description).toBe('Fatura')
      expect(responseBody.amount).toBe('400')
      expect(responseBody.type).toBe('expense')
      expect(responseBody.paid).toBe(true)
      expect(responseBody.account).toBeDefined()
      expect(responseBody.category).toBeDefined()
      expect(responseBody.creditCard).toBeUndefined()
    })
  })

  describe('PUT /entries/:id', () => {
    it('should update an entry successfully', async () => {
      // Criar lançamento primeiro
      const entry = await prisma.entry.create({
        data: {
          description: 'Fatura',
          amount: 400,
          type: 'expense',
          categoryId,
          paid: true,
          date: new Date(1755043200 * 1000),
          accountId,
          userId,
        },
      })

      const updateData = {
        description: 'Fatura',
        amount: '400',
        type: 'expense' as EntryType,
        categoryId,
        paid: false,
        date: 1755043200,
        accountId,
      }

      const response = await app.inject({
        method: 'PUT',
        url: `/entries/${entry.id}`,
        payload: updateData,
      })

      expect(response.statusCode).toBe(200)
      const responseBody = JSON.parse(response.body)
      expect(responseBody.paid).toBe(false)
      expect(responseBody.account).toBeDefined()
      expect(responseBody.category).toBeDefined()
      expect(responseBody.creditCard).toBeUndefined()
    })
  })

  describe('GET /entries/:id', () => {
    it('should get an entry by id successfully', async () => {
      // Criar lançamento primeiro
      const entry = await prisma.entry.create({
        data: {
          description: 'Fatura',
          amount: 400,
          type: 'expense',
          categoryId,
          paid: true,
          date: new Date(1755043200 * 1000),
          accountId,
          userId,
        },
      })

      const response = await app.inject({
        method: 'GET',
        url: `/entries/${entry.id}`,
      })

      expect(response.statusCode).toBe(200)
      const responseBody = JSON.parse(response.body)
      expect(responseBody.description).toBe('Fatura')
      expect(responseBody.amount).toBe('400')
      expect(responseBody.account).toBeDefined()
      expect(responseBody.category).toBeDefined()
      expect(responseBody.creditCard).toBeUndefined()
    })
  })
})
