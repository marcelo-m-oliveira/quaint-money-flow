import { CouponController } from '@/controllers/coupon.controller'
import { CouponService } from '@/services/coupon.service'

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
