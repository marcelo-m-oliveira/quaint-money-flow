import { useCallback, useEffect, useState } from 'react'

import { useCrudToast } from '@/lib/hooks/use-crud-toast'
import { type AdminPlan, adminPlansService } from '@/lib/services/admin'

export function useAdminPlans() {
  const [plans, setPlans] = useState<AdminPlan[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { success, error: showError } = useCrudToast()

  const loadPlans = useCallback(
    async (includeInactive = false) => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await adminPlansService.getAll(includeInactive)
        setPlans(response.plans || [])
      } catch (err: any) {
        const errorMessage = err?.message || 'Erro ao carregar planos'
        setError(errorMessage)
        showError.general(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [showError],
  )

  useEffect(() => {
    loadPlans()
  }, [loadPlans])

  const createPlan = useCallback(
    async (data: Partial<AdminPlan>): Promise<AdminPlan | null> => {
      try {
        setError(null)
        const newPlan = await adminPlansService.create(data)
        setPlans((prev) => [...prev, newPlan])
        success.create('plano')
        return newPlan
      } catch (err: any) {
        const errorMessage = err?.message || 'Erro ao criar plano'
        setError(errorMessage)
        showError.create('plano', errorMessage)
        return null
      }
    },
    [success, showError],
  )

  const updatePlan = useCallback(
    async (id: string, data: Partial<AdminPlan>): Promise<AdminPlan | null> => {
      try {
        setError(null)
        const updatedPlan = await adminPlansService.update(id, data)
        setPlans((prev) =>
          prev.map((plan) => (plan.id === id ? updatedPlan : plan)),
        )
        success.update('plano')
        return updatedPlan
      } catch (err: any) {
        const errorMessage = err?.message || 'Erro ao atualizar plano'
        setError(errorMessage)
        showError.update('plano', errorMessage)
        return null
      }
    },
    [success, showError],
  )

  const deletePlan = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setError(null)
        await adminPlansService.delete(id)
        setPlans((prev) => prev.filter((plan) => plan.id !== id))
        success.delete('plano')
        return true
      } catch (err: any) {
        const errorMessage = err?.message || 'Erro ao excluir plano'
        setError(errorMessage)
        showError.delete('plano', errorMessage)
        return false
      }
    },
    [success, showError],
  )

  const activatePlan = useCallback(
    async (id: string): Promise<AdminPlan | null> => {
      try {
        setError(null)
        const activatedPlan = await adminPlansService.activate(id)
        setPlans((prev) =>
          prev.map((plan) => (plan.id === id ? activatedPlan : plan)),
        )
        success.update('plano')
        return activatedPlan
      } catch (err: any) {
        const errorMessage = err?.message || 'Erro ao ativar plano'
        setError(errorMessage)
        showError.update('plano', errorMessage)
        return null
      }
    },
    [success, showError],
  )

  const deactivatePlan = useCallback(
    async (id: string): Promise<AdminPlan | null> => {
      try {
        setError(null)
        const deactivatedPlan = await adminPlansService.deactivate(id)
        setPlans((prev) =>
          prev.map((plan) => (plan.id === id ? deactivatedPlan : plan)),
        )
        success.update('plano')
        return deactivatedPlan
      } catch (err: any) {
        const errorMessage = err?.message || 'Erro ao desativar plano'
        setError(errorMessage)
        showError.update('plano', errorMessage)
        return null
      }
    },
    [success, showError],
  )

  const getPlanById = useCallback(
    (id: string) => plans.find((plan) => plan.id === id),
    [plans],
  )

  const refetch = useCallback(() => {
    return loadPlans()
  }, [loadPlans])

  return {
    plans,
    isLoading,
    error,
    createPlan,
    updatePlan,
    deletePlan,
    activatePlan,
    deactivatePlan,
    getPlanById,
    refetch,
  }
}
