import { PrismaClient, UserPreferences } from '@prisma/client'

import { NotFoundError } from '@/http/routes/_errors/not-found-error'
import { UserPreferencesRepository } from '@/repositories/user-preferences.repository'
import { type UserPreferencesSchema } from '@/utils/schemas'

export class UserPreferencesService {
  constructor(
    private userPreferencesRepository: UserPreferencesRepository,
    private prisma: PrismaClient,
  ) {}

  async findByUserId(userId: string): Promise<UserPreferences> {
    const preferences =
      await this.userPreferencesRepository.findByUserId(userId)

    if (!preferences) {
      // Se não existir, criar com valores padrão
      return this.createDefault(userId)
    }

    return preferences
  }

  async createDefault(userId: string): Promise<UserPreferences> {
    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new NotFoundError('Usuário não encontrado')
    }

    // Criar preferências com valores padrão
    const defaultPreferences = {
      entryOrder: 'descending' as const,
      defaultNavigationPeriod: 'monthly' as const,
      showDailyBalance: false,
      viewMode: 'all' as const,
      isFinancialSummaryExpanded: false,
    }

    return this.userPreferencesRepository.create({
      data: {
        ...defaultPreferences,
        user: {
          connect: { id: userId },
        },
      },
    })
  }

  async update(
    userId: string,
    data: Partial<UserPreferencesSchema>,
  ): Promise<UserPreferences> {
    // Verificar se as preferências existem
    const existingPreferences =
      await this.userPreferencesRepository.findByUserId(userId)

    if (!existingPreferences) {
      // Se não existir, criar com os dados fornecidos
      const defaultPreferences = {
        entryOrder: 'descending' as const,
        defaultNavigationPeriod: 'monthly' as const,
        showDailyBalance: false,
        viewMode: 'all' as const,
        isFinancialSummaryExpanded: false,
      }

      return this.userPreferencesRepository.create({
        data: {
          ...defaultPreferences,
          ...data,
          user: {
            connect: { id: userId },
          },
        },
      })
    }

    // Atualizar preferências existentes
    return this.userPreferencesRepository.update({
      where: { userId },
      data,
    })
  }

  async upsert(
    userId: string,
    data: Partial<UserPreferencesSchema>,
  ): Promise<UserPreferences> {
    const defaultPreferences = {
      entryOrder: 'descending' as const,
      defaultNavigationPeriod: 'monthly' as const,
      showDailyBalance: false,
      viewMode: 'all' as const,
      isFinancialSummaryExpanded: false,
    }

    return this.userPreferencesRepository.upsert({
      where: { userId },
      create: {
        ...defaultPreferences,
        ...data,
        user: {
          connect: { id: userId },
        },
      },
      update: data,
    })
  }

  async reset(userId: string): Promise<UserPreferences> {
    const defaultPreferences = {
      entryOrder: 'descending' as const,
      defaultNavigationPeriod: 'monthly' as const,
      showDailyBalance: false,
      viewMode: 'all' as const,
      isFinancialSummaryExpanded: false,
    }

    return this.userPreferencesRepository.upsert({
      where: { userId },
      create: {
        ...defaultPreferences,
        user: {
          connect: { id: userId },
        },
      },
      update: defaultPreferences,
    })
  }
}
