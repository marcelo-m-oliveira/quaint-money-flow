'use client'

import { useEffect } from 'react'

import { useCreditCards as useCreditCardsContext } from '../contexts/credit-cards-context'

// Hook que retorna o contexto de cartões de crédito sem inicialização automática
export function useCreditCards() {
  return useCreditCardsContext()
}

// Hook que inicializa os cartões automaticamente quando usado
export function useCreditCardsWithAutoInit() {
  const context = useCreditCardsContext()

  // Inicializar cartões automaticamente quando o hook é usado
  useEffect(() => {
    if (!context.isInitialized) {
      context.initialize()
    }
  }, [context])

  return context
}

export { useCreditCards as useCreditCardsContext } from '../contexts/credit-cards-context'
