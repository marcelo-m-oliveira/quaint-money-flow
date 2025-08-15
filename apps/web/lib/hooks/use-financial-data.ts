'use client'

import { dateToSeconds } from '@saas/utils'
import { useEffect, useState } from 'react'

import {
  Category,
  CategoryFormData,
  Entry,
  EntryFormData,
  useCrudToast,
} from '@/lib'

import { dateStringToTimestamp } from '../format'

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

        // Carregar entries da API usando o apiClient
        const entriesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/entries`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer dev-token-123',
            },
          }
        )
        if (entriesResponse.ok) {
          const entriesData = await entriesResponse.json()
          const parsedEntries = entriesData.entries?.map(
            (entry: Record<string, unknown>) => ({
              ...entry,
              date: new Date(entry.date as string),
              createdAt: new Date(entry.createdAt as string),
              updatedAt: new Date(entry.updatedAt as string),
              paid: entry.paid ?? false,
            }),
          ) || []
          setEntries(parsedEntries)
        }

        // Carregar categories da API usando o apiClient
        const categoriesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/categories`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer dev-token-123',
            },
          }
        )
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          const parsedCategories = categoriesData.categories?.map(
            (category: Record<string, unknown>) => ({
              ...category,
              createdAt: new Date(category.createdAt as string),
            }),
          ) || []
          setCategories(parsedCategories)
        }
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
      const newEntry: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'> = {
        description: data.description,
        amount: parseFloat(data.amount),
        type: data.type,
        categoryId: data.categoryId,
        accountId: data.accountId || undefined,
        creditCardId: data.creditCardId || undefined,
        date: dateStringToTimestamp(data.date),
        paid: data.paid,
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/entries`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer dev-token-123',
          },
          body: JSON.stringify(newEntry),
        },
      )

      if (response.ok) {
        const createdEntry = await response.json()
        const parsedEntry = {
          ...createdEntry,
          date: new Date(createdEntry.date),
          createdAt: new Date(createdEntry.createdAt),
          updatedAt: new Date(createdEntry.updatedAt),
        }
        const updatedEntries = [...entries, parsedEntry]
        updateEntriesState(updatedEntries)

        const entryType = data.type === 'income' ? 'Receita' : 'Despesa'
        success.create(entryType)
      } else {
        throw new Error('Falha ao criar entry')
      }
    } catch (err) {
      const entryType = data.type === 'income' ? 'receita' : 'despesa'
      error.create(entryType)
    }
  }

  // Editar entry
  const updateEntry = async (id: string, data: EntryFormData) => {
    try {
      const updatedEntryData = {
        description: data.description,
        amount: parseFloat(data.amount),
        type: data.type,
        categoryId: data.categoryId,
        accountId: data.accountId || undefined,
        creditCardId: data.creditCardId || undefined,
        date: dateStringToTimestamp(data.date),
        paid: data.paid,
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/entries/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer dev-token-123',
          },
          body: JSON.stringify(updatedEntryData),
        },
      )

      if (response.ok) {
        const updatedEntry = await response.json()
        const parsedEntry = {
          ...updatedEntry,
          date: new Date(updatedEntry.date),
          createdAt: new Date(updatedEntry.createdAt),
          updatedAt: new Date(updatedEntry.updatedAt),
        }

        const updatedEntries = entries.map((entry) =>
          entry.id === id ? parsedEntry : entry,
        )
        updateEntriesState(updatedEntries)

        const entryType = data.type === 'income' ? 'Receita' : 'Despesa'
        success.update(entryType)
      } else {
        throw new Error('Falha ao atualizar entry')
      }
    } catch (err) {
      const entryType = data.type === 'income' ? 'receita' : 'despesa'
      error.update(entryType)
    }
  }

  // Atualizar campos específicos da entry
  const updateEntryStatus = async (id: string, updates: Partial<Entry>) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/entries/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer dev-token-123',
          },
          body: JSON.stringify(updates),
        },
      )

      if (response.ok) {
        const updatedEntry = await response.json()
        const parsedEntry = {
          ...updatedEntry,
          date: new Date(updatedEntry.date),
          createdAt: new Date(updatedEntry.createdAt),
          updatedAt: new Date(updatedEntry.updatedAt),
        }

        const updatedEntries = entries.map((entry) =>
          entry.id === id ? parsedEntry : entry,
        )
        updateEntriesState(updatedEntries)
      }
    } catch (err) {
      console.error('Erro ao atualizar status da entry:', err)
    }
  }

  // Deletar entry
  const deleteEntry = async (id: string) => {
    try {
      const entryToDelete = entries.find((e) => e.id === id)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/entries/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: 'Bearer dev-token-123',
          },
        },
      )

      if (response.ok) {
        const updatedEntries = entries.filter((entry) => entry.id !== id)
        updateEntriesState(updatedEntries)

        const entryType =
          entryToDelete?.type === 'income' ? 'Receita' : 'Despesa'
        success.delete(entryType)
      } else {
        throw new Error('Falha ao deletar entry')
      }
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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categories`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer dev-token-123',
          },
          body: JSON.stringify(newCategoryData),
        },
      )

      if (response.ok) {
        const createdCategory = await response.json()
        const parsedCategory = {
          ...createdCategory,
          createdAt: new Date(createdCategory.createdAt),
        }
        const updatedCategories = [...categories, parsedCategory]
        updateCategoriesState(updatedCategories)
        success.create('Categoria')
      } else {
        throw new Error('Falha ao criar categoria')
      }
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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer dev-token-123',
          },
          body: JSON.stringify(updatedCategoryData),
        },
      )

      if (response.ok) {
        const updatedCategory = await response.json()
        const parsedCategory = {
          ...updatedCategory,
          createdAt: new Date(updatedCategory.createdAt),
        }

        const updatedCategories = categories.map((category) => {
          if (category.id === id) {
            return parsedCategory
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
      } else {
        throw new Error('Falha ao atualizar categoria')
      }
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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: 'Bearer dev-token-123',
          },
        },
      )

      if (response.ok) {
        const updatedCategories = categories.filter(
          (category) => category.id !== id,
        )
        updateCategoriesState(updatedCategories)
        success.delete('Categoria')
      } else {
        throw new Error('Falha ao deletar categoria')
      }
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
