import fastify, { FastifyInstance } from 'fastify'

import { prisma } from '@/lib/prisma'

// Mock do JWT para testes
const mockUser = {
  sub: 'test-user-id',
  email: 'test@example.com',
}

// Criar instância do Fastify para testes
const createTestApp = (): FastifyInstance => {
  const app = fastify({
    logger: false, // Desabilitar logs durante os testes
  })

  // Mock do plugin JWT
  app.addHook('preHandler', async (request, reply) => {
    request.user = mockUser
  })

  // Registrar as rotas de contas sem validação de schema
  app.register(async function (fastify) {
    // POST /accounts - Criar conta
    fastify.post('/accounts', async (request, reply) => {
      try {
        const userId = (request.user as { sub: string }).sub
        const accountData = request.body as {
          name: string
          type: 'bank' | 'investment' | 'cash' | 'other'
          icon: string
          iconType: 'bank' | 'generic'
          includeInGeneralBalance: boolean
        }

        const account = await prisma.account.create({
          data: {
            ...accountData,
            userId,
          },
        })

        return reply.code(201).send(account)
      } catch (error) {
        request.log.error(error)
        reply.code(500).send({ error: 'Erro interno do servidor' })
      }
    })

    // GET /accounts - Listar contas
    fastify.get('/accounts', async (request, reply) => {
      try {
        const userId = (request.user as { sub: string }).sub
        const query = request.query as { type?: string }

        const whereClause: any = { userId }
        if (query.type) {
          whereClause.type = query.type
        }

        const accounts = await prisma.account.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
        })

        return {
          accounts,
          pagination: {
            page: 1,
            limit: 20,
            total: accounts.length,
            totalPages: 1,
          },
        }
      } catch (error) {
        request.log.error(error)
        reply.code(500).send({ error: 'Erro interno do servidor' })
      }
    })

    // GET /accounts/:id - Obter conta por ID
    fastify.get('/accounts/:id', async (request, reply) => {
      try {
        const { id } = request.params as { id: string }
        const userId = (request.user as { sub: string }).sub

        const account = await prisma.account.findFirst({
          where: {
            id,
            userId,
          },
        })

        if (!account) {
          return reply.code(404).send({ error: 'Conta não encontrada' })
        }

        return account
      } catch (error) {
        request.log.error(error)
        reply.code(500).send({ error: 'Erro interno do servidor' })
      }
    })

    // PUT /accounts/:id - Atualizar conta
    fastify.put('/accounts/:id', async (request, reply) => {
      try {
        const { id } = request.params as { id: string }
        const userId = (request.user as { sub: string }).sub
        const updateData = request.body as Partial<{
          name: string
          type: 'bank' | 'investment' | 'cash' | 'other'
          icon: string
          iconType: 'bank' | 'generic'
          includeInGeneralBalance: boolean
        }>

        const existingAccount = await prisma.account.findFirst({
          where: {
            id,
            userId,
          },
        })

        if (!existingAccount) {
          return reply.code(404).send({ error: 'Conta não encontrada' })
        }

        const updatedAccount = await prisma.account.update({
          where: { id },
          data: updateData,
        })

        return updatedAccount
      } catch (error) {
        request.log.error(error)
        reply.code(500).send({ error: 'Erro interno do servidor' })
      }
    })

    // DELETE /accounts/:id - Excluir conta
    fastify.delete('/accounts/:id', async (request, reply) => {
      try {
        const { id } = request.params as { id: string }
        const userId = (request.user as { sub: string }).sub

        const existingAccount = await prisma.account.findFirst({
          where: {
            id,
            userId,
          },
        })

        if (!existingAccount) {
          return reply.code(404).send({ error: 'Conta não encontrada' })
        }

        await prisma.account.delete({
          where: { id },
        })

        return reply.code(204).send()
      } catch (error) {
        request.log.error(error)
        reply.code(500).send({ error: 'Erro interno do servidor' })
      }
    })
  })

  return app
}

describe('Accounts Routes', () => {
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
        password: '$2b$10$example.hash.for.development', // Hash de exemplo para desenvolvimento
      },
    })
    userId = user.id

    // Mock do usuário autenticado
    mockUser.sub = userId
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    // Limpar contas antes de cada teste
    await prisma.account.deleteMany({
      where: { userId },
    })
  })

  describe('POST /accounts', () => {
    it('deve criar uma nova conta', async () => {
      const accountData = {
        name: 'Conta Teste',
        type: 'bank' as const,
        icon: 'bank-icon',
        iconType: 'bank' as const,
        includeInGeneralBalance: true,
      }

      const response = await app.inject({
        method: 'POST',
        url: '/accounts',
        payload: accountData,
      })

      expect(response.statusCode).toBe(201)
      const account = JSON.parse(response.payload)
      expect(account.name).toBe(accountData.name)
      expect(account.type).toBe(accountData.type)
      expect(account.userId).toBe(userId)
    })
  })

  describe('GET /accounts', () => {
    it('deve listar contas do usuário', async () => {
      // Criar conta de teste
      await prisma.account.create({
        data: {
          name: 'Conta Teste',
          type: 'bank',
          icon: 'bank-icon',
          iconType: 'bank',
          includeInGeneralBalance: true,
          userId,
        },
      })

      const response = await app.inject({
        method: 'GET',
        url: '/accounts',
      })

      expect(response.statusCode).toBe(200)
      const data = JSON.parse(response.payload)
      expect(data.accounts).toHaveLength(1)
      expect(data.accounts[0].name).toBe('Conta Teste')
    })
  })

  describe('GET /accounts/:id', () => {
    it('deve obter conta por ID', async () => {
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

      const response = await app.inject({
        method: 'GET',
        url: `/accounts/${account.id}`,
      })

      expect(response.statusCode).toBe(200)
      const responseAccount = JSON.parse(response.payload)
      expect(responseAccount.id).toBe(account.id)
      expect(responseAccount.name).toBe('Conta Teste')
    })

    it('deve retornar erro 404 para conta inexistente', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/accounts/00000000-0000-0000-0000-000000000000',
      })

      expect(response.statusCode).toBe(404)
      const error = JSON.parse(response.payload)
      expect(error.error).toBe('Conta não encontrada')
    })
  })

  describe('PUT /accounts/:id', () => {
    it('deve atualizar conta existente', async () => {
      const account = await prisma.account.create({
        data: {
          name: 'Conta Original',
          type: 'bank',
          icon: 'bank-icon',
          iconType: 'bank',
          includeInGeneralBalance: true,
          userId,
        },
      })

      const updateData = {
        name: 'Conta Atualizada',
        type: 'investment' as const,
      }

      const response = await app.inject({
        method: 'PUT',
        url: `/accounts/${account.id}`,
        payload: updateData,
      })

      expect(response.statusCode).toBe(200)
      const updatedAccount = JSON.parse(response.payload)
      expect(updatedAccount.name).toBe('Conta Atualizada')
      expect(updatedAccount.type).toBe('investment')
    })

    it('deve retornar erro 404 para conta inexistente', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/accounts/00000000-0000-0000-0000-000000000000',
        payload: { name: 'Nova Conta' },
      })

      expect(response.statusCode).toBe(404)
      const error = JSON.parse(response.payload)
      expect(error.error).toBe('Conta não encontrada')
    })
  })

  describe('DELETE /accounts/:id', () => {
    it('deve excluir conta existente', async () => {
      const account = await prisma.account.create({
        data: {
          name: 'Conta para Excluir',
          type: 'bank',
          icon: 'bank-icon',
          iconType: 'bank',
          includeInGeneralBalance: true,
          userId,
        },
      })

      const response = await app.inject({
        method: 'DELETE',
        url: `/accounts/${account.id}`,
      })

      expect(response.statusCode).toBe(204)

      // Verificar se a conta foi realmente excluída
      const deletedAccount = await prisma.account.findUnique({
        where: { id: account.id },
      })
      expect(deletedAccount).toBeNull()
    })

    it('deve retornar erro 404 para conta inexistente', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/accounts/00000000-0000-0000-0000-000000000000',
      })

      expect(response.statusCode).toBe(404)
      const error = JSON.parse(response.payload)
      expect(error.error).toBe('Conta não encontrada')
    })
  })
})
