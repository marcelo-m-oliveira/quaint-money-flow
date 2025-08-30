import { Plan, PlanType } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export interface PlanCreateData {
  name: string
  type: PlanType
  price: number
  description?: string
  features: any
  isActive?: boolean
}

export interface PlanUpdateData extends Partial<PlanCreateData> {}

export class PlanService {
  protected prisma = prisma

  protected calculatePagination(
    total: number,
    page: number,
    limit: number,
  ) {
    const totalPages = Math.ceil(total / limit)
    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }
  }

  async getAll(options?: {
    includeInactive?: boolean
  }): Promise<Plan[]> {
    const where = options?.includeInactive ? {} : { isActive: true }
    
    return this.prisma.plan.findMany({
      where,
      orderBy: [
        { type: 'asc' },
        { price: 'asc' },
      ],
    })
  }

  async getById(id: string): Promise<Plan | null> {
    return this.prisma.plan.findUnique({
      where: { id },
    })
  }

  async create(data: PlanCreateData): Promise<Plan> {
    return this.prisma.plan.create({
      data: {
        name: data.name,
        type: data.type,
        price: data.price,
        description: data.description,
        features: data.features,
        isActive: data.isActive ?? true,
      },
    })
  }

  async update(id: string, data: PlanUpdateData): Promise<Plan> {
    const existingPlan = await this.getById(id)
    if (!existingPlan) {
      throw new Error('Plano não encontrado')
    }

    return this.prisma.plan.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        price: data.price,
        description: data.description,
        features: data.features,
        isActive: data.isActive,
      },
    })
  }

  async delete(id: string): Promise<void> {
    const existingPlan = await this.getById(id)
    if (!existingPlan) {
      throw new Error('Plano não encontrado')
    }

    // Verificar se há usuários usando este plano
    const usersCount = await this.prisma.user.count({
      where: { planId: id },
    })

    if (usersCount > 0) {
      throw new Error('Não é possível excluir um plano que está sendo usado por usuários')
    }

    await this.prisma.plan.delete({
      where: { id },
    })
  }

  async deactivate(id: string): Promise<Plan> {
    return this.update(id, { isActive: false })
  }

  async activate(id: string): Promise<Plan> {
    return this.update(id, { isActive: true })
  }

  async getPlanStats() {
    const [
      totalPlans,
      activePlans,
      planUsage,
    ] = await Promise.all([
      this.prisma.plan.count(),
      this.prisma.plan.count({ where: { isActive: true } }),
      this.prisma.plan.findMany({
        include: {
          _count: {
            select: {
              users: true,
            },
          },
        },
      }),
    ])

    return {
      totalPlans,
      activePlans,
      planUsage: planUsage.map(plan => ({
        id: plan.id,
        name: plan.name,
        type: plan.type,
        price: plan.price,
        userCount: plan._count.users,
        isActive: plan.isActive,
      })),
    }
  }
}
