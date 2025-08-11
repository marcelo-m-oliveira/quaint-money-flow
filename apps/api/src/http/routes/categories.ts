/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { CategoryFactory } from '@/factories/category.factory'
import {
  categoryCreateSchema,
  categoryFiltersSchema,
  categoryResponseSchema,
  categoryUpdateSchema,
  categoryUsageSchema,
  idParamSchema,
  selectOptionSchema,
} from '@/utils/schemas'

import { authMiddleware } from '../middlewares/auth'

export async function categoryRoutes(app: FastifyInstance) {
  const categoryController = CategoryFactory.getController()

  // GET /categories - Listar categorias
  app.get(
    '/categories',
    {
      schema: {
        querystring: categoryFiltersSchema,
        response: {
          200: z.object({
            categories: z.array(categoryResponseSchema),
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
    categoryController.index.bind(categoryController),
  )

  // GET /categories/select - Opções para selects
  app.get(
    '/categories/select-options',
    {
      schema: {
        querystring: z.object({
          type: z.enum(['income', 'expense']).optional(),
        }),
        response: {
          200: z.array(selectOptionSchema),
          401: z.object({ error: z.string() }),
        },
      },
      preHandler: [authMiddleware],
    },
    categoryController.select.bind(categoryController),
  )

  // GET /categories/usage - Indicadores de uso
  app.get(
    '/categories/usage',
    {
      schema: {
        response: {
          200: z.array(categoryUsageSchema),
          401: z.object({ error: z.string() }),
        },
      },
      preHandler: [authMiddleware],
    },
    categoryController.usage.bind(categoryController),
  )

  // GET /categories/:id - Buscar por ID
  app.get(
    '/categories/:id',
    {
      schema: {
        params: idParamSchema,
        response: {
          200: categoryResponseSchema,
          401: z.object({ error: z.string() }),
        },
      },
      preHandler: [authMiddleware],
    },
    categoryController.show.bind(categoryController),
  )

  // POST /categories - Criar
  app.post(
    '/categories',
    {
      schema: {
        body: categoryCreateSchema,
        response: {
          201: categoryResponseSchema,
          401: z.object({ error: z.string() }),
        },
      },
      preHandler: [authMiddleware],
    },
    categoryController.store.bind(categoryController),
  )

  // PUT /categories/:id - Atualizar
  app.put(
    '/categories/:id',
    {
      schema: {
        params: idParamSchema,
        body: categoryUpdateSchema,
        response: {
          200: categoryResponseSchema,
          401: z.object({ error: z.string() }),
        },
      },
      preHandler: [authMiddleware],
    },
    categoryController.update.bind(categoryController),
  )

  // DELETE /categories/:id - Excluir
  app.delete(
    '/categories/:id',
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
    categoryController.destroy.bind(categoryController),
  )
}
