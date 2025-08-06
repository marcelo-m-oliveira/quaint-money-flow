'use client'

import { useEffect, useState } from 'react'

import { preferencesSchema } from '@/lib/schemas'

// Definir tipo específico para as preferências do usuário
export type UserPreferences = {
  transactionOrder: 'crescente' | 'decrescente'
  defaultNavigationPeriod:
    | 'diario'
    | 'semanal'
    | 'mensal'
    | 'trimestral'
    | 'anual'
  showDailyBalance: boolean
  viewMode: 'all' | 'cashflow'
  isFinancialSummaryExpanded: boolean
}

// Tipo para o formulário (campos opcionais)
export type PreferencesFormData = Partial<UserPreferences>

const PREFERENCES_STORAGE_KEY = 'quaint-money-preferences'

const DEFAULT_PREFERENCES: UserPreferences = {
  transactionOrder: 'decrescente',
  defaultNavigationPeriod: 'mensal',
  showDailyBalance: false,
  viewMode: 'all',
  isFinancialSummaryExpanded: false,
}

export function usePreferences() {
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [isLoading, setIsLoading] = useState(true)

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
    savePreferences(DEFAULT_PREFERENCES)
  }

  // Excluir todas as transações (função especial)
  const clearAllTransactions = () => {
    try {
      localStorage.removeItem('quaint-money-transactions')
      console.log('🗑️ Todas as transações foram excluídas')
      // Recarregar a página para atualizar os dados
      window.location.reload()
    } catch (error) {
      console.error('Erro ao excluir transações:', error)
    }
  }

  // Excluir conta completamente (função especial)
  const deleteAccount = () => {
    try {
      localStorage.removeItem('quaint-money-transactions')
      localStorage.removeItem('quaint-money-categories')
      localStorage.removeItem('quaint-money-accounts')
      localStorage.removeItem('quaint-money-credit-cards')
      localStorage.removeItem(PREFERENCES_STORAGE_KEY)
      localStorage.removeItem('quaint-money-theme')
      console.log('🗑️ Conta excluída completamente')
      // Recarregar a página para atualizar os dados
      window.location.reload()
    } catch (error) {
      console.error('Erro ao excluir conta:', error)
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
