'use client'

import { useEffect, useRef } from 'react'

import { useAccounts as useAccountsContext } from '../contexts/accounts-context'

// Hook que inicializa as contas automaticamente quando usado
export function useAccountsWithAutoInit() {
  const context = useAccountsContext()
  const hasInitialized = useRef(false)

  // Inicializar contas automaticamente quando o hook é usado
  useEffect(() => {
    if (!context.isInitialized && !hasInitialized.current) {
      hasInitialized.current = true
      context.initialize()
    }
  }, [context.isInitialized, context.initialize])

  return context
}
