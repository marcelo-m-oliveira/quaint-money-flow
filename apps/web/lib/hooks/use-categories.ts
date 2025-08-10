'use client'

import { useEffect, useState } from 'react'

import {
  CategoriesQueryParams,
  CategoriesResponse,
  categoriesService,
  Category,
  CategoryFormData,
} from '@/lib/services/categories'

import { useCrudToast } from './use-crud-toast'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorState, setErrorState] = useState<string | null>(null)
  const [pagination, setPagination] = useState<
    CategoriesResponse['pagination']
  >({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })
  const { success, error } = useCrudToast()

  const fetchCategories = async (params?: CategoriesQueryParams) => {
    try {
      setIsLoading(true)
      const response = await categoriesService.getAll(params)
      setCategories(response.categories)
      setPagination(response.pagination)
    } catch (err) {
      console.error('Error fetching categories:', err)
      error.general('Erro ao carregar categorias')
    } finally {
      setIsLoading(false)
    }
  }

  const addCategory = async (data: CategoryFormData) => {
    try {
      const newCategory = await categoriesService.create(data)
      setCategories((prev) => [newCategory, ...prev])
      success.create('Categoria')
      return newCategory
    } catch (err) {
      console.error('Error creating category:', err)
      error.create('Categoria')
      throw err
    }
  }

  const updateCategory = async (
    id: string,
    data: Partial<CategoryFormData>,
  ) => {
    try {
      const updatedCategory = await categoriesService.update(id, data)
      setCategories((prev) =>
        prev.map((category) =>
          category.id === id ? updatedCategory : category,
        ),
      )
      success.update('Categoria')
      return updatedCategory
    } catch (err) {
      console.error('Error updating category:', err)
      error.update('Categoria')
      throw err
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      await categoriesService.delete(id)
      setCategories((prev) => prev.filter((category) => category.id !== id))
      success.delete('Categoria')
    } catch (err) {
      console.error('Error deleting category:', err)
      error.delete('Categoria')
      throw err
    }
  }

  const getCategoryById = async (id: string) => {
    try {
      return await categoriesService.getById(id)
    } catch (err) {
      console.error('Error fetching category:', err)
      error.general('Erro ao buscar categoria')
      throw err
    }
  }

  const getSelectOptions = async (type?: 'income' | 'expense') => {
    try {
      return await categoriesService.getSelectOptions(type)
    } catch (err) {
      console.error('Error fetching select options:', err)
      error.general('Erro ao carregar opções de categoria')
      throw err
    }
  }

  const getUsageStats = async () => {
    try {
      return await categoriesService.getUsageStats()
    } catch (err) {
      console.error('Error fetching usage stats:', err)
      error.general('Erro ao carregar estatísticas de uso')
      throw err
    }
  }

  // Carregar categorias na inicialização
  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    isLoading,
         error: errorState,
    pagination,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getSelectOptions,
    getUsageStats,
    refetch: () => fetchCategories(),
  }
}
