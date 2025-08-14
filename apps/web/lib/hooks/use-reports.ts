'use client'

import { dateToSeconds } from '@saas/utils'
import { useCallback, useEffect, useState } from 'react'

import { ReportPeriod } from '@/app/relatorios/page'
import { useCrudToast } from '@/lib/hooks/use-crud-toast'
import {
  AccountsReportFilters,
  AccountsReportResponse,
  CashflowReportFilters,
  CashflowReportResponse,
  CategoriesReportFilters,
  CategoriesReportResponse,
  reportsService,
} from '@/lib/services/reports'

type ReportType = 'categories' | 'cashflow' | 'accounts'

interface UseReportsOptions {
  enabled?: boolean
  refetchOnMount?: boolean
}

// Função utilitária para converter período em datas
function getPeriodDates(period: ReportPeriod): {
  startDate: number
  endDate: number
} {
  const now = new Date()
  let startDate: Date

  switch (period) {
    case 'day':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case '3months':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
      break
    case '6months':
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1)
      break
    case '1year':
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1)
      break
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  return {
    startDate: dateToSeconds(startDate),
    endDate: dateToSeconds(now),
  }
}

// Overloads tipados para retornar tipos específicos baseados no reportType
export function useReports(
  reportType: 'categories',
  filters: CategoriesReportFilters,
  options?: UseReportsOptions,
): {
  data: CategoriesReportResponse | null
  loading: boolean
  error: Error | null
  refetch: () => void
}
export function useReports(
  reportType: 'cashflow',
  filters: CashflowReportFilters,
  options?: UseReportsOptions,
): {
  data: CashflowReportResponse | null
  loading: boolean
  error: Error | null
  refetch: () => void
}
export function useReports(
  reportType: 'accounts',
  filters: AccountsReportFilters,
  options?: UseReportsOptions,
): {
  data: AccountsReportResponse | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

// Hook otimizado para relatórios específicos com cache e prevenção de loops
export function useReports(
  reportType: ReportType,
  filters:
    | CategoriesReportFilters
    | CashflowReportFilters
    | AccountsReportFilters,
  options: UseReportsOptions = {},
) {
  const { enabled = true, refetchOnMount = true } = options
  const [data, setData] = useState<
    | CategoriesReportResponse
    | CashflowReportResponse
    | AccountsReportResponse
    | null
  >(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { error: toastError } = useCrudToast()

  // Criar uma chave única para cache baseada no tipo e filtros
  const cacheKey = JSON.stringify({ reportType, filters })
  const [lastCacheKey, setLastCacheKey] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!enabled) return

    // Evitar refetch desnecessário se os filtros não mudaram
    if (lastCacheKey === cacheKey && data && !refetchOnMount) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      let result:
        | CategoriesReportResponse
        | CashflowReportResponse
        | AccountsReportResponse
        | null = null

      switch (reportType) {
        case 'categories':
          result = await reportsService.getCategoriesReport(
            filters as CategoriesReportFilters,
          )
          break
        case 'cashflow':
          result = await reportsService.getCashflowReport(
            filters as CashflowReportFilters,
          )
          break
        case 'accounts':
          result = await reportsService.getAccountsReport(
            filters as AccountsReportFilters,
          )
          break
        default:
          throw new Error(`Tipo de relatório não suportado: ${reportType}`)
      }

      setData(result)
      setLastCacheKey(cacheKey)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido'
      const errorObj = new Error(errorMessage)
      setError(errorObj)
      toastError.general(`Erro ao carregar relatório de ${reportType}`)
      console.error(`Erro ao carregar relatório de ${reportType}:`, err)
    } finally {
      setLoading(false)
    }
  }, [reportType, filters, enabled, refetchOnMount, toastError])

  // Executar fetch quando os filtros mudarem
  useEffect(() => {
    fetchData()
  }, [cacheKey, enabled])

  const refetch = useCallback(() => {
    setLastCacheKey(null) // Forçar refetch
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch,
  }
}

// Hook legado mantido para compatibilidade
export function useReportsLegacy() {
  const [categoriesData, setCategoriesData] =
    useState<CategoriesReportResponse | null>(null)
  const [cashflowData, setCashflowData] =
    useState<CashflowReportResponse | null>(null)
  const [accountsData, setAccountsData] =
    useState<AccountsReportResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { error } = useCrudToast()

  const getCategoriesReport = useCallback(
    async (period: ReportPeriod, type?: 'income' | 'expense') => {
      try {
        setIsLoading(true)
        const { startDate, endDate } = getPeriodDates(period)
        const filters: CategoriesReportFilters = {
          startDate,
          endDate,
          type,
        }
        const data = await reportsService.getCategoriesReport(filters)
        setCategoriesData(data)
        return data
      } catch (err) {
        error.general('Erro ao carregar relatório de categorias')
        console.error('Erro ao carregar relatório de categorias:', err)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [error],
  )

  const getCashflowReport = useCallback(
    async (period: ReportPeriod) => {
      try {
        setIsLoading(true)
        const { startDate, endDate } = getPeriodDates(period)
        const filters: CashflowReportFilters = {
          startDate,
          endDate,
        }
        const data = await reportsService.getCashflowReport(filters)
        setCashflowData(data)
        return data
      } catch (err) {
        error.general('Erro ao carregar relatório de fluxo de caixa')
        console.error('Erro ao carregar relatório de fluxo de caixa:', err)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [error],
  )

  const getAccountsReport = useCallback(
    async (
      period: ReportPeriod,
      accountType?: 'all' | 'bank_accounts' | 'credit_cards',
    ) => {
      try {
        setIsLoading(true)
        const { startDate, endDate } = getPeriodDates(period)
        const filters: AccountsReportFilters = {
          startDate,
          endDate,
          accountType,
        }
        const data = await reportsService.getAccountsReport(filters)
        setAccountsData(data)
        return data
      } catch (err) {
        error.general('Erro ao carregar relatório de contas')
        console.error('Erro ao carregar relatório de contas:', err)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [error],
  )

  return {
    // Data
    categoriesData,
    cashflowData,
    accountsData,
    isLoading,

    // Actions
    getCategoriesReport,
    getCashflowReport,
    getAccountsReport,

    // Clear data
    clearData: () => {
      setCategoriesData(null)
      setCashflowData(null)
      setAccountsData(null)
    },
  }
}
