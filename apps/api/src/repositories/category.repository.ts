import { Prisma, PrismaClient } from '@prisma/client'

import { BaseRepository } from '@/repositories/base.repository'

export class CategoryRepository extends BaseRepository<'category'> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'category')
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
    const where: Prisma.CategoryWhereInput = {
      name,
      userId,
    }

    if (excludeId) {
      // Evitar colisão com a própria categoria durante update
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
      color: category.color, // Incluir cor para uso no frontend
    }))
  }

  async getUsageStats(userId: string) {
    const categories = await this.prisma.category.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            entries: true,
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
      entryCount: category._count.entries,
      totalAmount: 0, // Por enquanto, não calculamos o valor total
    }))
  }
}
