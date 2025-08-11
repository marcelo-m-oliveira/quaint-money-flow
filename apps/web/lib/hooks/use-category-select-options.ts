'use client'

import { useEffect, useState } from 'react'

import { categoriesService } from '@/lib/services/categories'
import { SelectOption } from '@/lib/types'

export function useCategorySelectOptions(
  type?: 'income' | 'expense',
  shouldFetch = true,
) {
  const [options, setOptions] = useState<SelectOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!shouldFetch) {
      setOptions([])
      setIsLoading(false)
      setError(null)
      return
    }

    const fetchOptions = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const selectOptions = await categoriesService.getSelectOptions(type)
        setOptions(selectOptions)
      } catch (err) {
        console.error('Error fetching category select options:', err)
        setError('Erro ao carregar opções de categorias')
        setOptions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchOptions()
  }, [type, shouldFetch])

  return {
    options,
    isLoading,
    error,
    refetch: () => {
      if (!shouldFetch) return

      const fetchOptions = async () => {
        try {
          setIsLoading(true)
          setError(null)
          const selectOptions = await categoriesService.getSelectOptions(type)
          setOptions(selectOptions)
        } catch (err) {
          console.error('Error fetching category select options:', err)
          setError('Erro ao carregar opções de categorias')
          setOptions([])
        } finally {
          setIsLoading(false)
        }
      }
      fetchOptions()
    },
  }
}
