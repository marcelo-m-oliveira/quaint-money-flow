import { Prisma, PrismaClient } from '@prisma/client'

import { BaseRepository } from '@/repositories/base.repository'

export class CreditCardRepository extends BaseRepository<'creditCard'> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'creditCard')
  }

  // Métodos específicos de negócio
  async findByUserId(userId: string, includeEntries = false) {
    return this.prisma.creditCard.findMany({
      where: { userId },
      include: {
        entries: includeEntries,
        defaultPaymentAccount: true,
        _count: {
          select: {
            entries: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async existsByNameAndUserId(
    name: string,
    userId: string,
    excludeId?: string,
  ): Promise<boolean> {
    const where: Prisma.CreditCardWhereInput = {
      name,
      userId,
    }

    if (excludeId) {
      where.NOT = { id: excludeId }
    }

    const creditCard = await this.prisma.creditCard.findFirst({ where })
    return !!creditCard
  }

  async getCreditCardsWithUsage(userId: string) {
    return this.prisma.creditCard.findMany({
      where: { userId },
      include: {
        entries: {
          select: {
            amount: true,
            type: true,
          },
        },
        defaultPaymentAccount: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getCreditCardUsage(creditCardId: string, userId: string) {
    const entries = await this.prisma.entry.findMany({
      where: {
        creditCardId,
        userId,
        type: 'expense',
      },
      select: {
        amount: true,
      },
    })

    return entries.reduce((acc, entry) => {
      const amount = Number(entry.amount)
      return acc + amount
    }, 0)
  }

  async getCreditCardsSummary(userId: string) {
    const creditCards = await this.prisma.creditCard.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            entries: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return creditCards.map((creditCard) => ({
      id: creditCard.id,
      name: creditCard.name,
      icon: creditCard.icon,
      iconType: creditCard.iconType,
      limit: creditCard.limit,
      closingDay: creditCard.closingDay,
      dueDay: creditCard.dueDay,
      entriesCount: creditCard._count.entries,
      createdAt: creditCard.createdAt,
      updatedAt: creditCard.updatedAt,
    }))
  }
}
