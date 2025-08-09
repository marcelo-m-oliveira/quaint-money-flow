/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { CreditCardFactory } from '@/factories/credit-card.factory'
import {
  creditCardCreateSchema,
  creditCardResponseSchema,
  idParamSchema,
  paginationSchema,
} from '@/utils/schemas'

import { authMiddleware } from '../middlewares/auth'

export async function creditCardRoutes(app: FastifyInstance) {
  const creditCardController = CreditCardFactory.getController()

  // GET /credit-cards - Listar cartões de crédito
  app.get(
    '/credit-cards',
    {
      schema: {
        querystring: paginationSchema,
        response: {
          200: z.object({
            creditCards: z.array(creditCardResponseSchema),
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
    creditCardController.index.bind(creditCardController),
  )

  app.get(
    '/credit-cards/:id',
    {
      schema: {
        params: idParamSchema,
        response: {
          200: creditCardResponseSchema,
          401: z.object({ error: z.string() }),
        },
      },
      preHandler: [authMiddleware],
    },
    creditCardController.show.bind(creditCardController),
  )

  app.post(
    '/credit-cards',
    {
      schema: {
        body: creditCardCreateSchema,
        response: {
          201: creditCardResponseSchema,
          401: z.object({ error: z.string() }),
        },
      },
      preHandler: [authMiddleware],
    },
    creditCardController.store.bind(creditCardController),
  )

  app.put(
    '/credit-cards/:id',
    {
      schema: {
        params: idParamSchema,
        body: creditCardCreateSchema.partial(),
        response: {
          200: creditCardResponseSchema,
          401: z.object({ error: z.string() }),
        },
      },
      preHandler: [authMiddleware],
    },
    creditCardController.update.bind(creditCardController),
  )

  app.delete(
    '/credit-cards/:id',
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
    creditCardController.destroy.bind(creditCardController),
  )

  app.get(
    '/credit-cards/:id/usage',
    {
      schema: {
        params: idParamSchema,
        response: {
          200: z.object({
            usage: z.number(),
            limit: z.number(),
            availableLimit: z.number(),
            creditCardId: z.string(),
            lastUpdated: z.string(),
          }),
          401: z.object({ error: z.string() }),
        },
      },
      preHandler: [authMiddleware],
    },
    creditCardController.usage.bind(creditCardController),
  )
}
