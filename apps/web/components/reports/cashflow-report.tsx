'use client'

import { formatCurrency } from '@saas/utils'
import ReactECharts from 'echarts-for-react'
import {
  ArrowUp,
  BarChart3,
  Calendar,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { ReportPeriod } from '@/app/relatorios/page'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useFinancialData } from '@/lib/hooks/use-financial-data'
import { useTheme } from '@/lib/hooks/use-theme'

interface CashflowReportProps {
  period: ReportPeriod
}

type ViewMode = 'daily' | 'weekly' | 'monthly'

interface CashflowData {
  date: string
  income: number
  expense: number
  balance: number
  period: string
}

export function CashflowReport({ period }: CashflowReportProps) {
  const { transactions } = useFinancialData()
  const { isDark } = useTheme()
  const [viewMode, setViewMode] = useState<ViewMode>('monthly')

  // Estados para scroll infinito
  const [visibleItems, setVisibleItems] = useState(30)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const lastScrollTop = useRef(0)

  // Filtrar transações por período
  const filteredTransactions = useMemo(() => {
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
      case '3months': {
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
        break
      }
      case '6months': {
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1)
        break
      }
      case '1year': {
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1)
        break
      }
      default: {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      }
    }

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      return transactionDate >= startDate && transactionDate <= now
    })
  }, [transactions, period])

  // Processar dados do fluxo de caixa
  const cashflowData = useMemo(() => {
    const dataMap = new Map<string, CashflowData>()

    filteredTransactions.forEach((transaction) => {
      const date = new Date(transaction.date)
      let key: string
      let periodLabel: string

      switch (viewMode) {
        case 'daily':
          key = date.toISOString().split('T')[0]
          periodLabel = date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
          })
          break
        case 'weekly': {
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 6)
          key = weekStart.toISOString().split('T')[0]
          periodLabel = `${weekStart.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
          })} à ${weekEnd.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
          })}`
          break
        }
        case 'monthly':
        default:
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          periodLabel = date.toLocaleDateString('pt-BR', {
            month: 'short',
            year: 'numeric',
          })
          break
      }

      const existing = dataMap.get(key)
      if (existing) {
        if (transaction.type === 'income') {
          existing.income += transaction.amount
        } else {
          existing.expense += transaction.amount
        }
        existing.balance = existing.income - existing.expense
      } else {
        dataMap.set(key, {
          date: key,
          income: transaction.type === 'income' ? transaction.amount : 0,
          expense: transaction.type === 'expense' ? transaction.amount : 0,
          balance:
            transaction.type === 'income'
              ? transaction.amount
              : -transaction.amount,
          period: periodLabel,
        })
      }
    })

    return Array.from(dataMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    )
  }, [filteredTransactions, viewMode])

  // Função para voltar ao topo
  const scrollToTop = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    container.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
    setShowBackToTop(false)
  }, [])

  // Hook para detectar scroll
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const scrollDirection = scrollTop > lastScrollTop.current ? 'down' : 'up'
    lastScrollTop.current = scrollTop

    // Calcular quantos itens restam para o final
    const itemsFromEnd = cashflowData.length - visibleItems

    // Mostrar botão "Voltar ao Topo" quando estiver próximo do final
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 200
    const hasReachedEnd = visibleItems >= cashflowData.length
    setShowBackToTop(isNearBottom && hasReachedEnd && cashflowData.length > 30)

    // Scroll para baixo - carregar mais itens quando restarem cerca de 3 itens (27 de 30)
    if (
      scrollDirection === 'down' &&
      (scrollTop + clientHeight >= scrollHeight - 150 || itemsFromEnd <= 3)
    ) {
      if (!isLoadingMore && visibleItems < cashflowData.length) {
        setIsLoadingMore(true)
        setTimeout(() => {
          setVisibleItems((prev) => Math.min(prev + 30, cashflowData.length))
          setIsLoadingMore(false)
        }, 500)
      }
    }

    // Scroll para cima - remover itens se necessário
    if (scrollDirection === 'up' && scrollTop < 200 && visibleItems > 30) {
      setVisibleItems((prev) => Math.max(prev - 30, 30))
      setShowBackToTop(false)
    }
  }, [visibleItems, isLoadingMore, cashflowData])

  // Adicionar listener de scroll
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Reset visible items quando dados mudarem
  useEffect(() => {
    setVisibleItems(30)
  }, [period, viewMode])

  // Configuração do gráfico de barras
  const chartOptions = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        textStyle: {
          color: isDark ? '#f9fafb' : '#111827',
        },
        formatter: (
          params: {
            name: string
            dataIndex: number
            seriesName: string
            value: number
          }[],
        ) => {
          const data = params[0]
          const income = cashflowData[data.dataIndex]?.income || 0
          const expense = cashflowData[data.dataIndex]?.expense || 0
          const balance = income - expense

          return `
            <div style="padding: 8px;">
              <div style="font-weight: 600; margin-bottom: 8px;">${data.name}</div>
              <div style="margin-bottom: 4px;">
                <span style="color: #22c55e;">● Receitas: ${formatCurrency(income)}</span>
              </div>
              <div style="margin-bottom: 4px;">
                <span style="color: #ef4444;">● Despesas: ${formatCurrency(expense)}</span>
              </div>
              <div style="border-top: 1px solid ${isDark ? '#374151' : '#e5e7eb'}; padding-top: 4px; margin-top: 4px;">
                <span style="font-weight: 600; color: ${balance >= 0 ? '#22c55e' : '#ef4444'};">Saldo: ${formatCurrency(Math.abs(balance))}</span>
              </div>
            </div>
          `
        },
      },
      legend: {
        data: ['Receitas', 'Despesas'],
        textStyle: {
          color: isDark ? '#f9fafb' : '#111827',
        },
        top: 10,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: cashflowData.map((item) => item.period),
        axisLabel: {
          color: isDark ? '#9ca3af' : '#6b7280',
          rotate: cashflowData.length > 10 ? 45 : 0,
        },
        axisLine: {
          lineStyle: {
            color: isDark ? '#374151' : '#e5e7eb',
          },
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: isDark ? '#9ca3af' : '#6b7280',
          formatter: (value: number) => formatCurrency(value),
        },
        axisLine: {
          lineStyle: {
            color: isDark ? '#374151' : '#e5e7eb',
          },
        },
        splitLine: {
          lineStyle: {
            color: isDark ? '#374151' : '#e5e7eb',
          },
        },
      },
      series: [
        {
          name: 'Receitas',
          type: 'bar',
          data: cashflowData.map((item) => item.income),
          itemStyle: {
            color: '#22c55e',
            borderRadius: [4, 4, 0, 0],
          },
        },
        {
          name: 'Despesas',
          type: 'bar',
          data: cashflowData.map((item) => item.expense),
          itemStyle: {
            color: '#ef4444',
            borderRadius: [4, 4, 0, 0],
          },
        },
      ],
    }
  }, [cashflowData, isDark])

  // Calcular totais
  const totals = useMemo(() => {
    const totalIncome = cashflowData.reduce((sum, item) => sum + item.income, 0)
    const totalExpense = cashflowData.reduce(
      (sum, item) => sum + item.expense,
      0,
    )
    const totalBalance = totalIncome - totalExpense
    const averageIncome =
      cashflowData.length > 0 ? totalIncome / cashflowData.length : 0
    const averageExpense =
      cashflowData.length > 0 ? totalExpense / cashflowData.length : 0

    return {
      totalIncome,
      totalExpense,
      totalBalance,
      averageIncome,
      averageExpense,
    }
  }, [cashflowData])

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Visualização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Agrupar por:</span>
            <Select
              value={viewMode}
              onValueChange={(value: ViewMode) => setViewMode(value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Receitas
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totals.totalIncome)}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Despesas
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(totals.totalExpense)}
                </p>
              </div>
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Saldo Total
                </p>
                <p
                  className={`text-2xl font-bold ${
                    totals.totalBalance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(Math.abs(totals.totalBalance))}
                </p>
              </div>
              <div
                className={`rounded-full p-3 ${
                  totals.totalBalance >= 0
                    ? 'bg-green-100 dark:bg-green-900'
                    : 'bg-red-100 dark:bg-red-900'
                }`}
              >
                {totals.totalBalance >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-green-600" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Períodos
                </p>
                <p className="text-2xl font-bold">{cashflowData.length}</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Barras */}
      <Card>
        <CardHeader>
          <CardTitle>Comparativo de Receitas vs Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          {cashflowData.length > 0 ? (
            <div className="h-[400px] w-full">
              <ReactECharts
                option={chartOptions}
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'canvas' }}
              />
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <BarChart3 className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="mb-2 text-lg font-medium">Nenhum dado encontrado</p>
              <p className="text-sm">
                Não há transações para o período selecionado
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Médias */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Média de Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Por{' '}
                  {viewMode === 'daily'
                    ? 'dia'
                    : viewMode === 'weekly'
                      ? 'semana'
                      : 'mês'}
                  :
                </span>
                <span className="font-medium text-green-600">
                  {formatCurrency(totals.averageIncome)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Média de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Por{' '}
                  {viewMode === 'daily'
                    ? 'dia'
                    : viewMode === 'weekly'
                      ? 'semana'
                      : 'mês'}
                  :
                </span>
                <span className="font-medium text-red-600">
                  {formatCurrency(totals.averageExpense)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista detalhada */}
      {cashflowData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Detalhamento por Período</span>
              <span className="text-sm font-normal text-muted-foreground">
                Exibindo {Math.min(visibleItems, cashflowData.length)} de{' '}
                {cashflowData.length} períodos
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              ref={scrollContainerRef}
              className="max-h-[600px] space-y-2 overflow-y-auto"
            >
              {cashflowData.slice(0, visibleItems).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{item.period}</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-right">
                      <p className="text-green-600">
                        +{formatCurrency(item.income)}
                      </p>
                      <p className="text-xs text-muted-foreground">Receitas</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-600">
                        -{formatCurrency(item.expense)}
                      </p>
                      <p className="text-xs text-muted-foreground">Despesas</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          item.balance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {item.balance >= 0 ? '+' : ''}
                        {formatCurrency(item.balance)}
                      </p>
                      <p className="text-xs text-muted-foreground">Saldo</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Skeleton durante carregamento */}
              {isLoadingMore && (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={`skeleton-${index}`}
                      className="rounded-lg border p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <Skeleton className="h-5 w-24" />
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="space-y-1 text-right">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-3 w-12" />
                          </div>
                          <div className="space-y-1 text-right">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-3 w-12" />
                          </div>
                          <div className="space-y-1 text-right">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-3 w-10" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Indicador de fim da lista */}
              {visibleItems >= cashflowData.length &&
                cashflowData.length > 30 && (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    Todos os períodos foram carregados
                  </div>
                )}

              {/* Botão Voltar ao Topo */}
              {showBackToTop && (
                <div className="flex justify-center py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={scrollToTop}
                    className="flex items-center gap-2 transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <ArrowUp className="h-4 w-4" />
                    Voltar ao Início
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
