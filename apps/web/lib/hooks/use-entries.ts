'use client'

import { useEffect, useState } from 'react'

import { entriesService } from '@/lib/services/entries'
import {
  EntriesQueryParams,
  EntriesResponse,
  Entry,
  EntryFormData,
} from '@/lib/types'

import { useCrudToast } from './use-crud-toast'

export function useEntries(initialFilters?: EntriesQueryParams) {
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
  const { success, error } = useCrudToast()

  const fetchEntries = async (params?: EntriesQueryParams) => {
    try {
      setIsLoading(true)
      setErrorState(null)
      const response = await entriesService.getAll(params)
      setEntries(response.entries)
      setPagination(response.pagination)
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

  // Carregar lançamentos na inicialização com filtros
  useEffect(() => {
    fetchEntries(currentFilters)
  }, [])

  return {
    entries,
    isLoading,
    error: errorState,
    pagination,
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
