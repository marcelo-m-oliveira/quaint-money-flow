import { PrismaClient } from '@prisma/client'

import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { NotFoundError } from '@/http/routes/_errors/not-found-error'
import { BaseRepository } from '@/repositories/base.repository'

export interface PaginationOptions {
  page: number
  limit: number
}

export interface PaginationResult {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginatedData<T> {
  items: T[]
  pagination: PaginationResult
}

export abstract class BaseService<TModel extends keyof PrismaClient> {
  protected repository: BaseRepository<TModel>
  protected prisma: PrismaClient

  constructor(repository: BaseRepository<TModel>, prisma: PrismaClient) {
    this.repository = repository
    this.prisma = prisma
  }

  protected calculatePagination(
    total: number,
    page: number,
    limit: number,
  ): PaginationResult {
    const totalPages = Math.ceil(total / limit)
    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }
  }

  protected validateUserOwnership(
    userId: string,
    entityUserId: string,
    entityName: string = 'Entidade',
  ) {
    if (userId !== entityUserId) {
      throw new BadRequestError(`${entityName} não pertence ao usuário`)
    }
  }

  protected async findByIdOrThrow(
    id: string,
    userId?: string,
    entityName: string = 'Entidade',
  ) {
    const entity = await this.repository.findById(id)

    if (!entity) {
      throw new NotFoundError(`${entityName} não encontrada`)
    }

    if (userId && entity.userId && entity.userId !== userId) {
      throw new BadRequestError(`${entityName} não pertence ao usuário`)
    }

    return entity
  }

  protected async validateUniqueConstraint(
    field: string,
    value: any,
    userId: string,
    excludeId?: string,
    entityName: string = 'Entidade',
  ) {
    const where: any = {
      [field]: value,
      userId,
    }

    if (excludeId) {
      where.id = { not: excludeId }
    }

    const existing = await this.repository.findMany({ where })

    if (existing.length > 0) {
      throw new BadRequestError(
        `${entityName} com ${field} '${value}' já existe`,
      )
    }
  }

  protected async validateForeignKey(
    repository: BaseRepository<any>,
    id: string,
    fieldName: string,
    entityName: string = 'Entidade',
  ) {
    const entity = await repository.findById(id)

    if (!entity) {
      throw new BadRequestError(
        `${entityName} com ${fieldName} '${id}' não encontrada`,
      )
    }

    return entity
  }

  protected async validateRequiredFields(
    data: Record<string, any>,
    requiredFields: string[],
    entityName: string = 'Entidade',
  ) {
    const missingFields = requiredFields.filter((field) => !data[field])

    if (missingFields.length > 0) {
      throw new BadRequestError(
        `Campos obrigatórios não informados: ${missingFields.join(', ')}`,
      )
    }
  }

  protected sanitizeData(
    data: Record<string, any>,
    allowedFields: string[],
  ): Record<string, any> {
    const sanitized: Record<string, any> = {}

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        sanitized[field] = data[field]
      }
    }

    return sanitized
  }

  protected async withTransaction<T>(operation: () => Promise<T>): Promise<T> {
    return await this.prisma.$transaction(operation)
  }

  protected logOperation(
    operation: string,
    userId: string,
    details?: Record<string, any>,
  ) {
    console.log(`[${operation}] User: ${userId}`, details || '')
  }
}
