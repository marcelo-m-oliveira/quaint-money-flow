/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyReply, FastifyRequest } from 'fastify'

import { BaseController } from '@/controllers/base.controller'
import { UserPreferencesService } from '@/services/user-preferences.service'
import { convertDatesToSeconds } from '@/utils/response'
import type {
  IdParamSchema,
  PreferencesCreateSchema,
  PreferencesUpdateSchema,
} from '@/utils/schemas'

export class UserPreferencesController extends BaseController {
  constructor(private userPreferencesService: UserPreferencesService) {
    super({
      entityName: 'preferência',
      entityNamePlural: 'preferências',
    })
  }

  async index(request: FastifyRequest, reply: FastifyReply) {
    const userId = this.getUserId(request)
    const preferences = await this.userPreferencesService.findByUserId(userId)
    return reply.status(200).send(convertDatesToSeconds(preferences))
  }

  async show(request: FastifyRequest, reply: FastifyReply) {
    const userId = this.getUserId(request)
    const { id } = this.getPathParams<IdParamSchema>(request)

    const preferences = await this.userPreferencesService.findById(id, userId)
    return reply.status(200).send(convertDatesToSeconds(preferences))
  }

  async store(request: FastifyRequest, reply: FastifyReply) {
    return this.handleCreateRequest(
      request,
      reply,
      async () => {
        const userId = this.getUserId(request)
        const data = this.getBodyParams<PreferencesCreateSchema>(request)

        const preferences = await this.userPreferencesService.create(
          data,
          userId,
        )
        return convertDatesToSeconds(preferences)
      },
      `Criação de ${this.entityName}`,
    )
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    return this.handleUpdateRequest(
      request,
      reply,
      async () => {
        const userId = this.getUserId(request)
        const { id } = this.getPathParams<IdParamSchema>(request)
        const data = this.getBodyParams<PreferencesUpdateSchema>(request)

        const preferences = await this.userPreferencesService.update(
          id,
          data,
          userId,
        )
        return convertDatesToSeconds(preferences)
      },
      `Atualização de ${this.entityName}`,
    )
  }

  async updateByUserId(request: FastifyRequest, reply: FastifyReply) {
    return this.handleUpdateRequest(
      request,
      reply,
      async () => {
        const userId = this.getUserId(request)
        const data = this.getBodyParams<PreferencesUpdateSchema>(request)

        const preferences = await this.userPreferencesService.updateByUserId(
          userId,
          data,
        )
        return convertDatesToSeconds(preferences)
      },
      `Atualização de ${this.entityName} do usuário`,
    )
  }

  async destroy(request: FastifyRequest, reply: FastifyReply) {
    return this.handleDeleteRequest(
      request,
      reply,
      async () => {
        const userId = this.getUserId(request)
        const { id } = this.getPathParams<IdParamSchema>(request)

        await this.userPreferencesService.delete(id, userId)
      },
      `Exclusão de ${this.entityName}`,
    )
  }

  // Métodos customizados específicos para user preferences
  async upsert(request: FastifyRequest, reply: FastifyReply) {
    return this.handleUpdateRequest(
      request,
      reply,
      async () => {
        const userId = this.getUserId(request)
        const data =
          this.getBodyParams<Partial<PreferencesCreateSchema>>(request)

        const preferences = await this.userPreferencesService.upsert(
          userId,
          data,
        )
        return convertDatesToSeconds(preferences)
      },
      `Upsert de ${this.entityName}`,
    )
  }

  async reset(request: FastifyRequest, reply: FastifyReply) {
    return this.handleUpdateRequest(
      request,
      reply,
      async () => {
        const userId = this.getUserId(request)
        const preferences = await this.userPreferencesService.reset(userId)
        return convertDatesToSeconds(preferences)
      },
      `Reset de ${this.entityName} para padrão`,
    )
  }

  async createDefault(request: FastifyRequest, reply: FastifyReply) {
    return this.handleCreateRequest(
      request,
      reply,
      async () => {
        const userId = this.getUserId(request)
        const preferences =
          await this.userPreferencesService.createDefault(userId)
        return convertDatesToSeconds(preferences)
      },
      `Criação de ${this.entityName} padrão`,
    )
  }
}
