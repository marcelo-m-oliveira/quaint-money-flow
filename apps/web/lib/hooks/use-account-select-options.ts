'use client'

import { useEffect, useState } from 'react'

import { accountsService } from '@/lib/services/accounts'
import { SelectOption } from '@/lib/types'

export function useAccountSelectOptions() {
  const [options, setOptions] = useState<SelectOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const selectOptions = await accountsService.getSelectOptions()
        setOptions(selectOptions)
      } catch (err) {
        console.error('Error fetching account select options:', err)
        setError('Erro ao carregar opções de contas')
        setOptions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchOptions()
  }, [])

  return {
    options,
    isLoading,
    error,
    refetch: () => {
      const fetchOptions = async () => {
        try {
          setIsLoading(true)
          setError(null)
          const selectOptions = await accountsService.getSelectOptions()
          setOptions(selectOptions)
        } catch (err) {
          console.error('Error fetching account select options:', err)
          setError('Erro ao carregar opções de contas')
          setOptions([])
        } finally {
          setIsLoading(false)
        }
      }
      fetchOptions()
    },
  }
}
