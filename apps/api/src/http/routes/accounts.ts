import { Account, AccountType } from '@prisma/client'
import { FastifyInstance } from 'fastify'

import { prisma } from '@/lib/prisma'

export async function accountRoutes(app: FastifyInstance) {
  // Middleware de autenticação para todas as rotas
  app.addHook('preHandler', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.code(401).send({ error: 'Token inválido ou expirado' })
    }
  })

  // GET /accounts - Listar contas
  app.get(
    '/accounts',
    {
      schema: {
        tags: ['Accounts'],
        summary: 'Listar contas do usuário',
        description:
          'Retorna uma lista paginada das contas do usuário autenticado',
        querystring: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['bank', 'credit_card', 'investment', 'cash', 'other'],
            },
            includeInGeneralBalance: { type: 'boolean' },
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              accounts: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    type: { type: 'string' },
                    icon: { type: 'string' },
                    iconType: { type: 'string' },
                    includeInGeneralBalance: { type: 'boolean' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                  },
                },
              },
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'number' },
                  limit: { type: 'number' },
                  total: { type: 'number' },
                  totalPages: { type: 'number' },
                },
              },
            },
          },
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const query = request.query as {
          type?: string
          includeInGeneralBalance?: boolean
          page?: number
          limit?: number
        }
        const userId = (request.user as { sub: string }).sub

        const { page = 1, limit = 20, type, includeInGeneralBalance } = query

        // Construir filtros
        const whereClause: Partial<Account> = { userId }
        if (type) {
          whereClause.type = type as AccountType
        }
        if (includeInGeneralBalance !== undefined) {
          whereClause.includeInGeneralBalance = includeInGeneralBalance
        }

        // Calcular offset
        const offset = (page - 1) * limit

        // Buscar contas com paginação
        const [accounts, total] = await Promise.all([
          prisma.account.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            skip: offset,
            take: limit,
          }),
          prisma.account.count({ where: whereClause }),
        ])

        const totalPages = Math.ceil(total / limit)

        return {
          accounts,
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        }
      } catch (error) {
        request.log.error(error)
        reply.code(500).send({ error: 'Erro interno do servidor' })
      }
    },
  )

  // GET /accounts/:id - Buscar conta por ID
  app.get(
    '/accounts/:id',
    {
      schema: {
        tags: ['Accounts'],
        summary: 'Buscar conta por ID',
        description: 'Retorna os detalhes de uma conta específica',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              icon: { type: 'string' },
              iconType: { type: 'string' },
              includeInGeneralBalance: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
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
    },
  )

  // POST /accounts - Criar nova conta
  app.post(
    '/accounts',
    {
      schema: {
        tags: ['Accounts'],
        summary: 'Criar nova conta',
        description: 'Cria uma nova conta para o usuário autenticado',
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            type: {
              type: 'string',
              enum: ['bank', 'credit_card', 'investment', 'cash', 'other'],
            },
            icon: { type: 'string' },
            iconType: { type: 'string', enum: ['bank', 'generic'] },
            includeInGeneralBalance: { type: 'boolean' },
          },
          required: [
            'name',
            'type',
            'icon',
            'iconType',
            'includeInGeneralBalance',
          ],
        },
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              icon: { type: 'string' },
              iconType: { type: 'string' },

              includeInGeneralBalance: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              details: { type: 'array' },
            },
          },
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const userId = (request.user as { sub: string }).sub
        const accountData = request.body as {
          name: string
          type: 'bank' | 'credit_card' | 'investment' | 'cash' | 'other'
          icon: string
          iconType: 'bank' | 'generic'
          includeInGeneralBalance: boolean
        }

        // Verificar se já existe uma conta com o mesmo nome para o usuário
        const existingAccount = await prisma.account.findFirst({
          where: {
            userId,
            name: accountData.name,
          },
        })

        if (existingAccount) {
          return reply.code(400).send({
            error: 'Já existe uma conta com este nome',
          })
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
    },
  )

  // PUT /accounts/:id - Atualizar conta
  app.put(
    '/accounts/:id',
    {
      schema: {
        tags: ['Accounts'],
        summary: 'Atualizar conta',
        description: 'Atualiza os dados de uma conta existente',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            type: {
              type: 'string',
              enum: ['bank', 'credit_card', 'investment', 'cash', 'other'],
            },
            icon: { type: 'string' },
            iconType: { type: 'string', enum: ['bank', 'generic'] },
            includeInGeneralBalance: { type: 'boolean' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              icon: { type: 'string' },
              iconType: { type: 'string' },

              includeInGeneralBalance: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              details: { type: 'array' },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string }
        const userId = (request.user as { sub: string }).sub
        const updateData = request.body as Partial<{
          name: string
          type: 'bank' | 'credit_card' | 'investment' | 'cash' | 'other'
          icon: string
          iconType: 'bank' | 'generic'
          includeInGeneralBalance: boolean
        }>

        // Verificar se a conta existe e pertence ao usuário
        const existingAccount = await prisma.account.findFirst({
          where: {
            id,
            userId,
          },
        })

        if (!existingAccount) {
          return reply.code(404).send({ error: 'Conta não encontrada' })
        }

        // Se está alterando o nome, verificar se não existe outra conta com o mesmo nome
        if (updateData.name && updateData.name !== existingAccount.name) {
          const duplicateAccount = await prisma.account.findFirst({
            where: {
              userId,
              name: updateData.name,
              id: { not: id },
            },
          })

          if (duplicateAccount) {
            return reply.code(400).send({
              error: 'Já existe uma conta com este nome',
            })
          }
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
    },
  )

  // DELETE /accounts/:id - Excluir conta
  app.delete(
    '/accounts/:id',
    {
      schema: {
        tags: ['Accounts'],
        summary: 'Excluir conta',
        description:
          'Exclui uma conta existente (apenas se não tiver transações)',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        response: {
          204: {
            type: 'null',
            description: 'Conta excluída com sucesso',
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string }
        const userId = (request.user as { sub: string }).sub

        // Verificar se a conta existe e pertence ao usuário
        const existingAccount = await prisma.account.findFirst({
          where: {
            id,
            userId,
          },
        })

        if (!existingAccount) {
          return reply.code(404).send({ error: 'Conta não encontrada' })
        }

        // Verificar se existem transações associadas à conta
        const transactionCount = await prisma.transaction.count({
          where: {
            accountId: id,
          },
        })

        if (transactionCount > 0) {
          return reply.code(400).send({
            error: 'Não é possível excluir uma conta que possui transações',
          })
        }

        await prisma.account.delete({
          where: { id },
        })

        return reply.code(204).send()
      } catch (error) {
        request.log.error(error)
        reply.code(500).send({ error: 'Erro interno do servidor' })
      }
    },
  )

  // GET /accounts/:id/balance - Obter saldo da conta
  app.get(
    '/accounts/:id/balance',
    {
      schema: {
        tags: ['Accounts'],
        summary: 'Obter saldo da conta',
        description:
          'Retorna o saldo atual da conta calculado com base nas transações',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              accountId: { type: 'string' },
              balance: { type: 'number' },
              lastUpdated: { type: 'string', format: 'date-time' },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string }
        const userId = (request.user as { sub: string }).sub

        // Verificar se a conta existe e pertence ao usuário
        const account = await prisma.account.findFirst({
          where: {
            id,
            userId,
          },
        })

        if (!account) {
          return reply.code(404).send({ error: 'Conta não encontrada' })
        }

        // Calcular saldo baseado nas transações
        const transactions = await prisma.transaction.findMany({
          where: {
            accountId: id,
            paid: true, // Apenas transações pagas
          },
        })

        const balance = transactions.reduce((acc, transaction) => {
          const amount = Number(transaction.amount)
          return transaction.type === 'income' ? acc + amount : acc - amount
        }, 0)

        return {
          accountId: id,
          balance,
          lastUpdated: new Date().toISOString(),
        }
      } catch (error) {
        request.log.error(error)
        reply.code(500).send({ error: 'Erro interno do servidor' })
      }
    },
  )
}
