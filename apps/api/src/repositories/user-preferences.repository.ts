import { Prisma, PrismaClient } from '@prisma/client'

export class UserPreferencesRepository {
  constructor(private prisma: PrismaClient) {}

  async findUnique(params: {
    where: Prisma.UserPreferencesWhereUniqueInput
    include?: Prisma.UserPreferencesInclude
  }) {
    return this.prisma.userPreferences.findUnique(params)
  }

  async findFirst(params: {
    where?: Prisma.UserPreferencesWhereInput
    include?: Prisma.UserPreferencesInclude
  }) {
    return this.prisma.userPreferences.findFirst(params)
  }

  async create(params: {
    data: Prisma.UserPreferencesCreateInput
    include?: Prisma.UserPreferencesInclude
  }) {
    return this.prisma.userPreferences.create(params)
  }

  async update(params: {
    where: Prisma.UserPreferencesWhereUniqueInput
    data: Prisma.UserPreferencesUpdateInput
    include?: Prisma.UserPreferencesInclude
  }) {
    return this.prisma.userPreferences.update(params)
  }

  async upsert(params: {
    where: Prisma.UserPreferencesWhereUniqueInput
    create: Prisma.UserPreferencesCreateInput
    update: Prisma.UserPreferencesUpdateInput
    include?: Prisma.UserPreferencesInclude
  }) {
    return this.prisma.userPreferences.upsert(params)
  }

  async delete(params: { where: Prisma.UserPreferencesWhereUniqueInput }) {
    return this.prisma.userPreferences.delete(params)
  }

  async findByUserId(userId: string) {
    return this.prisma.userPreferences.findUnique({
      where: { userId },
    })
  }
}
