import { Prisma, PrismaClient, User, UserRole } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

import {
  UserManagementRepository,
  type UserWithPlan,
} from '@/repositories/user-management.repository'
import { BadRequestError } from '@/routes/_errors/bad-request-error'
import { BaseService } from '@/services/base.service'

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
  isActive?: boolean
}

export interface UserFilters {
  role?: UserRole
  planId?: string
  search?: string
  page?: number
  limit?: number
}

export class UserManagementService extends BaseService<'user'> {
  constructor(
    private userManagementRepository: UserManagementRepository,
    prisma: PrismaClient,
  ) {
    super(userManagementRepository, prisma)
  }

  async findMany(filters?: UserFilters): Promise<{
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
      this.userManagementRepository.findWithPlanAndCounts(where, skip, limit),
      this.userManagementRepository.count(where),
    ])

    const pagination = this.calculatePagination(total, page, limit)

    return {
      users,
      pagination,
    }
  }

  async findById(id: string): Promise<UserWithPlan> {
    const user = await this.userManagementRepository.findWithPlan(id)

    if (!user) {
      throw new BadRequestError('Usuário não encontrado')
    }

    return user
  }

  async create(data: UserCreateData): Promise<User> {
    // Verificar se já existe um usuário com o mesmo email
    const existingUser = await this.userManagementRepository.findByEmail(
      data.email,
    )

    if (existingUser) {
      throw new BadRequestError('Já existe um usuário com este email')
    }

    // Verificar se o plano existe (se fornecido)
    if (data.planId) {
      await this.validateForeignKey(
        this.prisma.plan as any,
        data.planId,
        'planId',
        'Plano',
      )
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await this.userManagementRepository.create({
      email: data.email,
      name: data.name,
      password: hashedPassword,
      role: data.role || 'user',
      planId: data.planId,
      avatarUrl: data.avatarUrl,
      passwordConfigured: true,
      isActive: true,
    })

    this.logOperation('CREATE_USER', 'admin', {
      userId: user.id,
      userEmail: user.email,
    })

    return user
  }

  async update(id: string, data: UserUpdateData): Promise<User> {
    // Verificar se o usuário existe
    await this.findById(id)

    const updateData: any = {}

    if (data.name !== undefined) {
      updateData.name = data.name
    }

    if (data.email !== undefined) {
      // Verificar se já existe outro usuário com o mesmo email
      const duplicateUser =
        await this.userManagementRepository.findByEmailExcludingId(
          data.email,
          id,
        )

      if (duplicateUser) {
        throw new BadRequestError('Já existe um usuário com este email')
      }

      updateData.email = data.email
    }

    if (data.role !== undefined) {
      updateData.role = data.role
    }

    if (data.planId !== undefined) {
      if (data.planId) {
        // Verificar se o plano existe
        await this.validateForeignKey(
          this.prisma.plan as any,
          data.planId,
          'planId',
          'Plano',
        )
      }
      updateData.planId = data.planId
    }

    if (data.avatarUrl !== undefined) {
      updateData.avatarUrl = data.avatarUrl
    }

    if (data.passwordConfigured !== undefined) {
      updateData.passwordConfigured = data.passwordConfigured
    }

    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive
    }

    const user = await this.userManagementRepository.update(id, updateData)

    this.logOperation('UPDATE_USER', 'admin', {
      userId: user.id,
      userEmail: user.email,
    })

    return user
  }

  async delete(id: string): Promise<User> {
    // Verificar se o usuário existe
    const user = await this.findById(id)

    // Verificar se há dados associados ao usuário
    const userWithCounts = await this.userManagementRepository.findWithPlan(id)
    const counts = userWithCounts?._count

    if (counts) {
      const totalItems =
        counts.accounts +
        counts.categories +
        counts.creditCards +
        counts.entries
      if (totalItems > 0) {
        throw new BadRequestError(
          'Não é possível excluir um usuário que possui dados associados',
        )
      }
    }

    await this.userManagementRepository.delete(id)

    this.logOperation('DELETE_USER', 'admin', {
      userId: id,
      userEmail: user.email,
    })

    return user
  }

  async deactivate(id: string): Promise<User> {
    return this.update(id, { isActive: false })
  }

  async activate(id: string): Promise<User> {
    return this.update(id, { isActive: true })
  }

  async getUserStats() {
    const [totalUsers, activeUsers, usersByRole, usersByPlan] =
      await Promise.all([
        this.userManagementRepository.count(),
        this.userManagementRepository.count({ isActive: true }),
        this.userManagementRepository.groupBy(['role'], undefined, {
          role: 'asc',
        }),
        this.userManagementRepository.groupBy(['planId'], undefined, {
          planId: 'asc',
        }),
      ])

    return {
      totalUsers,
      activeUsers,
      usersByRole: usersByRole.map((group: any) => ({
        role: group.role,
        count: group._count,
      })),
      usersByPlan: usersByPlan.map((group: any) => ({
        planId: group.planId,
        count: group._count,
      })),
    }
  }
}
