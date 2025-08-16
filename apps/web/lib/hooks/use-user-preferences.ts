'use client'

import { useEffect, useRef } from 'react'

import { useUserPreferences as useUserPreferencesContext } from '../contexts/user-preferences-context'

// Hook que inicializa as preferências automaticamente quando usado
export function useUserPreferencesWithAutoInit() {
  const context = useUserPreferencesContext()
  const hasInitialized = useRef(false)

  // Inicializar preferências automaticamente quando o hook é usado
  useEffect(() => {
    if (
      !hasInitialized.current &&
      !context.isInitialized &&
      !context.isLoading
    ) {
      hasInitialized.current = true
      context.initialize()
    }
  }, [context.isInitialized, context.isLoading, context.initialize])

  return context
}
