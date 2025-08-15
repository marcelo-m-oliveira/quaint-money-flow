'use client'

import { useEffect, useState } from 'react'

import { accountsService } from '@/lib/services/accounts'
import { SelectOption } from '@/lib/types'

// Cache em memória para as opções de contas
let accountOptionsCache: SelectOption[] | null = null
let isFetching = false
let fetchPromise: Promise<SelectOption[]> | null = null

export function useAccountSelectOptions() {
  const [options, setOptions] = useState<SelectOption[]>(
    accountOptionsCache || [],
  )
  const [isLoading, setIsLoading] = useState(!accountOptionsCache)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Se já temos dados no cache, usar eles
    if (accountOptionsCache) {
      setOptions(accountOptionsCache)
      setIsLoading(false)
      return
    }

    // Se já está fazendo fetch, aguardar a promise existente
    if (isFetching && fetchPromise) {
      fetchPromise
        .then((selectOptions) => {
          setOptions(selectOptions)
          setError(null)
        })
        .catch((err) => {
          console.error('Error fetching account select options:', err)
          setError('Erro ao carregar opções de contas')
          setOptions([])
        })
        .finally(() => {
          setIsLoading(false)
        })
      return
    }

    const fetchOptions = async () => {
      try {
        isFetching = true
        setIsLoading(true)
        setError(null)

        fetchPromise = accountsService.getSelectOptions()
        const selectOptions = await fetchPromise

        // Armazenar no cache
        accountOptionsCache = selectOptions
        setOptions(selectOptions)
      } catch (err) {
        console.error('Error fetching account select options:', err)
        setError('Erro ao carregar opções de contas')
        setOptions([])
      } finally {
        setIsLoading(false)
        isFetching = false
        fetchPromise = null
      }
    }

    fetchOptions()
  }, [])

  return {
    options,
    isLoading,
    error,
    refetch: () => {
      // Limpar cache para forçar nova requisição
      accountOptionsCache = null

      const fetchOptions = async () => {
        try {
          isFetching = true
          setIsLoading(true)
          setError(null)

          fetchPromise = accountsService.getSelectOptions()
          const selectOptions = await fetchPromise

          // Armazenar no cache
          accountOptionsCache = selectOptions
          setOptions(selectOptions)
        } catch (err) {
          console.error('Error fetching account select options:', err)
          setError('Erro ao carregar opções de contas')
          setOptions([])
        } finally {
          setIsLoading(false)
          isFetching = false
          fetchPromise = null
        }
      }
      fetchOptions()
    },
  }
}
