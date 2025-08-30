import { User, UserRole, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { BaseService } from './base.service'
import * as bcrypt from 'bcryptjs'

export interface UserCreateData {
  email: string
  name: string
  password: string
  role?: UserRole
  planId?: string
  avatarUrl?: string
}

export interface UserUpdateData {
  name?: string
  email?: string
  role?: UserRole
  planId?: string
  avatarUrl?: string
  passwordConfigured?: boolean
}

export interface UserWithPlan extends User {
  plan?: {
    id: string
    name: string
    type: string
    price: number
  } | null
  _count?: {
    accounts: number
    categories: number
    creditCards: number
    entries: number
  }
}

export interface UserFilters {
  role?: UserRole
  planId?: string
  search?: string
  page?: number
  limit?: number
}

export class UserManagementService {
  protected prisma = prisma

  protected calculatePagination(
    total: number,
    page: number,
    limit: number,
  ) {
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

  async getAll(filters?: UserFilters): Promise<{
    users: UserWithPlan[]
    pagination?: any
  }> {
    const page = filters?.page || 1
    const limit = filters?.limit || 20
    const skip = (page - 1) * limit

    const where: Prisma.UserWhereInput = {}

    if (filters?.role) {
      where.role = filters.role
    }

    if (filters?.planId) {
      where.planId = filters.planId
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          plan: {
            select: {
              id: true,
              name: true,
              type: true,
              price: true,
            },
          },
          _count: {
            select: {
              accounts: true,
              categories: true,
              creditCards: true,
              entries: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count({ where }),
    ])

    const pagination = this.calculatePagination(total, page, limit)

    return {
      users,
      pagination,
    }
  }

  async getById(id: string): Promise<UserWithPlan | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            type: true,
            price: true,
          },
        },
        _count: {
          select: {
            accounts: true,
            categories: true,
            creditCards: true,
            entries: true,
          },
        },
      },
    })
  }

  async create(data: UserCreateData): Promise<User> {
    // Verificar se email já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      throw new Error('Email já está em uso')
    }

    // Verificar se o plano existe (se fornecido)
    if (data.planId) {
      const plan = await this.prisma.plan.findUnique({
        where: { id: data.planId },
      })

      if (!plan || !plan.isActive) {
        throw new Error('Plano não encontrado ou inativo')
      }
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(data.password, 10)

    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: passwordHash,
        passwordConfigured: true,
        role: data.role || 'user',
        planId: data.planId,
        avatarUrl: data.avatarUrl,
      },
    })
  }

  async update(id: string, data: UserUpdateData): Promise<User> {
    const existingUser = await this.getById(id)
    if (!existingUser) {
      throw new Error('Usuário não encontrado')
    }

    // Verificar se email já existe (se fornecido)
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: data.email },
      })

      if (emailExists) {
        throw new Error('Email já está em uso')
      }
    }

    // Verificar se o plano existe (se fornecido)
    if (data.planId) {
      const plan = await this.prisma.plan.findUnique({
        where: { id: data.planId },
      })

      if (!plan || !plan.isActive) {
        throw new Error('Plano não encontrado ou inativo')
      }
    }

    return this.prisma.user.update({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<void> {
    const existingUser = await this.getById(id)
    if (!existingUser) {
      throw new Error('Usuário não encontrado')
    }

    // Verificar se é o último admin
    if (existingUser.role === 'admin') {
      const adminCount = await this.prisma.user.count({
        where: { role: 'admin' },
      })

      if (adminCount <= 1) {
        throw new Error('Não é possível excluir o último administrador')
      }
    }

    await this.prisma.user.delete({
      where: { id },
    })
  }

  async changePassword(id: string, newPassword: string): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, 10)
    
    await this.prisma.user.update({
      where: { id },
      data: {
        password: passwordHash,
        passwordConfigured: true,
      },
    })
  }

  async changePlan(userId: string, newPlanId: string): Promise<User> {
    // Verificar se o plano existe
    const plan = await this.prisma.plan.findUnique({
      where: { id: newPlanId },
    })

    if (!plan || !plan.isActive) {
      throw new Error('Plano não encontrado ou inativo')
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { planId: newPlanId },
    })
  }

  async getUserStats() {
    const [
      totalUsers,
      adminUsers,
      activeUsers,
      usersByPlan,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'admin' } }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // últimos 30 dias
          },
        },
      }),
      this.prisma.user.groupBy({
        by: ['planId'],
        _count: {
          id: true,
        },
      }),
    ])

    return {
      totalUsers,
      adminUsers,
      regularUsers: totalUsers - adminUsers,
      activeUsers,
      usersByPlan,
    }
  }
}
