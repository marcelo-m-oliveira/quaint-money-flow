import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { EntryFactory } from '@/factories/entry.factory'
import {
  entryCreateSchema,
  entryFiltersSchema,
  entryListResponseSchema,
  entryResponseSchema,
  entryUpdateSchema,
  idParamSchema,
} from '@/utils/schemas'

import { authMiddleware } from '../middlewares/auth'

export async function entryRoutes(app: FastifyInstance) {
  const entryController = EntryFactory.getController()

  // Aplicar middleware de autenticação em todas as rotas
  app.addHook('onRequest', authMiddleware)

  // GET /entries - Listar transações do usuário com filtros
  app.get(
    '/',
    {
      schema: {
        querystring: entryFiltersSchema,
        response: {
          200: entryListResponseSchema,
          401: z.object({ error: z.string() }),
        },
      },
    },
    entryController.index.bind(entryController),
  )

  // GET /entries/:id - Buscar transação específica
  app.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
        response: {
          200: entryResponseSchema,
          401: z.object({ error: z.string() }),
          404: z.object({ error: z.string() }),
        },
      },
    },
    entryController.show.bind(entryController),
  )

  // POST /entries - Criar nova transação
  app.post(
    '/',
    {
      schema: {
        body: entryCreateSchema,
        response: {
          201: entryResponseSchema,
          401: z.object({ error: z.string() }),
        },
      },
    },
    entryController.store.bind(entryController),
  )

  // PUT /entries/:id - Atualizar transação
  app.put(
    '/:id',
    {
      schema: {
        params: idParamSchema,
        body: entryUpdateSchema,
        response: {
          200: entryResponseSchema,
          401: z.object({ error: z.string() }),
          404: z.object({ error: z.string() }),
        },
      },
    },
    entryController.update.bind(entryController),
  )

  // DELETE /entries/:id - Excluir transação específica
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
    entryController.destroy.bind(entryController),
  )
}
