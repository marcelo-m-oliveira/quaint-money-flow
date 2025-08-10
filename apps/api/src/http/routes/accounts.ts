/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { AccountFactory } from '@/factories/account.factory'
import {
  accountBalanceSchema,
  accountCreateSchema,
  accountFiltersSchema,
  accountListResponseSchema,
  accountResponseSchema,
  accountUpdateSchema,
  idParamSchema,
  selectOptionSchema,
} from '@/utils/schemas'

import { authMiddleware } from '../middlewares/auth'

export async function accountRoutes(app: FastifyInstance) {
  const accountController = AccountFactory.getController()

  // GET /accounts/select-options - Buscar contas formatadas para select
  app.get(
    '/accounts/select-options',
    {
      schema: {
        response: {
          200: z.array(selectOptionSchema),
          401: z.object({ error: z.string() }),
        },
      },
      preHandler: [authMiddleware],
    },
    accountController.selectOptions.bind(accountController),
  )

  // GET /accounts - Listar contas
  app.get(
    '/accounts',
    {
      schema: {
        querystring: accountFiltersSchema,
        response: {
          200: accountListResponseSchema,
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
          200: accountResponseSchema,
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
          201: accountResponseSchema,
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
        body: accountUpdateSchema,
        response: {
          200: accountResponseSchema,
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
          200: accountBalanceSchema,
          401: z.object({ error: z.string() }),
        },
      },
      preHandler: [authMiddleware],
    },
    accountController.balance.bind(accountController),
  )
}
