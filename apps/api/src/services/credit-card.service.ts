import { Prisma, PrismaClient } from '@prisma/client'

import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { CreditCardRepository } from '@/repositories/credit-card.repository'
import { type CreditCardCreateSchema } from '@/utils/schemas'

export class CreditCardService {
  constructor(
    private creditCardRepository: CreditCardRepository,
    private prisma: PrismaClient,
  ) {}

  async findMany(
    userId: string,
    filters: {
      page: number
      limit: number
    },
  ) {
    const { page, limit } = filters
    const skip = (page - 1) * limit

    // Buscar cartões com transações para calcular o uso
    const creditCardsWithUsage =
      await this.creditCardRepository.getCreditCardsWithUsage(userId)

    // Ordenar por data de criação (mais recentes primeiro)
    creditCardsWithUsage.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

    const total = creditCardsWithUsage.length
    const totalPages = Math.ceil(total / limit)

    // Aplicar paginação
    const paginatedCreditCards = creditCardsWithUsage.slice(skip, skip + limit)

    // Calcular o uso para cada cartão
    const creditCardsWithUsageCalculated = paginatedCreditCards.map(
      (creditCard) => {
        const usage = creditCard.transactions.reduce((acc, transaction) => {
          const amount = Number(transaction.amount)
          return transaction.type === 'expense' ? acc + amount : acc
        }, 0)

        // Remover as transações do retorno e adicionar o uso
        const { ...creditCardData } = creditCard
        return {
          ...creditCardData,
          usage,
          availableLimit: Number(creditCard.limit) - usage,
        }
      },
    )

    return {
      creditCards: creditCardsWithUsageCalculated,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
  }

  async findById(id: string, userId: string) {
    const creditCard = await this.creditCardRepository.findUnique({
      where: { id, userId },
      include: {
        defaultPaymentAccount: true,
      },
    })

    if (!creditCard) {
      throw new BadRequestError('Cartão de crédito não encontrado')
    }

    return creditCard
  }

  async create(data: CreditCardCreateSchema, userId: string) {
    // Verificar se já existe um cartão com o mesmo nome
    const existingCreditCard = await this.creditCardRepository.findFirst({
      where: {
        name: data.name,
        userId,
      },
    })

    if (existingCreditCard) {
      throw new BadRequestError('Já existe um cartão de crédito com este nome')
    }

    // Verificar se a conta de pagamento padrão existe (se fornecida)
    if (data.defaultPaymentAccountId) {
      const account = await this.prisma.account.findUnique({
        where: {
          id: data.defaultPaymentAccountId,
          userId,
        },
      })

      if (!account) {
        throw new BadRequestError('Conta de pagamento padrão não encontrada')
      }
    }

    return this.creditCardRepository.create({
      data: {
        ...data,
        user: { connect: { id: userId } },
        ...(data.defaultPaymentAccountId && {
          defaultPaymentAccount: {
            connect: { id: data.defaultPaymentAccountId },
          },
        }),
      },
      include: {
        defaultPaymentAccount: true,
      },
    })
  }

  async update(
    id: string,
    data: Partial<CreditCardCreateSchema>,
    userId: string,
  ) {
    // Verificar se o cartão existe
    await this.findById(id, userId)

    // Verificar se já existe outro cartão com o mesmo nome
    if (data.name) {
      const existingCreditCard = await this.creditCardRepository.findFirst({
        where: {
          name: data.name,
          userId,
          NOT: { id },
        },
      })

      if (existingCreditCard) {
        throw new BadRequestError(
          'Já existe um cartão de crédito com este nome',
        )
      }
    }

    // Verificar se a conta de pagamento padrão existe (se fornecida)
    if (data.defaultPaymentAccountId) {
      const account = await this.prisma.account.findUnique({
        where: {
          id: data.defaultPaymentAccountId,
          userId,
        },
      })

      if (!account) {
        throw new BadRequestError('Conta de pagamento padrão não encontrada')
      }
    }

    // Preparar dados para atualização
    const { defaultPaymentAccountId, ...restData } = data
    const updateData: Prisma.CreditCardUpdateInput = { ...restData }

    // Conectar conta de pagamento padrão se fornecida
    if (defaultPaymentAccountId) {
      updateData.defaultPaymentAccount = {
        connect: { id: defaultPaymentAccountId },
      }
    }

    return this.creditCardRepository.update({
      where: { id, userId },
      data: updateData,
      include: {
        defaultPaymentAccount: true,
      },
    })
  }

  async delete(id: string, userId: string) {
    // Verificar se o cartão existe
    await this.findById(id, userId)

    // Verificar se há transações associadas
    const transactionCount = await this.prisma.transaction.count({
      where: { creditCardId: id, userId },
    })

    if (transactionCount > 0) {
      throw new BadRequestError(
        'Não é possível excluir um cartão de crédito que possui transações',
      )
    }

    return this.creditCardRepository.delete({
      where: { id, userId },
    })
  }

  async getUsage(id: string, userId: string) {
    // Verificar se o cartão existe
    const creditCard = await this.findById(id, userId)

    // Calcular uso baseado nas transações de despesa
    const transactions = await this.prisma.transaction.findMany({
      where: {
        creditCardId: id,
        userId,
        type: 'expense',
      },
      select: {
        amount: true,
      },
    })

    const usage = transactions.reduce((acc, transaction) => {
      const amount = Number(transaction.amount)
      return acc + amount
    }, 0)

    const availableLimit = Number(creditCard.limit) - usage

    return {
      usage,
      limit: Number(creditCard.limit),
      availableLimit,
      creditCardId: id,
      lastUpdated: new Date().toISOString(),
    }
  }
}
