import { dateToSeconds } from '@saas/utils'
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'

import { BaseController } from '@/controllers/base.controller'
import { OverviewService } from '@/services/overview.service'
import { handleError } from '@/utils/errors'

interface TopExpensesQuery {
  period?: string
}

export class OverviewController extends BaseController {
  constructor(private overviewService: OverviewService) {
    super({ entityName: 'visão geral', entityNamePlural: 'visões gerais' })
  }

  async getGeneralOverview(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = this.getUserId(request)

      request.log.info({ userId }, `Buscando ${this.entityName} do usuário`)
      const overview = await this.overviewService.getGeneralOverview(userId)

      request.log.info(
        {
          userId,
          monthlyIncome: overview.monthlyIncome,
          monthlyExpenses: overview.monthlyExpenses,
          accountsPayableCount: overview.accountsPayable.length,
          accountsReceivableCount: overview.accountsReceivable.length,
        },
        `${this.entityName}l obtida com sucesso`,
      )

      // Convert dates to seconds for frontend
      const convertedOverview = {
        ...overview,
        accountsPayable: overview.accountsPayable.map((account) => ({
          ...account,
          date: account.date ? dateToSeconds(account.date) : undefined,
        })),
        accountsReceivable: overview.accountsReceivable.map((account) => ({
          ...account,
          date: account.date ? dateToSeconds(account.date) : undefined,
        })),
      }

      return reply.status(200).send(convertedOverview)
    } catch (error: any) {
      request.log.error(
        { error: error.message },
        `Erro ao buscar ${this.entityName}`,
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async getTopExpensesByCategory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = this.getUserId(request)
      const { period = `current-month` } = request.query as TopExpensesQuery

      request.log.info(
        { userId, period },
        `Buscando maiores gastos por categoria`,
      )
      const topExpenses = await this.overviewService.getTopExpensesByCategory(
        userId,
        period,
      )

      request.log.info(
        {
          userId,
          period,
          expensesCount: topExpenses.expenses.length,
          totalExpenses: topExpenses.totalExpenses,
        },
        `Maiores gastos obtidos com sucesso`,
      )

      // Convert dates to seconds for frontend
      const convertedTopExpenses = {
        ...topExpenses,
        dateRange: {
          startDate: topExpenses.dateRange.startDate
            ? dateToSeconds(topExpenses.dateRange.startDate)
            : undefined,
          endDate: topExpenses.dateRange.endDate
            ? dateToSeconds(topExpenses.dateRange.endDate)
            : undefined,
        },
      }

      return reply.status(200).send(convertedTopExpenses)
    } catch (error: any) {
      request.log.error(
        { error: error.message },
        `Erro ao buscar maiores gastos por categoria`,
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async getQuickStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = this.getUserId(request)

      request.log.info({ userId }, `Buscando estatísticas rápidas do usuário`)
      const stats = await this.overviewService.getQuickStats(userId)

      request.log.info(
        {
          userId,
          monthlyBalance: stats.monthlyBalance,
          overduePayable: stats.overduePayable,
          overdueReceivable: stats.overdueReceivable,
        },
        `Estatísticas rápidas obtidas com sucesso`,
      )

      return reply.status(200).send(stats)
    } catch (error: any) {
      request.log.error(
        { error: error.message },
        `Erro ao buscar estatísticas rápidas`,
      )
      return handleError(error as FastifyError, reply)
    }
  }
}
