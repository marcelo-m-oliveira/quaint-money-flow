import { useEffect, useState } from 'react'

import { type AccountStatus, userService } from '@/lib/services/user'

export function useAccountStatus() {
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAccountStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const status = await userService.getAccountStatus()
      setAccountStatus(status)
    } catch (err) {
      console.error('Erro ao buscar status da conta:', err)
      setError('Erro ao carregar status da conta')
    } finally {
      setIsLoading(false)
    }
  }

  const refreshAccountStatus = () => {
    fetchAccountStatus()
  }

  useEffect(() => {
    fetchAccountStatus()
  }, [])

  return {
    accountStatus,
    isLoading,
    error,
    refreshAccountStatus,
  }
}
