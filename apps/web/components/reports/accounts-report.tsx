'use client'

import { formatCurrency } from '@saas/utils'
import ReactECharts from 'echarts-for-react'
import { BarChart3, CreditCard, Filter, PieChart, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'

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
import { useAccounts } from '@/lib/hooks/use-accounts'
import { useCreditCards } from '@/lib/hooks/use-credit-cards'
import { useFinancialData } from '@/lib/hooks/use-financial-data'
import { useTheme } from '@/lib/hooks/use-theme'

interface AccountsReportProps {
  period: ReportPeriod
}

type ChartType = 'doughnut' | 'bar'
type AccountFilter =
  | 'all'
  | 'bank'
  | 'credit_card'
  | 'investment'
  | 'cash'
  | 'other'

interface AccountData {
  accountId: string
  accountName: string
  accountType: string
  totalIncome: number
  totalExpense: number
  balance: number
  transactionCount: number
  icon: string
  iconType: 'bank' | 'generic'
}

const ACCOUNT_TYPE_LABELS = {
  bank: 'Conta Bancária',
  credit_card: 'Cartão de Crédito',
  investment: 'Investimento',
  cash: 'Dinheiro',
  other: 'Outros',
}

const DEFAULT_COLORS = [
  '#3b82f6',
  '#ef4444',
  '#22c55e',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
  '#f97316',
  '#6366f1',
]

export function AccountsReport({ period }: AccountsReportProps) {
  const { transactions } = useFinancialData()
  const { accounts } = useAccounts()
  const { creditCards } = useCreditCards()
  const { isDark } = useTheme()
  const [chartType, setChartType] = useState<ChartType>('doughnut')
  const [accountFilter, setAccountFilter] = useState<AccountFilter>('all')

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

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      return (
        transactionDate >= startDate &&
        transactionDate <= now &&
        (transaction.accountId || transaction.creditCardId)
      )
    })
  }, [transactions, period])

  // Processar dados das contas
  const accountData = useMemo(() => {
    const accountMap = new Map<string, AccountData>()

    // Combinar contas e cartões de crédito
    const allAccounts = [
      ...accounts,
      ...creditCards.map((card) => ({
        ...card,
        type: 'credit_card' as const,
      })),
    ]

    filteredTransactions.forEach((transaction) => {
      const accountId = transaction.accountId || transaction.creditCardId
      if (!accountId) return

      const account = allAccounts.find((a) => a.id === accountId)
      if (!account) return

      // Filtrar por tipo de conta se necessário
      if (accountFilter !== 'all' && account.type !== accountFilter) return

      const existing = accountMap.get(account.id)
      if (existing) {
        if (transaction.type === 'income') {
          existing.totalIncome += transaction.amount
        } else {
          existing.totalExpense += transaction.amount
        }
        existing.balance = existing.totalIncome - existing.totalExpense
        existing.transactionCount += 1
      } else {
        accountMap.set(account.id, {
          accountId: account.id,
          accountName: account.name,
          accountType: account.type,
          totalIncome: transaction.type === 'income' ? transaction.amount : 0,
          totalExpense: transaction.type === 'expense' ? transaction.amount : 0,
          balance:
            transaction.type === 'income'
              ? transaction.amount
              : -transaction.amount,
          transactionCount: 1,
          icon: account.icon,
          iconType: account.iconType,
        })
      }
    })

    return Array.from(accountMap.values()).sort(
      (a, b) => Math.abs(b.balance) - Math.abs(a.balance),
    )
  }, [filteredTransactions, accounts, creditCards, accountFilter])

  // Configuração do gráfico Doughnut
  const doughnutOptions = useMemo(() => {
    const data = accountData.map((item, index) => ({
      value: Math.abs(item.balance),
      name: item.accountName,
      itemStyle: {
        color: DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      },
    }))

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        textStyle: {
          color: isDark ? '#f9fafb' : '#111827',
        },
        formatter: (params: {
          name: string
          value: number
          percent: number
        }) => {
          const accountInfo = accountData.find(
            (a) => a.accountName === params.name,
          )
          if (!accountInfo) return ''

          return `
            <div style="padding: 8px;">
              <div style="font-weight: 600; margin-bottom: 4px;">${params.name}</div>
              <div style="color: ${isDark ? '#9ca3af' : '#6b7280'}; font-size: 12px; margin-bottom: 2px;">
                Tipo: ${ACCOUNT_TYPE_LABELS[accountInfo.accountType as keyof typeof ACCOUNT_TYPE_LABELS]}
              </div>
              <div style="color: ${isDark ? '#9ca3af' : '#6b7280'}; font-size: 12px; margin-bottom: 2px;">
                Receitas: ${formatCurrency(accountInfo.totalIncome)}
              </div>
              <div style="color: ${isDark ? '#9ca3af' : '#6b7280'}; font-size: 12px; margin-bottom: 2px;">
                Despesas: ${formatCurrency(accountInfo.totalExpense)}
              </div>
              <div style="color: ${isDark ? '#9ca3af' : '#6b7280'}; font-size: 12px;">
                Saldo: ${formatCurrency(accountInfo.balance)}
              </div>
            </div>
          `
        },
      },
      legend: {
        show: false,
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: isDark ? '#1f2937' : '#ffffff',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
              color: isDark ? '#f9fafb' : '#111827',
            },
          },
          data,
        },
      ],
    }
  }, [accountData, isDark])

  // Configuração do gráfico de barras
  const barOptions = useMemo(() => {
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
          params: { name: string; dataIndex: number; seriesName: string }[],
        ) => {
          const data = params[0]
          const accountInfo = accountData[data.dataIndex]

          return `
            <div style="padding: 8px;">
              <div style="font-weight: 600; margin-bottom: 8px;">${data.name}</div>
              <div style="margin-bottom: 4px;">
                <span style="color: #22c55e;">● Receitas: ${formatCurrency(accountInfo.totalIncome)}</span>
              </div>
              <div style="margin-bottom: 4px;">
                <span style="color: #ef4444;">● Despesas: ${formatCurrency(accountInfo.totalExpense)}</span>
              </div>
              <div style="border-top: 1px solid ${isDark ? '#374151' : '#e5e7eb'}; padding-top: 4px; margin-top: 4px;">
                <span style="font-weight: 600; color: ${accountInfo.balance >= 0 ? '#22c55e' : '#ef4444'};">Saldo: ${formatCurrency(accountInfo.balance)}</span>
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
        data: accountData.map((item) => item.accountName),
        axisLabel: {
          color: isDark ? '#9ca3af' : '#6b7280',
          rotate: accountData.length > 5 ? 45 : 0,
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
          data: accountData.map((item) => item.totalIncome),
          itemStyle: {
            color: '#22c55e',
            borderRadius: [4, 4, 0, 0],
          },
        },
        {
          name: 'Despesas',
          type: 'bar',
          data: accountData.map((item) => item.totalExpense),
          itemStyle: {
            color: '#ef4444',
            borderRadius: [4, 4, 0, 0],
          },
        },
      ],
    }
  }, [accountData, isDark])

  // Calcular totais
  const totals = useMemo(() => {
    const totalIncome = accountData.reduce(
      (sum, item) => sum + item.totalIncome,
      0,
    )
    const totalExpense = accountData.reduce(
      (sum, item) => sum + item.totalExpense,
      0,
    )
    const totalBalance = totalIncome - totalExpense
    const totalTransactions = accountData.reduce(
      (sum, item) => sum + item.transactionCount,
      0,
    )

    return {
      totalIncome,
      totalExpense,
      totalBalance,
      totalTransactions,
    }
  }, [accountData])

  // Agrupar por tipo de conta
  const accountsByType = useMemo(() => {
    const typeMap = new Map<string, { count: number; balance: number }>()

    accountData.forEach((account) => {
      const existing = typeMap.get(account.accountType)
      if (existing) {
        existing.count += 1
        existing.balance += account.balance
      } else {
        typeMap.set(account.accountType, {
          count: 1,
          balance: account.balance,
        })
      }
    })

    return Array.from(typeMap.entries()).map(([type, data]) => ({
      type,
      label:
        ACCOUNT_TYPE_LABELS[type as keyof typeof ACCOUNT_TYPE_LABELS] || type,
      count: data.count,
      balance: data.balance,
    }))
  }, [accountData])

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Tipo de Conta:</span>
              <Select
                value={accountFilter}
                onValueChange={(value: AccountFilter) =>
                  setAccountFilter(value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as contas</SelectItem>
                  <SelectItem value="bank">Contas Bancárias</SelectItem>
                  <SelectItem value="credit_card">
                    Cartões de Crédito
                  </SelectItem>
                  <SelectItem value="investment">Investimentos</SelectItem>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="other">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Gráfico:</span>
              <div className="flex rounded-lg border">
                <Button
                  variant={chartType === 'doughnut' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartType('doughnut')}
                  className="rounded-r-none"
                >
                  <PieChart className="h-4 w-4" />
                </Button>
                <Button
                  variant={chartType === 'bar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartType('bar')}
                  className="rounded-l-none"
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
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
                <Wallet className="h-6 w-6 text-green-600" />
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
                <CreditCard className="h-6 w-6 text-red-600" />
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
                <PieChart
                  className={`h-6 w-6 ${
                    totals.totalBalance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Transações
                </p>
                <p className="text-2xl font-bold">{totals.totalTransactions}</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo por tipo de conta */}
      {accountsByType.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo por Tipo de Conta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {accountsByType.map((typeData) => (
                <div key={typeData.type} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{typeData.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {typeData.count} conta{typeData.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          typeData.balance >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(Math.abs(typeData.balance))}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráfico */}
      <Card>
        <CardHeader>
          <CardTitle>Análise por Conta</CardTitle>
        </CardHeader>
        <CardContent>
          {accountData.length > 0 ? (
            <div className="h-[400px] w-full">
              <ReactECharts
                key={`${chartType}-${accountFilter}`}
                option={chartType === 'doughnut' ? doughnutOptions : barOptions}
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'canvas' }}
                notMerge={true}
                lazyUpdate={true}
              />
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <CreditCard className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="mb-2 text-lg font-medium">Nenhum dado encontrado</p>
              <p className="text-sm">
                Não há transações com contas associadas para o período
                selecionado
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista detalhada */}
      {accountData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detalhamento por Conta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accountData.map((item) => {
                return (
                  <div
                    key={item.accountId}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        {item.iconType === 'bank' ? (
                          <img
                            src={`/icons/banks/${item.icon}.png`}
                            alt={item.accountName}
                            className="h-8 w-8 rounded-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              target.nextElementSibling?.classList.remove(
                                'hidden',
                              )
                            }}
                          />
                        ) : (
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                        )}
                        <CreditCard className="hidden h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{item.accountName}</p>
                        <p className="text-sm text-muted-foreground">
                          {
                            ACCOUNT_TYPE_LABELS[
                              item.accountType as keyof typeof ACCOUNT_TYPE_LABELS
                            ]
                          }{' '}
                          •{item.transactionCount} transaç
                          {item.transactionCount === 1 ? 'ão' : 'ões'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-right">
                        <p className="text-green-600">
                          +{formatCurrency(item.totalIncome)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Receitas
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-red-600">
                          -{formatCurrency(item.totalExpense)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Despesas
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold ${
                            item.balance >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {item.balance >= 0 ? '+' : ''}
                          {formatCurrency(item.balance)}
                        </p>
                        <p className="text-xs text-muted-foreground">Saldo</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
