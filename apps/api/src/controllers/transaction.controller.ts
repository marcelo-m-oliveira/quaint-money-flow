/* eslint-disable @typescript-eslint/no-explicit-any */
import { dateToSeconds, secondsToDate } from '@saas/utils'
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'

import { TransactionService } from '@/services/transaction.service'
import { handleError } from '@/utils/errors'
import {
  IdParamSchema,
  idParamSchema,
  PaginationSchema,
  TransactionCreateSchema,
  TransactionUpdateSchema,
} from '@/utils/schemas'

interface TransactionFilters extends PaginationSchema {
  type?: 'income' | 'expense'
  categoryId?: string
  accountId?: string
  creditCardId?: string
  startDate?: string
  endDate?: string
  search?: string
}

export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  async index(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const filters = request.query as TransactionFilters

      request.log.info({ userId, filters }, 'Listando transações do usuario')

      const result = await this.transactionService.findMany(userId, {
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
          totalTransactions: result.transactions.length,
          totalPages: result.pagination.totalPages,
        },
        'Transações listadas com sucesso',
      )

      // Convert dates to seconds for frontend
      const convertedResult = {
        ...result,
        transactions: result.transactions.map((transaction) => ({
          ...transaction,
          date: dateToSeconds(transaction.date),
          createdAt: dateToSeconds(transaction.createdAt),
          updatedAt: dateToSeconds(transaction.updatedAt),
          category: transaction.category
            ? {
                ...transaction.category,
                createdAt: dateToSeconds(transaction.category.createdAt),
                updatedAt: dateToSeconds(transaction.category.updatedAt),
              }
            : null,
          account: transaction.account
            ? {
                ...transaction.account,
                createdAt: dateToSeconds(transaction.account.createdAt),
                updatedAt: dateToSeconds(transaction.account.updatedAt),
              }
            : null,
          creditCard: transaction.creditCard
            ? {
                ...transaction.creditCard,
                createdAt: dateToSeconds(transaction.creditCard.createdAt),
                updatedAt: dateToSeconds(transaction.creditCard.updatedAt),
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

      request.log.info(
        { userId, transactionId: id },
        'Buscando transação por ID',
      )

      const transaction = await this.transactionService.findById(id, userId)

      request.log.info(
        { userId, transactionId: transaction.id },
        'Transação encontrada com sucesso',
      )

      // Convert dates to seconds for frontend
      const convertedTransaction = {
        ...transaction,
        date: dateToSeconds(transaction.date),
        createdAt: dateToSeconds(transaction.createdAt),
        updatedAt: dateToSeconds(transaction.updatedAt),
      }

      return reply.status(200).send(convertedTransaction)
    } catch (error: any) {
      request.log.error(
        {
          userId: request.user.sub,
          transactionId: idParamSchema,
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
      const data = request.body as TransactionCreateSchema

      request.log.info(
        { userId, transactionData: data },
        'Criando nova transação',
      )

      // Convert date from seconds to Date before saving to database
      const processedData = {
        ...data,
        date: data.date ? secondsToDate(Number(data.date)) : new Date(),
      }

      const transaction = await this.transactionService.create(
        processedData,
        userId,
      )

      request.log.info(
        { transactionId: transaction.id, description: transaction.description },
        'Transação criada com sucesso',
      )

      // Convert dates to seconds for frontend
      const convertedTransaction = {
        ...transaction,
        date: dateToSeconds(transaction.date),
        createdAt: dateToSeconds(transaction.createdAt),
        updatedAt: dateToSeconds(transaction.updatedAt),
      }

      return reply.status(201).send(convertedTransaction)
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
      const data = request.body as TransactionUpdateSchema

      request.log.info(
        { userId, transactionId: id, updateData: data },
        'Atualizando transação',
      )

      // Convert date from seconds to Date before saving to database
      const processedData = {
        ...data,
        ...(data.date && { date: secondsToDate(Number(data.date)) }),
      }

      const transaction = await this.transactionService.update(
        id,
        processedData,
        userId,
      )

      request.log.info(
        { transactionId: transaction.id, description: transaction.description },
        'Transação atualizada com sucesso',
      )

      // Convert dates to seconds for frontend
      const convertedTransaction = {
        ...transaction,
        date: dateToSeconds(transaction.date),
        createdAt: dateToSeconds(transaction.createdAt),
        updatedAt: dateToSeconds(transaction.updatedAt),
      }

      return reply.status(200).send(convertedTransaction)
    } catch (error: any) {
      request.log.error(
        {
          userId: request.user.sub,
          transactionId: idParamSchema,
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

      request.log.info({ userId, transactionId: id }, 'Deletando transação')

      await this.transactionService.delete(id, userId)

      request.log.info({ transactionId: id }, 'Transação deletada com sucesso')

      return reply.status(204).send()
    } catch (error: any) {
      request.log.error(
        {
          userId: request.user.sub,
          transactionId: idParamSchema,
          error: error.message,
        },
        'Erro ao deletar transação',
      )
      return handleError(error as FastifyError, reply)
    }
  }
}
