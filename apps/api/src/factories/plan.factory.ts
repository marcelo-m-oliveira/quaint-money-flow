import { PlanController } from '@/controllers/plan.controller'
import { PlanService } from '@/services/plan.service'

export class PlanFactory {
  private static planService: PlanService
  private static planController: PlanController

  static getPlanService(): PlanService {
    if (!this.planService) {
      this.planService = new PlanService()
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
