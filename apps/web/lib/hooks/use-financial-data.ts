'use client'

import { useEffect, useState } from 'react'

import { dateStringToTimestamp } from '../format'
import {
  Category,
  CategoryFormData,
  Transaction,
  TransactionFormData,
} from '../types'

const STORAGE_KEYS = {
  TRANSACTIONS: 'quaint-money-transactions',
  CATEGORIES: 'quaint-money-categories',
}

// Removido DEFAULT_CATEGORIES - agora só carrega dados do localStorage ou mock

export function useFinancialData() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Carregar dados do localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        const storedTransactions = localStorage.getItem(
          STORAGE_KEYS.TRANSACTIONS,
        )
        const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES)

        if (storedTransactions) {
          const parsedTransactions = JSON.parse(storedTransactions).map(
            (
              t: Omit<Transaction, 'date' | 'createdAt' | 'updatedAt'> & {
                date: string
                createdAt: string
                updatedAt: string
                paid?: boolean
              },
            ) => ({
              ...t,
              date: new Date(t.date),
              createdAt: new Date(t.createdAt),
              updatedAt: new Date(t.updatedAt),
              paid: t.paid ?? false, // Garantir compatibilidade com transações existentes
            }),
          )
          setTransactions(parsedTransactions)
        }

        if (storedCategories) {
          const parsedCategories = JSON.parse(storedCategories).map(
            (c: Omit<Category, 'createdAt'> & { createdAt: string }) => ({
              ...c,
              createdAt: new Date(c.createdAt),
            }),
          )
          setCategories(parsedCategories)
        }
        // Não criar categorias padrão - deixar vazio até que dados sejam inseridos
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        // Não definir categorias padrão em caso de erro
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Salvar transações no localStorage
  const saveTransactions = (newTransactions: Transaction[]) => {
    localStorage.setItem(
      STORAGE_KEYS.TRANSACTIONS,
      JSON.stringify(newTransactions),
    )
    setTransactions(newTransactions)
  }

  // Salvar categorias no localStorage
  const saveCategories = (newCategories: Category[]) => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(newCategories))
    setCategories(newCategories)
  }

  // Adicionar transação
  const addTransaction = (data: TransactionFormData) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      description: data.description,
      amount: parseFloat(data.amount),
      type: data.type,
      categoryId: data.categoryId,
      accountId: data.accountId || undefined,
      creditCardId: data.creditCardId || undefined,
      date: dateStringToTimestamp(data.date),
      paid: data.paid,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    const updatedTransactions = [...transactions, newTransaction]
    saveTransactions(updatedTransactions)
  }

  // Editar transação
  const updateTransaction = (id: string, data: TransactionFormData) => {
    const updatedTransactions = transactions.map((transaction) => {
      if (transaction.id === id) {
        const updatedTransaction = {
          ...transaction,
          description: data.description,
          amount: parseFloat(data.amount),
          type: data.type,
          categoryId: data.categoryId,
          accountId: data.accountId || undefined,
          creditCardId: data.creditCardId || undefined,
          date: dateStringToTimestamp(data.date),
          paid: data.paid,
          updatedAt: Date.now(),
        }
        return updatedTransaction
      }
      return transaction
    })

    saveTransactions(updatedTransactions)
  }

  // Deletar transação
  const deleteTransaction = (id: string) => {
    const updatedTransactions = transactions.filter(
      (transaction) => transaction.id !== id,
    )
    saveTransactions(updatedTransactions)
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
  const addCategory = (data: CategoryFormData) => {
    // Para subcategorias, se não foi fornecido ícone, herdar da categoria pai
    let icon = data.icon
    if (data.parentId && !icon) {
      const parentCategory = categories.find((cat) => cat.id === data.parentId)
      icon = parentCategory?.icon || 'FileText'
    }

    const newCategory: Category = {
      id: Date.now().toString(),
      name: data.name,
      color: data.color,
      type: data.type,
      icon: icon || 'FileText',
      parentId: data.parentId,
      createdAt: new Date(),
    }

    const updatedCategories = [...categories, newCategory]
    saveCategories(updatedCategories)
  }

  // Editar categoria
  const updateCategory = (id: string, data: CategoryFormData) => {
    // Encontrar a categoria que está sendo editada
    const categoryBeingUpdated = categories.find((cat) => cat.id === id)

    const updatedCategories = categories.map((category) => {
      if (category.id === id) {
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
          else if (category.parentId !== data.parentId) {
            const oldParentCategory = categories.find(
              (cat) => cat.id === category.parentId,
            )
            // Se o ícone atual é igual ao da categoria pai anterior, herdar da nova categoria pai
            if (icon === oldParentCategory?.icon) {
              icon = newParentCategory?.icon || 'FileText'
            }
          }
        }

        return {
          ...category,
          name: data.name,
          color: data.color,
          type: data.type,
          icon: icon || category.icon || 'FileText',
          parentId: data.parentId,
        }
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

    saveCategories(updatedCategories)
  }

  // Deletar categoria
  const deleteCategory = (id: string) => {
    // Verificar se há transações usando esta categoria
    const hasTransactions = transactions.some(
      (transaction) => transaction.categoryId === id,
    )

    if (hasTransactions) {
      throw new Error(
        'Não é possível deletar uma categoria que possui transações associadas.',
      )
    }

    const updatedCategories = categories.filter(
      (category) => category.id !== id,
    )
    saveCategories(updatedCategories)
  }

  // Obter transações com categorias
  const getTransactionsWithCategories = (): (Transaction & {
    category: Category
  })[] => {
    return transactions.map((transaction) => {
      const category = categories.find(
        (cat) => cat.id === transaction.categoryId,
      )
      return {
        ...transaction,
        category: category || {
          id: '',
          name: 'Categoria não encontrada',
          color: '#6B7280',
          type: 'expense' as const,
          icon: 'FileText',
          createdAt: new Date(),
        },
      }
    })
  }

  // Calcular totais
  const getTotals = () => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      income,
      expenses,
      balance: income - expenses,
    }
  }

  return {
    transactions,
    categories,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    getTransactionsWithCategories,
    getTotals,
    getCategoryIcon,
  }
}
