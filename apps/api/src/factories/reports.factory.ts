/* eslint-disable @typescript-eslint/no-explicit-any */
import { env } from '@saas/env'

import { prisma } from '@/lib/prisma'

import { ReportsController } from '../controllers/reports.controller'
import { ReportsRepository } from '../repositories/reports.repository'
import { ReportsService } from '../services/reports.service'

// Factory para criar instâncias das dependências de Reports
export class ReportsFactory {
  private static reportsRepository: ReportsRepository
  private static reportsService: ReportsService
  private static reportsController: ReportsController

  // Método para limpar o cache das instâncias (útil para desenvolvimento)
  static clearCache(): void {
    this.reportsRepository = null as any
    this.reportsService = null as any
    this.reportsController = null as any
  }

  static getRepository(): ReportsRepository {
    // Em desenvolvimento, sempre criar nova instância para evitar cache
    if (env.NODE_ENV === 'development') {
      return new ReportsRepository(prisma)
    }
    if (!this.reportsRepository) {
      this.reportsRepository = new ReportsRepository(prisma)
    }
    return this.reportsRepository
  }

  static getService(): ReportsService {
    // Em desenvolvimento, sempre criar nova instância para evitar cache
    if (env.NODE_ENV === 'development') {
      const repository = this.getRepository()
      return new ReportsService(repository)
    }
    if (!this.reportsService) {
      const repository = this.getRepository()
      this.reportsService = new ReportsService(repository)
    }
    return this.reportsService
  }

  static getController(): ReportsController {
    // Em desenvolvimento, sempre criar nova instância para evitar cache
    if (env.NODE_ENV === 'development') {
      const service = this.getService()
      return new ReportsController(service)
    }
    if (!this.reportsController) {
      const service = this.getService()
      this.reportsController = new ReportsController(service)
    }
    return this.reportsController
  }
}
