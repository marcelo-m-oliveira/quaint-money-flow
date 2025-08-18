/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma, PrismaClient } from '@prisma/client'

import { EntryRepository } from '@/repositories/entry.repository'
import { BadRequestError } from '@/routes/_errors/bad-request-error'
import { BaseService } from '@/services/base.service'
import { EntryCreateSchema, EntryUpdateSchema } from '@/utils/schemas'

export class EntryService extends BaseService<'entry'> {
  constructor(
    private entryRepository: EntryRepository,
    prisma: PrismaClient,
  ) {
    super(entryRepository, prisma)
  }

  async findMany(
    userId: string,
    filters: {
      page: number
      limit: number
      type?: 'income' | 'expense'
      categoryId?: string
      accountId?: string
      creditCardId?: string
      startDate?: Date
      endDate?: Date
      search?: string
      viewMode?: 'cashflow' | 'all'
    },
  ) {
    const {
      page,
      limit,
      type,
      categoryId,
      accountId,
      creditCardId,
      startDate,
      endDate,
      search,
      viewMode = 'all',
    } = filters
    const skip = (page - 1) * limit

    try {
      // Build where clause
      const where: Prisma.EntryWhereInput = { userId }

      if (type) {
        where.type = type
      }

      if (categoryId) {
        where.categoryId = categoryId
      }

      if (accountId) {
        where.accountId = accountId
      }

      if (creditCardId) {
        where.creditCardId = creditCardId
      }

      if (startDate && endDate) {
        where.date = {
          gte: startDate,
          lte: endDate,
        }
      }

      if (search) {
        where.description = {
          contains: search,
          mode: 'insensitive',
        }
      }

      const entries = await this.entryRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
              icon: true,
              type: true,
            },
          },
          account: {
            select: {
              id: true,
              name: true,
              icon: true,
              iconType: true,
            },
          },
          creditCard: {
            select: {
              id: true,
              name: true,
              icon: true,
              iconType: true,
              limit: true,
            },
          },
        },
      })

      // Calculate previous balance (sum of all paid entries before startDate)
      let previousBalance = 0
      if (startDate) {
        const previousEntries = await this.entryRepository.findMany({
          where: {
            userId,
            paid: true,
            date: {
              lt: startDate,
            },
          },
          select: {
            amount: true,
            type: true,
          },
        })

        previousBalance = previousEntries.reduce(
          (sum: number, entry: { amount: any; type: string }) => {
            const amount = Number(entry.amount)
            return entry.type === 'income' ? sum + amount : sum - amount
          },
          0,
        )
      }

      // Get total count for pagination
      const total = await this.entryRepository.count(where)
      const totalPages = Math.ceil(total / limit)

      // Calculate summary based on viewMode
      let summary

      if (viewMode === 'cashflow') {
        // Define date range for calculations
        const dateFilter =
          startDate && endDate
            ? {
                date: {
                  gte: startDate,
                  lte: endDate,
                },
              }
            : {}

        // Get all entries in the period for cashflow calculations
        const periodEntries = await this.entryRepository.findMany({
          where: {
            userId,
            ...dateFilter,
          },
          select: {
            amount: true,
            type: true,
            paid: true,
          },
        })

        const realizedIncome = periodEntries
          .filter(
            (entry: { type: string; paid: any }) =>
              entry.type === 'income' && entry.paid,
          )
          .reduce(
            (sum: number, entry: { amount: any }) => sum + Number(entry.amount),
            0,
          )

        const expectedIncome = periodEntries
          .filter(
            (entry: { type: string; paid: any }) =>
              entry.type === 'income' && !entry.paid,
          )
          .reduce(
            (sum: number, entry: { amount: any }) => sum + Number(entry.amount),
            0,
          )

        const realizedExpense = periodEntries
          .filter(
            (entry: { type: string; paid: any }) =>
              entry.type === 'expense' && entry.paid,
          )
          .reduce(
            (sum: number, entry: { amount: any }) => sum + Number(entry.amount),
            0,
          )

        const expectedExpense = periodEntries
          .filter(
            (entry: { type: string; paid: any }) =>
              entry.type === 'expense' && !entry.paid,
          )
          .reduce(
            (sum: number, entry: { amount: any }) => sum + Number(entry.amount),
            0,
          )

        const currentBalance =
          previousBalance + realizedIncome - realizedExpense
        const projectedBalance =
          currentBalance + expectedIncome - expectedExpense

        summary = {
          previousBalance,
          realizedIncome,
          expectedIncome,
          realizedExpense,
          expectedExpense,
          currentBalance,
          projectedBalance,
        }
      } else {
        // Get all entries for simple totals (with or without date filter)
        const dateFilter =
          startDate && endDate
            ? {
                date: {
                  gte: startDate,
                  lte: endDate,
                },
              }
            : {}

        const periodEntries = await this.entryRepository.findMany({
          where: {
            userId,
            ...dateFilter,
          },
          select: {
            amount: true,
            type: true,
          },
        })

        const income = periodEntries
          .filter((entry: { type: string }) => entry.type === 'income')
          .reduce(
            (sum: number, entry: { amount: any }) => sum + Number(entry.amount),
            0,
          )

        const expense = periodEntries
          .filter((entry: { type: string }) => entry.type === 'expense')
          .reduce(
            (sum: number, entry: { amount: any }) => sum + Number(entry.amount),
            0,
          )

        const balance = income - expense

        summary = {
          income,
          expense,
          balance,
        }
      }

      // Structure summary according to frontend expectations
      let structuredSummary
      if (viewMode === 'cashflow') {
        structuredSummary = {
          cashflow: summary,
          all: {
            income: summary.realizedIncome + summary.expectedIncome,
            expense: summary.realizedExpense + summary.expectedExpense,
            balance:
              summary.realizedIncome +
              summary.expectedIncome -
              (summary.realizedExpense + summary.expectedExpense),
          },
        }
      } else {
        structuredSummary = {
          all: summary,
        }
      }

      const result = {
        entries,
        summary: structuredSummary,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      }
      return result
    } catch (error) {
      console.error('Error fetching entries:', error)
      throw error
    }
  }

  async findById(id: string, userId: string) {
    const entry = await this.entryRepository.findFirst({ id, userId } as any, {
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
            type: true,
          },
        },
        account: {
          select: {
            id: true,
            name: true,
            icon: true,
            iconType: true,
          },
        },
        creditCard: {
          select: {
            id: true,
            name: true,
            icon: true,
            iconType: true,
            limit: true,
          },
        },
      },
    })

    if (!entry) {
      throw new BadRequestError('Lançamento não encontrado')
    }

    return entry
  }

  async create(
    data: EntryCreateSchema & { date: Date; amount: number },
    userId: string,
  ) {
    // Validate that category exists
    const category = await this.prisma.category.findUnique({
      where: { id: data.categoryId, userId },
    })

    if (!category) {
      throw new BadRequestError('Categoria não encontrada')
    }

    // Validate that account exists (if provided)
    if (data.accountId) {
      const account = await this.prisma.account.findUnique({
        where: { id: data.accountId, userId },
      })

      if (!account) {
        throw new BadRequestError('Conta não encontrada')
      }
    }

    // Validate that credit card exists (if provided)
    if (data.creditCardId) {
      const creditCard = await this.prisma.creditCard.findUnique({
        where: { id: data.creditCardId, userId },
      })

      if (!creditCard) {
        throw new BadRequestError('Cartão de crédito não encontrado')
      }
    }

    // Remove ID fields from data to avoid conflicts with Prisma relations
    const { categoryId, accountId, creditCardId, ...entryData } = data

    return this.entryRepository.create(
      {
        ...entryData,
        user: { connect: { id: userId } },
        category: { connect: { id: categoryId } },
        ...(accountId && {
          account: { connect: { id: accountId } },
        }),
        ...(creditCardId && {
          creditCard: { connect: { id: creditCardId } },
        }),
      },
      {
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
              icon: true,
              type: true,
            },
          },
          account: {
            select: {
              id: true,
              name: true,
              icon: true,
              iconType: true,
            },
          },
          creditCard: {
            select: {
              id: true,
              name: true,
              icon: true,
              iconType: true,
              limit: true,
            },
          },
        },
      },
    )
  }

  async update(
    id: string,
    data: Partial<EntryUpdateSchema> & { date?: Date; amount?: number },
    userId: string,
  ) {
    // Check if entry exists
    await this.findById(id, userId)

    // Validate that category exists (if provided)
    if (data.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: data.categoryId, userId },
      })

      if (!category) {
        throw new BadRequestError('Categoria não encontrada')
      }
    }

    // Validate that account exists (if provided)
    if (data.accountId) {
      const account = await this.prisma.account.findUnique({
        where: { id: data.accountId, userId },
      })

      if (!account) {
        throw new BadRequestError('Conta não encontrada')
      }
    }

    // Validate that credit card exists (if provided)
    if (data.creditCardId) {
      const creditCard = await this.prisma.creditCard.findUnique({
        where: { id: data.creditCardId, userId },
      })

      if (!creditCard) {
        throw new BadRequestError('Cartão de crédito não encontrado')
      }
    }

    // Remove ID fields from data to avoid conflicts with Prisma relations
    const { categoryId, accountId, creditCardId, ...updateData } = data

    // Build update data with proper relations
    const updatePayload: any = { ...updateData }

    if (categoryId) {
      updatePayload.category = { connect: { id: categoryId } }
    }

    // Garantir exclusividade entre account e creditCard
    // Se accountId é fornecido, desconectar creditCard
    if (accountId) {
      updatePayload.account = { connect: { id: accountId } }
      updatePayload.creditCard = { disconnect: true }
    } else if (accountId === null) {
      updatePayload.account = { disconnect: true }
    }

    // Se creditCardId é fornecido, desconectar account
    if (creditCardId) {
      updatePayload.creditCard = { connect: { id: creditCardId } }
      updatePayload.account = { disconnect: true }
    } else if (creditCardId === null) {
      updatePayload.creditCard = { disconnect: true }
    }

    return this.prisma.entry.update({
      where: { id, userId },
      data: updatePayload,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
            type: true,
          },
        },
        account: {
          select: {
            id: true,
            name: true,
            icon: true,
            iconType: true,
          },
        },
        creditCard: {
          select: {
            id: true,
            name: true,
            icon: true,
            iconType: true,
            limit: true,
          },
        },
      },
    })
  }

  async delete(id: string, userId: string) {
    // Check if entry exists
    await this.findById(id, userId)

    return this.prisma.entry.delete({
      where: { id, userId },
    })
  }

  async deleteAllByUserId(userId: string) {
    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new BadRequestError('Usuário não encontrado')
    }

    // Contar quantas entradas o usuário tem antes de deletar
    const entryCount = await this.prisma.entry.count({
      where: { userId },
    })

    if (entryCount === 0) {
      throw new BadRequestError('Nenhuma entrada encontrada para excluir')
    }

    // Deletar todas as entradas do usuário
    const deleteResult = await this.prisma.entry.deleteMany({
      where: { userId },
    })

    return {
      deletedCount: deleteResult.count,
      message: `${deleteResult.count} entrada(s) excluída(s) com sucesso`,
    }
  }
}
