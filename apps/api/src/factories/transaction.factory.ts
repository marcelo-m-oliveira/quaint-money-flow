import { TransactionController } from '@/controllers/transaction.controller'
import { prisma } from '@/lib/prisma'
import { TransactionRepository } from '@/repositories/transaction.repository'
import { TransactionService } from '@/services/transaction.service'

// Factory para criar instâncias das dependências de Transaction
export class TransactionFactory {
  private static transactionRepository: TransactionRepository
  private static transactionService: TransactionService
  private static transactionController: TransactionController

  static getRepository(): TransactionRepository {
    if (!this.transactionRepository) {
      this.transactionRepository = new TransactionRepository(prisma)
    }
    return this.transactionRepository
  }

  static getService(): TransactionService {
    if (!this.transactionService) {
      const repository = this.getRepository()
      this.transactionService = new TransactionService(repository, prisma)
    }
    return this.transactionService
  }

  static getController(): TransactionController {
    if (!this.transactionController) {
      const service = this.getService()
      this.transactionController = new TransactionController(service)
    }
    return this.transactionController
  }
}
