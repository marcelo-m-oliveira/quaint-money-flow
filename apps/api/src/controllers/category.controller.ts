import { Category } from '@prisma/client'
import { dateToSeconds } from '@saas/utils'
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'

import { BaseController } from '@/controllers/base.controller'
import { CategoryService } from '@/services/category.service'
import { handleError } from '@/utils/errors'
import {
  CategoryCreateSchema,
  CategoryUpdateSchema,
  IdParamSchema,
  PaginationSchema,
} from '@/utils/schemas'

interface CategoryFilters extends PaginationSchema {
  type?: 'income' | 'expense'
}

export class CategoryController extends BaseController {
  constructor(private categoryService: CategoryService) {
    super({ entityName: 'Categoria', entityNamePlural: 'Categorias' })
  }

  async index(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = this.getUserId(request)
      const filters = this.getQueryParams<CategoryFilters>(request)

      const result = await this.categoryService.findMany(userId, {
        page: filters.page || 1,
        limit: filters.limit || 20,
        type: filters.type,
      })

      const categoriesWithConvertedDates = result.categories.map(
        (category: Category) => ({
          ...category,
          createdAt: category.createdAt
            ? dateToSeconds(category.createdAt)
            : undefined,
          updatedAt: category.updatedAt
            ? dateToSeconds(category.updatedAt)
            : undefined,
        }),
      )

      return reply.status(200).send({
        data: categoriesWithConvertedDates,
        pagination: result.pagination,
      })
    } catch (error: any) {
      request.log.error(
        { error: error.message, stack: error.stack },
        'Erro ao listar categorias',
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async select(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = this.getUserId(request)
      const { type } = request.query as { type?: 'income' | 'expense' }

      request.log.info(
        { userId, type },
        'Buscando opcoes de categoria para select',
      )

      const options = await this.categoryService.findForSelect(userId, type)

      request.log.info(
        { userId, totalOptions: options.length },
        'Opcoes de select retornadas com sucesso',
      )

      return reply.status(200).send(options)
    } catch (error: any) {
      request.log.error(
        { error: error.message, stack: error.stack },
        'Erro ao buscar opções de categoria',
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async usage(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = this.getUserId(request)

      request.log.info(
        { userId },
        'Buscando estatisticas de uso das categorias',
      )

      const usage = await this.categoryService.getUsageStats(userId)

      request.log.info(
        { userId, totalCategories: usage.length },
        'Estatisticas de uso retornadas com sucesso',
      )

      return reply.status(200).send(usage)
    } catch (error: any) {
      request.log.error(
        { error: error.message, stack: error.stack },
        'Erro ao buscar estatísticas de uso',
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async show(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = this.getUserId(request)
      const { id } = this.getPathParams<IdParamSchema>(request)

      const category = await this.categoryService.findById(id, userId)

      // Convert dates to seconds for frontend
      const convertedCategory = {
        ...category,
        createdAt: category.createdAt
          ? dateToSeconds(category.createdAt)
          : undefined,
        updatedAt: category.updatedAt
          ? dateToSeconds(category.updatedAt)
          : undefined,
      }

      return reply.status(200).send(convertedCategory)
    } catch (error: any) {
      request.log.error(
        {
          error: error.message,
          stack: error.stack,
        },
        'Erro ao buscar categoria',
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async store(request: FastifyRequest, reply: FastifyReply) {
    return this.handleCreateRequest(
      request,
      reply,
      async () => {
        const userId = this.getUserId(request)
        const data = this.getBodyParams<CategoryCreateSchema>(request)

        const category = await this.categoryService.create(data, userId)

        // Convert dates to seconds for frontend
        const convertedCategory = {
          ...category,
          createdAt: category.createdAt
            ? dateToSeconds(category.createdAt)
            : undefined,
          updatedAt: category.updatedAt
            ? dateToSeconds(category.updatedAt)
            : undefined,
        }

        return convertedCategory
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
        const data = this.getBodyParams<CategoryUpdateSchema>(request)

        const category = await this.categoryService.update(id, data, userId)

        // Convert dates to seconds for frontend
        return {
          ...category,
          createdAt: category.createdAt
            ? dateToSeconds(category.createdAt)
            : undefined,
          updatedAt: category.updatedAt
            ? dateToSeconds(category.updatedAt)
            : undefined,
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

        await this.categoryService.delete(id, userId)
      },
      `Exclusão de ${this.entityName}`,
    )
  }
}
