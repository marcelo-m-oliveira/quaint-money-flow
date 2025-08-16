'use client'

import React, { createContext, useCallback, useContext, useState } from 'react'

import { useCrudToast } from '../hooks/use-crud-toast'
import { userPreferencesService } from '../services/user-preferences'
import { UserPreferences, UserPreferencesFormData } from '../types'

interface UserPreferencesContextType {
  preferences: UserPreferences | null
  isLoading: boolean
  isInitialized: boolean
  updatePreferences: (
    id: string,
    data: UserPreferencesFormData,
  ) => Promise<UserPreferences>
  upsertPreferences: (data: UserPreferencesFormData) => Promise<UserPreferences>
  resetPreferences: () => Promise<UserPreferences>
  refetch: () => Promise<void>
  initialize: () => Promise<void>
}

const UserPreferencesContext = createContext<
  UserPreferencesContextType | undefined
>(undefined)

export function UserPreferencesProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const { success, error } = useCrudToast()

  // Carregar preferências da API
  const loadPreferences = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await userPreferencesService.get()

      // Mapear campos da API para o frontend
      const preferencesWithDates = {
        ...response.data,
        // Mapear entryOrder para entryOrder
        entryOrder: response.data.entryOrder,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt,
      }
      setPreferences(preferencesWithDates)
      setIsInitialized(true)
    } catch (err) {
      console.error('Erro ao carregar preferências:', err)
      // Se não encontrar preferências, criar com valores padrão
      try {
        const defaultPreferences = await userPreferencesService.createDefault()

        // Mapear campos da API para o frontend
        const preferencesWithDates = {
          ...defaultPreferences,
          // Mapear entryOrder para entryOrder
          entryOrder: defaultPreferences.entryOrder,
          createdAt: defaultPreferences.createdAt,
          updatedAt: defaultPreferences.updatedAt,
        }
        setPreferences(preferencesWithDates)
        setIsInitialized(true)
      } catch (createErr) {
        console.error('Erro ao criar preferências padrão:', createErr)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Inicializar preferências apenas quando necessário
  const initialize = useCallback(async () => {
    if (!isInitialized && !isLoading) {
      await loadPreferences()
    }
  }, [isInitialized, isLoading, loadPreferences])

  // Atualizar preferências
  const updatePreferences = useCallback(
    async (data: UserPreferencesFormData) => {
      try {
        setIsLoading(true)

        // Enviar apenas os campos que estão sendo alterados
        const apiData: Partial<UserPreferencesFormData> = { ...data }

        const updatedPreferences = await userPreferencesService.update(apiData)

        // Mapear campos da API para o frontend
        setPreferences(updatedPreferences)
        success.update('Preferências atualizadas com sucesso')
        return updatedPreferences
      } catch (err) {
        console.error('Erro ao atualizar preferências:', err)
        error.update(
          'Preferências',
          'Não foi possível atualizar as preferências.',
        )
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [success, error],
  )

  // Criar ou atualizar preferências (upsert)
  const upsertPreferences = useCallback(
    async (data: UserPreferencesFormData) => {
      try {
        setIsLoading(true)

        // Enviar apenas os campos que estão sendo alterados
        const apiData: Partial<UserPreferencesFormData> = { ...data }

        const upsertedPreferences = await userPreferencesService.upsert(apiData)

        setPreferences(upsertedPreferences)
        success.create('Preferências salvas com sucesso')
        return upsertedPreferences
      } catch (err) {
        console.error('Erro ao salvar preferências:', err)
        error.create('Preferências', 'Não foi possível salvar as preferências.')
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [success, error],
  )

  // Resetar preferências para valores padrão
  const resetPreferences = useCallback(async () => {
    try {
      setIsLoading(true)
      const resetPreferences = await userPreferencesService.reset()

      setPreferences(resetPreferences)
      success.update('Preferências resetadas para o padrão')
      return resetPreferences
    } catch (err) {
      console.error('Erro ao resetar preferências:', err)
      error.update('Preferências', 'Não foi possível resetar as preferências.')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [success, error])

  // Recarregar preferências
  const refetch = useCallback(async () => {
    await loadPreferences()
  }, [loadPreferences])

  const value: UserPreferencesContextType = {
    preferences,
    isLoading,
    isInitialized,
    updatePreferences,
    upsertPreferences,
    resetPreferences,
    refetch,
    initialize,
  }

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  )
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext)
  if (context === undefined) {
    throw new Error(
      'useUserPreferences must be used within a UserPreferencesProvider',
    )
  }
  return context
}
