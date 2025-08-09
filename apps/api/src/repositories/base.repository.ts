/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client'

export abstract class BaseRepository<TModel extends keyof PrismaClient> {
  protected prisma: PrismaClient
  protected model: TModel

  constructor(prisma: PrismaClient, model: TModel) {
    this.prisma = prisma
    this.model = model
  }

  // Métodos básicos CRUD que podem ser sobrescritos pelas classes filhas
  async findById(id: string) {
    return (this.prisma[this.model] as any).findUnique({
      where: { id },
    })
  }

  async findMany(options?: any) {
    return (this.prisma[this.model] as any).findMany(options)
  }

  async create(data: any) {
    return (this.prisma[this.model] as any).create({
      data,
    })
  }

  async update(id: string, data: any) {
    return (this.prisma[this.model] as any).update({
      where: { id },
      data,
    })
  }

  async delete(id: string) {
    return (this.prisma[this.model] as any).delete({
      where: { id },
    })
  }

  async count(options?: any) {
    return (this.prisma[this.model] as any).count(options)
  }

  async deleteMany(options?: any) {
    return (this.prisma[this.model] as any).deleteMany(options)
  }
}
