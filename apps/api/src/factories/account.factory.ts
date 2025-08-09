import { AccountController } from '../controllers/account.controller'
import { prisma } from '../lib/prisma'
import { AccountRepository } from '../repositories/account.repository'
import { AccountService } from '../services/account.service'

// Factory para criar instâncias das dependências de Account
export class AccountFactory {
  private static accountRepository: AccountRepository
  private static accountService: AccountService
  private static accountController: AccountController

  static getRepository(): AccountRepository {
    if (!this.accountRepository) {
      this.accountRepository = new AccountRepository(prisma)
    }
    return this.accountRepository
  }

  static getService(): AccountService {
    if (!this.accountService) {
      const repository = this.getRepository()
      this.accountService = new AccountService(repository, prisma)
    }
    return this.accountService
  }

  static getController(): AccountController {
    if (!this.accountController) {
      const service = this.getService()
      this.accountController = new AccountController(service)
    }
    return this.accountController
  }
}
