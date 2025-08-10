import { Prisma, PrismaClient } from '@prisma/client'

import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { TransactionRepository } from '@/repositories/transaction.repository'
import {
  TransactionCreateSchema,
  TransactionUpdateSchema,
} from '@/utils/schemas'

export class TransactionService {
  constructor(
    private transactionRepository: TransactionRepository,
    private prisma: PrismaClient,
  ) {}

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
    } = filters
    const skip = (page - 1) * limit

    try {
      // Build where clause
      const where: Prisma.TransactionWhereInput = { userId }

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

      const transactions = await this.transactionRepository.findMany({
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
              color: true,
              icon: true,
              type: true,
            },
          },
          creditCard: {
            select: {
              id: true,
              name: true,
              color: true,
              icon: true,
              limit: true,
            },
          },
        },
      })

      // Get total count for pagination
      const total = await this.transactionRepository.count({ where })
      const totalPages = Math.ceil(total / limit)

      return {
        transactions,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      throw error
    }
  }

  async findById(id: string, userId: string) {
    const transaction = await this.transactionRepository.findUnique({
      where: { id, userId },
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
            color: true,
            icon: true,
            type: true,
          },
        },
        creditCard: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
            limit: true,
          },
        },
      },
    })

    if (!transaction) {
      throw new BadRequestError('Transação não encontrada')
    }

    return transaction
  }

  async create(data: TransactionCreateSchema, userId: string) {
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

    return this.transactionRepository.create({
      data: {
        ...data,
        user: { connect: { id: userId } },
        category: { connect: { id: data.categoryId } },
        ...(data.accountId && {
          account: { connect: { id: data.accountId } },
        }),
        ...(data.creditCardId && {
          creditCard: { connect: { id: data.creditCardId } },
        }),
      },
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
            color: true,
            icon: true,
            type: true,
          },
        },
        creditCard: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
            limit: true,
          },
        },
      },
    })
  }

  async update(
    id: string,
    data: Partial<TransactionUpdateSchema>,
    userId: string,
  ) {
    // Check if transaction exists
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

    return this.transactionRepository.update({
      where: { id, userId },
      data: {
        ...data,
        ...(data.categoryId && {
          category: { connect: { id: data.categoryId } },
        }),
        ...(data.accountId && {
          account: { connect: { id: data.accountId } },
        }),
        ...(data.creditCardId && {
          creditCard: { connect: { id: data.creditCardId } },
        }),
      },
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
            color: true,
            icon: true,
            type: true,
          },
        },
        creditCard: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
            limit: true,
          },
        },
      },
    })
  }

  async delete(id: string, userId: string) {
    // Check if transaction exists
    await this.findById(id, userId)

    return this.transactionRepository.delete({
      where: { id, userId },
    })
  }
}
