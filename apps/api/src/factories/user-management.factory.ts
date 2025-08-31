import { UserManagementController } from '@/controllers/user-management.controller'
import { prisma } from '@/lib/prisma'
import { UserManagementRepository } from '@/repositories/user-management.repository'
import { UserManagementService } from '@/services/user-management.service'

export class UserManagementFactory {
  private static userManagementRepository: UserManagementRepository
  private static userManagementService: UserManagementService
  private static userManagementController: UserManagementController

  static getUserManagementRepository(): UserManagementRepository {
    if (!this.userManagementRepository) {
      this.userManagementRepository = new UserManagementRepository(prisma)
    }
    return this.userManagementRepository
  }

  static getUserManagementService(): UserManagementService {
    if (!this.userManagementService) {
      const userManagementRepository = this.getUserManagementRepository()
      this.userManagementService = new UserManagementService(
        userManagementRepository,
        prisma,
      )
    }
    return this.userManagementService
  }

  static getUserManagementController(): UserManagementController {
    if (!this.userManagementController) {
      const userManagementService = this.getUserManagementService()
      this.userManagementController = new UserManagementController(
        userManagementService,
      )
    }
    return this.userManagementController
  }
}
