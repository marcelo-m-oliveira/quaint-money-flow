import { useCallback, useEffect, useState } from 'react'

import { useCrudToast } from '@/lib/hooks/use-crud-toast'
import { type AdminCoupon, adminCouponsService } from '@/lib/services/admin'

export function useAdminCoupons() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { success, error: showError } = useCrudToast()

  const loadCoupons = useCallback(
    async (includeUsage = false) => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await adminCouponsService.getAll(includeUsage)
        setCoupons(response.coupons || [])
      } catch (err: any) {
        const errorMessage = err?.message || 'Erro ao carregar cupons'
        setError(errorMessage)
        showError.general(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [showError],
  )

  useEffect(() => {
    loadCoupons()
  }, [loadCoupons])

  const createCoupon = useCallback(
    async (data: Partial<AdminCoupon>): Promise<AdminCoupon | null> => {
      try {
        setError(null)
        const newCoupon = await adminCouponsService.create(data)
        setCoupons((prev) => [...prev, newCoupon])
        success.create('cupom')
        return newCoupon
      } catch (err: any) {
        const errorMessage = err?.message || 'Erro ao criar cupom'
        setError(errorMessage)
        showError.create('cupom', errorMessage)
        return null
      }
    },
    [success, showError],
  )

  const updateCoupon = useCallback(
    async (
      id: string,
      data: Partial<AdminCoupon>,
    ): Promise<AdminCoupon | null> => {
      try {
        setError(null)
        const updatedCoupon = await adminCouponsService.update(id, data)
        setCoupons((prev) =>
          prev.map((coupon) => (coupon.id === id ? updatedCoupon : coupon)),
        )
        success.update('cupom')
        return updatedCoupon
      } catch (err: any) {
        const errorMessage = err?.message || 'Erro ao atualizar cupom'
        setError(errorMessage)
        showError.update('cupom', errorMessage)
        return null
      }
    },
    [success, showError],
  )

  const deleteCoupon = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setError(null)
        await adminCouponsService.delete(id)
        setCoupons((prev) => prev.filter((coupon) => coupon.id !== id))
        success.delete('cupom')
        return true
      } catch (err: any) {
        const errorMessage = err?.message || 'Erro ao excluir cupom'
        setError(errorMessage)
        showError.delete('cupom', errorMessage)
        return false
      }
    },
    [success, showError],
  )

  const activateCoupon = useCallback(
    async (id: string): Promise<AdminCoupon | null> => {
      try {
        setError(null)
        const activatedCoupon = await adminCouponsService.activate(id)
        setCoupons((prev) =>
          prev.map((coupon) => (coupon.id === id ? activatedCoupon : coupon)),
        )
        success.update('cupom')
        return activatedCoupon
      } catch (err: any) {
        const errorMessage = err?.message || 'Erro ao ativar cupom'
        setError(errorMessage)
        showError.update('cupom', errorMessage)
        return null
      }
    },
    [success, showError],
  )

  const deactivateCoupon = useCallback(
    async (id: string): Promise<AdminCoupon | null> => {
      try {
        setError(null)
        const deactivatedCoupon = await adminCouponsService.deactivate(id)
        setCoupons((prev) =>
          prev.map((coupon) => (coupon.id === id ? deactivatedCoupon : coupon)),
        )
        success.update('cupom')
        return deactivatedCoupon
      } catch (err: any) {
        const errorMessage = err?.message || 'Erro ao desativar cupom'
        setError(errorMessage)
        showError.update('cupom', errorMessage)
        return null
      }
    },
    [success, showError],
  )

  const getCouponById = useCallback(
    (id: string) => coupons.find((coupon) => coupon.id === id),
    [coupons],
  )

  const refetch = useCallback(() => {
    return loadCoupons()
  }, [loadCoupons])

  return {
    coupons,
    isLoading,
    error,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    activateCoupon,
    deactivateCoupon,
    getCouponById,
    refetch,
  }
}
