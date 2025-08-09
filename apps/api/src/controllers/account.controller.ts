import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'

import { AccountService } from '@/services/account.service'
import { handleError } from '@/utils/errors'

import type {
  AccountFormSchema,
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

      const result = await this.accountService.findMany(userId, {
        type: filters.type,
        includeInGeneralBalance: filters.includeInGeneralBalance,
        page: filters.page || 1,
        limit: filters.limit || 20,
      })

      return reply.status(200).send(result)
    } catch (error) {
      return handleError(error as FastifyError, reply)
    }
  }

  async show(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const { id } = request.params as IdParamSchema

      const account = await this.accountService.findById(id, userId)

      return reply.status(200).send({ account })
    } catch (error) {
      return handleError(error as FastifyError, reply)
    }
  }

  async store(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const data = request.body as AccountFormSchema

      const account = await this.accountService.create(data, userId)

      return reply.status(201).send({ account })
    } catch (error) {
      return handleError(error as FastifyError, reply)
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const { id } = request.params as IdParamSchema
      const data = request.body as AccountFormSchema

      const account = await this.accountService.update(id, data, userId)

      return reply.status(200).send({ account })
    } catch (error) {
      return handleError(error as FastifyError, reply)
    }
  }

  async destroy(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const { id } = request.params as IdParamSchema

      await this.accountService.delete(id, userId)

      return reply.status(204).send()
    } catch (error) {
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
