import { AccountType, Prisma, PrismaClient } from '@prisma/client'

export class AccountRepository {
  constructor(private prisma: PrismaClient) {}

  async findMany(params: {
    where?: Prisma.AccountWhereInput
    skip?: number
    take?: number
    orderBy?: Prisma.AccountOrderByWithRelationInput
    include?: Prisma.AccountInclude
  }) {
    return this.prisma.account.findMany(params)
  }

  async findUnique(params: {
    where: Prisma.AccountWhereUniqueInput
    include?: Prisma.AccountInclude
  }) {
    return this.prisma.account.findUnique(params)
  }

  async findFirst(params: {
    where?: Prisma.AccountWhereInput
    include?: Prisma.AccountInclude
  }) {
    return this.prisma.account.findFirst(params)
  }

  async create(params: {
    data: Prisma.AccountCreateInput
    include?: Prisma.AccountInclude
  }) {
    return this.prisma.account.create(params)
  }

  async update(params: {
    where: Prisma.AccountWhereUniqueInput
    data: Prisma.AccountUpdateInput
    include?: Prisma.AccountInclude
  }) {
    return this.prisma.account.update(params)
  }

  async delete(params: { where: Prisma.AccountWhereUniqueInput }) {
    return this.prisma.account.delete(params)
  }

  async count(params: { where?: Prisma.AccountWhereInput }) {
    return this.prisma.account.count(params)
  }

  async upsert(params: {
    where: Prisma.AccountWhereUniqueInput
    create: Prisma.AccountCreateInput
    update: Prisma.AccountUpdateInput
    include?: Prisma.AccountInclude
  }) {
    return this.prisma.account.upsert(params)
  }

  // Métodos específicos de negócio
  async findByUserId(userId: string, includeEntries = false) {
    return this.prisma.account.findMany({
      where: { userId },
      include: {
        entries: includeEntries,
        _count: {
          select: {
            entries: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findByUserIdAndType(
    userId: string,
    type: string,
    includeInGeneralBalance?: boolean,
  ) {
    const where: Prisma.AccountWhereInput = {
      userId,
      type: type as AccountType,
    }

    if (includeInGeneralBalance !== undefined) {
      where.includeInGeneralBalance = includeInGeneralBalance
    }

    return this.prisma.account.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
  }

  async existsByNameAndUserId(
    name: string,
    userId: string,
    excludeId?: string,
  ) {
    const where: Prisma.AccountWhereInput = {
      name,
      userId,
    }

    if (excludeId) {
      where.NOT = { id: excludeId }
    }

    const account = await this.prisma.account.findFirst({ where })
    return !!account
  }

  async getAccountsWithBalance(userId: string) {
    return this.prisma.account.findMany({
      where: { userId },
      include: {
        entries: {
          where: { paid: true },
          select: {
            amount: true,
            type: true,
          },
        },
      },
    })
  }
}
