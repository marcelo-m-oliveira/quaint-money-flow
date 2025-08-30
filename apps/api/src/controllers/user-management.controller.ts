import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { UserManagementService } from '@/services/user-management.service'
import { convertDatesToSeconds } from '@/utils/response'

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
})

const ChangePasswordSchema = z.object({
  newPassword: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

const ChangePlanSchema = z.object({
  planId: z.string().min(1, 'ID do plano é obrigatório'),
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
    return this.handlePaginatedRequest(
      request,
      reply,
      async () => {
        const query = UserQuerySchema.parse(request.query)
        const result = await this.userManagementService.getAll(query)

        return {
          items: result.users.map((user) => {
            const { password, ...userWithoutPassword } = user
            return convertDatesToSeconds(userWithoutPassword)
          }),
          pagination: result.pagination,
        }
      },
      `Listagem de ${this.entityNamePlural}`,
    )
  }

  async show(request: FastifyRequest, reply: FastifyReply) {
    return this.handleShowRequest(
      request,
      reply,
      async () => {
        const { id } = this.getPathParams<{ id: string }>(request)
        const user = await this.userManagementService.getById(id)

        if (!user) {
          throw new Error(`${this.entityName} não encontrado`)
        }

        const { password, ...userWithoutPassword } = user
        return convertDatesToSeconds(userWithoutPassword)
      },
      `Busca de ${this.entityName}`,
    )
  }

  async store(request: FastifyRequest, reply: FastifyReply) {
    return this.handleCreateRequest(
      request,
      reply,
      async () => {
        const data = UserCreateSchema.parse(request.body)
        const user = await this.userManagementService.create(data)

        const { password, ...userWithoutPassword } = user
        return convertDatesToSeconds(userWithoutPassword)
      },
      `Criação de ${this.entityName}`,
    )
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    return this.handleUpdateRequest(
      request,
      reply,
      async () => {
        const { id } = this.getPathParams<{ id: string }>(request)
        const data = UserUpdateSchema.parse(request.body)
        const user = await this.userManagementService.update(id, data)

        const { password, ...userWithoutPassword } = user
        return convertDatesToSeconds(userWithoutPassword)
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
        await this.userManagementService.delete(id)
        return { deleted: true }
      },
      `Exclusão de ${this.entityName}`,
    )
  }

  async changePassword(request: FastifyRequest, reply: FastifyReply) {
    return this.handleUpdateRequest(
      request,
      reply,
      async () => {
        const { id } = this.getPathParams<{ id: string }>(request)
        const { newPassword } = ChangePasswordSchema.parse(request.body)

        await this.userManagementService.changePassword(id, newPassword)

        return {
          success: true,
          message: 'Senha alterada com sucesso',
        }
      },
      'Alteração de Senha',
    )
  }

  async changePlan(request: FastifyRequest, reply: FastifyReply) {
    return this.handleUpdateRequest(
      request,
      reply,
      async () => {
        const { id } = this.getPathParams<{ id: string }>(request)
        const { planId } = ChangePlanSchema.parse(request.body)

        const user = await this.userManagementService.changePlan(id, planId)

        const { password, ...userWithoutPassword } = user
        return convertDatesToSeconds(userWithoutPassword)
      },
      'Alteração de Plano',
    )
  }

  async stats(request: FastifyRequest, reply: FastifyReply) {
    return this.handleRequest(
      request,
      reply,
      async () => {
        const stats = await this.userManagementService.getUserStats()
        return stats
      },
      'Estatísticas de Usuários',
    )
  }
}
