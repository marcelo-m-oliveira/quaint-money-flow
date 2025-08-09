/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { id } from 'zod/v4/locales'

import { AccountService } from '@/services/account.service'
import { handleError } from '@/utils/errors'

import type {
  AccountCreateSchema,
  IdParamSchema,
  PaginationSchema,
} from '../utils/schemas'

interface AccountFilters extends PaginationSchema {
  type?: string
  includeInGeneralBalance?: boolean
}

export class AccountController {
  constructor(private accountService: AccountService) {}

  async index(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const filters = request.query as AccountFilters

      request.log.info({ userId, filters }, 'Listando contas do usuário')
      const result = await this.accountService.findMany(userId, {
        type: filters.type,
        includeInGeneralBalance: filters.includeInGeneralBalance,
        page: filters.page || 1,
        limit: filters.limit || 20,
      })
      request.log.info(
        {
          userId,
          totalAccounts: result.accounts.length,
          totalPages: result.pagination.totalPages,
        },
        'Contas listadas com sucesso',
      )

      return reply.status(200).send(result)
    } catch (error: any) {
      request.log.error({ error: error.message }, 'Erro ao listar contas')
      return handleError(error as FastifyError, reply)
    }
  }

  async show(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const { id } = request.params as IdParamSchema

      request.log.info({ userId, accountId: id }, 'Buscando conta por ID')
      const account = await this.accountService.findById(id, userId)

      return reply.status(200).send(account)
    } catch (error: any) {
      request.log.error(
        { userId: request.user.sub, accountId: id, error: error.message },
        'Erro ao buscar conta',
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async store(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const data = request.body as AccountCreateSchema

      request.log.info({ userId, accountData: data }, 'Criando nova conta')
      const account = await this.accountService.create(data, userId)
      request.log.info(
        { accountId: account.id, name: account.name },
        'Conta criada com sucesso',
      )

      return reply.status(201).send(account)
    } catch (error: any) {
      request.log.error(
        { userId: request.user.sub, error: error.message },
        'Erro ao criar conta',
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const { id } = request.params as IdParamSchema
      const data = request.body as AccountCreateSchema

      request.log.info(
        { userId, accountId: id, updateData: data },
        'Atualizando conta',
      )
      const account = await this.accountService.update(id, data, userId)
      request.log.info(
        { accountId: account.id, name: account.name },
        'Conta atualizada com sucesso',
      )

      return reply.status(200).send(account)
    } catch (error: any) {
      request.log.error(
        { userId: request.user.sub, accountId: id, error: error.message },
        'Erro ao atualizar conta',
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async destroy(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const { id } = request.params as IdParamSchema

      request.log.info({ userId, accountId: id }, 'Deletando conta')
      await this.accountService.delete(id, userId)
      request.log.info({ accountId: id }, 'Conta deletada com sucesso')

      return reply.status(204).send()
    } catch (error: any) {
      request.log.error(
        { userId: request.user.sub, accountId: id, error: error.message },
        'Erro ao deletar conta',
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async balance(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const { id } = request.params as IdParamSchema

      const balance = await this.accountService.getBalance(id, userId)

      return reply.status(200).send(balance)
    } catch (error) {
      return handleError(error as FastifyError, reply)
    }
  }
}
