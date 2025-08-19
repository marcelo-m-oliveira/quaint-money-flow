'use client'

import { dateToSeconds } from '@saas/utils'
import { useEffect, useState } from 'react'

import {
  categoriesService,
  Category,
  CategoryFormData,
  entriesService,
  Entry,
  EntryFormData,
  useCrudToast,
} from '@/lib'

export function useFinancialData() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { success, error, warning } = useCrudToast()

  // Carregar dados da API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        const entriesData = await entriesService.getAll()
        setEntries(entriesData.entries ?? [])

        const categoriesData = await categoriesService.getAll()
        setCategories(categoriesData.data ?? [])
      } catch (error) {
        console.error('Erro ao carregar dados da API:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Atualizar entries no estado
  const updateEntriesState = (newEntries: Entry[]) => {
    setEntries(newEntries)
  }

  // Atualizar categories no estado
  const updateCategoriesState = (newCategories: Category[]) => {
    setCategories(newCategories)
  }

  // Adicionar entry
  const addEntry = async (data: EntryFormData) => {
    try {
      const createdEntry = await entriesService.create(data)
      const updatedEntries = [...entries, createdEntry]
      updateEntriesState(updatedEntries)

      const entryType = data.type === 'income' ? 'Receita' : 'Despesa'
      success.create(entryType)
    } catch (err) {
      const entryType = data.type === 'income' ? 'receita' : 'despesa'
      error.create(entryType)
    }
  }

  // Editar entry
  const updateEntry = async (id: string, data: EntryFormData) => {
    try {
      const updatedEntry = await entriesService.update(id, data)
      const updatedEntries = entries.map((entry) =>
        entry.id === id ? updatedEntry : entry,
      )
      updateEntriesState(updatedEntries)

      const entryType = data.type === 'income' ? 'Receita' : 'Despesa'
      success.update(entryType)
    } catch (err) {
      const entryType = data.type === 'income' ? 'receita' : 'despesa'
      error.update(entryType)
    }
  }

  // Atualizar campos específicos da entry
  const updateEntryStatus = async (id: string, updates: Partial<Entry>) => {
    try {
      const updatedEntry = await entriesService.patch(id, updates as any)
      const updatedEntries = entries.map((entry) =>
        entry.id === id ? updatedEntry : entry,
      )
      updateEntriesState(updatedEntries)
    } catch (err) {
      console.error('Erro ao atualizar status da entry:', err)
    }
  }

  // Deletar entry
  const deleteEntry = async (id: string) => {
    try {
      const entryToDelete = entries.find((e) => e.id === id)
      await entriesService.delete(id)
      const updatedEntries = entries.filter((entry) => entry.id !== id)
      updateEntriesState(updatedEntries)

      const entryType = entryToDelete?.type === 'income' ? 'Receita' : 'Despesa'
      success.delete(entryType)
    } catch (err) {
      error.delete('entrada')
    }
  }

  // Função para obter o ícone correto da categoria (herda da categoria pai se for subcategoria)
  const getCategoryIcon = (category: Category | undefined): string => {
    if (!category) return 'FileText'

    // Se a categoria tem ícone próprio, usar ele
    if (category.icon) return category.icon

    // Se é subcategoria e não tem ícone, herdar da categoria pai
    if (category.parentId) {
      const parentCategory = categories.find(
        (cat) => cat.id === category.parentId,
      )
      return parentCategory?.icon || 'FileText'
    }

    return 'FileText'
  }

  // Adicionar categoria
  const addCategory = async (data: CategoryFormData) => {
    try {
      // Para subcategorias, se não foi fornecido ícone, herdar da categoria pai
      let icon = data.icon
      if (data.parentId && !icon) {
        const parentCategory = categories.find(
          (cat) => cat.id === data.parentId,
        )
        icon = parentCategory?.icon || 'FileText'
      }

      const newCategoryData = {
        name: data.name,
        color: data.color,
        type: data.type,
        icon: icon || 'FileText',
        parentId: data.parentId,
      }
      const createdCategory = await categoriesService.create(newCategoryData)
      const updatedCategories = [...categories, createdCategory]
      updateCategoriesState(updatedCategories)
      success.create('Categoria')
    } catch (err) {
      error.create('categoria')
    }
  }

  // Editar categoria
  const updateCategory = async (id: string, data: CategoryFormData) => {
    try {
      // Encontrar a categoria que está sendo editada
      const categoryBeingUpdated = categories.find((cat) => cat.id === id)

      let icon = data.icon

      // Se é uma subcategoria
      if (data.parentId) {
        const newParentCategory = categories.find(
          (cat) => cat.id === data.parentId,
        )

        // Se não foi fornecido ícone específico ou ícone está vazio (movida para nova categoria pai)
        if (!icon || icon === '') {
          icon = newParentCategory?.icon || 'FileText'
        }
        // Se a subcategoria foi movida para uma nova categoria pai e ainda tem o ícone da categoria pai anterior
        else if (
          categoryBeingUpdated &&
          categoryBeingUpdated.parentId !== data.parentId
        ) {
          const oldParentCategory = categories.find(
            (cat) => cat.id === categoryBeingUpdated.parentId,
          )
          // Se o ícone atual é igual ao da categoria pai anterior, herdar da nova categoria pai
          if (icon === oldParentCategory?.icon) {
            icon = newParentCategory?.icon || 'FileText'
          }
        }
      }

      const updatedCategoryData = {
        name: data.name,
        color: data.color,
        type: data.type,
        icon: icon || categoryBeingUpdated?.icon || 'FileText',
        parentId: data.parentId,
      }
      const updatedCategory = await categoriesService.update(
        id,
        updatedCategoryData,
      )

      const updatedCategories = categories.map((category) => {
        if (category.id === id) {
          return updatedCategory
        }

        // Se esta categoria é uma subcategoria da categoria que está sendo editada
        // e ela herdou o ícone da categoria pai, atualizar o ícone
        if (category.parentId === id && categoryBeingUpdated) {
          // Verificar se a subcategoria está usando o ícone da categoria pai
          if (category.icon === categoryBeingUpdated.icon || !category.icon) {
            return {
              ...category,
              icon: data.icon || 'FileText',
            }
          }
        }

        return category
      })

      updateCategoriesState(updatedCategories)
      success.update('Categoria')
    } catch (err) {
      error.update('categoria')
    }
  }

  // Deletar categoria
  const deleteCategory = async (id: string) => {
    try {
      // Verificar se há entries usando esta categoria
      const hasEntries = entries.some((entry) => entry.categoryId === id)

      if (hasEntries) {
        warning.constraint(
          'Não é possível deletar uma categoria que possui entradas associadas.',
        )
        return
      }

      await categoriesService.delete(id)
      const updatedCategories = categories.filter(
        (category) => category.id !== id,
      )
      updateCategoriesState(updatedCategories)
      success.delete('Categoria')
    } catch (err) {
      error.delete('categoria')
    }
  }

  // Obter entries com categorias
  const getEntriesWithCategories = (): (Entry & {
    category: Category
  })[] => {
    return entries.map((entry) => {
      const category = categories.find((cat) => cat.id === entry.categoryId)
      return {
        ...entry,
        category: category || {
          id: '',
          name: 'Categoria não encontrada',
          color: '#6B7280',
          type: 'expense' as const,
          icon: 'FileText',
          createdAt: dateToSeconds(new Date()),
        },
      }
    })
  }

  // Calcular totais
  const getTotals = () => {
    const income = entries
      .filter((e) => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0)

    const expenses = entries
      .filter((e) => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0)

    return {
      income,
      expenses,
      balance: income - expenses,
    }
  }

  return {
    entries,
    categories,
    isLoading,
    addEntry,
    updateEntry,
    updateEntryStatus,
    deleteEntry,
    addCategory,
    updateCategory,
    deleteCategory,
    getEntriesWithCategories,
    getTotals,
    getCategoryIcon,
  }
}
