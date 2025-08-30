import { CouponService } from '@/services/coupon.service'
import { CouponController } from '@/controllers/coupon.controller'

export class CouponFactory {
  private static couponService: CouponService
  private static couponController: CouponController

  static getCouponService(): CouponService {
    if (!this.couponService) {
      this.couponService = new CouponService()
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
