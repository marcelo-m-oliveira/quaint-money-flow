import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { ReportsFactory } from '@/factories/reports.factory'
import {
  accountsReportFiltersSchema,
  accountsReportResponseSchema,
  cashflowReportFiltersSchema,
  cashflowReportResponseSchema,
  categoriesReportFiltersSchema,
  categoriesReportResponseSchema,
} from '@/utils/schemas'

import { authMiddleware } from '../middlewares/auth'

export async function reportRoutes(app: FastifyInstance) {
  const reportsController = ReportsFactory.getController()

  // GET /reports/categories - Relatório de categorias
  app.get(
    '/reports/categories',
    {
      schema: {
        querystring: categoriesReportFiltersSchema,
        response: {
          200: categoriesReportResponseSchema,
          401: z.object({ error: z.string() }),
        },
      },
      preHandler: [authMiddleware],
    },
    reportsController.categories.bind(reportsController),
  )

  // GET /reports/cashflow - Relatório de fluxo de caixa
  app.get(
    '/reports/cashflow',
    {
      schema: {
        querystring: cashflowReportFiltersSchema,
        response: {
          200: cashflowReportResponseSchema,
          401: z.object({ error: z.string() }),
        },
      },
      preHandler: [authMiddleware],
    },
    reportsController.cashflow.bind(reportsController),
  )

  // GET /reports/accounts - Relatório de contas e cartões
  app.get(
    '/reports/accounts',
    {
      schema: {
        querystring: accountsReportFiltersSchema,
        response: {
          200: accountsReportResponseSchema,
          401: z.object({ error: z.string() }),
        },
      },
      preHandler: [authMiddleware],
    },
    reportsController.accounts.bind(reportsController),
  )
}
