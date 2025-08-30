import { UserManagementController } from '@/controllers/user-management.controller'
import { UserManagementService } from '@/services/user-management.service'

export class UserManagementFactory {
  private static userManagementService: UserManagementService
  private static userManagementController: UserManagementController

  static getUserManagementService(): UserManagementService {
    if (!this.userManagementService) {
      this.userManagementService = new UserManagementService()
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
