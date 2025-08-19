import { PrismaClient } from '@prisma/client'

import { BaseRepository } from '@/repositories/base.repository'

export class UserPreferencesRepository extends BaseRepository<'userPreferences'> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'userPreferences')
  }

  // Métodos específicos de negócio
  async findByUserId(userId: string) {
    return this.prisma.userPreferences.findUnique({
      where: { userId },
    })
  }

  async existsByUserId(userId: string): Promise<boolean> {
    const preferences = await this.prisma.userPreferences.findUnique({
      where: { userId },
    })
    return !!preferences
  }

  async createDefault(userId: string) {
    const defaultPreferences = {
      entryOrder: 'descending' as const,
      defaultNavigationPeriod: 'monthly' as const,
      showDailyBalance: false,
      viewMode: 'all' as const,
      isFinancialSummaryExpanded: false,
    }

    return this.prisma.userPreferences.create({
      data: {
        ...defaultPreferences,
        user: { connect: { id: userId } },
      },
    })
  }

  async upsertByUserId(userId: string, createData: any, updateData: any) {
    return this.prisma.userPreferences.upsert({
      where: { userId },
      create: {
        ...createData,
        user: { connect: { id: userId } },
      },
      update: updateData,
    })
  }

  async resetToDefault(userId: string) {
    const defaultPreferences = {
      entryOrder: 'descending' as const,
      defaultNavigationPeriod: 'monthly' as const,
      showDailyBalance: false,
      viewMode: 'all' as const,
      isFinancialSummaryExpanded: false,
    }

    return this.prisma.userPreferences.upsert({
      where: { userId },
      create: {
        ...defaultPreferences,
        user: { connect: { id: userId } },
      },
      update: defaultPreferences,
    })
  }
}
