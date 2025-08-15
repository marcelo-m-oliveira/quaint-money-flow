'use client'

import { useEffect, useState } from 'react'

import { creditCardsService } from '@/lib/services/credit-cards'
import { SelectOption } from '@/lib/types'

// Cache em memória para as opções de cartões de crédito
let creditCardOptionsCache: SelectOption[] | null = null
let isFetching = false
let fetchPromise: Promise<SelectOption[]> | null = null

export function useCreditCardSelectOptions() {
  const [options, setOptions] = useState<SelectOption[]>(
    creditCardOptionsCache || [],
  )
  const [isLoading, setIsLoading] = useState(!creditCardOptionsCache)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Se já temos dados no cache, usar eles
    if (creditCardOptionsCache) {
      setOptions(creditCardOptionsCache)
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
          console.error('Error fetching credit card select options:', err)
          setError('Erro ao carregar opções de cartões de crédito')
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

        fetchPromise = creditCardsService.getSelectOptions()
        const selectOptions = await fetchPromise

        // Armazenar no cache
        creditCardOptionsCache = selectOptions
        setOptions(selectOptions)
      } catch (err) {
        console.error('Error fetching credit card select options:', err)
        setError('Erro ao carregar opções de cartões de crédito')
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
      creditCardOptionsCache = null

      const fetchOptions = async () => {
        try {
          isFetching = true
          setIsLoading(true)
          setError(null)

          fetchPromise = creditCardsService.getSelectOptions()
          const selectOptions = await fetchPromise

          // Armazenar no cache
          creditCardOptionsCache = selectOptions
          setOptions(selectOptions)
        } catch (err) {
          console.error('Error fetching credit card select options:', err)
          setError('Erro ao carregar opções de cartões de crédito')
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
