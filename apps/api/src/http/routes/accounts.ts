import { Account } from '@prisma/client'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

// Schema para criação de conta
const createAccountSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  type: z.enum(['bank', 'credit_card', 'investment', 'cash', 'other'], {
    message: 'Tipo de conta inválido',
  }),
  icon: z.string().min(1, 'Ícone é obrigatório'),
  iconType: z.enum(['bank', 'generic'], {
    message: 'Tipo de ícone inválido',
  }),
  includeInGeneralBalance: z.boolean().default(true),
})

// Schema para atualização de conta
const updateAccountSchema = createAccountSchema.partial()

// Schema para parâmetros de rota
const accountParamsSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
})

// Schema para query de listagem
const listAccountsQuerySchema = z.object({
  type: z
    .enum(['bank', 'credit_card', 'investment', 'cash', 'other'])
    .optional(),
  includeInGeneralBalance: z.boolean().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

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
        security: [{ bearerAuth: [] }],
        querystring: listAccountsQuerySchema,
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
        const { type, includeInGeneralBalance, page, limit } =
          request.query as {
            type?: 'bank' | 'credit_card' | 'investment' | 'cash' | 'other'
            includeInGeneralBalance?: boolean
            page: number
            limit: number
          }
        const userId = (request.user as { sub: string }).sub

        // Construir filtros
        const where: Partial<Account> = {
          userId,
        }

        if (type) {
          where.type = type
        }

        if (includeInGeneralBalance !== undefined) {
          where.includeInGeneralBalance = includeInGeneralBalance
        }

        // Contar total de registros
        const total = await prisma.account.count({ where })

        // Buscar contas com paginação
        const accounts = await prisma.account.findMany({
          where,
          orderBy: {
            createdAt: 'desc',
          },
          skip: (page - 1) * limit,
          take: limit,
        })

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
        security: [{ bearerAuth: [] }],
        params: accountParamsSchema,
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
        security: [{ bearerAuth: [] }],
        body: createAccountSchema,
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
        security: [{ bearerAuth: [] }],
        params: accountParamsSchema,
        body: updateAccountSchema,
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
        security: [{ bearerAuth: [] }],
        params: accountParamsSchema,
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
        security: [{ bearerAuth: [] }],
        params: accountParamsSchema,
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
