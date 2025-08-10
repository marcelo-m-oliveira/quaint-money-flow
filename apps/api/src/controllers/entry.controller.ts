/* eslint-disable @typescript-eslint/no-explicit-any */
import { dateToSeconds, secondsToDate } from '@saas/utils'
import {
  EntryCreateSchema,
  EntryFiltersSchema,
  EntryUpdateSchema,
} from '@saas/validations'
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'

import { EntryService } from '@/services/entry.service'
import { handleError } from '@/utils/errors'
import { IdParamSchema, idParamSchema } from '@/utils/schemas'

export class EntryController {
  constructor(private entryService: EntryService) {}

  async index(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const filters = request.query as EntryFiltersSchema

      request.log.info({ userId, filters }, 'Listando transações do usuario')

      const result = await this.entryService.findMany(userId, {
        page: filters.page || 1,
        limit: filters.limit || 20,
        type: filters.type,
        categoryId: filters.categoryId,
        accountId: filters.accountId,
        creditCardId: filters.creditCardId,
        startDate: filters.startDate
          ? secondsToDate(Number(filters.startDate))
          : undefined,
        endDate: filters.endDate
          ? secondsToDate(Number(filters.endDate))
          : undefined,
        search: filters.search,
      })

      request.log.info(
        {
          userId,
          totalEntries: result.entries.length,
          totalPages: result.pagination.totalPages,
        },
        'Transações listadas com sucesso',
      )

      // Convert dates to seconds for frontend
      const convertedResult = {
        ...result,
        entries: result.entries.map((entry: any) => ({
          ...entry,
          date: dateToSeconds(entry.date),
          createdAt: dateToSeconds(entry.createdAt),
          updatedAt: dateToSeconds(entry.updatedAt),
          category: entry.category
            ? {
                ...entry.category,
                createdAt: dateToSeconds(entry.category.createdAt),
                updatedAt: dateToSeconds(entry.category.updatedAt),
              }
            : null,
          account: entry.account
            ? {
                ...entry.account,
                createdAt: dateToSeconds(entry.account.createdAt),
                updatedAt: dateToSeconds(entry.account.updatedAt),
              }
            : null,
          creditCard: entry.creditCard
            ? {
                ...entry.creditCard,
                createdAt: dateToSeconds(entry.creditCard.createdAt),
                updatedAt: dateToSeconds(entry.creditCard.updatedAt),
              }
            : null,
        })),
      }

      return reply.status(200).send(convertedResult)
    } catch (error: any) {
      request.log.error(
        { error: error.message, stack: error.stack },
        'Erro ao listar transações',
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async show(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const { id } = request.params as IdParamSchema

      request.log.info({ userId, entryId: id }, 'Buscando transação por ID')

      const entry = await this.entryService.findById(id, userId)

      request.log.info(
        { userId, entryId: entry.id },
        'Transação encontrada com sucesso',
      )

      // Convert dates to seconds for frontend
      const convertedEntry = {
        ...entry,
        date: dateToSeconds(entry.date),
        createdAt: dateToSeconds(entry.createdAt),
        updatedAt: dateToSeconds(entry.updatedAt),
      }

      return reply.status(200).send(convertedEntry)
    } catch (error: any) {
      request.log.error(
        {
          userId: request.user.sub,
          entryId: idParamSchema,
          error: error.message,
        },
        'Erro ao buscar transação',
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async store(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const data = request.body as EntryCreateSchema

      request.log.info({ userId, entryData: data }, 'Criando nova transação')

      // Convert date from seconds to Date before saving to database
      const processedData = {
        ...data,
        date: data.date ? secondsToDate(Number(data.date)) : new Date(),
      }

      const entry = await this.entryService.create(processedData, userId)

      request.log.info(
        { entryId: entry.id, description: entry.description },
        'Transação criada com sucesso',
      )

      // Convert dates to seconds for frontend
      const convertedEntry = {
        ...entry,
        date: dateToSeconds(entry.date),
        createdAt: dateToSeconds(entry.createdAt),
        updatedAt: dateToSeconds(entry.updatedAt),
      }

      return reply.status(201).send(convertedEntry)
    } catch (error: any) {
      request.log.error(
        { userId: request.user.sub, error: error.message },
        'Erro ao criar transação',
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const { id } = request.params as IdParamSchema
      const data = request.body as EntryUpdateSchema

      request.log.info(
        { userId, entryId: id, updateData: data },
        'Atualizando transação',
      )

      // Convert date from seconds to Date before saving to database
      const processedData = {
        ...data,
        ...(data.date && { date: secondsToDate(Number(data.date)) }),
      }

      const entry = await this.entryService.update(id, processedData, userId)

      request.log.info(
        { entryId: entry.id, description: entry.description },
        'Transação atualizada com sucesso',
      )

      // Convert dates to seconds for frontend
      const convertedEntry = {
        ...entry,
        date: dateToSeconds(entry.date),
        createdAt: dateToSeconds(entry.createdAt),
        updatedAt: dateToSeconds(entry.updatedAt),
      }

      return reply.status(200).send(convertedEntry)
    } catch (error: any) {
      request.log.error(
        {
          userId: request.user.sub,
          entryId: idParamSchema,
          error: error.message,
        },
        'Erro ao atualizar transação',
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async destroy(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const { id } = request.params as IdParamSchema

      request.log.info({ userId, entryId: id }, 'Deletando transação')

      await this.entryService.delete(id, userId)

      request.log.info({ entryId: id }, 'Transação deletada com sucesso')

      return reply.status(204).send()
    } catch (error: any) {
      request.log.error(
        {
          userId: request.user.sub,
          entryId: idParamSchema,
          error: error.message,
        },
        'Erro ao deletar transação',
      )
      return handleError(error as FastifyError, reply)
    }
  }
}
