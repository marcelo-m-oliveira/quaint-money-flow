'use client'

import { useEffect, useState } from 'react'

import { useCrudToast } from '@/lib'
import { entriesService } from '@/lib/services/entries'
import {
  EntriesQueryParams,
  EntriesResponse,
  Entry,
  EntryFormData,
} from '@/lib/types'

export function useEntries(
  initialFilters?: EntriesQueryParams,
  shouldFetch = true,
) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorState, setErrorState] = useState<string | null>(null)
  const [currentFilters, setCurrentFilters] = useState<
    EntriesQueryParams | undefined
  >(initialFilters)
  const [pagination, setPagination] = useState<EntriesResponse['pagination']>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })
  const [summary, setSummary] = useState<EntriesResponse['summary']>()
  const { success, error } = useCrudToast()

  const fetchEntries = async (params?: EntriesQueryParams) => {
    try {
      setIsLoading(true)
      setErrorState(null)
      const response = await entriesService.getAll(params)

      setEntries(response.entries)
      setPagination(response.pagination)
      setSummary(response.summary)
    } catch (err) {
      console.error('Error fetching entries:', err)
      error.general('Erro ao carregar lançamentos')
    } finally {
      setIsLoading(false)
    }
  }

  const updateFilters = async (newFilters: EntriesQueryParams) => {
    setCurrentFilters(newFilters)
    await fetchEntries(newFilters)
  }

  const addEntry = async (data: EntryFormData) => {
    try {
      const newEntry = await entriesService.create(data)
      setEntries((prev) => [newEntry, ...prev])
      success.create('Lançamento')

      // Atualizar summary após criar lançamento
      if (currentFilters) {
        await fetchEntries(currentFilters)
      }

      return newEntry
    } catch (err) {
      console.error('Error creating entry:', err)
      error.create('Lançamento')
      throw err
    }
  }

  const updateEntry = async (id: string, data: Partial<EntryFormData>) => {
    try {
      const updatedEntry = await entriesService.update(id, data)
      setEntries((prev) =>
        prev.map((entry) => (entry.id === id ? updatedEntry : entry)),
      )
      success.update('Lançamento')

      // Atualizar summary após atualizar lançamento
      if (currentFilters) {
        await fetchEntries(currentFilters)
      }

      return updatedEntry
    } catch (err) {
      console.error('Error updating entry:', err)
      error.update('Lançamento')
      throw err
    }
  }

  const patchEntry = async (id: string, data: Partial<EntryFormData>) => {
    try {
      const updatedEntry = await entriesService.patch(id, data)
      setEntries((prev) =>
        prev.map((entry) => (entry.id === id ? updatedEntry : entry)),
      )
      success.update('Lançamento')

      // Atualizar summary após fazer patch do lançamento
      if (currentFilters) {
        await fetchEntries(currentFilters)
      }

      return updatedEntry
    } catch (err) {
      console.error('Error patching entry:', err)
      error.update('Lançamento')
      throw err
    }
  }

  const deleteEntry = async (id: string) => {
    try {
      await entriesService.delete(id)
      setEntries((prev) => prev.filter((entry) => entry.id !== id))
      success.delete('Lançamento')

      // Atualizar summary após deletar lançamento
      if (currentFilters) {
        await fetchEntries(currentFilters)
      }
    } catch (err) {
      console.error('Error deleting entry:', err)
      error.delete('Lançamento')
      throw err
    }
  }

  const getEntryById = async (id: string) => {
    try {
      return await entriesService.getById(id)
    } catch (err) {
      console.error('Error fetching entry:', err)
      error.general('Erro ao buscar lançamento')
      throw err
    }
  }

  // Carregar lançamentos na inicialização com filtros apenas se shouldFetch for true
  useEffect(() => {
    if (shouldFetch) {
      fetchEntries(currentFilters)
    }
  }, [shouldFetch])

  return {
    entries,
    isLoading,
    error: errorState,
    pagination,
    summary,
    currentFilters,
    fetchEntries,
    updateFilters,
    addEntry,
    updateEntry,
    patchEntry,
    deleteEntry,
    getEntryById,
    refetch: () => fetchEntries(currentFilters),
  }
}
