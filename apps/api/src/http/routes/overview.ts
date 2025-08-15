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
        tags: ['📊 Visão Geral'],
        summary: 'Resumo Geral',
        description: `
Retorna um resumo completo da situação financeira do usuário.

**Informações incluídas:**
- Saldo total (contas + cartões)
- Receitas e despesas do período
- Resumo por conta bancária
- Resumo por cartão de crédito
- Indicadores de performance
- Gráficos e métricas principais

**Período:** Últimos 30 dias (padrão)
        `,
        response: {
          200: generalOverviewSchema,
          401: z.object({ message: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
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
        tags: ['📊 Visão Geral'],
        summary: 'Maiores Gastos por Categoria',
        description: `
Retorna os maiores gastos agrupados por categoria.

**Filtros disponíveis:**
- **limit**: número de categorias a retornar (padrão: 5)
- **period**: período de análise (7d, 30d, 90d, 1y)

**Informações retornadas:**
- Top categorias com maiores gastos
- Valor total por categoria
- Percentual do total de despesas
- Comparação com período anterior
        `,
        querystring: topExpensesQuerySchema,
        response: {
          200: topExpensesByCategorySchema,
          401: z.object({ message: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
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
        tags: ['📊 Visão Geral'],
        summary: 'Estatísticas Rápidas',
        description: `
Retorna estatísticas financeiras resumidas para dashboard.

**Métricas incluídas:**
- Saldo atual total
- Receitas do mês atual
- Despesas do mês atual
- Saldo do mês (receitas - despesas)
- Comparação com mês anterior
- Indicadores de tendência
- Alertas e notificações importantes
        `,
        response: {
          200: quickStatsSchema,
          401: z.object({ message: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
    },
    overviewController.getQuickStats.bind(overviewController),
  )
}
