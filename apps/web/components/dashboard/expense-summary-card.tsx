'use client'

import { formatCurrency } from '@saas/utils'
import ReactECharts from 'echarts-for-react'
import { useMemo, useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CategoryIcon } from '@/lib/components/category-icon'
import { useFinancialData } from '@/lib/hooks/use-financial-data'
import { useTheme } from '@/lib/hooks/use-theme'
import { Category, Entry } from '@/lib/types'

interface ExpenseSummaryCardProps {
  transactions: Entry[]
  categories: Category[]
}

type PeriodType = '15days' | '30days' | 'current_month' | '3months' | '6months'

const PERIOD_OPTIONS = [
  { value: 'current_month' as PeriodType, label: 'Mês atual' },
  { value: '15days' as PeriodType, label: 'Últimos 15 dias' },
  { value: '30days' as PeriodType, label: 'Últimos 30 dias' },
  { value: '3months' as PeriodType, label: 'Últimos 3 meses' },
  { value: '6months' as PeriodType, label: 'Últimos 6 meses' },
]

interface ExpenseData {
  categoryId: string
  categoryName: string
  amount: number
  percentage: number
  color: string
  icon: string
}

// Cores padrão para o gráfico ECharts
const DEFAULT_COLORS = [
  '#FF6B6B', // Coral
  '#4ECDC4', // Turquesa
  '#45B7D1', // Azul claro
  '#96CEB4', // Verde menta
  '#FFEAA7', // Amarelo claro
  '#DDA0DD', // Ameixa
  '#98D8C8', // Verde água
  '#F7DC6F', // Dourado
]

export function ExpenseSummaryCard({
  transactions,
  categories,
}: ExpenseSummaryCardProps) {
  const [selectedPeriod, setSelectedPeriod] =
    useState<PeriodType>('current_month')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  )
  const { isDark } = useTheme()
  const { getCategoryIcon } = useFinancialData()

  const getDateFilter = (period: PeriodType) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (period) {
      case '15days': {
        const fifteenDaysAgo = new Date(today)
        fifteenDaysAgo.setDate(today.getDate() - 15)
        return (date: Date) => date >= fifteenDaysAgo && date <= today
      }

      case '30days': {
        const thirtyDaysAgo = new Date(today)
        thirtyDaysAgo.setDate(today.getDate() - 30)
        return (date: Date) => date >= thirtyDaysAgo && date <= today
      }

      case 'current_month':
        return (date: Date) =>
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()

      case '3months': {
        const threeMonthsAgo = new Date(today)
        threeMonthsAgo.setMonth(today.getMonth() - 3)
        return (date: Date) => date >= threeMonthsAgo && date <= today
      }

      case '6months': {
        const sixMonthsAgo = new Date(today)
        sixMonthsAgo.setMonth(today.getMonth() - 6)
        return (date: Date) => date >= sixMonthsAgo && date <= today
      }

      default:
        return () => true
    }
  }

  const expenseData = useMemo(() => {
    const dateFilter = getDateFilter(selectedPeriod)

    const filteredExpenses = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      return transaction.type === 'expense' && dateFilter(transactionDate)
    })

    // Agrupar por categoria principal (somar subcategorias na categoria pai)
    const categoryTotals = new Map<string, number>()

    filteredExpenses.forEach((transaction) => {
      const category = categories.find(
        (cat) => cat.id === transaction.categoryId,
      )

      // Se a categoria tem parentId, somar na categoria pai
      const targetCategoryId = category?.parentId || transaction.categoryId

      const current = categoryTotals.get(targetCategoryId) || 0
      categoryTotals.set(targetCategoryId, current + transaction.amount)
    })

    // Calcular total geral
    const totalExpenses = Array.from(categoryTotals.values()).reduce(
      (sum, amount) => sum + amount,
      0,
    )

    if (totalExpenses === 0) {
      return []
    }

    // Converter para array e calcular percentuais
    const expenseArray: ExpenseData[] = Array.from(categoryTotals.entries())
      .map(([categoryId, amount], index) => {
        // Buscar sempre pela categoria principal (não subcategoria)
        const category = categories.find(
          (cat) => cat.id === categoryId && !cat.parentId,
        )
        const categoryName = category?.name || 'Categoria não encontrada'
        const percentage = (amount / totalExpenses) * 100

        return {
          categoryId,
          categoryName,
          amount,
          percentage,
          color:
            category?.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
          icon: getCategoryIcon(category),
        }
      })
      .sort((a, b) => b.amount - a.amount) // Ordenar por valor decrescente
      .slice(0, 5) // Pegar apenas os 5 maiores

    return expenseArray
  }, [transactions, categories, selectedPeriod])

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
          data: expenseData.map((item) => ({
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
            onValueChange={(value) => setSelectedPeriod(value as PeriodType)}
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
          onValueChange={(value) => setSelectedPeriod(value as PeriodType)}
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
            {expenseData.map((item) => (
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
