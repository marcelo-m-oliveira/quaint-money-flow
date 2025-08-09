import { UserPreferencesController } from '@/controllers/user-preferences.controller'
import { prisma } from '@/lib/prisma'
import { UserPreferencesRepository } from '@/repositories/user-preferences.repository'
import { UserPreferencesService } from '@/services/user-preferences.service'

// Factory para criar instâncias das dependências de UserPreferences
export class UserPreferencesFactory {
  private static userPreferencesRepository: UserPreferencesRepository
  private static userPreferencesService: UserPreferencesService
  private static userPreferencesController: UserPreferencesController

  static getRepository(): UserPreferencesRepository {
    if (!this.userPreferencesRepository) {
      this.userPreferencesRepository = new UserPreferencesRepository(prisma)
    }
    return this.userPreferencesRepository
  }

  static getService(): UserPreferencesService {
    if (!this.userPreferencesService) {
      const repository = this.getRepository()
      this.userPreferencesService = new UserPreferencesService(
        repository,
        prisma,
      )
    }
    return this.userPreferencesService
  }

  static getController(): UserPreferencesController {
    if (!this.userPreferencesController) {
      const service = this.getService()
      this.userPreferencesController = new UserPreferencesController(service)
    }
    return this.userPreferencesController
  }
}
