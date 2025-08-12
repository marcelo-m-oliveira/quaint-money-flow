'use client'

import { useEffect, useState } from 'react'

import { categoriesService } from '@/lib/services/categories'
import { SelectOption } from '@/lib/types'

// Cache em memória para as opções de categorias (por tipo)
const categoryOptionsCache = new Map<string, SelectOption[]>()
const fetchingStates = new Map<string, boolean>()
const fetchPromises = new Map<string, Promise<SelectOption[]>>()

// Função para gerar chave do cache baseada no tipo
const getCacheKey = (type?: 'income' | 'expense') => {
  return type || 'all'
}

export function useCategorySelectOptions(
  type?: 'income' | 'expense',
  shouldFetch = true,
) {
  const cacheKey = getCacheKey(type)
  const [options, setOptions] = useState<SelectOption[]>(
    categoryOptionsCache.get(cacheKey) || [],
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!shouldFetch) {
      setOptions([])
      setIsLoading(false)
      setError(null)
      return
    }

    // Se já temos dados no cache para este tipo, usar eles
    const cachedOptions = categoryOptionsCache.get(cacheKey)
    if (cachedOptions) {
      setOptions(cachedOptions)
      setIsLoading(false)
      return
    }

    // Se já está fazendo fetch para este tipo, aguardar a promise existente
    const isFetching = fetchingStates.get(cacheKey)
    const fetchPromise = fetchPromises.get(cacheKey)
    if (isFetching && fetchPromise) {
      setIsLoading(true)
      fetchPromise
        .then((selectOptions) => {
          setOptions(selectOptions)
          setError(null)
        })
        .catch((err) => {
          console.error('Error fetching category select options:', err)
          setError('Erro ao carregar opções de categorias')
          setOptions([])
        })
        .finally(() => {
          setIsLoading(false)
        })
      return
    }

    const fetchOptions = async () => {
      try {
        fetchingStates.set(cacheKey, true)
        setIsLoading(true)
        setError(null)

        const promise = categoriesService.getSelectOptions(type)
        fetchPromises.set(cacheKey, promise)
        const selectOptions = await promise

        // Armazenar no cache
        categoryOptionsCache.set(cacheKey, selectOptions)
        setOptions(selectOptions)
      } catch (err) {
        console.error('Error fetching category select options:', err)
        setError('Erro ao carregar opções de categorias')
        setOptions([])
      } finally {
        setIsLoading(false)
        fetchingStates.set(cacheKey, false)
        fetchPromises.delete(cacheKey)
      }
    }

    fetchOptions()
  }, [type, shouldFetch, cacheKey])

  return {
    options,
    isLoading,
    error,
    refetch: () => {
      if (!shouldFetch) return

      // Limpar cache para este tipo específico
      categoryOptionsCache.delete(cacheKey)
      fetchingStates.delete(cacheKey)
      fetchPromises.delete(cacheKey)

      const fetchOptions = async () => {
        try {
          fetchingStates.set(cacheKey, true)
          setIsLoading(true)
          setError(null)

          const promise = categoriesService.getSelectOptions(type)
          fetchPromises.set(cacheKey, promise)
          const selectOptions = await promise

          // Armazenar no cache
          categoryOptionsCache.set(cacheKey, selectOptions)
          setOptions(selectOptions)
        } catch (err) {
          console.error('Error fetching category select options:', err)
          setError('Erro ao carregar opções de categorias')
          setOptions([])
        } finally {
          setIsLoading(false)
          fetchingStates.set(cacheKey, false)
          fetchPromises.delete(cacheKey)
        }
      }
      fetchOptions()
    },
  }
}
