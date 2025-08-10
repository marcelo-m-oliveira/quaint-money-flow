import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { TransactionFactory } from '@/factories/transaction.factory'
import {
  idParamSchema,
  transactionCreateSchema,
  transactionFiltersSchema,
  transactionListResponseSchema,
  transactionResponseSchema,
  transactionUpdateSchema,
} from '@/utils/schemas'

import { authMiddleware } from '../middlewares/auth'

export async function transactionRoutes(app: FastifyInstance) {
  const transactionController = TransactionFactory.getController()

  // Aplicar middleware de autenticação em todas as rotas
  app.addHook('onRequest', authMiddleware)

  // GET /transactions - Listar transações do usuário com filtros
  app.get(
    '/',
    {
      schema: {
        querystring: transactionFiltersSchema,
        response: {
          200: transactionListResponseSchema,
          401: z.object({ error: z.string() }),
        },
      },
    },
    transactionController.index.bind(transactionController),
  )

  // GET /transactions/:id - Buscar transação específica
  app.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
        response: {
          200: transactionResponseSchema,
          401: z.object({ error: z.string() }),
          404: z.object({ error: z.string() }),
        },
      },
    },
    transactionController.show.bind(transactionController),
  )

  // POST /transactions - Criar nova transação
  app.post(
    '/',
    {
      schema: {
        body: transactionCreateSchema,
        response: {
          201: transactionResponseSchema,
          401: z.object({ error: z.string() }),
        },
      },
    },
    transactionController.store.bind(transactionController),
  )

  // PUT /transactions/:id - Atualizar transação
  app.put(
    '/:id',
    {
      schema: {
        params: idParamSchema,
        body: transactionUpdateSchema,
        response: {
          200: transactionResponseSchema,
          401: z.object({ error: z.string() }),
          404: z.object({ error: z.string() }),
        },
      },
    },
    transactionController.update.bind(transactionController),
  )

  // DELETE /transactions/:id - Excluir transação específica
  app.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
        response: {
          204: z.null(),
          401: z.object({ error: z.string() }),
          404: z.object({ error: z.string() }),
        },
      },
    },
    transactionController.destroy.bind(transactionController),
  )
}
