import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'

import { BaseController } from '@/controllers/base.controller'
import { ReportsService } from '@/services/reports.service'
import { handleError } from '@/utils/errors'

// Interfaces para query parameters (recebidos como números/strings)
interface CategoriesReportQueryFilters {
  startDate?: number
  endDate?: number
  type?: 'income' | 'expense'
  categoryId?: string
  advanced?: boolean
}

interface CashflowReportQueryFilters {
  startDate?: number
  endDate?: number
  viewMode?: 'daily' | 'weekly' | 'monthly'
  advanced?: boolean
}

interface AccountsReportQueryFilters {
  startDate?: number
  endDate?: number
  accountFilter?: 'all' | 'bank_accounts' | 'credit_cards'
  advanced?: boolean
}

// Extend FastifyRequest to include user property
// Tipagem do user já provida pelo projeto através de declarações globais.

export class ReportsController extends BaseController {
  constructor(private reportsService: ReportsService) {
    super({ entityName: 'relatório', entityNamePlural: 'relatórios' })
  }

  async categories(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = this.getUserId(request)
      const filters = request.query as CategoriesReportQueryFilters

      request.log.info(
        { userId, filters },
        `Gerando ${this.entityName} de categorias`,
      )

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
        filters.advanced || false,
      )

      request.log.info(
        {
          userId,
          categoriesCount: result.categories.length,
          totalIncome: result.summary.totalIncome,
          totalExpense: result.summary.totalExpense,
        },
        `${this.entityName} de categorias gerado com sucesso`,
      )

      reply.type('application/json')
      return reply.send(JSON.stringify(result))
    } catch (error: any) {
      request.log.error(
        { error: error.message },
        `Erro ao gerar ${this.entityName} de categorias`,
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async cashflow(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = this.getUserId(request)
      const filters = request.query as CashflowReportQueryFilters

      request.log.info(
        { userId, filters },
        `Gerando ${this.entityName} de fluxo de caixa`,
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
        filters.advanced || false,
      )

      request.log.info(
        {
          userId,
          dataPoints: result.data.length,
          totalIncome: result.summary.totalIncome,
          totalExpense: result.summary.totalExpense,
          viewMode: filters.viewMode,
        },
        `${this.entityName} de fluxo de caixa gerado com sucesso`,
      )

      reply.type('application/json')
      return reply.send(JSON.stringify(result))
    } catch (error: any) {
      request.log.error(
        { error: error.message },
        `Erro ao gerar ${this.entityName} de fluxo de caixa`,
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async accounts(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = this.getUserId(request)
      const filters = request.query as AccountsReportQueryFilters

      request.log.info(
        { userId, filters },
        `Gerando ${this.entityName} de contas`,
      )

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
        filters.advanced || false,
      )

      request.log.info(
        {
          userId,
          accountsCount: result.accounts.length,
          totalIncome: result.summary.totalIncome,
          totalExpense: result.summary.totalExpense,
          accountFilter: filters.accountFilter,
        },
        `${this.entityName} de contas gerado com sucesso`,
      )

      reply.type('application/json')
      return reply.send(JSON.stringify(result))
    } catch (error: any) {
      request.log.error(
        { error: error.message },
        `Erro ao gerar ${this.entityName} de contas`,
      )
      return handleError(error as FastifyError, reply)
    }
  }
}
