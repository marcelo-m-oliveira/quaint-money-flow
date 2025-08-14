import { prisma } from '@/lib/prisma'

import { ReportsController } from '../controllers/reports.controller'
import { ReportsRepository } from '../repositories/reports.repository'
import { ReportsService } from '../services/reports.service'

// Factory para criar instâncias das dependências de Reports
export class ReportsFactory {
  private static reportsRepository: ReportsRepository
  private static reportsService: ReportsService
  private static reportsController: ReportsController

  static getRepository(): ReportsRepository {
    if (!this.reportsRepository) {
      this.reportsRepository = new ReportsRepository(prisma)
    }
    return this.reportsRepository
  }

  static getService(): ReportsService {
    if (!this.reportsService) {
      const repository = this.getRepository()
      this.reportsService = new ReportsService(repository)
    }
    return this.reportsService
  }

  static getController(): ReportsController {
    if (!this.reportsController) {
      const service = this.getService()
      this.reportsController = new ReportsController(service)
    }
    return this.reportsController
  }
}
