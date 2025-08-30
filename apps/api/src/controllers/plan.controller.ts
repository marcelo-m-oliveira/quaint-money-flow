import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { BaseController } from './base.controller'
import { PlanService } from '@/services/plan.service'
import { convertDatesToSeconds } from '@/utils/response'

// Schemas de validação
const PlanCreateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['free', 'monthly', 'annual']),
  price: z.number().min(0, 'Preço deve ser maior ou igual a zero'),
  description: z.string().optional(),
  features: z.any(), // Simplificado para evitar problemas com z.record
  isActive: z.boolean().optional().default(true),
})

const PlanUpdateSchema = PlanCreateSchema.partial()

const PlanQuerySchema = z.object({
  includeInactive: z.string().optional().transform(val => val === 'true'),
})

interface PlanFilters {
  includeInactive?: boolean
}

export class PlanController extends BaseController {
  constructor(private planService: PlanService) {
    super({ entityName: 'Plano', entityNamePlural: 'Planos' })
  }

  async index(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = PlanQuerySchema.parse(request.query)
      const plans = await this.planService.getAll({
        includeInactive: query.includeInactive,
      })
      
      reply.code(200).send({
        success: true,
        data: {
          plans: plans.map(plan => convertDatesToSeconds(plan)),
        },
      })
    } catch (error: any) {
      reply.code(500).send({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message,
      })
    }
  }

  async show(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const plan = await this.planService.getById(id)
      
      if (!plan) {
        return reply.code(404).send({
          success: false,
          message: 'Plano não encontrado',
        })
      }
      
      reply.code(200).send({
        success: true,
        data: convertDatesToSeconds(plan),
      })
    } catch (error: any) {
      reply.code(500).send({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message,
      })
    }
  }

  async store(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = PlanCreateSchema.parse(request.body)
      const plan = await this.planService.create(data)
      
      reply.code(201).send({
        success: true,
        data: convertDatesToSeconds(plan),
      })
    } catch (error: any) {
      reply.code(500).send({
        success: false,
        message: 'Erro ao criar plano',
        error: error.message,
      })
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    return this.handleUpdateRequest(
      request,
      reply,
      async () => {
        const { id } = this.getPathParams<{ id: string }>(request)
        const data = PlanUpdateSchema.parse(request.body)
        const plan = await this.planService.update(id, data)
        return convertDatesToSeconds(plan)
      },
      `Atualização de ${this.entityName}`,
    )
  }

  async destroy(request: FastifyRequest, reply: FastifyReply) {
    return this.handleDeleteRequest(
      request,
      reply,
      async () => {
        const { id } = this.getPathParams<{ id: string }>(request)
        await this.planService.delete(id)
        return { deleted: true }
      },
      `Exclusão de ${this.entityName}`,
    )
  }

  async deactivate(request: FastifyRequest, reply: FastifyReply) {
    return this.handleUpdateRequest(
      request,
      reply,
      async () => {
        const { id } = this.getPathParams<{ id: string }>(request)
        const plan = await this.planService.deactivate(id)
        return convertDatesToSeconds(plan)
      },
      `Desativação de ${this.entityName}`,
    )
  }

  async activate(request: FastifyRequest, reply: FastifyReply) {
    return this.handleUpdateRequest(
      request,
      reply,
      async () => {
        const { id } = this.getPathParams<{ id: string }>(request)
        const plan = await this.planService.activate(id)
        return convertDatesToSeconds(plan)
      },
      `Ativação de ${this.entityName}`,
    )
  }

  async stats(request: FastifyRequest, reply: FastifyReply) {
    return this.handleListRequest(
      request,
      reply,
      async () => {
        const stats = await this.planService.getPlanStats()
        return stats
      },
      'Estatísticas de Planos',
    )
  }
}
