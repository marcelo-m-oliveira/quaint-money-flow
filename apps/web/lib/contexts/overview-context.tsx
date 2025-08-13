'use client'

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

import { overviewService } from '@/lib/services/overview'
import type {
  GeneralOverview,
  TopExpensesByCategory,
  TopExpensesQueryParams,
} from '@/lib/types'

interface OverviewContextType {
  generalOverview: GeneralOverview | null
  topExpenses: TopExpensesByCategory | null
  isLoading: boolean
  error: string | null
  refreshGeneralOverview: () => Promise<void>
  refreshTopExpenses: (params?: TopExpensesQueryParams) => Promise<void>
}

const OverviewContext = createContext<OverviewContextType | undefined>(
  undefined,
)

interface OverviewProviderProps {
  children: ReactNode
}

export function OverviewProvider({ children }: OverviewProviderProps) {
  const [generalOverview, setGeneralOverview] =
    useState<GeneralOverview | null>(null)
  const [topExpenses, setTopExpenses] = useState<TopExpensesByCategory | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cache para evitar chamadas desnecessárias
  const lastTopExpensesParamsRef = useRef<string | null>(null)
  const isInitializedRef = useRef(false)
  const generalOverviewLoadingRef = useRef(false)
  const topExpensesLoadingRef = useRef(false)

  const refreshGeneralOverview = useCallback(async () => {
    // Evitar chamadas simultâneas
    if (generalOverviewLoadingRef.current) return

    try {
      generalOverviewLoadingRef.current = true
      setError(null)
      const data = await overviewService.getGeneralOverview()
      setGeneralOverview(data)
    } catch (err) {
      console.error('Erro ao buscar overview geral:', err)
      setError('Erro ao carregar dados do overview')
    } finally {
      generalOverviewLoadingRef.current = false
    }
  }, [])

  const refreshTopExpenses = useCallback(
    async (params?: TopExpensesQueryParams) => {
      // Evitar chamadas simultâneas
      if (topExpensesLoadingRef.current) return

      try {
        // Evitar chamadas duplicadas com os mesmos parâmetros
        const paramsKey = JSON.stringify(params || {})
        if (
          lastTopExpensesParamsRef.current === paramsKey &&
          isInitializedRef.current
        ) {
          return
        }

        topExpensesLoadingRef.current = true
        setError(null)
        const data = await overviewService.getTopExpensesByCategory(params)
        setTopExpenses(data)
        lastTopExpensesParamsRef.current = paramsKey
      } catch (err) {
        console.error('Erro ao buscar maiores gastos:', err)
        setError('Erro ao carregar maiores gastos')
      } finally {
        topExpensesLoadingRef.current = false
      }
    },
    [],
  )

  // Carregar dados iniciais apenas uma vez
  useEffect(() => {
    const loadInitialData = async () => {
      if (isInitializedRef.current) return

      setIsLoading(true)
      await Promise.all([
        refreshGeneralOverview(),
        refreshTopExpenses({ period: 'current-month' }),
      ])
      setIsLoading(false)
      isInitializedRef.current = true
    }

    loadInitialData()
  }, [refreshGeneralOverview, refreshTopExpenses])

  const value: OverviewContextType = {
    generalOverview,
    topExpenses,
    isLoading,
    error,
    refreshGeneralOverview,
    refreshTopExpenses,
  }

  return (
    <OverviewContext.Provider value={value}>
      {children}
    </OverviewContext.Provider>
  )
}

export function useOverviewContext(): OverviewContextType {
  const context = useContext(OverviewContext)
  if (context === undefined) {
    throw new Error(
      'useOverviewContext must be used within an OverviewProvider',
    )
  }
  return context
}
