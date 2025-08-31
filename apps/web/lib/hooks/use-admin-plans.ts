import { useCallback, useEffect, useState } from 'react'

import { useCrudToast } from '@/lib/hooks/use-crud-toast'
import { type AdminPlan, adminPlansService } from '@/lib/services/admin'

export function useAdminPlans(includeInactive = false) {
  const [plans, setPlans] = useState<AdminPlan[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { error: showError } = useCrudToast()

  const loadPlans = useCallback(async () => {
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
  }, [includeInactive, showError])

  useEffect(() => {
    loadPlans()
  }, [loadPlans])

  const refetch = useCallback(() => {
    return loadPlans()
  }, [loadPlans])

  return {
    plans,
    isLoading,
    error,
    refetch,
  }
}
