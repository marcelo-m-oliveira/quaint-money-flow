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

      // Convert data to match response schema
      const convertedResult = {
        ...result,
        entries: result.entries.map((entry: any) => ({
          ...entry,
          amount: entry.amount.toString(), // Convert Decimal to string
          date: entry.date ? dateToSeconds(entry.date) : undefined, // Convert Date to secund
          createdAt: entry.createdAt
            ? dateToSeconds(entry.createdAt)
            : undefined,
          updatedAt: entry.updatedAt
            ? dateToSeconds(entry.updatedAt)
            : undefined,
          creditCardId: entry.creditCardId || '', // Convert null to empty string
          category: entry.category
            ? {
                ...entry.category,
                createdAt: entry.category.createdAt
                  ? dateToSeconds(entry.category.createdAt)
                  : undefined,
                updatedAt: entry.category.updatedAt
                  ? dateToSeconds(entry.category.updatedAt)
                  : undefined,
              }
            : undefined,
          account: entry.account
            ? {
                ...entry.account,
                createdAt: entry.account.createdAt
                  ? dateToSeconds(entry.account.createdAt)
                  : undefined,
                updatedAt: entry.account.updatedAt
                  ? dateToSeconds(entry.account.updatedAt)
                  : undefined,
              }
            : undefined,
          creditCard: entry.creditCard
            ? {
                ...entry.creditCard,
                createdAt: entry.creditCard.createdAt
                  ? dateToSeconds(entry.creditCard.createdAt)
                  : undefined,
                updatedAt: entry.creditCard.updatedAt
                  ? dateToSeconds(entry.creditCard.updatedAt)
                  : undefined,
              }
            : undefined,
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

      // Convert data to match response schema
      const convertedEntry = {
        ...entry,
        amount: entry.amount.toString(), // Convert Decimal to string
        date: entry.date ? dateToSeconds(entry.date) : undefined, // Convert Date to secunds
        createdAt: entry.createdAt ? dateToSeconds(entry.createdAt) : undefined,
        updatedAt: entry.updatedAt ? dateToSeconds(entry.updatedAt) : undefined,
        creditCardId: entry.creditCardId || '', // Convert null to empty string
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

      // Convert date from seconds to Date and amount from string to number before saving to database
      const processedData = {
        ...data,
        amount: parseFloat(data.amount || '0'),
        date: data.date ? secondsToDate(data.date) : new Date(),
      } as any // Temporary type assertion to bypass type checking

      const entry = await this.entryService.create(processedData, userId)

      request.log.info(
        { entryId: entry.id, description: entry.description },
        'Transação criada com sucesso',
      )

      // Convert data to match response schema
      const convertedEntry = {
        ...entry,
        amount: entry.amount.toString(), // Convert Decimal to string
        date: entry.date ? dateToSeconds(entry.date) : undefined, // Convert Date to secunds
        createdAt: entry.createdAt ? dateToSeconds(entry.createdAt) : undefined,
        updatedAt: entry.updatedAt ? dateToSeconds(entry.updatedAt) : undefined,
        creditCardId: entry.creditCardId || '', // Convert null to empty string
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

      // Convert date from seconds to Date and amount from string to number before saving to database
      const processedData = {
        ...data,
        ...(data.amount !== undefined && {
          amount: parseFloat(data.amount || '0'),
        }),
        ...(data.date && { date: secondsToDate(data.date) }),
      } as any // Temporary type assertion to bypass type checking

      const entry = await this.entryService.update(id, processedData, userId)

      request.log.info(
        { entryId: entry.id, description: entry.description },
        'Transação atualizada com sucesso',
      )

      // Convert data to match response schema
      const convertedEntry = {
        ...entry,
        amount: entry.amount.toString(), // Convert Decimal to string
        date: entry.date ? dateToSeconds(entry.date) : undefined, // Convert Date to secunds
        createdAt: entry.createdAt ? dateToSeconds(entry.createdAt) : undefined,
        updatedAt: entry.updatedAt ? dateToSeconds(entry.updatedAt) : undefined,
        creditCardId: entry.creditCardId || '', // Convert null to empty string
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
