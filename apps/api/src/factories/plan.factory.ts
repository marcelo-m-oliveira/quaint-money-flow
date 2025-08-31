import { PlanController } from '@/controllers/plan.controller'
import { prisma } from '@/lib/prisma'
import { PlanRepository } from '@/repositories/plan.repository'
import { PlanService } from '@/services/plan.service'

export class PlanFactory {
  private static planRepository: PlanRepository
  private static planService: PlanService
  private static planController: PlanController

  static getPlanRepository(): PlanRepository {
    if (!this.planRepository) {
      this.planRepository = new PlanRepository(prisma)
    }
    return this.planRepository
  }

  static getPlanService(): PlanService {
    if (!this.planService) {
      const planRepository = this.getPlanRepository()
      this.planService = new PlanService(planRepository, prisma)
    }
    return this.planService
  }

  static getPlanController(): PlanController {
    if (!this.planController) {
      const planService = this.getPlanService()
      this.planController = new PlanController(planService)
    }
    return this.planController
  }
}
