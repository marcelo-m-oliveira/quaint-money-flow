'use client'

import { formatCurrency } from '@saas/utils'
import ReactECharts from 'echarts-for-react'
import { BarChart3, Calendar, TrendingDown, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'

import { ReportPeriod } from '@/app/relatorios/page'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
            month: '2-digit',
          })
          break
        case 'weekly': {
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          key = weekStart.toISOString().split('T')[0]
          periodLabel = `${weekStart.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
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
            <CardTitle>Detalhamento por Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cashflowData.map((item, index) => (
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
