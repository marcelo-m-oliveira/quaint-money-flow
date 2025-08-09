'use client'

import { useEffect } from 'react'

import { useAccounts as useAccountsContext } from '../contexts/accounts-context'

// Hook que retorna o contexto de contas sem inicialização automática
export function useAccounts() {
  return useAccountsContext()
}

// Hook que inicializa as contas automaticamente quando usado
export function useAccountsWithAutoInit() {
  const context = useAccountsContext()
  
  // Inicializar contas automaticamente quando o hook é usado
  useEffect(() => {
    if (!context.isInitialized) {
      context.initialize()
    }
  }, [context])
  
  return context
}

export { useAccounts as useAccountsContext } from '../contexts/accounts-context'
