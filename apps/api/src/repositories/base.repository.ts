/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client'

export interface FindManyOptions {
  where?: any
  orderBy?: any
  skip?: number
  take?: number
  include?: any
  select?: any
}

export interface CreateOptions {
  data: any
  include?: any
  select?: any
}

export interface UpdateOptions {
  where: any
  data: any
  include?: any
  select?: any
}

export abstract class BaseRepository<TModel extends keyof PrismaClient> {
  protected prisma: PrismaClient
  protected model: TModel

  constructor(prisma: PrismaClient, model: TModel) {
    this.prisma = prisma
    this.model = model
  }

  // Métodos básicos CRUD que podem ser sobrescritos pelas classes filhas
  async findById(id: string, options?: { include?: any; select?: any }) {
    return (this.prisma[this.model] as any).findUnique({
      where: { id },
      ...options,
    })
  }

  async findFirst(where: any, options?: { include?: any; select?: any; orderBy?: any }) {
    return (this.prisma[this.model] as any).findFirst({
      where,
      ...options,
    })
  }

  async findMany(options?: FindManyOptions) {
    return (this.prisma[this.model] as any).findMany(options)
  }

  async create(data: any, options?: { include?: any; select?: any }) {
    return (this.prisma[this.model] as any).create({
      data,
      ...options,
    })
  }

  async update(id: string, data: any, options?: { include?: any; select?: any }) {
    return (this.prisma[this.model] as any).update({
      where: { id },
      data,
      ...options,
    })
  }

  async updateMany(where: any, data: any) {
    return (this.prisma[this.model] as any).updateMany({
      where,
      data,
    })
  }

  async delete(id: string) {
    return (this.prisma[this.model] as any).delete({
      where: { id },
    })
  }

  async deleteMany(where: any) {
    return (this.prisma[this.model] as any).deleteMany({
      where,
    })
  }

  async count(where?: any) {
    return (this.prisma[this.model] as any).count({
      where,
    })
  }

  async exists(where: any): Promise<boolean> {
    const count = await this.count(where)
    return count > 0
  }

  async findByIds(ids: string[], options?: { include?: any; select?: any }) {
    return (this.prisma[this.model] as any).findMany({
      where: {
        id: {
          in: ids,
        },
      },
      ...options,
    })
  }

  async findWithPagination(
    where: any,
    page: number,
    limit: number,
    orderBy?: any,
    include?: any,
    select?: any
  ) {
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      (this.prisma[this.model] as any).findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include,
        select,
      }),
      this.count(where),
    ])

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    }
  }

  async upsert(
    where: any,
    createData: any,
    updateData: any,
    options?: { include?: any; select?: any }
  ) {
    return (this.prisma[this.model] as any).upsert({
      where,
      create: createData,
      update: updateData,
      ...options,
    })
  }

  async aggregate(aggregate: any) {
    return (this.prisma[this.model] as any).aggregate(aggregate)
  }

  async groupBy(groupBy: any, having?: any, orderBy?: any, take?: number, skip?: number) {
    return (this.prisma[this.model] as any).groupBy({
      by: groupBy,
      having,
      orderBy,
      take,
      skip,
    })
  }
}
