import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { PlanService } from '@/services/plan.service'
import { convertDatesToSeconds } from '@/utils/response'

import { BaseController } from './base.controller'

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
  includeInactive: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
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

      const plansWithConvertedDates = plans.map((plan) =>
        convertDatesToSeconds(plan),
      )

      return reply.status(200).send({
        plans: plansWithConvertedDates,
      })
    } catch (error: any) {
      request.log.error(
        { error: error.message, operation: 'index' },
        `Erro na listagem de ${this.entityNamePlural}`,
      )
      throw error
    }
  }

  async show(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = this.getPathParams<{ id: string }>(request)
      const plan = await this.planService.getById(id)

      if (!plan) {
        return reply.status(404).send({
          message: `${this.entityName} não encontrado`,
        })
      }

      return reply.status(200).send(convertDatesToSeconds(plan))
    } catch (error: any) {
      request.log.error(
        { error: error.message, operation: 'show' },
        `Erro na busca de ${this.entityName}`,
      )
      throw error
    }
  }

  async store(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = PlanCreateSchema.parse(request.body)
      const plan = await this.planService.create(data)
      return reply.status(201).send(convertDatesToSeconds(plan))
    } catch (error: any) {
      request.log.error(
        { error: error.message, operation: 'store' },
        `Erro na criação de ${this.entityName}`,
      )
      throw error
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = this.getPathParams<{ id: string }>(request)
      const data = PlanUpdateSchema.parse(request.body)
      const plan = await this.planService.update(id, data)
      return reply.status(200).send(convertDatesToSeconds(plan))
    } catch (error: any) {
      request.log.error(
        { error: error.message, operation: 'update' },
        `Erro na atualização de ${this.entityName}`,
      )
      throw error
    }
  }

  async destroy(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = this.getPathParams<{ id: string }>(request)
      await this.planService.delete(id)
      return reply.status(204).send()
    } catch (error: any) {
      request.log.error(
        { error: error.message, operation: 'destroy' },
        `Erro na exclusão de ${this.entityName}`,
      )
      throw error
    }
  }

  async deactivate(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = this.getPathParams<{ id: string }>(request)
      const plan = await this.planService.deactivate(id)
      return reply.status(200).send(convertDatesToSeconds(plan))
    } catch (error: any) {
      request.log.error(
        { error: error.message, operation: 'deactivate' },
        `Erro na desativação de ${this.entityName}`,
      )
      throw error
    }
  }

  async activate(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = this.getPathParams<{ id: string }>(request)
      const plan = await this.planService.activate(id)
      return reply.status(200).send(convertDatesToSeconds(plan))
    } catch (error: any) {
      request.log.error(
        { error: error.message, operation: 'activate' },
        `Erro na ativação de ${this.entityName}`,
      )
      throw error
    }
  }

  async stats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const stats = await this.planService.getPlanStats()
      return reply.status(200).send(stats)
    } catch (error: any) {
      request.log.error(
        { error: error.message, operation: 'stats' },
        'Erro ao buscar estatísticas de planos',
      )
      throw error
    }
  }
}
