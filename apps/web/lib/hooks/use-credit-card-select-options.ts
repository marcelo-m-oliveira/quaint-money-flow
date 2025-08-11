'use client'

import { useEffect, useState } from 'react'

import { creditCardsService } from '@/lib/services/credit-cards'
import { SelectOption } from '@/lib/types'

export function useCreditCardSelectOptions() {
  const [options, setOptions] = useState<SelectOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const selectOptions = await creditCardsService.getSelectOptions()
        setOptions(selectOptions)
      } catch (err) {
        console.error('Error fetching credit card select options:', err)
        setError('Erro ao carregar opções de cartões de crédito')
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
          const selectOptions = await creditCardsService.getSelectOptions()
          setOptions(selectOptions)
        } catch (err) {
          console.error('Error fetching credit card select options:', err)
          setError('Erro ao carregar opções de cartões de crédito')
          setOptions([])
        } finally {
          setIsLoading(false)
        }
      }
      fetchOptions()
    },
  }
}
