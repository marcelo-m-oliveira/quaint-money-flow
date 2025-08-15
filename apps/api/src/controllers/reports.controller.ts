/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'

import { ReportsService } from '@/services/reports.service'
import { handleError } from '@/utils/errors'

// Interfaces para query parameters (recebidos como números/strings)
interface CategoriesReportQueryFilters {
  startDate?: number
  endDate?: number
  type?: 'income' | 'expense'
  categoryId?: string
}

interface CashflowReportQueryFilters {
  startDate?: number
  endDate?: number
  viewMode?: 'daily' | 'weekly' | 'monthly'
}

interface AccountsReportQueryFilters {
  startDate?: number
  endDate?: number
  accountFilter?: 'all' | 'bank_accounts' | 'credit_cards'
}

// Extend FastifyRequest to include user property
declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: string
      email: string
      name: string
      sub: string
    }
  }
}

export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  async categories(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const filters = request.query as CategoriesReportQueryFilters

      request.log.info({ userId, filters }, 'Gerando relatório de categorias')

      // Convert timestamp filters to Date objects
      const processedFilters = {
        ...filters,
        startDate: filters.startDate
          ? new Date(filters.startDate * 1000)
          : undefined,
        endDate: filters.endDate ? new Date(filters.endDate * 1000) : undefined,
      }

      const result = await this.reportsService.getCategoriesReport(
        userId,
        processedFilters,
      )

      request.log.info(
        {
          userId,
          categoriesCount: result.categories.length,
          totalIncome: result.summary.totalIncome,
          totalExpense: result.summary.totalExpense,
        },
        'Relatório de categorias gerado com sucesso',
      )

      reply.type('application/json')
      return reply.send(JSON.stringify(result))
    } catch (error: any) {
      request.log.error(
        { error: error.message },
        'Erro ao gerar relatório de categorias',
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async cashflow(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const filters = request.query as CashflowReportQueryFilters

      request.log.info(
        { userId, filters },
        'Gerando relatório de fluxo de caixa',
      )

      // Convert timestamp filters to Date objects
      const processedFilters = {
        ...filters,
        startDate: filters.startDate
          ? new Date(filters.startDate * 1000)
          : undefined,
        endDate: filters.endDate ? new Date(filters.endDate * 1000) : undefined,
        viewMode: filters.viewMode || 'daily',
      }

      const result = await this.reportsService.getCashflowReport(
        userId,
        processedFilters,
      )

      request.log.info(
        {
          userId,
          dataPoints: result.data.length,
          totalIncome: result.summary.totalIncome,
          totalExpense: result.summary.totalExpense,
          viewMode: filters.viewMode,
        },
        'Relatório de fluxo de caixa gerado com sucesso',
      )

      reply.type('application/json')
      return reply.send(JSON.stringify(result))
    } catch (error: any) {
      request.log.error(
        { error: error.message },
        'Erro ao gerar relatório de fluxo de caixa',
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async accounts(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const filters = request.query as AccountsReportQueryFilters

      request.log.info({ userId, filters }, 'Gerando relatório de contas')

      // Convert timestamp filters to Date objects
      const processedFilters = {
        ...filters,
        startDate: filters.startDate
          ? new Date(filters.startDate * 1000)
          : undefined,
        endDate: filters.endDate ? new Date(filters.endDate * 1000) : undefined,
        accountFilter: filters.accountFilter || 'all',
      }

      const result = await this.reportsService.getAccountsReport(
        userId,
        processedFilters,
      )

      request.log.info(
        {
          userId,
          accountsCount: result.accounts.length,
          totalIncome: result.summary.totalIncome,
          totalExpense: result.summary.totalExpense,
          accountFilter: filters.accountFilter,
        },
        'Relatório de contas gerado com sucesso',
      )

      reply.type('application/json')
      return reply.send(JSON.stringify(result))
    } catch (error: any) {
      request.log.error(
        { error: error.message },
        'Erro ao gerar relatório de contas',
      )
      return handleError(error as FastifyError, reply)
    }
  }
}
