import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { EntryFactory } from '@/factories/entry.factory'
import {
  entryCreateSchema,
  entryFiltersSchema,
  entryPatchSchema,
  entryResponseSchema,
  entryUpdateSchema,
  idParamSchema,
} from '@/utils/schemas'

import { authMiddleware } from '../middlewares/auth'

export async function entryRoutes(app: FastifyInstance) {
  const entryController = EntryFactory.getController()

  // GET /entries - Listar transações do usuário com filtros
  app.get(
    '/entries',
    {
      schema: {
        querystring: entryFiltersSchema,
        // Temporariamente desabilitado até ajustar o schema
        // response: {
        //   200: entryListResponseSchema,
        //   401: z.object({ error: z.string() }),
        // },
      },
      preHandler: [authMiddleware],
    },
    entryController.index.bind(entryController),
  )

  // GET /entries/:id - Buscar transação específica
  app.get(
    '/entries/:id',
    {
      schema: {
        params: idParamSchema,
        response: {
          200: entryResponseSchema,
          401: z.object({ error: z.string() }),
          404: z.object({ error: z.string() }),
        },
      },
      preHandler: [authMiddleware],
    },
    entryController.show.bind(entryController),
  )

  // POST /entries - Criar nova transação
  app.post(
    '/entries',
    {
      schema: {
        body: entryCreateSchema,
        response: {
          201: entryResponseSchema,
          401: z.object({ error: z.string() }),
        },
      },
      preHandler: [authMiddleware],
    },
    entryController.store.bind(entryController),
  )

  // PUT /entries/:id - Atualizar transação
  app.put(
    '/entries/:id',
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
      preHandler: [authMiddleware],
    },
    entryController.update.bind(entryController),
  )

  // PATCH /entries/:id - Atualizar transação parcialmente
  app.patch(
    '/entries/:id',
    {
      schema: {
        params: idParamSchema,
        body: entryPatchSchema,
        response: {
          200: entryResponseSchema,
          401: z.object({ error: z.string() }),
          404: z.object({ error: z.string() }),
        },
      },
      preHandler: [authMiddleware],
    },
    entryController.patch.bind(entryController),
  )

  // DELETE /entries/:id - Excluir transação específica
  app.delete(
    '/entries/:id',
    {
      schema: {
        params: idParamSchema,
        response: {
          204: z.null(),
          401: z.object({ error: z.string() }),
          404: z.object({ error: z.string() }),
        },
      },
      preHandler: [authMiddleware],
    },
    entryController.destroy.bind(entryController),
  )
}
