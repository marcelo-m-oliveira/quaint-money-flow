import { PrismaClient } from '@prisma/client'

import { UserPreferencesRepository } from '@/repositories/user-preferences.repository'
import { BadRequestError } from '@/routes/_errors/bad-request-error'
import { BaseService } from '@/services/base.service'
import {
  type PreferencesCreateSchema,
  type PreferencesUpdateSchema,
} from '@/utils/schemas'

export class UserPreferencesService extends BaseService<'userPreferences'> {
  constructor(
    private userPreferencesRepository: UserPreferencesRepository,
    prisma: PrismaClient,
  ) {
    super(userPreferencesRepository, prisma)
  }

  async findByUserId(userId: string) {
    const preferences =
      await this.userPreferencesRepository.findByUserId(userId)

    if (!preferences) {
      // Se não existir, criar com valores padrão
      return this.createDefault(userId)
    }

    return preferences
  }

  async findById(id: string, userId: string) {
    const preferences = await this.userPreferencesRepository.findById(id)

    if (!preferences) {
      throw new BadRequestError('Preferências não encontradas')
    }

    // Verificar se as preferências pertencem ao usuário
    if (preferences.userId !== userId) {
      throw new BadRequestError('Preferências não pertencem ao usuário')
    }

    return preferences
  }

  async create(data: PreferencesCreateSchema, userId: string) {
    // Verificar se já existem preferências para o usuário
    const existingPreferences =
      await this.userPreferencesRepository.existsByUserId(userId)

    if (existingPreferences) {
      throw new BadRequestError('Já existem preferências para este usuário')
    }

    const preferences = await this.userPreferencesRepository.create({
      ...data,
      user: { connect: { id: userId } },
    })

    this.logOperation('CREATE_USER_PREFERENCES', userId, {
      preferencesId: preferences.id,
    })
    return preferences
  }

  async update(userId: string, data: Partial<PreferencesUpdateSchema>) {
    // Verificar se as preferências existem
    const existingPreferences =
      await this.userPreferencesRepository.findByUserId(userId)

    if (!existingPreferences) {
      // Se não existir, criar com valores padrão + dados fornecidos
      const defaultPreferences = {
        entryOrder: 'descending' as const,
        defaultNavigationPeriod: 'monthly' as const,
        showDailyBalance: false,
        viewMode: 'all' as const,
        isFinancialSummaryExpanded: false,
      }

      const preferences = await this.userPreferencesRepository.create({
        ...defaultPreferences,
        ...data,
        user: { connect: { id: userId } },
      })

      this.logOperation('CREATE_USER_PREFERENCES', userId, {
        preferencesId: preferences.id,
      })
      return preferences
    }

    // Se existir, apenas atualizar os campos fornecidos
    const preferences = await this.userPreferencesRepository.update(
      existingPreferences.id,
      data,
    )

    this.logOperation('UPDATE_USER_PREFERENCES', userId, {
      preferencesId: preferences.id,
    })
    return preferences
  }

  async upsert(userId: string, data: Partial<PreferencesCreateSchema>) {
    const defaultPreferences = {
      entryOrder: 'descending' as const,
      defaultNavigationPeriod: 'monthly' as const,
      showDailyBalance: false,
      viewMode: 'all' as const,
      isFinancialSummaryExpanded: false,
    }

    const preferences = await this.userPreferencesRepository.upsertByUserId(
      userId,
      { ...defaultPreferences, ...data },
      data,
    )

    this.logOperation('UPSERT_USER_PREFERENCES', userId, {
      preferencesId: preferences.id,
    })
    return preferences
  }

  async delete(userId: string) {
    // Verificar se as preferências existem
    const existingPreferences =
      await this.userPreferencesRepository.findByUserId(userId)

    if (!existingPreferences) {
      throw new BadRequestError('Preferências não encontradas')
    }

    await this.userPreferencesRepository.delete(existingPreferences.id)

    this.logOperation('DELETE_USER_PREFERENCES', userId, {
      preferencesId: existingPreferences.id,
    })

    return existingPreferences
  }

  async reset(userId: string) {
    const preferences =
      await this.userPreferencesRepository.resetToDefault(userId)

    this.logOperation('RESET_USER_PREFERENCES', userId, {
      preferencesId: preferences.id,
    })
    return preferences
  }

  async createDefault(userId: string) {
    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new BadRequestError('Usuário não encontrado')
    }

    const preferences =
      await this.userPreferencesRepository.createDefault(userId)

    this.logOperation('CREATE_DEFAULT_USER_PREFERENCES', userId, {
      preferencesId: preferences.id,
    })
    return preferences
  }
}
