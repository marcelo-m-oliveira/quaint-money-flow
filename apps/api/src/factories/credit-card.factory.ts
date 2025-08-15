import { CreditCardController } from '../controllers/credit-card.controller'
import { prisma } from '../lib/prisma'
import { CreditCardRepository } from '../repositories/credit-card.repository'
import { CreditCardService } from '../services/credit-card.service'

// Factory para criar instâncias das dependências de CreditCard
export class CreditCardFactory {
  private static creditCardRepository: CreditCardRepository
  private static creditCardService: CreditCardService
  private static creditCardController: CreditCardController

  static getRepository(): CreditCardRepository {
    if (!this.creditCardRepository) {
      this.creditCardRepository = new CreditCardRepository(prisma)
    }
    return this.creditCardRepository
  }

  static getService(): CreditCardService {
    if (!this.creditCardService) {
      const repository = this.getRepository()
      this.creditCardService = new CreditCardService(repository, prisma)
    }
    return this.creditCardService
  }

  static getController(): CreditCardController {
    if (!this.creditCardController) {
      const service = this.getService()
      this.creditCardController = new CreditCardController(service)
    }
    return this.creditCardController
  }
}
