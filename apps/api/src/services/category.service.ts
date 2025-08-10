/* eslint-disable @typescript-eslint/no-explicit-any */
import { Category, Prisma, PrismaClient } from '@prisma/client'

import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { CategoryRepository } from '@/repositories/category.repository'
import {
  CategoryCreateSchema,
  CategoryUsageSchema,
  SelectOptionSchema,
} from '@/utils/schemas'

export class CategoryService {
  constructor(
    private categoryRepository: CategoryRepository,
    private prisma: PrismaClient,
  ) {}

  // Função auxiliar para herdar propriedades do parent
  private inheritFromParent(data: any, parentCategory: Category) {
    return {
      ...data,
      color: data.parentId ? parentCategory.color : data.color,
      icon: data.parentId ? parentCategory.icon : data.icon,
    }
  }

  async findMany(
    userId: string,
    filters: {
      page: number
      limit: number
      type?: 'income' | 'expense'
    },
  ) {
    const { page, limit, type } = filters
    const skip = (page - 1) * limit

    try {
      // Buscar categorias com filtros
      const where: Prisma.CategoryWhereInput = { userId }

      if (type) {
        where.type = type
      }

      const categories = await this.categoryRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              color: true,
              icon: true,
            },
          },
          children: {
            select: {
              id: true,
              name: true,
              color: true,
              icon: true,
            },
          },
        },
      })

      // Buscar total de categorias para paginação
      const total = await this.categoryRepository.count({ where })
      const totalPages = Math.ceil(total / limit)

      return {
        categories,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
      throw error
    }
  }

  async findById(id: string, userId: string) {
    const category = await this.categoryRepository.findUnique({
      where: { id, userId },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
    })

    if (!category) {
      throw new BadRequestError('Categoria nao encontrada')
    }

    return category
  }

  async create(data: CategoryCreateSchema, userId: string) {
    // Verificar se já existe uma categoria com o mesmo nome
    const existingCategory = await this.categoryRepository.findFirst({
      where: {
        name: data.name,
        userId,
      },
    })

    if (existingCategory) {
      throw new BadRequestError('Ja existe uma categoria com este nome')
    }

    // Verificar se a categoria pai existe (se fornecida) e herdar propriedades
    let finalData = { ...data }

    if (data.parentId) {
      const parentCategory = await this.prisma.category.findUnique({
        where: {
          id: data.parentId,
          userId,
        },
      })

      if (!parentCategory) {
        throw new BadRequestError('Categoria pai nao encontrada')
      }

      // Herdar cor e ícone do parent
      finalData = this.inheritFromParent(finalData, parentCategory)
    }

    // Preparar dados para criação, removendo parentId e adicionando as conexões
    const { parentId, ...categoryData } = finalData

    return this.categoryRepository.create({
      data: {
        ...categoryData,
        user: { connect: { id: userId } },
        ...(parentId && {
          parent: { connect: { id: parentId } },
        }),
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
    })
  }

  async update(
    id: string,
    data: Partial<CategoryCreateSchema>,
    userId: string,
  ) {
    // Verificar se a categoria existe
    await this.findById(id, userId)

    // Verificar se já existe outra categoria com o mesmo nome
    if (data.name) {
      const existingCategory = await this.categoryRepository.findFirst({
        where: {
          name: data.name,
          userId,
          NOT: { id },
        },
      })

      if (existingCategory) {
        throw new BadRequestError('Ja existe uma categoria com este nome')
      }
    }

    // Verificar se a categoria pai existe (se fornecida) e herdar propriedades
    let finalData = { ...data }

    if (data.parentId) {
      const parentCategory = await this.prisma.category.findUnique({
        where: {
          id: data.parentId,
          userId,
        },
      })

      if (!parentCategory) {
        throw new BadRequestError('Categoria pai nao encontrada')
      }

      // Herdar cor e ícone do parent
      finalData = this.inheritFromParent(finalData, parentCategory)
    }

    // Preparar dados para atualização, removendo parentId
    const { parentId, ...updateData } = finalData

    // Conectar categoria pai se fornecida
    const updatePayload: any = { ...updateData }
    if (parentId) {
      updatePayload.parent = {
        connect: { id: parentId },
      }
    } else {
      updatePayload.parent = {
        disconnect: true,
      }
    }

    return this.categoryRepository.update({
      where: { id, userId },
      data: updatePayload,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
    })
  }

  async delete(id: string, userId: string) {
    // Verificar se a categoria existe
    await this.findById(id, userId)

    // Verificar se há transações associadas
    const entryCount = await this.prisma.entry.count({
      where: { categoryId: id, userId },
    })

    if (entryCount > 0) {
      throw new BadRequestError(
        'Nao e possivel excluir uma categoria que possui entries',
      )
    }

    // Verificar se há categorias filhas
    const childrenCount = await this.prisma.category.count({
      where: { parentId: id, userId },
    })

    if (childrenCount > 0) {
      throw new BadRequestError(
        'Nao e possivel excluir uma categoria que possui subcategorias',
      )
    }

    return this.categoryRepository.delete({
      where: { id, userId },
    })
  }

  async findForSelect(
    userId: string,
    type?: 'income' | 'expense',
  ): Promise<SelectOptionSchema[]> {
    try {
      const categories = await this.categoryRepository.findForSelect(
        userId,
        type,
      )
      return categories
    } catch (error) {
      console.error('Erro ao buscar opções de categoria:', error)
      throw error
    }
  }

  async getUsageStats(userId: string): Promise<CategoryUsageSchema[]> {
    try {
      return await this.categoryRepository.getUsageStats(userId)
    } catch (error) {
      console.error('Erro ao buscar estatísticas de uso:', error)
      throw error
    }
  }
}
