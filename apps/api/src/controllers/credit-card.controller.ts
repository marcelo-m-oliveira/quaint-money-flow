/* eslint-disable @typescript-eslint/no-explicit-any */
import { dateToSeconds } from '@saas/utils'
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { id } from 'zod/locales'

import { CreditCardService } from '@/services/credit-card.service'
import { handleError } from '@/utils/errors'

import type {
  CreditCardCreateSchema,
  IdParamSchema,
  PaginationSchema,
} from '../utils/schemas'

interface CreditCardFilters extends PaginationSchema {}

export class CreditCardController {
  constructor(private creditCardService: CreditCardService) {}

  async index(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const filters = request.query as CreditCardFilters

      request.log.info(
        { userId, filters },
        'Listando cartoes de credito do usuario',
      )
      const result = await this.creditCardService.findMany(userId, {
        page: filters.page || 1,
        limit: filters.limit || 20,
      })
      request.log.info(
        {
          userId,
          totalCreditCards: result.creditCards.length,
          totalPages: result.pagination.totalPages,
        },
        'Cartoes de credito listados com sucesso',
      )

      // Convert dates to seconds and limit/usage to number for frontend
      const convertedResult = {
        ...result,
        creditCards: result.creditCards.map((creditCard) => ({
          ...creditCard,
          limit: Number(creditCard.limit),
          usage: Number(creditCard.usage || 0),
          createdAt: dateToSeconds(creditCard.createdAt),
          updatedAt: dateToSeconds(creditCard.updatedAt),
        })),
      }

      return reply.status(200).send(convertedResult)
    } catch (error: any) {
      request.log.error(
        { error: error.message },
        'Erro ao listar cartões de crédito',
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async show(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const { id } = request.params as IdParamSchema

      request.log.info(
        { userId, creditCardId: id },
        'Buscando cartao de credito por ID',
      )
      const creditCard = await this.creditCardService.findById(id, userId)

      // Convert dates to seconds and limit/usage to number for frontend
      const convertedCreditCard = {
        ...creditCard,
        limit: Number(creditCard.limit),
        usage: 0,
        createdAt: dateToSeconds(creditCard.createdAt),
        updatedAt: dateToSeconds(creditCard.updatedAt),
      }

      return reply.status(200).send(convertedCreditCard)
    } catch (error: any) {
      request.log.error(
        { userId: request.user.sub, creditCardId: id, error: error.message },
        'Erro ao buscar cartão de crédito',
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async store(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const data = request.body as CreditCardCreateSchema

      request.log.info(
        { userId, creditCardData: data },
        'Criando novo cartao de credito',
      )
      const creditCard = await this.creditCardService.create(data, userId)
      request.log.info(
        { creditCardId: creditCard.id, name: creditCard.name },
        'Cartao de credito criado com sucesso',
      )

      // Convert dates to seconds and limit to number for frontend
      const convertedCreditCard = {
        ...creditCard,
        limit: Number(creditCard.limit),
        usage: 0,
        createdAt: dateToSeconds(creditCard.createdAt),
        updatedAt: dateToSeconds(creditCard.updatedAt),
      }

      return reply.status(201).send(convertedCreditCard)
    } catch (error: any) {
      request.log.error(
        { userId: request.user.sub, error: error.message },
        'Erro ao criar cartão de crédito',
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const { id } = request.params as IdParamSchema
      const data = request.body as CreditCardCreateSchema

      request.log.info(
        { userId, creditCardId: id, updateData: data },
        'Atualizando cartao de credito',
      )
      const creditCard = await this.creditCardService.update(id, data, userId)
      request.log.info(
        { creditCardId: creditCard.id, name: creditCard.name },
        'Cartao de credito atualizado com sucesso',
      )

      // Convert dates to seconds and limit to number for frontend
      const convertedCreditCard = {
        ...creditCard,
        limit: Number(creditCard.limit),
        usage: 0,
        createdAt: dateToSeconds(creditCard.createdAt),
        updatedAt: dateToSeconds(creditCard.updatedAt),
      }

      return reply.status(200).send(convertedCreditCard)
    } catch (error: any) {
      request.log.error(
        { userId: request.user.sub, creditCardId: id, error: error.message },
        'Erro ao atualizar cartao de credito',
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async destroy(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const { id } = request.params as IdParamSchema

      request.log.info(
        { userId, creditCardId: id },
        'Deletando cartao de credito',
      )
      await this.creditCardService.delete(id, userId)
      request.log.info(
        { creditCardId: id },
        'Cartao de credito deletado com sucesso',
      )

      return reply.status(204).send()
    } catch (error: any) {
      request.log.error(
        { userId: request.user.sub, creditCardId: id, error: error.message },
        'Erro ao deletar cartão de crédito',
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async usage(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const { id } = request.params as IdParamSchema

      const usage = await this.creditCardService.getUsage(id, userId)

      return reply.status(200).send(usage)
    } catch (error) {
      return handleError(error as FastifyError, reply)
    }
  }
}
