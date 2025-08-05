'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

import { BANK_ICONS, searchBanks } from '../data/banks'
import { BankIcon } from '../types'

interface BankIconsContextType {
  bankIcons: BankIcon[]
  isLoading: boolean
  searchBanksWithCache: (query: string) => BankIcon[]
  preloadBankImages: (banks: BankIcon[]) => void
  clearCache: () => void
}

const BankIconsContext = createContext<BankIconsContextType | undefined>(
  undefined,
)

export function BankIconsProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [bankIcons, setBankIcons] = useState<BankIcon[]>([])
  const [searchCache, setSearchCache] = useState<Map<string, BankIcon[]>>(
    new Map(),
  )

  // Carrega os ícones apenas uma vez quando o provider é montado
  useEffect(() => {
    setIsLoading(true)
    // Simula um pequeno delay para mostrar que está carregando
    const timer = setTimeout(() => {
      setBankIcons(BANK_ICONS)
      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // Função de busca com cache
  const searchBanksWithCache = useCallback(
    (query: string): BankIcon[] => {
      // Se não há query, retorna todos os ícones
      if (!query.trim()) {
        return bankIcons
      }

      // Verifica se já temos o resultado em cache
      const cacheKey = query.toLowerCase().trim()
      if (searchCache.has(cacheKey)) {
        return searchCache.get(cacheKey)!
      }

      // Faz a busca e armazena no cache
      const results = searchBanks(query)
      setSearchCache((prev) => {
        const newCache = new Map(prev)
        newCache.set(cacheKey, results)

        // Limita o cache para não crescer indefinidamente
        if (newCache.size > 100) {
          const firstKey = newCache.keys().next().value
          if (firstKey) {
            newCache.delete(firstKey)
          }
        }

        return newCache
      })

      return results
    },
    [bankIcons], // Removido searchCache das dependências para evitar recriação
  )

  // Função para pré-carregar imagens
  const preloadBankImages = useCallback((banks: BankIcon[]) => {
    banks.forEach((bank) => {
      const img = new Image()
      img.src = bank.icon
    })
  }, [])

  // Função para limpar o cache
  const clearCache = useCallback(() => {
    setSearchCache(new Map())
  }, [])

  // Pré-carrega as primeiras imagens quando os ícones são carregados
  useEffect(() => {
    if (bankIcons.length > 0) {
      // Pré-carrega os primeiros 50 ícones mais comuns
      const commonBanks = bankIcons.slice(0, 50)
      preloadBankImages(commonBanks)
    }
  }, [bankIcons, preloadBankImages])

  const value: BankIconsContextType = {
    bankIcons,
    isLoading,
    searchBanksWithCache,
    preloadBankImages,
    clearCache,
  }

  return (
    <BankIconsContext.Provider value={value}>
      {children}
    </BankIconsContext.Provider>
  )
}

export function useBankIconsCache() {
  const context = useContext(BankIconsContext)
  if (context === undefined) {
    throw new Error(
      'useBankIconsCache deve ser usado dentro de um BankIconsProvider',
    )
  }
  return context
}

// Hook para limpar o cache (útil para desenvolvimento)
export function useClearBankIconsCache() {
  const { clearCache } = useBankIconsCache()
  return clearCache
}
