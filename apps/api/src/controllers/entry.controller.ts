import { dateToSeconds, secondsToDate } from '@saas/utils'
import {
  EntryCreateSchema,
  EntryFiltersSchema,
  EntryUpdateSchema,
} from '@saas/validations'
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'

import { BaseController } from '@/controllers/base.controller'
import { EntryService } from '@/services/entry.service'
import { handleError } from '@/utils/errors'
import { EntryPatchSchema, IdParamSchema } from '@/utils/schemas'

export class EntryController extends BaseController {
  constructor(private entryService: EntryService) {
    super({ entityName: 'lançamento', entityNamePlural: 'lançamentos' })
  }

  private convertNullToUndefined(obj: any): any {
    if (obj === null) return undefined
    if (typeof obj !== 'object' || obj === undefined) return obj

    // Handle arrays separately to preserve array structure
    if (Array.isArray(obj)) {
      return obj.map((item) => this.convertNullToUndefined(item))
    }

    const converted: any = { ...obj }
    for (const key in converted) {
      if (converted[key] === null) {
        converted[key] = undefined
      } else if (typeof converted[key] === 'object') {
        converted[key] = this.convertNullToUndefined(converted[key])
      }
    }
    return converted
  }

  private parseFilterDate(dateValue: string): Date {
    // Se for um número (timestamp em segundos), converte usando secondsToDate
    if (/^\d+$/.test(dateValue)) {
      return secondsToDate(Number(dateValue))
    }
    // Se for uma string datetime ISO, converte diretamente para Date
    return new Date(dateValue)
  }

  async index(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = this.getUserId(request)
      const filters = request.query as EntryFiltersSchema

      request.log.info(
        { userId, filters },
        `Listando ${this.entityNamePlural} do usuario`,
      )

      const result = await this.entryService.findMany(userId, {
        page: filters.page || 1,
        limit: filters.limit || 20,
        type: filters.type,
        categoryId: filters.categoryId,
        accountId: filters.accountId,
        creditCardId: filters.creditCardId,
        startDate: filters.startDate
          ? this.parseFilterDate(filters.startDate)
          : undefined,
        endDate: filters.endDate
          ? this.parseFilterDate(filters.endDate)
          : undefined,
        search: filters.search,
        viewMode: filters.viewMode,
      })

      request.log.info(
        {
          userId,
          totalEntries: result.entries.length,
          totalPages: result.pagination.totalPages,
        },
        `${this.entityNamePlural} listadas com sucesso`,
      )

      // Convert data to match response schema
      // O schema espera o summary diretamente, não aninhado
      let convertedSummary
      if (result.summary) {
        if (filters.viewMode === 'cashflow' && result.summary.cashflow) {
          // Para viewMode 'cashflow', usar os campos completos do objeto 'cashflow'
          convertedSummary = result.summary.cashflow
        } else if (filters.viewMode === 'all' && result.summary.all) {
          // Para viewMode 'all', extrair os campos do objeto 'all'
          convertedSummary = result.summary.all
        }
      }

      const convertedResult = this.convertNullToUndefined({
        ...result,
        summary: convertedSummary,
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
      })

      return reply.status(200).send(convertedResult)
    } catch (error: any) {
      request.log.error(
        { error: error.message, stack: error.stack },
        `Erro ao listar ${this.entityNamePlural}`,
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async show(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = this.getUserId(request)
      const { id } = this.getPathParams<IdParamSchema>(request)

      request.log.info(
        { userId, entryId: id },
        `Buscando ${this.entityName} por ID`,
      )

      const entry = await this.entryService.findById(id, userId)

      request.log.info(
        { userId, entryId: entry.id },
        `${this.entityName} encontrada com sucesso`,
      )

      // Convert data to match response schema
      const convertedEntry = this.convertNullToUndefined({
        ...entry,
        amount: entry.amount.toString(), // Convert Decimal to string
        date: entry.date ? dateToSeconds(entry.date) : undefined, // Convert Date to secunds
        createdAt: entry.createdAt ? dateToSeconds(entry.createdAt) : undefined,
        updatedAt: entry.updatedAt ? dateToSeconds(entry.updatedAt) : undefined,
        creditCardId: entry.creditCardId || '', // Convert null to empty string
      })

      return reply.status(200).send(convertedEntry)
    } catch (error: any) {
      request.log.error(
        {
          error: error.message,
        },
        `Erro ao buscar ${this.entityName}`,
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async store(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = this.getUserId(request)
      const data = request.body as EntryCreateSchema

      request.log.info(
        { userId, entryData: data },
        `Criando novo ${this.entityName}`,
      )

      // Convert date from seconds to Date and amount from string to number before saving to database
      const processedData = {
        ...data,
        amount: parseFloat(data.amount || '0'),
        date: data.date ? secondsToDate(data.date) : new Date(),
      } as any // Temporary type assertion to bypass type checking

      const entry = await this.entryService.create(processedData, userId)

      request.log.info(
        { entryId: entry.id, description: entry.description },
        `${this.entityName} criada com sucesso`,
      )

      // Convert data to match response schema
      const convertedEntry = this.convertNullToUndefined({
        ...entry,
        amount: entry.amount.toString(), // Convert Decimal to string
        date: entry.date ? dateToSeconds(entry.date) : undefined, // Convert Date to secunds
        createdAt: entry.createdAt ? dateToSeconds(entry.createdAt) : undefined,
        updatedAt: entry.updatedAt ? dateToSeconds(entry.updatedAt) : undefined,
        creditCardId: entry.creditCardId || '', // Convert null to empty string
      })

      return reply.status(201).send(convertedEntry)
    } catch (error: any) {
      request.log.error(
        { error: error.message },
        `Erro ao criar ${this.entityName}`,
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = this.getUserId(request)
      const { id } = this.getPathParams<IdParamSchema>(request)
      const data = request.body as EntryUpdateSchema

      request.log.info(
        { userId, entryId: id, updateData: data },
        `Atualizando ${this.entityName}`,
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
        `${this.entityName} atualizada com sucesso`,
      )

      // Convert data to match response schema
      const convertedEntry = this.convertNullToUndefined({
        ...entry,
        amount: entry.amount.toString(), // Convert Decimal to string
        date: entry.date ? dateToSeconds(entry.date) : undefined, // Convert Date to secunds
        createdAt: entry.createdAt ? dateToSeconds(entry.createdAt) : undefined,
        updatedAt: entry.updatedAt ? dateToSeconds(entry.updatedAt) : undefined,
        creditCardId: entry.creditCardId || '', // Convert null to empty string
      })

      return reply.status(200).send(convertedEntry)
    } catch (error: any) {
      request.log.error(
        {
          error: error.message,
        },
        `Erro ao atualizar ${this.entityName}`,
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async patch(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = this.getUserId(request)
      const { id } = this.getPathParams<IdParamSchema>(request)
      const data = request.body as EntryPatchSchema

      request.log.info(
        { userId, entryId: id, patchData: data },
        `Atualizando ${this.entityName} parcialmente`,
      )

      // Convert only provided fields
      const processedData: any = {}

      if (data.amount !== undefined) {
        processedData.amount = parseFloat(data.amount || '0')
      }

      if (data.date !== undefined) {
        processedData.date = secondsToDate(data.date)
      }

      // Copy other fields directly if provided
      if (data.description !== undefined)
        processedData.description = data.description
      if (data.type !== undefined) processedData.type = data.type
      if (data.categoryId !== undefined)
        processedData.categoryId = data.categoryId
      if (data.accountId !== undefined) processedData.accountId = data.accountId
      if (data.creditCardId !== undefined)
        processedData.creditCardId = data.creditCardId
      if (data.paid !== undefined) processedData.paid = data.paid

      const entry = await this.entryService.update(id, processedData, userId)

      request.log.info(
        { entryId: entry.id, description: entry.description },
        `${this.entityName} atualizada parcialmente com sucesso`,
      )

      // Convert data to match response schema
      const convertedEntry = this.convertNullToUndefined({
        ...entry,
        amount: entry.amount.toString(), // Convert Decimal to string
        date: entry.date ? dateToSeconds(entry.date) : undefined, // Convert Date to seconds
        createdAt: entry.createdAt ? dateToSeconds(entry.createdAt) : undefined,
        updatedAt: entry.updatedAt ? dateToSeconds(entry.updatedAt) : undefined,
        creditCardId: entry.creditCardId || '', // Convert null to empty string
      })

      return reply.status(200).send(convertedEntry)
    } catch (error: any) {
      request.log.error(
        {
          error: error.message,
        },
        `Erro ao atualizar ${this.entityName} parcialmente`,
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async destroy(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = this.getUserId(request)
      const { id } = request.params as IdParamSchema

      request.log.info({ userId, entryId: id }, `Deletando ${this.entityName}`)

      await this.entryService.delete(id, userId)

      request.log.info(
        { entryId: id },
        `${this.entityName} deletada com sucesso`,
      )

      return reply.status(204).send()
    } catch (error: any) {
      request.log.error(
        {
          error: error.message,
        },
        `Erro ao deletar ${this.entityName}`,
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async deleteAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = this.getUserId(request)

      request.log.info(
        { userId },
        `Excluindo todas as ${this.entityNamePlural} do usuário`,
      )

      const result = await this.entryService.deleteAllByUserId(userId)

      request.log.info(
        { userId, deletedCount: result.deletedCount },
        `Todas as ${this.entityNamePlural} excluídas com sucesso`,
      )

      return reply.status(200).send({
        message: result.message,
        deletedCount: result.deletedCount,
      })
    } catch (error: any) {
      request.log.error(
        {
          error: error.message,
        },
        `Erro ao excluir todas as ${this.entityNamePlural}`,
      )
      return handleError(error as FastifyError, reply)
    }
  }
}
