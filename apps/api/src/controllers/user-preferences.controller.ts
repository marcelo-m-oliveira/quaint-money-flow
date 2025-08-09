/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'

import { UserPreferencesService } from '@/services/user-preferences.service'
import { handleError } from '@/utils/errors'

import type { UserPreferencesSchema } from '../utils/schemas'

export class UserPreferencesController {
  constructor(private userPreferencesService: UserPreferencesService) {}

  async show(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub

      request.log.info({ userId }, 'Buscando preferências do usuário')
      const preferences = await this.userPreferencesService.findByUserId(userId)

      request.log.info(
        { userId, preferences: preferences.id },
        'Preferências encontradas com sucesso',
      )

      return reply.status(200).send({
        ...preferences,
        createdAt: preferences.createdAt.toISOString(),
        updatedAt: preferences.updatedAt.toISOString(),
      })
    } catch (error: any) {
      request.log.error(
        { error: error.message },
        'Erro ao buscar preferências do usuário',
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const data = request.body as Partial<UserPreferencesSchema>

      request.log.info({ userId, data }, 'Atualizando preferências do usuário')

      const preferences = await this.userPreferencesService.update(userId, data)

      request.log.info(
        { userId, preferences: preferences.id },
        'Preferências atualizadas com sucesso',
      )

      return reply.status(200).send({
        ...preferences,
        createdAt: preferences.createdAt.toISOString(),
        updatedAt: preferences.updatedAt.toISOString(),
      })
    } catch (error: any) {
      request.log.error(
        { error: error.message },
        'Erro ao atualizar preferências do usuário',
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async upsert(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const data = request.body as Partial<UserPreferencesSchema>

      request.log.info(
        { userId, data },
        'Criando/atualizando preferências do usuário',
      )

      const preferences = await this.userPreferencesService.upsert(userId, data)

      request.log.info(
        { userId, preferences: preferences.id },
        'Preferências criadas/atualizadas com sucesso',
      )

      return reply.status(200).send({
        ...preferences,
        createdAt: preferences.createdAt.toISOString(),
        updatedAt: preferences.updatedAt.toISOString(),
      })
    } catch (error: any) {
      request.log.error(
        { error: error.message },
        'Erro ao criar/atualizar preferências do usuário',
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async reset(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub

      request.log.info({ userId }, 'Resetando preferências do usuário')

      const preferences = await this.userPreferencesService.reset(userId)

      request.log.info(
        { userId, preferences: preferences.id },
        'Preferências resetadas com sucesso',
      )

      return reply.status(200).send({
        ...preferences,
        createdAt: preferences.createdAt.toISOString(),
        updatedAt: preferences.updatedAt.toISOString(),
      })
    } catch (error: any) {
      request.log.error(
        { error: error.message },
        'Erro ao resetar preferências do usuário',
      )
      return handleError(error as FastifyError, reply)
    }
  }
}
