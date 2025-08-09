/* eslint-disable @typescript-eslint/no-explicit-any */
import { dateToSeconds, secondsToDate } from '@saas/utils'
import { FastifyReply, FastifyRequest } from 'fastify'

import { TransactionService } from '../../services/transaction.service'

export class TransactionController {
  private transactionService: TransactionService

  constructor(transactionService?: TransactionService) {
    this.transactionService = transactionService || new TransactionService()
  }

  async index(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as { sub: string }).sub
      const {
        page = 1,
        limit = 10,
        type,
        categoryId,
        accountId,
        creditCardId,
        startDate,
        endDate,
        search,
      } = request.query as {
        page?: number
        limit?: number
        type?: 'income' | 'expense'
        categoryId?: string
        accountId?: string
        creditCardId?: string
        startDate?: string
        endDate?: string
        search?: string
      }

      const filters: any = {}
      if (type) filters.type = type
      if (categoryId) filters.categoryId = categoryId
      if (accountId) filters.accountId = accountId
      if (creditCardId) filters.creditCardId = creditCardId
      if (startDate) filters.startDate = secondsToDate(Number(startDate))
      if (endDate) filters.endDate = secondsToDate(Number(endDate))
      if (search) filters.search = search

      const result = await this.transactionService.findByUserId(
        userId,
        Number(page),
        Number(limit),
        filters,
      )

      // Converter datas para segundos antes de enviar para o frontend
      const convertedResult = {
        ...result,
        transactions: result.transactions.map((transaction: any) => ({
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

      return reply.send(convertedResult)
    } catch (error) {
      request.log.error(error)
      return reply.code(500).send({ error: 'Erro interno do servidor' })
    }
  }

  async show(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const userId = (request.user as { sub: string }).sub

      const transaction = await this.transactionService.findById(id, userId)

      // Converter datas para segundos antes de enviar para o frontend
      const convertedTransaction = {
        ...transaction,
        date: dateToSeconds(transaction.date),
        createdAt: dateToSeconds(transaction.createdAt),
        updatedAt: dateToSeconds(transaction.updatedAt),
      }

      return reply.send(convertedTransaction)
    } catch (error: any) {
      request.log.error(error)
      if (error.message === 'Transação não encontrada') {
        return reply.code(404).send({ error: error.message })
      }
      return reply.code(500).send({ error: 'Erro interno do servidor' })
    }
  }

  async store(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as { sub: string }).sub
      const data = request.body as any

      // Converter data de segundos para Date antes de salvar no banco
      const processedData = {
        ...data,
        date: data.date ? secondsToDate(Number(data.date)) : new Date(),
      }

      const transaction = await this.transactionService.create(
        processedData,
        userId,
      )

      // Converter datas para segundos antes de enviar para o frontend
      const convertedTransaction = {
        ...transaction,
        date: dateToSeconds(transaction.date),
        createdAt: dateToSeconds(transaction.createdAt),
        updatedAt: dateToSeconds(transaction.updatedAt),
      }

      return reply.code(201).send(convertedTransaction)
    } catch (error) {
      request.log.error(error)
      return reply.code(500).send({ error: 'Erro interno do servidor' })
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const userId = (request.user as { sub: string }).sub
      const data = request.body as any

      // Converter data de segundos para Date antes de salvar no banco
      const processedData = {
        ...data,
        ...(data.date && { date: secondsToDate(Number(data.date)) }),
      }

      const transaction = await this.transactionService.update(
        id,
        processedData,
        userId,
      )

      // Converter datas para segundos antes de enviar para o frontend
      const convertedTransaction = {
        ...transaction,
        date: dateToSeconds(transaction.date),
        createdAt: dateToSeconds(transaction.createdAt),
        updatedAt: dateToSeconds(transaction.updatedAt),
      }

      return reply.send(convertedTransaction)
    } catch (error: any) {
      request.log.error(error)
      if (error.message === 'Transação não encontrada') {
        return reply.code(404).send({ error: error.message })
      }
      return reply.code(500).send({ error: 'Erro interno do servidor' })
    }
  }

  async destroy(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const userId = (request.user as { sub: string }).sub

      await this.transactionService.delete(id, userId)
      return reply.code(204).send()
    } catch (error: any) {
      request.log.error(error)
      if (error.message === 'Transação não encontrada') {
        return reply.code(404).send({ error: error.message })
      }
      return reply.code(500).send({ error: 'Erro interno do servidor' })
    }
  }

  async destroyAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as { sub: string }).sub

      const result = await this.transactionService.deleteAllByUserId(userId)
      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.code(500).send({ error: 'Erro interno do servidor' })
    }
  }

  async destroyAllUserData(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as { sub: string }).sub

      const result = await this.transactionService.deleteAllUserData(userId)
      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.code(500).send({ error: 'Erro interno do servidor' })
    }
  }
}
