import { Prisma, PrismaClient } from '@prisma/client'

export class CategoryRepository {
  constructor(private prisma: PrismaClient) {}

  async findMany(params: {
    where?: Prisma.CategoryWhereInput
    skip?: number
    take?: number
    orderBy?: Prisma.CategoryOrderByWithRelationInput
    include?: Prisma.CategoryInclude
  }) {
    return this.prisma.category.findMany(params)
  }

  async findUnique(params: {
    where: Prisma.CategoryWhereUniqueInput
    include?: Prisma.CategoryInclude
  }) {
    return this.prisma.category.findUnique(params)
  }

  async findFirst(params: {
    where?: Prisma.CategoryWhereInput
    include?: Prisma.CategoryInclude
  }) {
    return this.prisma.category.findFirst(params)
  }

  async create(params: {
    data: Prisma.CategoryCreateInput
    include?: Prisma.CategoryInclude
  }) {
    return this.prisma.category.create(params)
  }

  async update(params: {
    where: Prisma.CategoryWhereUniqueInput
    data: Prisma.CategoryUpdateInput
    include?: Prisma.CategoryInclude
  }) {
    return this.prisma.category.update(params)
  }

  async delete(params: { where: Prisma.CategoryWhereUniqueInput }) {
    return this.prisma.category.delete(params)
  }

  async count(params: { where?: Prisma.CategoryWhereInput }) {
    return this.prisma.category.count(params)
  }

  async upsert(params: {
    where: Prisma.CategoryWhereUniqueInput
    create: Prisma.CategoryCreateInput
    update: Prisma.CategoryUpdateInput
    include?: Prisma.CategoryInclude
  }) {
    return this.prisma.category.upsert(params)
  }

  // Métodos específicos de negócio
  async findByUserId(userId: string, includeChildren = false) {
    return this.prisma.category.findMany({
      where: { userId },
      include: {
        children: includeChildren,
        parent: true,
        _count: {
          select: {
            children: true,
            transactions: true,
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
    const where: Prisma.CategoryWhereInput = {
      name,
      userId,
    }

    if (excludeId) {
      where.NOT = { id: excludeId }
    }

    const category = await this.prisma.category.findFirst({ where })
    return !!category
  }

  async findForSelect(userId: string, type?: 'income' | 'expense') {
    const where: Prisma.CategoryWhereInput = { userId }

    if (type) {
      where.type = type
    }

    const categories = await this.prisma.category.findMany({
      where,
      select: {
        id: true,
        name: true,
        color: true,
        icon: true,
        type: true,
      },
      orderBy: { name: 'asc' },
    })

    // Formatar para o schema selectOptionSchema
    return categories.map((category) => ({
      value: category.id,
      label: category.name,
      icon: category.icon,
      iconType: 'generic', // Categorias sempre usam ícones genéricos
    }))
  }

  async getUsageStats(userId: string) {
    const categories = await this.prisma.category.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            transactions: true,
            children: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    // Formatar para o schema categoryUsageSchema
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      icon: category.icon,
      type: category.type as 'income' | 'expense',
      transactionCount: category._count.transactions,
      totalAmount: 0, // Por enquanto, não calculamos o valor total
    }))
  }
}
