'use client'

import { apiClient, useCrudToast } from '@/lib'
import { entriesService } from '@/lib/services/entries'

export function usePreferences() {
  const { success, error } = useCrudToast()

  // Excluir todas as transações (função especial)
  const clearAllEntries = async () => {
    try {
      const result = await entriesService.deleteAll()
      console.log('🗑️ Todas as transações foram excluídas:', result.message)
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
      await apiClient.delete<void>('/user-preferences')

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
    clearAllEntries,
    deleteAccount,
  }
}
