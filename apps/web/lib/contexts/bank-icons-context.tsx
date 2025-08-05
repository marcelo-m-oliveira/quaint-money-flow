'use client'

import React, { createContext, useCallback, useContext, useState } from 'react'

import { BANK_ICONS, searchBanks } from '../data/banks'
import { BankIcon } from '../types'

interface BankIconsContextType {
  bankIcons: BankIcon[]
  isLoading: boolean
  searchBanks: (query: string) => BankIcon[]
  loadBankIcons: () => void
}

const BankIconsContext = createContext<BankIconsContextType | undefined>(
  undefined,
)

export function BankIconsProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [bankIcons, setBankIcons] = useState<BankIcon[]>([])

  // Função para carregar os ícones dos bancos quando necessário
  const loadBankIcons = useCallback(() => {
    if (bankIcons.length > 0) {
      return // Já carregados
    }

    setIsLoading(true)
    // Simula um pequeno delay para mostrar que está carregando
    const timer = setTimeout(() => {
      setBankIcons(BANK_ICONS)
      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [bankIcons.length])

  // Função de busca simples sem cache
  const searchBanksFunction = useCallback(
    (query: string): BankIcon[] => {
      // Se não há query, retorna todos os ícones
      if (!query.trim()) {
        return bankIcons
      }

      // Faz a busca diretamente
      return searchBanks(query)
    },
    [bankIcons],
  )

  const value: BankIconsContextType = {
    bankIcons,
    isLoading,
    searchBanks: searchBanksFunction,
    loadBankIcons,
  }

  return (
    <BankIconsContext.Provider value={value}>
      {children}
    </BankIconsContext.Provider>
  )
}

export function useBankIcons() {
  const context = useContext(BankIconsContext)
  if (context === undefined) {
    throw new Error(
      'useBankIcons deve ser usado dentro de um BankIconsProvider',
    )
  }
  return context
}
