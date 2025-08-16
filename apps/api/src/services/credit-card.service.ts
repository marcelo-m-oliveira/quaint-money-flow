import { PrismaClient } from '@prisma/client'

import { CreditCardRepository } from '@/repositories/credit-card.repository'
import { BadRequestError } from '@/routes/_errors/bad-request-error'
import { BaseService } from '@/services/base.service'
import {
  type CreditCardCreateSchema,
  type CreditCardUpdateSchema,
} from '@/utils/schemas'

export class CreditCardService extends BaseService<'creditCard'> {
  constructor(
    private creditCardRepository: CreditCardRepository,
    prisma: PrismaClient,
  ) {
    super(creditCardRepository, prisma)
  }

  async findMany(
    userId: string,
    filters: {
      search?: string
      page: number
      limit: number
    },
  ) {
    const { page, limit, search } = filters
    const skip = (page - 1) * limit

    // Buscar cartões com transações para calcular o uso
    const creditCardsWithUsage =
      await this.creditCardRepository.getCreditCardsWithUsage(userId)

    // Filtrar por busca se fornecida
    const filteredCreditCards = creditCardsWithUsage.filter((creditCard) => {
      return !(
        search && !creditCard.name.toLowerCase().includes(search.toLowerCase())
      )
    })

    // Ordenar por data de criação (mais recentes primeiro)
    filteredCreditCards.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

    const total = filteredCreditCards.length
    const pagination = this.calculatePagination(total, page, limit)

    // Aplicar paginação
    const paginatedCreditCards = filteredCreditCards.slice(skip, skip + limit)

    // Calcular o uso para cada cartão
    const creditCardsWithUsageCalculated = paginatedCreditCards.map(
      (creditCard) => {
        const usage = creditCard.entries.reduce((acc, entry) => {
          const amount = Number(entry.amount)
          return entry.type === 'expense' ? acc + amount : acc
        }, 0)

        // Remover as transações do retorno e adicionar o uso
        const { entries, ...creditCardData } = creditCard
        return {
          ...creditCardData,
          usage,
          availableLimit: Number(creditCard.limit) - usage,
        }
      },
    )

    return {
      creditCards: creditCardsWithUsageCalculated,
      pagination,
    }
  }

  async findById(id: string, userId: string) {
    const creditCard = await this.creditCardRepository.findById(id)

    if (!creditCard) {
      throw new BadRequestError('Cartao de credito nao encontrado')
    }

    // Verificar se o cartão pertence ao usuário
    if (creditCard.userId !== userId) {
      throw new BadRequestError('Cartao de credito nao pertence ao usuario')
    }

    return creditCard
  }

  async create(data: CreditCardCreateSchema, userId: string) {
    // Verificar se já existe um cartão com o mesmo nome
    const existingCreditCard = await this.creditCardRepository.findFirst({
      name: data.name,
      userId,
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

    // Converter limit de string para number
    const limitAsNumber = parseFloat(data.limit.replace(',', '.'))

    // Preparar dados para criação, removendo defaultPaymentAccountId do spread
    const { defaultPaymentAccountId, ...restData } = data

    const creditCard = await this.creditCardRepository.create({
      ...restData,
      limit: limitAsNumber,
      user: { connect: { id: userId } },
      ...(defaultPaymentAccountId && {
        defaultPaymentAccount: {
          connect: { id: defaultPaymentAccountId },
        },
      }),
    })

    this.logOperation('CREATE_CREDIT_CARD', userId, {
      creditCardId: creditCard.id,
      creditCardName: creditCard.name,
    })
    return creditCard
  }

  async update(
    id: string,
    data: Partial<CreditCardUpdateSchema>,
    userId: string,
  ) {
    // Verificar se o cartão existe e pertence ao usuário
    await this.findById(id, userId)

    // Verificar se já existe outro cartão com o mesmo nome (apenas se o nome foi fornecido)
    if (data.name) {
      const duplicateCreditCard = await this.creditCardRepository.findFirst({
        name: data.name,
        userId,
        id: { not: id },
      })

      if (duplicateCreditCard) {
        throw new BadRequestError('Já existe um cartão de crédito com este nome')
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
    const updateData: any = { ...restData }

    // Converter limit de string para number se fornecido
    if (data.limit) {
      updateData.limit = parseFloat(data.limit.replace(',', '.'))
    }

    // Conectar conta de pagamento padrão se fornecida
    if (defaultPaymentAccountId) {
      updateData.defaultPaymentAccount = {
        connect: { id: defaultPaymentAccountId },
      }
    }

    const creditCard = await this.creditCardRepository.update(id, updateData)

    this.logOperation('UPDATE_CREDIT_CARD', userId, {
      creditCardId: creditCard.id,
      creditCardName: creditCard.name,
    })
    return creditCard
  }

  async delete(id: string, userId: string) {
    // Verificar se o cartão existe e pertence ao usuário
    await this.findById(id, userId)

    // Verificar se há transações associadas
    const entryCount = await this.prisma.entry.count({
      where: { creditCardId: id, userId },
    })

    if (entryCount > 0) {
      throw new BadRequestError(
        'Não é possível excluir um cartão de crédito que possui transações',
      )
    }

    await this.creditCardRepository.delete(id)

    this.logOperation('DELETE_CREDIT_CARD', userId, { creditCardId: id })
  }

  async getUsage(id: string, userId: string) {
    // Verificar se o cartão existe e pertence ao usuário
    const creditCard = await this.findById(id, userId)

    // Usar o método do repository para calcular o uso
    const usage = await this.creditCardRepository.getCreditCardUsage(id, userId)

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
