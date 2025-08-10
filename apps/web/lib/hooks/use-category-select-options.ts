'use client'

import { useEffect, useState } from 'react'

import { categoriesService, SelectOption } from '@/lib/services/categories'

export function useCategorySelectOptions(type?: 'income' | 'expense') {
  const [options, setOptions] = useState<SelectOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const selectOptions = await categoriesService.getSelectOptions(type)
        setOptions(selectOptions)
      } catch (err) {
        console.error('Error fetching category select options:', err)
        setError('Erro ao carregar opções de categoria')
        setOptions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchOptions()
  }, [type])

  return {
    options,
    isLoading,
    error,
    refetch: () => {
      const fetchOptions = async () => {
        try {
          setIsLoading(true)
          setError(null)
          const selectOptions = await categoriesService.getSelectOptions(type)
          setOptions(selectOptions)
        } catch (err) {
          console.error('Error fetching category select options:', err)
          setError('Erro ao carregar opções de categoria')
          setOptions([])
        } finally {
          setIsLoading(false)
        }
      }
      fetchOptions()
    },
  }
}
