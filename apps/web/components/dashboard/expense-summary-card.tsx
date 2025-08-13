'use client'

import { formatCurrency } from '@saas/utils'
import ReactECharts from 'echarts-for-react'
import { useCallback, useMemo, useRef, useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CategoryIcon } from '@/lib/components/category-icon'
import { useOverviewContext } from '@/lib/contexts/overview-context'
import { useTheme } from '@/lib/hooks/use-theme'

type PeriodType = '15days' | '30days' | 'current_month' | '3months' | '6months'

const PERIOD_OPTIONS = [
  { value: 'current_month' as PeriodType, label: 'Mês atual' },
  { value: '15days' as PeriodType, label: 'Últimos 15 dias' },
  { value: '30days' as PeriodType, label: 'Últimos 30 dias' },
  { value: '3months' as PeriodType, label: 'Últimos 3 meses' },
  { value: '6months' as PeriodType, label: 'Últimos 6 meses' },
]

export function ExpenseSummaryCard() {
  const [selectedPeriod, setSelectedPeriod] =
    useState<PeriodType>('current_month')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  )
  const { isDark } = useTheme()
  const { topExpenses, refreshTopExpenses } = useOverviewContext()

  // Mapear períodos do frontend para parâmetros da API
  const mapPeriodToApiParam = (
    period: PeriodType,
  ):
    | 'current-month'
    | 'last-15-days'
    | 'last-30-days'
    | 'last-3-months'
    | 'last-6-months' => {
    const periodMap: Record<
      PeriodType,
      | 'current-month'
      | 'last-15-days'
      | 'last-30-days'
      | 'last-3-months'
      | 'last-6-months'
    > = {
      current_month: 'current-month',
      '15days': 'last-15-days',
      '30days': 'last-30-days',
      '3months': 'last-3-months',
      '6months': 'last-6-months',
    }
    return periodMap[period]
  }

  // Dados vêm do OverviewContext - não precisamos mais processar entries localmente
  const expenseData = useMemo(() => {
    if (!topExpenses?.expenses.length) {
      return []
    }

    // Calcular o total de todas as despesas
    const totalAmount = topExpenses.expenses.reduce(
      (sum, expense) => sum + expense.totalAmount,
      0,
    )

    return topExpenses.expenses.map((expense) => ({
      categoryId: expense.id,
      categoryName: expense.categoryName,
      amount: expense.totalAmount,
      percentage:
        totalAmount > 0 ? (expense.totalAmount / totalAmount) * 100 : 0,
      color: expense.color,
      icon: expense.icon,
    }))
  }, [topExpenses])

  // Usar dados do OverviewContext
  const displayExpenses = expenseData

  // Debounce para evitar múltiplas chamadas da API
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handlePeriodChange = useCallback(
    async (period: PeriodType) => {
      setSelectedPeriod(period)

      // Cancelar chamada anterior se existir
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      // Debounce de 300ms para evitar múltiplas chamadas rápidas
      debounceTimeoutRef.current = setTimeout(async () => {
        try {
          await refreshTopExpenses({ period: mapPeriodToApiParam(period) })
        } catch (error) {
          console.error('Erro ao atualizar dados do overview:', error)
        }
      }, 300)
    },
    [refreshTopExpenses],
  )

  // Configuração do ECharts
  const chartOptions = useMemo(() => {
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
          const { name, value, percent } = params
          return `
             <div style="padding: 8px;">
               <div style="font-weight: 600; margin-bottom: 4px;">${name}</div>
               <div style="color: ${isDark ? '#9ca3af' : '#6b7280'}; font-size: 12px;">
                 Valor: ${formatCurrency(value)}
               </div>
               <div style="color: ${isDark ? '#9ca3af' : '#6b7280'}; font-size: 12px;">
                 Percentual: ${percent}%
               </div>
             </div>
           `
        },
      },
      onClick: (params: { name: string; value: number }) => {
        const categoryData = expenseData.find(
          (item) => item.categoryName === params.name,
        )
        if (categoryData) {
          setSelectedCategoryId(
            selectedCategoryId === categoryData.categoryId
              ? null
              : categoryData.categoryId,
          )
        }
      },
      legend: {
        show: false,
      },
      series: [
        {
          name: 'Gastos',
          type: 'pie',
          radius: ['40%', '80%'],
          center: ['50%', '50%'],
          label: false,
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: isDark ? '#1f2937' : '#ffffff',
            borderWidth: 2,
          },
          emphasis: {
            label: {
              show: false,
              fontSize: 20,
              fontWeight: 'bold',
              color: isDark ? '#f9fafb' : '#111827',
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.2)',
            },
          },
          labelLine: {
            show: false,
          },
          data: displayExpenses.slice(0, 5).map((item) => ({
            value: item.amount,
            name: item.categoryName,
            itemStyle: {
              color: item.color,
              borderRadius: 10,
              opacity:
                selectedCategoryId === null ||
                selectedCategoryId === item.categoryId
                  ? 1
                  : 0.3,
              borderWidth: selectedCategoryId === item.categoryId ? 4 : 2,
              borderColor:
                selectedCategoryId === item.categoryId
                  ? isDark
                    ? '#ffffff'
                    : '#000000'
                  : isDark
                    ? '#1f2937'
                    : '#ffffff',
            },
          })),
        },
      ],
    }
  }, [expenseData, isDark, selectedCategoryId])

  if (expenseData.length === 0) {
    return (
      <Card>
        <CardHeader className="space-y-3">
          <CardTitle className="text-base font-semibold">
            Maiores gastos
          </CardTitle>
          <Tabs
            value={selectedPeriod}
            onValueChange={(value) => handlePeriodChange(value as PeriodType)}
          >
            <TabsList className="grid w-full grid-cols-5">
              {PERIOD_OPTIONS.map((option) => (
                <TabsTrigger
                  key={option.value}
                  value={option.value}
                  className="text-xs"
                >
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            <p className="text-sm">Nenhuma despesa encontrada neste período</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="space-y-3">
        <CardTitle className="text-base font-semibold">
          Maiores gastos
        </CardTitle>
        <Tabs
          value={selectedPeriod}
          onValueChange={(value) => handlePeriodChange(value as PeriodType)}
        >
          <TabsList className="grid w-full grid-cols-5">
            {PERIOD_OPTIONS.map((option) => (
              <TabsTrigger
                key={option.value}
                value={option.value}
                className="text-xs"
              >
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Lista de categorias */}
          <div className="flex min-h-[300px] flex-col justify-center space-y-3">
            {displayExpenses.slice(0, 5).map((item) => (
              <div
                key={item.categoryId}
                className={`flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-all duration-200 hover:bg-muted/50 ${
                  selectedCategoryId === item.categoryId
                    ? 'border-2 border-primary bg-muted shadow-sm'
                    : selectedCategoryId !== null
                      ? 'opacity-50'
                      : ''
                }`}
                onClick={() => {
                  setSelectedCategoryId(
                    selectedCategoryId === item.categoryId
                      ? null
                      : item.categoryId,
                  )
                }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border">
                  <div
                    className="flex h-full w-full items-center justify-center rounded-full"
                    style={{ backgroundColor: item.color }}
                  >
                    <CategoryIcon
                      iconName={item.icon}
                      size={16}
                      className="text-white"
                    />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">
                      {item.categoryName}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm font-semibold">
                    {item.percentage.toFixed(2)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(item.amount)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Gráfico Doughnut com ECharts */}
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="mx-auto aspect-square h-[400px] w-[400px]">
              <ReactECharts
                option={chartOptions}
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'canvas' }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
