/* eslint-disable @typescript-eslint/no-explicit-any */
import { dateToSeconds } from '@saas/utils'
import { UserPreferencesSchema } from '@saas/validations'
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'

import { UserPreferencesService } from '@/services/user-preferences.service'
import { handleError } from '@/utils/errors'

export class UserPreferencesController {
  constructor(private userPreferencesService: UserPreferencesService) {}

  async show(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub

      request.log.info({ userId }, 'Buscando preferencias do usuario')
      const preferences = await this.userPreferencesService.findByUserId(userId)

      request.log.info(
        { userId, preferences: preferences.id },
        'Preferencias encontradas com sucesso',
      )

      return reply.status(200).send({
        ...preferences,
        createdAt: dateToSeconds(preferences.createdAt),
        updatedAt: dateToSeconds(preferences.updatedAt),
      })
    } catch (error: any) {
      request.log.error(
        { error: error.message },
        'Erro ao buscar preferencias do usuario',
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const data = request.body as Partial<UserPreferencesSchema>

      request.log.info({ userId, data }, 'Atualizando preferencias do usuario')

      const preferences = await this.userPreferencesService.update(userId, data)

      request.log.info(
        { userId, preferences: preferences.id },
        'Preferencias atualizadas com sucesso',
      )

      return reply.status(200).send({
        ...preferences,
        createdAt: dateToSeconds(preferences.createdAt),
        updatedAt: dateToSeconds(preferences.updatedAt),
      })
    } catch (error: any) {
      request.log.error(
        { error: error.message },
        'Erro ao atualizar preferencias do usuario',
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
        'Criando/atualizando preferencias do usuario',
      )

      const preferences = await this.userPreferencesService.upsert(userId, data)

      request.log.info(
        { userId, preferences: preferences.id },
        'Preferencias criadas/atualizadas com sucesso',
      )

      return reply.status(200).send({
        ...preferences,
        createdAt: dateToSeconds(preferences.createdAt),
        updatedAt: dateToSeconds(preferences.updatedAt),
      })
    } catch (error: any) {
      request.log.error(
        { error: error.message },
        'Erro ao criar/atualizar preferencias do usuario',
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async reset(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub

      request.log.info({ userId }, 'Resetando preferencias do usuario')

      const preferences = await this.userPreferencesService.reset(userId)

      request.log.info(
        { userId, preferences: preferences.id },
        'Preferencias resetadas com sucesso',
      )

      return reply.status(200).send({
        ...preferences,
        createdAt: preferences.createdAt.toISOString(),
        updatedAt: preferences.updatedAt.toISOString(),
      })
    } catch (error: any) {
      request.log.error(
        { error: error.message },
        'Erro ao resetar preferencias do usuario',
      )
      return handleError(error as FastifyError, reply)
    }
  }
}
