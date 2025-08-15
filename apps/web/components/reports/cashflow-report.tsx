/* eslint-disable @typescript-eslint/no-explicit-any */
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
import {
  AwaitedReactNode,
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { ReportPeriod } from '@/app/relatorios/page'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DetailItem } from '@/components/ui/detail-item'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useInfiniteScroll } from '@/lib/hooks/use-infinite-scroll'
import { useReportsLegacy } from '@/lib/hooks/use-reports'
import { useTheme } from '@/lib/hooks/use-theme'

interface CashflowReportProps {
  period: ReportPeriod
  isActive: boolean
}

type ViewMode = 'daily' | 'weekly' | 'monthly'

export function CashflowReport({ period, isActive }: CashflowReportProps) {
  const { isDark } = useTheme()
  const [viewMode, setViewMode] = useState<ViewMode>('monthly')
  const { getCashflowReport } = useReportsLegacy()
  const [cashflowReportData, setCashflowReportData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Carregar dados do relatório apenas quando a aba estiver ativa
  useEffect(() => {
    if (!isActive) return

    const loadCashflowData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getCashflowReport(period, viewMode)
        setCashflowReportData(data)
      } catch (err) {
        console.error('Erro ao carregar dados do fluxo de caixa:', err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    loadCashflowData()
  }, [period, viewMode, isActive]) // Removido getCashflowReport das dependências

  // Processar dados do fluxo de caixa vindos da API
  const cashflowData = useMemo(() => {
    if (!cashflowReportData?.data) return []
    return cashflowReportData.data.map(
      (periodData: {
        date: any
        income: any
        expense: any
        balance: any
        period: any
      }) => ({
        date: periodData.date,
        income: periodData.income,
        expense: periodData.expense,
        balance: periodData.balance,
        period: periodData.period || periodData.date,
      }),
    )
  }, [cashflowReportData])

  // Hook de scroll infinito
  const {
    visibleItems,
    isLoadingMore,
    showBackToTop,
    scrollContainerRef,
    scrollToTop,
    resetItems,
  } = useInfiniteScroll(cashflowData.length)

  // Reset visible items quando dados mudarem
  useEffect(() => {
    resetItems()
  }, [period, viewMode, resetItems])

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
        data: cashflowData.map((item: { period: any }) => item.period),
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
          data: cashflowData.map((item: { income: any }) => item.income),
          itemStyle: {
            color: '#22c55e',
            borderRadius: [4, 4, 0, 0],
          },
        },
        {
          name: 'Despesas',
          type: 'bar',
          data: cashflowData.map((item: { expense: any }) => item.expense),
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
    // Usar dados do summary da API quando disponíveis, senão calcular localmente
    if (cashflowReportData?.summary) {
      return {
        totalIncome: cashflowReportData.summary.totalIncome,
        totalExpense: cashflowReportData.summary.totalExpense,
        totalBalance: cashflowReportData.summary.totalBalance,
        averageIncome: cashflowReportData.summary.averageIncome,
        averageExpense: cashflowReportData.summary.averageExpense,
      }
    }

    // Fallback: calcular localmente
    const totalIncome = cashflowData.reduce(
      (sum: any, item: { income: any }) => sum + item.income,
      0,
    )
    const totalExpense = cashflowData.reduce(
      (sum: any, item: { expense: any }) => sum + item.expense,
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
  }, [cashflowData, cashflowReportData])

  // Estados de loading e error
  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Visualização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-[140px]" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Comparativo de Receitas vs Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p className="mb-2 text-lg font-medium">Erro ao carregar dados</p>
              <p className="text-sm text-muted-foreground">
                Ocorreu um erro ao carregar os dados do fluxo de caixa. Tente
                novamente.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

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
              {cashflowData.slice(0, visibleItems).map(
                (
                  item: {
                    period:
                      | string
                      | number
                      | bigint
                      | boolean
                      | ReactElement<any, string | JSXElementConstructor<any>>
                      | Iterable<ReactNode>
                      | ReactPortal
                      | Promise<AwaitedReactNode>
                      | null
                      | undefined
                    income: number | null | undefined
                    expense: number | null | undefined
                    balance: number | null | undefined
                  },
                  index: Key | null | undefined,
                ) => (
                  <DetailItem key={index}>
                    <DetailItem.Content>
                      <DetailItem.Info>
                        <p className="font-medium">{item.period}</p>
                      </DetailItem.Info>
                    </DetailItem.Content>
                    <DetailItem.Values>
                      <DetailItem.Value
                        label="Receitas"
                        value={`+${formatCurrency(item.income)}`}
                        valueClassName="text-green-600"
                      />
                      <DetailItem.Value
                        label="Despesas"
                        value={`-${formatCurrency(item.expense)}`}
                        valueClassName="text-red-600"
                      />
                      <DetailItem.Value
                        label="Saldo"
                        value={`${item.balance && item.balance >= 0 ? '+' : ''}${formatCurrency(item.balance)}`}
                        valueClassName={`font-bold ${
                          item.balance && item.balance >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      />
                    </DetailItem.Values>
                  </DetailItem>
                ),
              )}

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
