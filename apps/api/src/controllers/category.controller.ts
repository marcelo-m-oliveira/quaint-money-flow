import { FastifyReply, FastifyRequest } from 'fastify'

import { CategoryService } from '../services/category.service'
import {
  CategoryCreateSchema,
  CategoryUpdateSchema,
  IdParamSchema,
} from '../utils/schemas'

export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  async index(request: FastifyRequest, reply: FastifyReply) {
    try {
      const categories = await this.categoryService.findAll()
      return reply.send(categories)
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao buscar categorias' })
    }
  }

  async select(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { type } = request.query as { type?: 'income' | 'expense' }
      const categories = await this.categoryService.findForSelect(type)
      return reply.send(categories)
    } catch (error) {
      return reply
        .status(500)
        .send({ error: 'Erro ao buscar opções de categoria' })
    }
  }

  async usage(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usage = await this.categoryService.getUsageStats()
      return reply.send(usage)
    } catch (error) {
      return reply
        .status(500)
        .send({ error: 'Erro ao buscar estatísticas de uso' })
    }
  }

  async show(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as IdParamSchema
      const category = await this.categoryService.findById(id)

      if (!category) {
        return reply.status(404).send({ error: 'Categoria não encontrada' })
      }

      return reply.send(category)
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao buscar categoria' })
    }
  }

  async store(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = request.body as CategoryCreateSchema
      const category = await this.categoryService.create(data)
      return reply.status(201).send(category)
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao criar categoria' })
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as IdParamSchema
      const data = request.body as CategoryUpdateSchema
      const category = await this.categoryService.update(id, data)

      if (!category) {
        return reply.status(404).send({ error: 'Categoria não encontrada' })
      }

      return reply.send(category)
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao atualizar categoria' })
    }
  }

  async destroy(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as IdParamSchema
      const deleted = await this.categoryService.delete(id)

      if (!deleted) {
        return reply.status(404).send({ error: 'Categoria não encontrada' })
      }

      return reply.status(204).send()
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao excluir categoria' })
    }
  }
}
