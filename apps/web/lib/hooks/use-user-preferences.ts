'use client'

import { useEffect } from 'react'

import { useUserPreferences as useUserPreferencesContext } from '../contexts/user-preferences-context'

// Hook que retorna o contexto de preferências sem inicialização automática
export function useUserPreferences() {
  return useUserPreferencesContext()
}

// Hook que inicializa as preferências automaticamente quando usado
export function useUserPreferencesWithAutoInit() {
  const context = useUserPreferencesContext()

  // Inicializar preferências automaticamente quando o hook é usado
  useEffect(() => {
    if (!context.isInitialized) {
      context.initialize()
    }
  }, [context])

  return context
}

export { useUserPreferences as useUserPreferencesContext } from '../contexts/user-preferences-context'
