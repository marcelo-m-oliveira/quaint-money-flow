import { PlanType, Prisma, PrismaClient } from '@prisma/client'

import { PlanRepository } from '@/repositories/plan.repository'
import { BadRequestError } from '@/routes/_errors/bad-request-error'
import { PlanInUseError } from '@/routes/_errors/plan-in-use-error'
import { BaseService } from '@/services/base.service'

export interface PlanCreateData {
  name: string
  type: PlanType | string
  price: number
  description?: string
  features: any
  isActive?: boolean
}

export interface PlanUpdateData extends Partial<PlanCreateData> {}

export class PlanService extends BaseService<'plan'> {
  constructor(
    private planRepository: PlanRepository,
    prisma: PrismaClient,
  ) {
    super(planRepository, prisma)
  }

  private validatePlanType(type: PlanType | string): PlanType {
    if (typeof type === 'string') {
      if (type === 'free' || type === 'monthly' || type === 'annual') {
        return type as PlanType
      }
      throw new BadRequestError(`Tipo de plano inválido: ${type}`)
    }
    return type
  }

  async findMany(options?: { includeInactive?: boolean }) {
    const where = options?.includeInactive ? {} : { isActive: true }

    const plans = await this.planRepository.findMany({
      where,
      orderBy: [{ type: 'asc' }, { price: 'asc' }],
    })

    return plans
  }

  async findById(id: string) {
    const plan = await this.planRepository.findById(id)

    if (!plan) {
      throw new BadRequestError('Plano não encontrado')
    }

    return plan
  }

  async create(data: PlanCreateData) {
    // Validar e converter o tipo
    const planType = this.validatePlanType(data.type)

    // Verificar se já existe um plano com o mesmo nome
    const existingPlan = await this.planRepository.findByName(data.name)

    if (existingPlan) {
      throw new BadRequestError('Já existe um plano com este nome')
    }

    const plan = await this.planRepository.create({
      name: data.name,
      type: planType,
      price: new Prisma.Decimal(data.price || 0),
      description: data.description,
      features: data.features || {},
      isActive: data.isActive ?? true,
    })

    this.logOperation('CREATE_PLAN', 'admin', {
      planId: plan.id,
      planName: plan.name,
    })

    return plan
  }

  async update(id: string, data: PlanUpdateData) {
    // Verificar se o plano existe
    await this.findById(id)

    const updateData: any = {}

    if (data.name !== undefined) {
      // Verificar se já existe outro plano com o mesmo nome
      const duplicatePlan = await this.planRepository.findByNameExcludingId(
        data.name,
        id,
      )

      if (duplicatePlan) {
        throw new BadRequestError('Já existe um plano com este nome')
      }

      updateData.name = data.name
    }

    if (data.type !== undefined) {
      updateData.type = this.validatePlanType(data.type)
    }

    if (data.price !== undefined) {
      updateData.price = new Prisma.Decimal(data.price)
    }

    if (data.description !== undefined) {
      updateData.description = data.description
    }

    if (data.features !== undefined) {
      updateData.features = data.features || {}
    }

    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive
    }

    const plan = await this.planRepository.update(id, updateData)

    this.logOperation('UPDATE_PLAN', 'admin', {
      planId: plan.id,
      planName: plan.name,
    })

    return plan
  }

  async delete(id: string) {
    // Verificar se o plano existe
    const plan = await this.findById(id)

    // Verificar se há usuários usando este plano
    const usersCount = await this.planRepository.countUsersByPlan(id)

    if (usersCount > 0) {
      throw new PlanInUseError(
        'Não é possível excluir um plano que está sendo usado por usuários',
      )
    }

    await this.planRepository.delete(id)

    this.logOperation('DELETE_PLAN', 'admin', {
      planId: id,
      planName: plan.name,
    })

    return plan
  }

  async deactivate(id: string) {
    // Verificar se o plano existe
    const plan = await this.findById(id)

    // Verificar se há usuários usando este plano
    const usersCount = await this.planRepository.countUsersByPlan(id)

    if (usersCount > 0) {
      throw new PlanInUseError(
        'Não é possível desativar um plano que está sendo usado por usuários',
      )
    }

    return this.update(id, { isActive: false })
  }

  async activate(id: string) {
    return this.update(id, { isActive: true })
  }

  async getPlanStats() {
    const [totalPlans, activePlans, planUsage] = await Promise.all([
      this.planRepository.count(),
      this.planRepository.count({ isActive: true }),
      this.planRepository.findWithUserCount(),
    ])

    return {
      totalPlans,
      activePlans,
      planUsage: planUsage.map((plan: any) => ({
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
