import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { UserPreferencesFactory } from '@/factories/user-preferences.factory'
import { authMiddleware } from '@/http/middlewares/auth'
import {
  preferencesCreateSchema,
  preferencesResponseSchema,
  preferencesUpdateSchema,
} from '@/utils/schemas'

export async function userPreferencesRoutes(app: FastifyInstance) {
  const userPreferencesController = UserPreferencesFactory.getController()

  // GET /user-preferences - Buscar preferências do usuário
  app.get(
    '/user-preferences',
    {
      schema: {
        response: {
          200: preferencesResponseSchema,
          401: z.object({ error: z.string() }),
        },
      },
      preHandler: [authMiddleware],
    },
    userPreferencesController.show.bind(userPreferencesController),
  )

  // PATCH /user-preferences - Atualizar preferências do usuário (parcial)
  app.patch(
    '/user-preferences',
    {
      schema: {
        body: preferencesUpdateSchema,
        response: {
          200: preferencesResponseSchema,
          401: z.object({ error: z.string() }),
        },
      },
      preHandler: [authMiddleware],
    },
    userPreferencesController.update.bind(userPreferencesController),
  )

  // POST /user-preferences - Criar/atualizar preferências do usuário (upsert)
  app.post(
    '/user-preferences',
    {
      schema: {
        body: preferencesCreateSchema,
        response: {
          200: preferencesResponseSchema,
          401: z.object({ error: z.string() }),
        },
      },
      preHandler: [authMiddleware],
    },
    userPreferencesController.upsert.bind(userPreferencesController),
  )

  // POST /user-preferences/reset - Resetar preferências para valores padrão
  app.post(
    '/user-preferences/reset',
    {
      schema: {
        response: {
          200: preferencesResponseSchema,
          401: z.object({ error: z.string() }),
        },
      },
      preHandler: [authMiddleware],
    },
    userPreferencesController.reset.bind(userPreferencesController),
  )
}
