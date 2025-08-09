/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { AccountFactory } from '@/factories/account.factory'
import { prisma } from '@/lib/prisma'

import { accountSchema, idParamSchema } from '../../utils/schemas'
import { authPlugin } from '../middlewares/auth'

export async function accountRoutes(app: FastifyInstance) {
  const accountController = AccountFactory.getController()

  // Registrar plugin de autenticação
  await app.register(authPlugin)

  // GET /accounts - Listar contas (versão de teste)
  app.get('/accounts', async (request, reply) => {
    try {
      // Verificar se há token de autorização
      const authHeader = request.headers.authorization
      if (!authHeader) {
        return reply.status(401).send({ message: 'Token de acesso requerido' })
      }

      // Para desenvolvimento, usar um usuário fixo
      const user = await prisma.user.findFirst({
        select: {
          id: true,
          email: true,
          name: true,
        },
      })

      if (!user) {
        return reply.status(401).send({ message: 'Usuário não encontrado' })
      }

      // Simular request.user
      request.user = {
        ...user,
        sub: user.id,
      }

      return await accountController.index(request, reply)
    } catch (error: any) {
      console.error('Erro na rota de contas:', error)
      return reply
        .status(500)
        .send({ message: 'Erro interno do servidor', error: error.message })
    }
  })

  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authPlugin)
    .get(
      '/accounts/:id',
      {
        schema: {
          tags: ['Accounts'],
          summary: 'Buscar conta por ID',
          description: 'Retorna os detalhes de uma conta específica',
          params: idParamSchema,
          response: {
            200: z.object({
              account: z.object({
                id: z.string(),
                name: z.string(),
                type: z.enum([
                  'bank',
                  'credit_card',
                  'investment',
                  'cash',
                  'other',
                ]),
                icon: z.string(),
                iconType: z.enum(['bank', 'generic']),
                includeInGeneralBalance: z.boolean(),
                createdAt: z.string(),
                updatedAt: z.string(),
              }),
            }),
            404: z.object({
              message: z.string(),
            }),
            401: z.object({
              message: z.string(),
            }),
          },
        },
      },
      accountController.show.bind(accountController),
    )

  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authPlugin)
    .post(
      '/accounts',
      {
        schema: {
          tags: ['Accounts'],
          summary: 'Criar nova conta',
          description: 'Cria uma nova conta para o usuário autenticado',
          body: accountSchema,
          response: {
            201: z.object({
              account: z.object({
                id: z.string(),
                name: z.string(),
                type: z.enum([
                  'bank',
                  'credit_card',
                  'investment',
                  'cash',
                  'other',
                ]),
                icon: z.string(),
                iconType: z.enum(['bank', 'generic']),
                includeInGeneralBalance: z.boolean(),
                createdAt: z.string(),
                updatedAt: z.string(),
              }),
            }),
            400: z.object({
              message: z.string(),
            }),
            401: z.object({
              message: z.string(),
            }),
          },
        },
      },
      accountController.store.bind(accountController),
    )

  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authPlugin)
    .put(
      '/accounts/:id',
      {
        schema: {
          tags: ['Accounts'],
          summary: 'Atualizar conta',
          description: 'Atualiza os dados de uma conta existente',
          params: idParamSchema,
          body: accountSchema,
          response: {
            200: z.object({
              account: z.object({
                id: z.string(),
                name: z.string(),
                type: z.enum([
                  'bank',
                  'credit_card',
                  'investment',
                  'cash',
                  'other',
                ]),
                icon: z.string(),
                iconType: z.enum(['bank', 'generic']),
                includeInGeneralBalance: z.boolean(),
                createdAt: z.string(),
                updatedAt: z.string(),
              }),
            }),
            400: z.object({
              message: z.string(),
            }),
            404: z.object({
              message: z.string(),
            }),
            401: z.object({
              message: z.string(),
            }),
          },
        },
      },
      accountController.update.bind(accountController),
    )

  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authPlugin)
    .delete(
      '/accounts/:id',
      {
        schema: {
          tags: ['Accounts'],
          summary: 'Excluir conta',
          description:
            'Exclui uma conta existente (apenas se não tiver transações)',
          params: idParamSchema,
          response: {
            204: z.null().describe('Conta excluída com sucesso'),
            400: z.object({
              message: z.string(),
            }),
            404: z.object({
              message: z.string(),
            }),
            401: z.object({
              message: z.string(),
            }),
          },
        },
      },
      accountController.destroy.bind(accountController),
    )

  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authPlugin)
    .get(
      '/accounts/:id/balance',
      {
        schema: {
          tags: ['Accounts'],
          summary: 'Obter saldo da conta',
          description:
            'Calcula e retorna o saldo atual de uma conta baseado nas transações pagas',
          params: idParamSchema,
          response: {
            200: z.object({
              balance: z.number(),
              accountId: z.string(),
              lastUpdated: z.string(),
            }),
            404: z.object({
              message: z.string(),
            }),
            401: z.object({
              message: z.string(),
            }),
          },
        },
      },
      accountController.balance.bind(accountController),
    )
}
