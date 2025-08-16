/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyReply, FastifyRequest } from 'fastify'

import { BaseController } from '@/controllers/base.controller'
import { CreditCardService } from '@/services/credit-card.service'
import {
  convertArrayDatesToSeconds,
  convertDatesToSeconds,
} from '@/utils/response'

import type {
  CreditCardCreateSchema,
  CreditCardUpdateSchema,
  CreditCardFiltersSchema,
  IdParamSchema,
} from '../utils/schemas'

export class CreditCardController extends BaseController {
  constructor(private creditCardService: CreditCardService) {
    super({
      entityName: 'cartão de crédito',
      entityNamePlural: 'cartões de crédito',
    })
  }

  async index(request: FastifyRequest, reply: FastifyReply) {
    return this.handlePaginatedRequest(
      request,
      reply,
      async () => {
        const userId = this.getUserId(request)
        const filters = this.getQueryParams<CreditCardFiltersSchema>(request)

        const result = await this.creditCardService.findMany(userId, {
          search: filters.search,
          page: filters.page || 1,
          limit: filters.limit || 20,
        })

        // Converter datas para timestamp em segundos e formatar números
        const creditCardsWithConvertedDates = result.creditCards.map((creditCard) => ({
          ...convertDatesToSeconds(creditCard),
          limit: Number(creditCard.limit),
          usage: Number(creditCard.usage || 0),
          availableLimit: Number(creditCard.availableLimit || 0),
        }))

        return {
          items: creditCardsWithConvertedDates,
          pagination: result.pagination,
        }
      },
      `Listagem de ${this.entityNamePlural}`,
    )
  }

  async selectOptions(request: FastifyRequest, reply: FastifyReply) {
    return this.handleRequest(
      request,
      reply,
      async () => {
        const userId = this.getUserId(request)
        const filters = this.getQueryParams<CreditCardFiltersSchema>(request)

        const result = await this.creditCardService.findMany(userId, {
          search: filters.search,
          page: 1,
          limit: 1000, // Buscar todos os cartões para o select
        })

        // Formatar dados para o select
        return result.creditCards.map((creditCard) => ({
          value: creditCard.id,
          label: creditCard.name,
          icon: creditCard.icon,
          iconType: creditCard.iconType,
        }))
      },
      `Busca de opções de select para ${this.entityNamePlural}`,
    )
  }

  async show(request: FastifyRequest, reply: FastifyReply) {
    return this.handleRequest(
      request,
      reply,
      async () => {
        const userId = this.getUserId(request)
        const { id } = this.getPathParams<IdParamSchema>(request)

        const creditCard = await this.creditCardService.findById(id, userId)

        // Converter datas para timestamp em segundos e formatar números
        return {
          ...convertDatesToSeconds(creditCard),
          limit: Number(creditCard.limit),
          usage: 0, // Será calculado separadamente se necessário
        }
      },
      `Busca de ${this.entityName} específico`,
    )
  }

  async store(request: FastifyRequest, reply: FastifyReply) {
    return this.handleCreateRequest(
      request,
      reply,
      async () => {
        const userId = this.getUserId(request)
        const data = this.getBodyParams<CreditCardCreateSchema>(request)

        const creditCard = await this.creditCardService.create(data, userId)

        // Converter datas para timestamp em segundos e formatar números
        return {
          ...convertDatesToSeconds(creditCard),
          limit: Number(creditCard.limit),
          usage: 0,
        }
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
        const data = this.getBodyParams<CreditCardUpdateSchema>(request)

        const creditCard = await this.creditCardService.update(id, data, userId)

        // Converter datas para timestamp em segundos e formatar números
        return {
          ...convertDatesToSeconds(creditCard),
          limit: Number(creditCard.limit),
          usage: 0,
        }
      },
      `Atualização de ${this.entityName}`,
    )
  }

  async destroy(request: FastifyRequest, reply: FastifyReply) {
    return this.handleDeleteRequest(
      request,
      reply,
      async () => {
        const userId = this.getUserId(request)
        const { id } = this.getPathParams<IdParamSchema>(request)

        await this.creditCardService.delete(id, userId)
      },
      `Exclusão de ${this.entityName}`,
    )
  }

  async usage(request: FastifyRequest, reply: FastifyReply) {
    return this.handleRequest(
      request,
      reply,
      async () => {
        const userId = this.getUserId(request)
        const { id } = this.getPathParams<IdParamSchema>(request)

        const usageData = await this.creditCardService.getUsage(id, userId)
        return { usage: usageData.usage.toString() }
      },
      `Uso do ${this.entityName}`,
    )
  }
}
