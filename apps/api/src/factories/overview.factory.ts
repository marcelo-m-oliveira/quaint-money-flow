import { OverviewController } from '../controllers/overview.controller'
import { prisma } from '../lib/prisma'
import { OverviewRepository } from '../repositories/overview.repository'
import { OverviewService } from '../services/overview.service'

// Factory para criar instâncias das dependências de Overview
export class OverviewFactory {
  private static overviewRepository: OverviewRepository
  private static overviewService: OverviewService
  private static overviewController: OverviewController

  static getRepository(): OverviewRepository {
    if (!this.overviewRepository) {
      this.overviewRepository = new OverviewRepository(prisma)
    }
    return this.overviewRepository
  }

  static getService(): OverviewService {
    if (!this.overviewService) {
      const repository = this.getRepository()
      this.overviewService = new OverviewService(repository, prisma)
    }
    return this.overviewService
  }

  static getController(): OverviewController {
    if (!this.overviewController) {
      const service = this.getService()
      this.overviewController = new OverviewController(service)
    }
    return this.overviewController
  }
}
