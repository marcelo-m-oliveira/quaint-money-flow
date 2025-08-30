import { useCallback, useEffect, useState } from 'react'

import { useCrudToast } from '@/lib/hooks/use-crud-toast'
import {
  type Plan,
  type PlanFormData,
  plansService,
  type PlanStats,
} from '@/lib/services/plans'

export function usePlans(includeInactive = false) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { success, error: showError } = useCrudToast()

  const loadPlans = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await plansService.getAll(includeInactive)
      setPlans(response.plans)
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro ao carregar planos'
      setError(errorMessage)
      showError.read('planos', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [includeInactive, showError])

  useEffect(() => {
    loadPlans()
  }, [loadPlans])

  const createPlan = useCallback(
    async (data: PlanFormData): Promise<Plan | null> => {
      try {
        setError(null)
        const newPlan = await plansService.create(data)
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
    async (id: string, data: Partial<PlanFormData>): Promise<Plan | null> => {
      try {
        setError(null)
        const updatedPlan = await plansService.update(id, data)
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
        await plansService.delete(id)
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
    async (id: string): Promise<boolean> => {
      try {
        setError(null)
        const updatedPlan = await plansService.activate(id)
        setPlans((prev) =>
          prev.map((plan) => (plan.id === id ? updatedPlan : plan)),
        )
        success.update('plano', 'Plano ativado com sucesso')
        return true
      } catch (err: any) {
        const errorMessage = err?.message || 'Erro ao ativar plano'
        setError(errorMessage)
        showError.update('plano', errorMessage)
        return false
      }
    },
    [success, showError],
  )

  const deactivatePlan = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setError(null)
        const updatedPlan = await plansService.deactivate(id)
        setPlans((prev) =>
          prev.map((plan) => (plan.id === id ? updatedPlan : plan)),
        )
        success.update('plano', 'Plano desativado com sucesso')
        return true
      } catch (err: any) {
        const errorMessage = err?.message || 'Erro ao desativar plano'
        setError(errorMessage)
        showError.update('plano', errorMessage)
        return false
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

export function usePlanStats() {
  const [stats, setStats] = useState<PlanStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const planStats = await plansService.getStats()
      setStats(planStats)
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro ao carregar estatísticas'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  return {
    stats,
    isLoading,
    error,
    refetch: loadStats,
  }
}
