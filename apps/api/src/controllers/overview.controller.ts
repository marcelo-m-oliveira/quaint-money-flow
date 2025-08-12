/* eslint-disable @typescript-eslint/no-explicit-any */
import { dateToSeconds } from '@saas/utils'
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'

import { OverviewService } from '@/services/overview.service'
import { handleError } from '@/utils/errors'

interface TopExpensesQuery {
  periodo?: string
}

export class OverviewController {
  constructor(private overviewService: OverviewService) {}

  async getGeneralOverview(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub

      request.log.info({ userId }, 'Buscando visão geral do usuário')
      const overview = await this.overviewService.getGeneralOverview(userId)

      request.log.info(
        {
          userId,
          monthlyIncome: overview.monthlyIncome,
          monthlyExpenses: overview.monthlyExpenses,
          accountsPayableCount: overview.accountsPayable.length,
          accountsReceivableCount: overview.accountsReceivable.length,
        },
        'Visão geral obtida com sucesso',
      )

      // Convert dates to seconds for frontend
      const convertedOverview = {
        ...overview,
        accountsPayable: overview.accountsPayable.map((account) => ({
          ...account,
          dueDate: account.dueDate ? dateToSeconds(account.dueDate) : undefined,
        })),
        accountsReceivable: overview.accountsReceivable.map((account) => ({
          ...account,
          dueDate: account.dueDate ? dateToSeconds(account.dueDate) : undefined,
        })),
      }

      return reply.status(200).send(convertedOverview)
    } catch (error: any) {
      request.log.error({ error: error.message }, 'Erro ao buscar visão geral')
      return handleError(error as FastifyError, reply)
    }
  }

  async getTopExpensesByCategory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const { periodo = 'mes-atual' } = request.query as TopExpensesQuery

      request.log.info(
        { userId, periodo },
        'Buscando maiores gastos por categoria',
      )
      const topExpenses = await this.overviewService.getTopExpensesByCategory(
        userId,
        periodo,
      )

      request.log.info(
        {
          userId,
          periodo,
          expensesCount: topExpenses.expenses.length,
          totalExpenses: topExpenses.totalExpenses,
        },
        'Maiores gastos obtidos com sucesso',
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
        'Erro ao buscar maiores gastos por categoria',
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async getQuickStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub

      request.log.info({ userId }, 'Buscando estatísticas rápidas do usuário')
      const stats = await this.overviewService.getQuickStats(userId)

      request.log.info(
        {
          userId,
          monthlyBalance: stats.monthlyBalance,
          overduePayable: stats.overduePayable,
          overdueReceivable: stats.overdueReceivable,
        },
        'Estatísticas rápidas obtidas com sucesso',
      )

      return reply.status(200).send(stats)
    } catch (error: any) {
      request.log.error(
        { error: error.message },
        'Erro ao buscar estatísticas rápidas',
      )
      return handleError(error as FastifyError, reply)
    }
  }
}
