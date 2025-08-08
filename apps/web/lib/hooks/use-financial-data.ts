'use client'

import { useCallback, useEffect, useState } from 'react'

import { dateStringToTimestamp } from '../format'
import {
  createInstallmentTransactions,
  RecurringTransactionsService,
} from '../services/recurring-transactions.service'
import {
  Category,
  CategoryFormData,
  Transaction,
  TransactionFormData,
} from '../types'
import { useCrudToast } from './use-crud-toast'

const STORAGE_KEYS = {
  TRANSACTIONS: 'quaint-money-transactions',
  CATEGORIES: 'quaint-money-categories',
}

// Removido DEFAULT_CATEGORIES - agora só carrega dados do localStorage ou mock

export function useFinancialData() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { success, error, warning } = useCrudToast()

  // Carregar dados do localStorage na inicialização
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

    // Listener para mudanças no localStorage (para detectar mudanças externas)
    // NOTA: Removido para evitar loop infinito com eventos transactionsUpdated
    const handleStorageChange = (e: StorageEvent) => {
      // Ignorar mudanças no localStorage se elas vêm de eventos customizados
      // O evento transactionsUpdated já cuida dessas atualizações
      if (e.key === STORAGE_KEYS.TRANSACTIONS && e.newValue) {
        console.log('🔄 Mudança no localStorage detectada, mas ignorada para evitar loop')
        // Não atualizar o estado aqui para evitar loop infinito
      }
    }

    // Listener para evento customizado de atualização de transações
    const handleTransactionsUpdate = (e: CustomEvent) => {
      if (e.detail?.transactions) {
        try {
          const parsedTransactions = e.detail.transactions.map(
            (
              t: Omit<Transaction, 'date' | 'createdAt' | 'updatedAt'> & {
                date: string | Date
                createdAt: string | Date
                updatedAt: string | Date
                paid?: boolean
              },
            ) => ({
              ...t,
              date: t.date instanceof Date ? t.date : new Date(t.date),
              createdAt:
                t.createdAt instanceof Date
                  ? t.createdAt
                  : new Date(t.createdAt),
              updatedAt:
                t.updatedAt instanceof Date
                  ? t.updatedAt
                  : new Date(t.updatedAt),
              paid: t.paid ?? false,
            }),
          )
          setTransactions(parsedTransactions)
        } catch (error) {
          console.error('Erro ao processar evento de atualização:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener(
      'transactionsUpdated',
      handleTransactionsUpdate as EventListener,
    )

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener(
        'transactionsUpdated',
        handleTransactionsUpdate as EventListener,
      )
    }
  }, [])

  // Salvar transações no localStorage
  const saveTransactions = (newTransactions: Transaction[]) => {
    // Evitar loop infinito: não disparar evento storage se a mudança vem do próprio hook
    const currentTransactionsStr = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
    const newTransactionsStr = JSON.stringify(newTransactions)
    
    if (currentTransactionsStr !== newTransactionsStr) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, newTransactionsStr)
    }
    setTransactions(newTransactions)
  }

  // Salvar categorias no localStorage
  const saveCategories = (newCategories: Category[]) => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(newCategories))
    setCategories(newCategories)
  }

  // Adicionar transação
  const addTransaction = (data: TransactionFormData) => {
    try {
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
        isRecurring: data.isRecurring,
        recurringType: data.recurringType,
        fixedFrequency: data.fixedFrequency,
        installmentCount: data.installmentCount,
        installmentPeriod: data.installmentPeriod,
        // Para transações parceladas, definir currentInstallment como 1 se não foi especificado
        currentInstallment:
          data.recurringType === 'installment'
            ? data.currentInstallment || 1
            : data.currentInstallment,
        parentTransactionId: data.parentTransactionId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      let allTransactions = [newTransaction]

      // Se é uma transação parcelada, criar automaticamente todas as parcelas
      if (
        data.isRecurring &&
        data.recurringType === 'installment' &&
        data.installmentCount &&
        data.installmentCount > 1
      ) {
        const installmentTransactions =
          createInstallmentTransactions(newTransaction)
        allTransactions = [newTransaction, ...installmentTransactions]
      }

      // Se é uma receita fixa, criar automaticamente as ocorrências para os próximos 3 anos
      else if (
        data.isRecurring &&
        data.recurringType === 'fixed' &&
        data.fixedFrequency
      ) {
        const currentTransactions = [...transactions, newTransaction]
        const fixedTransactions =
          RecurringTransactionsService.processRecurringTransactions(
            currentTransactions,
          )
        allTransactions = [newTransaction, ...fixedTransactions]
      }

      const updatedTransactions = [...transactions, ...allTransactions]
      saveTransactions(updatedTransactions)

      const transactionType = data.type === 'income' ? 'Receita' : 'Despesa'
      const message =
        allTransactions.length > 1
          ? `${transactionType} criada com ${allTransactions.length} parcelas`
          : transactionType
      success.create(message)
    } catch (err) {
      const transactionType = data.type === 'income' ? 'receita' : 'despesa'
      error.create(transactionType)
    }
  }

  // Editar transação
  const updateTransaction = (id: string, data: TransactionFormData) => {
    try {
      const updatedTransactions = transactions.map((transaction) => {
        if (transaction.id === id) {
          return {
            ...transaction,
            description: data.description,
            amount: parseFloat(data.amount),
            type: data.type,
            categoryId: data.categoryId,
            accountId: data.accountId || undefined,
            creditCardId: data.creditCardId || undefined,
            date: dateStringToTimestamp(data.date),
            paid: data.paid,
            isRecurring: data.isRecurring,
            recurringType: data.recurringType,
            fixedFrequency: data.fixedFrequency,
            installmentCount: data.installmentCount,
            installmentPeriod: data.installmentPeriod,
            // Para transações parceladas, definir currentInstallment como 1 se não foi especificado
            currentInstallment:
              data.recurringType === 'installment'
                ? data.currentInstallment || 1
                : data.currentInstallment,
            parentTransactionId: data.parentTransactionId,
            updatedAt: Date.now(),
          }
        }
        return transaction
      })

      saveTransactions(updatedTransactions)

      const transactionType = data.type === 'income' ? 'Receita' : 'Despesa'
      success.update(transactionType)
    } catch (err) {
      const transactionType = data.type === 'income' ? 'receita' : 'despesa'
      error.update(transactionType)
    }
  }

  // Atualizar campos específicos da transação
  const updateTransactionStatus = (
    id: string,
    updates: Partial<Transaction>,
  ) => {
    const updatedTransactions = transactions.map((transaction) => {
      if (transaction.id === id) {
        return {
          ...transaction,
          ...updates,
          updatedAt: Date.now(),
        }
      }
      return transaction
    })

    saveTransactions(updatedTransactions)
  }

  // Deletar transação
  const deleteTransaction = (id: string) => {
    try {
      const transactionToDelete = transactions.find((t) => t.id === id)
      const updatedTransactions = transactions.filter(
        (transaction) => transaction.id !== id,
      )
      saveTransactions(updatedTransactions)

      const transactionType =
        transactionToDelete?.type === 'income' ? 'Receita' : 'Despesa'
      success.delete(transactionType)
    } catch (err) {
      error.delete('transação')
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
  const addCategory = (data: CategoryFormData) => {
    try {
      // Para subcategorias, se não foi fornecido ícone, herdar da categoria pai
      let icon = data.icon
      if (data.parentId && !icon) {
        const parentCategory = categories.find(
          (cat) => cat.id === data.parentId,
        )
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
      success.create('Categoria')
    } catch (err) {
      error.create('categoria')
    }
  }

  // Editar categoria
  const updateCategory = (id: string, data: CategoryFormData) => {
    try {
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
      success.update('Categoria')
    } catch (err) {
      error.update('categoria')
    }
  }

  // Deletar categoria
  const deleteCategory = (id: string) => {
    try {
      // Verificar se há transações usando esta categoria
      const hasTransactions = transactions.some(
        (transaction) => transaction.categoryId === id,
      )

      if (hasTransactions) {
        warning.validation(
          'Não é possível deletar uma categoria que possui transações associadas.',
        )
        return
      }

      const updatedCategories = categories.filter(
        (category) => category.id !== id,
      )
      saveCategories(updatedCategories)
      success.delete('Categoria')
    } catch (err) {
      error.delete('categoria')
    }
  }

  // Obter transações com categorias
  const getTransactionsWithCategories = useCallback((): (Transaction & {
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
  }, [transactions, categories])

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
    updateTransactionStatus,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    getTransactionsWithCategories,
    getTotals,
    getCategoryIcon,
  }
}
