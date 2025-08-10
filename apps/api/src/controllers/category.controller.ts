/* eslint-disable @typescript-eslint/no-explicit-any */
import { Category, TransactionType } from '@prisma/client'
import { dateToSeconds } from '@saas/utils'
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'

import { CategoryService } from '@/services/category.service'
import { handleError } from '@/utils/errors'
import {
  CategoryCreateSchema,
  CategoryResponseSchema,
  CategoryUpdateSchema,
  IdParamSchema,
  idParamSchema,
  PaginationSchema,
} from '@/utils/schemas'

interface CategoryFilters extends PaginationSchema {
  type?: 'income' | 'expense'
}

export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  async index(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const filters = request.query as CategoryFilters

      request.log.info({ userId, filters }, 'Listando categorias do usuario')

      const result = await this.categoryService.findMany(userId, {
        page: filters.page || 1,
        limit: filters.limit || 20,
        type: filters.type,
      })

      request.log.info(
        {
          userId,
          totalCategories: result.categories.length,
          totalPages: result.pagination.totalPages,
        },
        'Categorias listadas com sucesso',
      )

      // Convert dates to seconds for frontend
      const convertedResult = {
        ...result,
        categories: result.categories.map((category: Category) => ({
          ...category,
          createdAt: dateToSeconds(category.createdAt),
          updatedAt: dateToSeconds(category.updatedAt),
        })),
      }

      return reply.status(200).send(convertedResult)
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
      const userId = request.user.sub
      const type = request.query as TransactionType

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
      const userId = request.user.sub

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
      const userId = request.user.sub
      const { id } = request.params as IdParamSchema

      request.log.info({ userId, categoryId: id }, 'Buscando categoria por ID')

      const category = await this.categoryService.findById(id, userId)

      if (!category) {
        return reply.status(404).send({ error: 'Categoria não encontrada' })
      }

      // Convert dates to seconds for frontend
      const convertedCategory = {
        ...category,
        createdAt: dateToSeconds(category.createdAt),
        updatedAt: dateToSeconds(category.updatedAt),
      }

      return reply.status(200).send(convertedCategory)
    } catch (error: any) {
      request.log.error(
        {
          userId: request.user.sub,
          categoryId: idParamSchema,
          error: error.message,
        },
        'Erro ao buscar categoria',
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async store(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const data = request.body as CategoryCreateSchema

      request.log.info({ userId, categoryData: data }, 'Criando nova categoria')

      const category = await this.categoryService.create(data, userId)

      request.log.info(
        { categoryId: category.id, name: category.name },
        'Categoria criada com sucesso',
      )

      // Convert dates to seconds for frontend
      const convertedCategory = {
        ...category,
        createdAt: dateToSeconds(category.createdAt),
        updatedAt: dateToSeconds(category.updatedAt),
      }

      return reply.status(201).send(convertedCategory)
    } catch (error: any) {
      request.log.error(
        { userId: request.user.sub, error: error.message },
        'Erro ao criar categoria',
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const { id } = request.params as IdParamSchema
      const data = request.body as CategoryUpdateSchema

      request.log.info(
        { userId, categoryId: id, updateData: data },
        'Atualizando categoria',
      )

      const category = await this.categoryService.update(id, data, userId)

      if (!category) {
        return reply.status(404).send({ error: 'Categoria não encontrada' })
      }

      request.log.info(
        { categoryId: category.id, name: category.name },
        'Categoria atualizada com sucesso',
      )

      // Convert dates to seconds for frontend
      const convertedCategory = {
        ...category,
        createdAt: dateToSeconds(category.createdAt),
        updatedAt: dateToSeconds(category.updatedAt),
      }

      return reply.status(200).send(convertedCategory)
    } catch (error: any) {
      request.log.error(
        {
          userId: request.user.sub,
          categoryId: idParamSchema,
          error: error.message,
        },
        'Erro ao atualizar categoria',
      )
      return handleError(error as FastifyError, reply)
    }
  }

  async destroy(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const { id } = request.params as IdParamSchema

      request.log.info({ userId, categoryId: id }, 'Deletando categoria')

      await this.categoryService.delete(id, userId)

      request.log.info({ categoryId: id }, 'Categoria deletada com sucesso')

      return reply.status(204).send()
    } catch (error: any) {
      request.log.error(
        {
          userId: request.user.sub,
          categoryId: idParamSchema,
          error: error.message,
        },
        'Erro ao deletar categoria',
      )
      return handleError(error as FastifyError, reply)
    }
  }
}
