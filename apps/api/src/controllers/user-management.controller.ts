import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { UserManagementService } from '@/services/user-management.service'
import {
  convertUserForResponse,
  convertUsersForResponse,
} from '@/utils/response'

import { BaseController } from './base.controller'

// Schemas de validação
const UserCreateSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(1, 'Nome é obrigatório'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: z.enum(['user', 'admin']).optional().default('user'),
  planId: z.string().optional(),
  avatarUrl: z.string().url().optional(),
})

const UserUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['user', 'admin']).optional(),
  planId: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  passwordConfigured: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

const ChangePasswordSchema = z.object({
  newPassword: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

const ChangePlanSchema = z.object({
  planId: z.string().min(1, 'ID do plano é obrigatório'),
})

const ToggleActiveSchema = z.object({
  isActive: z.boolean(),
})

const UserQuerySchema = z.object({
  role: z.enum(['user', 'admin']).optional(),
  planId: z.string().optional(),
  search: z.string().optional(),
  page: z.number().positive().optional().default(1),
  limit: z.number().positive().max(100).optional().default(20),
})

interface UserFilters {
  role?: 'user' | 'admin'
  planId?: string
  search?: string
  page?: number
  limit?: number
}

export class UserManagementController extends BaseController {
  constructor(private userManagementService: UserManagementService) {
    super({ entityName: 'Usuário', entityNamePlural: 'Usuários' })
  }

  async index(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = UserQuerySchema.parse(request.query)
      const result = await this.userManagementService.findMany(query)

      const usersWithConvertedDates = convertUsersForResponse(result.users)

      return reply.status(200).send({
        users: usersWithConvertedDates,
        pagination: result.pagination,
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
      const user = await this.userManagementService.findById(id)

      return reply.status(200).send(convertUserForResponse(user))
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
      const data = UserCreateSchema.parse(request.body)
      const user = await this.userManagementService.create(data)

      return reply.status(201).send(convertUserForResponse(user))
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
      const data = UserUpdateSchema.parse(request.body)
      const user = await this.userManagementService.update(id, data)

      return reply.status(200).send(convertUserForResponse(user))
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
      await this.userManagementService.delete(id)
      return reply.status(204).send()
    } catch (error: any) {
      request.log.error(
        { error: error.message, operation: 'destroy' },
        `Erro na exclusão de ${this.entityName}`,
      )
      throw error
    }
  }

  async changePassword(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = this.getPathParams<{ id: string }>(request)
      const { newPassword } = ChangePasswordSchema.parse(request.body)

      await this.userManagementService.changePassword(id, newPassword)

      return reply.status(200).send({
        success: true,
        message: 'Senha alterada com sucesso',
      })
    } catch (error: any) {
      request.log.error(
        { error: error.message, operation: 'changePassword' },
        'Erro na alteração de senha',
      )
      throw error
    }
  }

  async changePlan(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = this.getPathParams<{ id: string }>(request)
      const { planId } = ChangePlanSchema.parse(request.body)

      const user = await this.userManagementService.changePlan(id, planId)

      return reply.status(200).send(convertUserForResponse(user))
    } catch (error: any) {
      request.log.error(
        { error: error.message, operation: 'changePlan' },
        'Erro na alteração de plano',
      )
      throw error
    }
  }

  async toggleActive(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = this.getPathParams<{ id: string }>(request)
      const { isActive } = ToggleActiveSchema.parse(request.body)

      const user = await this.userManagementService.toggleActive(id, isActive)

      return reply.status(200).send(convertUserForResponse(user))
    } catch (error: any) {
      request.log.error(
        { error: error.message, operation: 'toggleActive' },
        'Erro na alteração de status do usuário',
      )
      throw error
    }
  }

  async stats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const stats = await this.userManagementService.getUserStats()
      return reply.status(200).send(stats)
    } catch (error: any) {
      request.log.error(
        { error: error.message, operation: 'stats' },
        'Erro ao buscar estatísticas de usuários',
      )
      throw error
    }
  }
}
