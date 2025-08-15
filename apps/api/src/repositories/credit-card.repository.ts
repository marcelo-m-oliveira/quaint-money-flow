import { Prisma, PrismaClient } from '@prisma/client'

export class CreditCardRepository {
  constructor(private prisma: PrismaClient) {}

  async findMany(params: {
    where?: Prisma.CreditCardWhereInput
    skip?: number
    take?: number
    orderBy?: Prisma.CreditCardOrderByWithRelationInput
    include?: Prisma.CreditCardInclude
  }) {
    return this.prisma.creditCard.findMany(params)
  }

  async findUnique(params: {
    where: Prisma.CreditCardWhereUniqueInput
    include?: Prisma.CreditCardInclude
  }) {
    return this.prisma.creditCard.findUnique(params)
  }

  async findFirst(params: {
    where?: Prisma.CreditCardWhereInput
    include?: Prisma.CreditCardInclude
  }) {
    return this.prisma.creditCard.findFirst(params)
  }

  async create(params: {
    data: Prisma.CreditCardCreateInput
    include?: Prisma.CreditCardInclude
  }) {
    return this.prisma.creditCard.create(params)
  }

  async update(params: {
    where: Prisma.CreditCardWhereUniqueInput
    data: Prisma.CreditCardUpdateInput
    include?: Prisma.CreditCardInclude
  }) {
    return this.prisma.creditCard.update(params)
  }

  async delete(params: { where: Prisma.CreditCardWhereUniqueInput }) {
    return this.prisma.creditCard.delete(params)
  }

  async count(params: { where?: Prisma.CreditCardWhereInput }) {
    return this.prisma.creditCard.count(params)
  }

  async upsert(params: {
    where: Prisma.CreditCardWhereUniqueInput
    create: Prisma.CreditCardCreateInput
    update: Prisma.CreditCardUpdateInput
    include?: Prisma.CreditCardInclude
  }) {
    return this.prisma.creditCard.upsert(params)
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
  ) {
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
    })
  }
}
