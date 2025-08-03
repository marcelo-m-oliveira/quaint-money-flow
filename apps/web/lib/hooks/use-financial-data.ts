'use client'

import { useEffect, useState } from 'react'

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

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Alimentação',
    color: '#10B981',
    type: 'expense',
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Moradia',
    color: '#3B82F6',
    type: 'expense',
    createdAt: new Date(),
  },
  {
    id: '3',
    name: 'Transporte',
    color: '#F59E0B',
    type: 'expense',
    createdAt: new Date(),
  },
  {
    id: '4',
    name: 'Salário',
    color: '#10B981',
    type: 'income',
    createdAt: new Date(),
  },
  {
    id: '5',
    name: 'Freelance',
    color: '#8B5CF6',
    type: 'income',
    createdAt: new Date(),
  },
]

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
              },
            ) => ({
              ...t,
              date: new Date(t.date),
              createdAt: new Date(t.createdAt),
              updatedAt: new Date(t.updatedAt),
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
        } else {
          setCategories(DEFAULT_CATEGORIES)
          localStorage.setItem(
            STORAGE_KEYS.CATEGORIES,
            JSON.stringify(DEFAULT_CATEGORIES),
          )
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        setCategories(DEFAULT_CATEGORIES)
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
      date: new Date(data.date),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const updatedTransactions = [...transactions, newTransaction]
    saveTransactions(updatedTransactions)
  }

  // Editar transação
  const updateTransaction = (id: string, data: TransactionFormData) => {
    const updatedTransactions = transactions.map((transaction) => {
      if (transaction.id === id) {
        return {
          ...transaction,
          description: data.description,
          amount: parseFloat(data.amount),
          type: data.type,
          categoryId: data.categoryId,
          date: new Date(data.date),
          updatedAt: new Date(),
        }
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

  // Adicionar categoria
  const addCategory = (data: CategoryFormData) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name: data.name,
      color: data.color,
      type: data.type,
      parentId: data.parentId,
      createdAt: new Date(),
    }

    const updatedCategories = [...categories, newCategory]
    saveCategories(updatedCategories)
  }

  // Editar categoria
  const updateCategory = (id: string, data: CategoryFormData) => {
    const updatedCategories = categories.map((category) => {
      if (category.id === id) {
        return {
          ...category,
          name: data.name,
          color: data.color,
          type: data.type,
          parentId: data.parentId,
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
  }
}
