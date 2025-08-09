/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { AccountFactory } from '@/factories/account.factory'
import { accountCreateSchema, accountSchema, idParamSchema, paginationSchema } from '@/utils/schemas'

import { authMiddleware } from '../middlewares/auth'

export async function accountRoutes(app: FastifyInstance) {
  const accountController = AccountFactory.getController()

  // GET /accounts - Listar contas
  app.get(
    '/accounts',
    {
      schema: {
        querystring: paginationSchema.merge(
          z.object({
            type: z.enum(['bank', 'investment', 'cash', 'other']).optional(),
            includeInGeneralBalance: z.boolean().optional(),
          }),
        ),
        response: {
          200: z.object({
            accounts: z.array(accountSchema as any),
            pagination: z.object({
              page: z.number(),
              limit: z.number(),
              total: z.number(),
              totalPages: z.number(),
              hasNext: z.boolean(),
              hasPrev: z.boolean(),
            }),
          }),
          401: z.object({ error: z.string() }),
        },
      },
      preHandler: [authMiddleware],
    },
    accountController.index.bind(accountController),
  )

  app.get(
    '/accounts/:id',
    {
      schema: {
        params: idParamSchema,
        response: {
          200: accountSchema,
          401: z.object({ error: z.string() }),
        },
      },
      preHandler: [authMiddleware],
    },
    accountController.show.bind(accountController),
  )

  app.post(
    '/accounts',
    {
      schema: {
        body: accountCreateSchema,
        response: {
          201: accountSchema,
          401: z.object({ error: z.string() }),
        },
      },
      preHandler: [authMiddleware],
    },
    accountController.store.bind(accountController),
  )

  app.put(
    '/accounts/:id',
    {
      schema: {
        params: idParamSchema,
        body: accountCreateSchema.partial(),
        response: {
          200: accountSchema,
          401: z.object({ error: z.string() }),
        },
      },
      preHandler: [authMiddleware],
    },
    accountController.update.bind(accountController),
  )

  app.delete(
    '/accounts/:id',
    {
      schema: {
        params: idParamSchema,
        response: {
          204: z.null(),
          401: z.object({ error: z.string() }),
        },
      },
      preHandler: [authMiddleware],
    },
    accountController.destroy.bind(accountController),
  )

  app.get(
    '/accounts/:id/balance',
    {
      schema: {
        params: idParamSchema,
        response: {
          200: z.object({
            balance: z.number(),
            accountId: z.string(),
            lastUpdated: z.string(),
          }),
          401: z.object({ error: z.string() }),
        },
      },
      preHandler: [authMiddleware],
    },
    accountController.balance.bind(accountController),
  )
}
