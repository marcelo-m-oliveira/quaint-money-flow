import { CouponController } from '@/controllers/coupon.controller'
import { prisma } from '@/lib/prisma'
import { CouponRepository } from '@/repositories/coupon.repository'
import { CouponService } from '@/services/coupon.service'

export class CouponFactory {
  private static couponRepository: CouponRepository
  private static couponService: CouponService
  private static couponController: CouponController

  static getCouponRepository(): CouponRepository {
    if (!this.couponRepository) {
      this.couponRepository = new CouponRepository(prisma)
    }
    return this.couponRepository
  }

  static getCouponService(): CouponService {
    if (!this.couponService) {
      const couponRepository = this.getCouponRepository()
      this.couponService = new CouponService(couponRepository, prisma)
    }
    return this.couponService
  }

  static getCouponController(): CouponController {
    if (!this.couponController) {
      const couponService = this.getCouponService()
      this.couponController = new CouponController(couponService)
    }
    return this.couponController
  }
}
