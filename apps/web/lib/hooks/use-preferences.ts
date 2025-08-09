'use client'

import { useEffect, useState } from 'react'

import { preferencesSchema } from '@/lib/schemas'

import { useCrudToast } from './use-crud-toast'

// Definir tipo específico para as preferências do usuário
export type UserPreferences = {
  transactionOrder: 'ascending' | 'descending'
  defaultNavigationPeriod:
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'quarterly'
    | 'yearly'
  showDailyBalance: boolean
  viewMode: 'all' | 'cashflow'
  isFinancialSummaryExpanded: boolean
}

// Tipo para o formulário (campos opcionais)
export type PreferencesFormData = Partial<UserPreferences>

const PREFERENCES_STORAGE_KEY = 'quaint-money-preferences'

const DEFAULT_PREFERENCES: UserPreferences = {
  transactionOrder: 'descending',
  defaultNavigationPeriod: 'monthly',
  showDailyBalance: false,
  viewMode: 'all',
  isFinancialSummaryExpanded: false,
}

export function usePreferences() {
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [isLoading, setIsLoading] = useState(true)
  const { success, error } = useCrudToast()

  // Carregar preferências do localStorage
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY)
        if (stored) {
          const parsedPreferences = JSON.parse(stored)
          // Validar com Zod antes de aplicar
          const validationResult =
            preferencesSchema.safeParse(parsedPreferences)
          if (validationResult.success) {
            setPreferences({ ...DEFAULT_PREFERENCES, ...validationResult.data })
          } else {
            console.warn(
              'Preferências inválidas encontradas, usando padrões:',
              validationResult.error,
            )
            setPreferences(DEFAULT_PREFERENCES)
          }
        }
      } catch (error) {
        console.error('Erro ao carregar preferências:', error)
        setPreferences(DEFAULT_PREFERENCES)
      } finally {
        setIsLoading(false)
      }
    }

    loadPreferences()

    // Listener para mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === PREFERENCES_STORAGE_KEY) {
        loadPreferences()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Salvar preferências no localStorage
  const savePreferences = (newPreferences: UserPreferences) => {
    try {
      // Validar com Zod antes de salvar
      const validationResult = preferencesSchema.safeParse(newPreferences)
      if (!validationResult.success) {
        console.error(
          '❌ Erro de validação ao salvar preferências:',
          validationResult.error,
        )
        throw new Error('Dados de preferências inválidos')
      }

      localStorage.setItem(
        PREFERENCES_STORAGE_KEY,
        JSON.stringify(validationResult.data),
      )

      setPreferences(validationResult.data)
    } catch (error) {
      console.error('❌ Erro ao salvar preferências:', error)
      throw error
    }
  }

  // Atualizar uma preferência específica
  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K],
  ) => {
    const updatedPreferences = {
      ...preferences,
      [key]: value,
    }
    savePreferences(updatedPreferences)
  }

  // Resetar preferências para o padrão
  const resetPreferences = () => {
    try {
      savePreferences(DEFAULT_PREFERENCES)
      success.update('Preferências resetadas para o padrão')
    } catch (err) {
      error.update('Preferências', 'Não foi possível resetar as preferências.')
    }
  }

  // Excluir todas as transações (função especial)
  const clearAllTransactions = async () => {
    try {
      const token = localStorage.getItem('quaint-money-token')
      if (!token) {
        throw new Error('Token de autenticação não encontrado')
      }

      const response = await fetch('/api/v1/transactions', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir transações')
      }

      console.log('🗑️ Todas as transações foram excluídas')
      success.delete('Todas as transações')
      // Recarregar a página para atualizar os dados
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      console.error('Erro ao excluir transações:', err)
      error.delete('transações')
    }
  }

  // Excluir conta completamente (função especial)
  const deleteAccount = async () => {
    try {
      const token = localStorage.getItem('quaint-money-token')
      if (!token) {
        throw new Error('Token de autenticação não encontrado')
      }

      const response = await fetch('/api/v1/transactions/user-data', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir conta')
      }

      // Limpar dados locais após sucesso da API
      localStorage.removeItem('quaint-money-token')
      localStorage.removeItem('quaint-money-transactions')
      localStorage.removeItem('quaint-money-categories')
      localStorage.removeItem('quaint-money-accounts')
      localStorage.removeItem('quaint-money-credit-cards')
      localStorage.removeItem(PREFERENCES_STORAGE_KEY)
      localStorage.removeItem('quaint-money-theme')

      console.log('🗑️ Conta excluída completamente')
      success.delete('Conta completa')
      // Recarregar a página para atualizar os dados
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      console.error('Erro ao excluir conta:', err)
      error.delete('conta')
    }
  }

  return {
    preferences,
    isLoading,
    updatePreference,
    savePreferences,
    resetPreferences,
    clearAllTransactions,
    deleteAccount,
  }
}
