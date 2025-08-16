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

import { authMiddleware } from '../middleware/auth'

export async function reportRoutes(app: FastifyInstance) {
  const reportsController = ReportsFactory.getController()

  // GET /reports/categories - Relatório de categorias
  app.get(
    '/reports/categories',
    {
      schema: {
        tags: ['📈 Relatórios'],
        summary: 'Relatório de Categorias',
        description: `
Gera relatório detalhado de transações agrupadas por categoria.

**Funcionalidades:**
- Agrupamento por categoria pai e subcategorias
- Filtros por período, tipo (receita/despesa) e categoria específica
- Cálculo de percentuais e totais
- Hierarquia de categorias com subcategorias

**Exemplo de uso:**
- Relatório geral: Sem filtros
- Apenas despesas: \`type=expense\`
- Categoria específica: \`categoryId=123\`
        `,
        querystring: categoriesReportFiltersSchema,
        response: {
          200: categoriesReportResponseSchema,
          401: z.object({ message: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
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
        tags: ['📈 Relatórios'],
        summary: 'Relatório de Fluxo de Caixa',
        description: `
Gera relatório de fluxo de caixa com agrupamento temporal.

**Agrupamentos disponíveis:**
- **Diário**: Dados agrupados por dia (DD/MM/AAAA)
- **Semanal**: Dados agrupados por semana (formato "28 Jun à 14 Ago")
- **Mensal**: Dados agrupados por mês

**Filtros:**
- Período de data (startDate/endDate em timestamp)
- Modo de visualização (viewMode: daily/weekly/monthly)

**Exemplo de uso:**
- Últimos 30 dias: \`startDate=1640995200&endDate=1643587200\`
- Agrupamento semanal: \`viewMode=weekly\`
        `,
        querystring: cashflowReportFiltersSchema,
        response: {
          200: cashflowReportResponseSchema,
          401: z.object({ message: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
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
        tags: ['📈 Relatórios'],
        summary: 'Relatório de Contas e Cartões',
        description: `
Gera relatório detalhado de transações por conta bancária e cartão de crédito.

**Filtros disponíveis:**
- **all**: Todas as contas e cartões (padrão)
- **bank_accounts**: Apenas contas bancárias
- **credit_cards**: Apenas cartões de crédito

**Informações retornadas:**
- Saldo, receitas e despesas por conta
- Número de transações
- Percentuais de participação
- Resumo consolidado

**Exemplo de uso:**
- Todas as contas: Sem filtro ou \`accountFilter=all\`
- Apenas contas bancárias: \`accountFilter=bank_accounts\`
- Apenas cartões: \`accountFilter=credit_cards\`
        `,
        querystring: accountsReportFiltersSchema,
        response: {
          200: accountsReportResponseSchema,
          401: z.object({ message: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
    },
    reportsController.accounts.bind(reportsController),
  )
}
