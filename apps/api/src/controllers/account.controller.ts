import { FastifyReply, FastifyRequest } from 'fastify'

import { BaseController } from '@/controllers/base.controller'
import { AccountService } from '@/services/account.service'
import {
  convertArrayDatesToSeconds,
  convertDatesToSeconds,
} from '@/utils/response'

import type {
  AccountCreateSchema,
  AccountUpdateSchema,
  IdParamSchema,
  PaginationSchema,
} from '../utils/schemas'

interface AccountFilters extends PaginationSchema {
  type?: string
  includeInGeneralBalance?: boolean
  search?: string
}

export class AccountController extends BaseController {
  constructor(private accountService: AccountService) {
    super({ entityName: 'Conta', entityNamePlural: 'Contas' })
  }

  async index(request: FastifyRequest, reply: FastifyReply) {
    return this.handlePaginatedRequest(
      request,
      reply,
      async () => {
        const userId = this.getUserId(request)
        const filters = this.getQueryParams<AccountFilters>(request)

        const result = await this.accountService.findMany(userId, {
          type: filters.type,
          includeInGeneralBalance: filters.includeInGeneralBalance,
          search: filters.search,
          page: filters.page || 1,
          limit: filters.limit || 20,
        })

        // Converter datas para timestamp em segundos
        const accountsWithConvertedDates = convertArrayDatesToSeconds(
          result.accounts,
        )

        return {
          items: accountsWithConvertedDates,
          pagination: result.pagination,
        }
      },
      `Listagem de ${this.entityNamePlural}`,
    )
  }

  async selectOptions(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = this.getUserId(request)
      const filters = this.getQueryParams<AccountFilters>(request)

      request.log.info(
        { userId, operation: 'selectOptions' },
        'Iniciando busca de opções de select para contas',
      )

      const result = await this.accountService.findMany(userId, {
        type: filters.type,
        includeInGeneralBalance: filters.includeInGeneralBalance,
        search: filters.search,
        page: 1,
        limit: 1000, // Buscar todas as contas para o select
      })

      // Formatar dados para o select
      const selectOptions = result.accounts.map((account) => ({
        value: account.id,
        label: account.name,
        icon: account.icon,
        iconType: account.iconType,
      }))

      request.log.info(
        {
          userId,
          operation: 'selectOptions',
          totalOptions: selectOptions.length,
        },
        'Busca de opções de select para contas concluída com sucesso',
      )

      // Retornar array diretamente, sem envolver em objeto data
      return reply.status(200).send(selectOptions)
    } catch (error: any) {
      request.log.error(
        { error: error.message, operation: 'selectOptions' },
        'Erro na busca de opções de select para contas',
      )
      throw error // Deixar o Fastify tratar o erro
    }
  }

  async show(request: FastifyRequest, reply: FastifyReply) {
    return this.handleRequest(
      request,
      reply,
      async () => {
        const userId = this.getUserId(request)
        const { id } = this.getPathParams<IdParamSchema>(request)

        const account = await this.accountService.findById(id, userId)
        return convertDatesToSeconds(account)
      },
      `Busca de ${this.entityName} específica`,
    )
  }

  async store(request: FastifyRequest, reply: FastifyReply) {
    return this.handleCreateRequest(
      request,
      reply,
      async () => {
        const userId = this.getUserId(request)
        const data = this.getBodyParams<AccountCreateSchema>(request)

        const account = await this.accountService.create(data, userId)
        return convertDatesToSeconds(account)
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
        const data = this.getBodyParams<AccountUpdateSchema>(request)

        const account = await this.accountService.update(id, data, userId)
        return convertDatesToSeconds(account)
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

        await this.accountService.delete(id, userId)
      },
      `Exclusão de ${this.entityName}`,
    )
  }

  async balance(request: FastifyRequest, reply: FastifyReply) {
    return this.handleRequest(
      request,
      reply,
      async () => {
        const userId = this.getUserId(request)
        const { id } = this.getPathParams<IdParamSchema>(request)

        const balanceData = await this.accountService.getBalance(id, userId)
        return { balance: balanceData.balance.toString() }
      },
      `Consulta de saldo da ${this.entityName}`,
    )
  }
}
