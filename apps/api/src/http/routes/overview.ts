/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { OverviewFactory } from '@/factories/overview.factory'
import {
  generalOverviewSchema,
  quickStatsSchema,
  topExpensesByCategorySchema,
  topExpensesQuerySchema,
} from '@/utils/schemas'

import { authMiddleware } from '../middlewares/auth'

export async function overviewRoutes(app: FastifyInstance) {
  const overviewController = OverviewFactory.getController()

  // GET /overview - Buscar resumo geral
  app.get(
    '/overview',
    {
      schema: {
        response: {
          200: generalOverviewSchema,
          401: z.object({ error: z.string() }),
        },
      },
      preHandler: [authMiddleware],
    },
    overviewController.getGeneralOverview.bind(overviewController),
  )

  // GET /overview/top-expenses - Buscar maiores gastos por categoria
  app.get(
    '/overview/top-expenses',
    {
      schema: {
        querystring: topExpensesQuerySchema,
        response: {
          200: topExpensesByCategorySchema,
          401: z.object({ error: z.string() }),
        },
      },
      preHandler: [authMiddleware],
    },
    overviewController.getTopExpensesByCategory.bind(overviewController),
  )

  // GET /overview/stats - Buscar estatísticas rápidas
  app.get(
    '/overview/stats',
    {
      schema: {
        response: {
          200: quickStatsSchema,
          401: z.object({ error: z.string() }),
        },
      },
      preHandler: [authMiddleware],
    },
    overviewController.getQuickStats.bind(overviewController),
  )
}
