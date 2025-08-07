'use client'

import { formatCurrency } from '@saas/utils'
import ReactECharts from 'echarts-for-react'
import { BarChart3, Filter, PieChart } from 'lucide-react'
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
import { useFinancialData } from '@/lib/hooks/use-financial-data'
import { useTheme } from '@/lib/hooks/use-theme'
import { CategoryIcon } from '@/lib/icon-map'

interface CategoriesReportProps {
  period: ReportPeriod
}

type ChartType = 'doughnut' | 'line'
type TransactionType = 'expense' | 'income'

interface CategoryData {
  categoryId: string
  categoryName: string
  amount: number
  percentage: number
  color: string
  icon: string
  transactionCount: number
  subcategories?: CategoryData[]
}

const DEFAULT_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
  '#F7DC6F',
  '#FFB6C1',
  '#87CEEB',
]

export function CategoriesReport({ period }: CategoriesReportProps) {
  const { transactions, categories } = useFinancialData()
  const { isDark } = useTheme()
  const [chartType, setChartType] = useState<ChartType>('doughnut')
  const [transactionType, setTransactionType] =
    useState<TransactionType>('expense')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

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
      const category = categories.find((c) => c.id === transaction.categoryId)

      // Se uma categoria específica foi selecionada, incluir ela e suas subcategorias
      const matchesCategory =
        selectedCategory === 'all' ||
        transaction.categoryId === selectedCategory ||
        category?.parentId === selectedCategory

      return (
        transactionDate >= startDate &&
        transactionDate <= now &&
        transaction.type === transactionType &&
        matchesCategory
      )
    })
  }, [transactions, period, transactionType, selectedCategory])

  // Processar dados das categorias agrupando subcategorias nas categorias pai
  const categoryData = useMemo(() => {
    const parentCategoryMap = new Map<string, CategoryData>()
    const totalAmount = filteredTransactions.reduce(
      (sum, t) => sum + t.amount,
      0,
    )

    filteredTransactions.forEach((transaction) => {
      const category = categories.find((c) => c.id === transaction.categoryId)
      if (!category) return

      // Se é uma subcategoria, agregar na categoria pai
      const parentCategory = category.parentId
        ? categories.find((c) => c.id === category.parentId)
        : category

      if (!parentCategory) return

      const existing = parentCategoryMap.get(parentCategory.id)
      if (existing) {
        existing.amount += transaction.amount
        existing.transactionCount += 1
      } else {
        parentCategoryMap.set(parentCategory.id, {
          categoryId: parentCategory.id,
          categoryName: parentCategory.name,
          amount: transaction.amount,
          percentage: 0,
          color: parentCategory.color,
          icon: parentCategory.icon,
          transactionCount: 1,
        })
      }
    })

    // Calcular percentuais e ordenar
    const result = Array.from(parentCategoryMap.values())
      .map((item) => ({
        ...item,
        percentage: totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)

    return result
  }, [filteredTransactions, categories])

  // Configuração do gráfico Doughnut
  const doughnutOptions = useMemo(() => {
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
          const value = params.value || 0
          const percent = params.percent || 0
          const name = params.name || 'Sem nome'

          return `
            <div style="padding: 8px;">
              <div style="font-weight: 600; margin-bottom: 4px;">${name}</div>
              <div style="color: ${isDark ? '#9ca3af' : '#6b7280'}; font-size: 12px;">
                ${formatCurrency(value)} (${percent.toFixed(1)}%)
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
          data: categoryData.map((item, index) => ({
            value: item.amount,
            name: item.categoryName,
            itemStyle: {
              color:
                item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
            },
          })),
        },
      ],
    }
  }, [categoryData, isDark])

  // Configuração do gráfico de linha
  const lineOptions = useMemo(() => {
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
          if (!params || params.length === 0) return ''

          const param = params[0]
          const value = param.value || 0
          const name = param.name || 'Sem nome'

          return `
            <div style="padding: 8px;">
              <div style="font-weight: 600; margin-bottom: 4px;">${name}</div>
              <div style="color: ${isDark ? '#9ca3af' : '#6b7280'}; font-size: 12px;">
                ${formatCurrency(value)}
              </div>
            </div>
          `
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: categoryData.map((item) => item.categoryName),
        axisLabel: {
          color: isDark ? '#9ca3af' : '#6b7280',
          rotate: 45,
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
          type: 'line',
          data: categoryData.map((item) => item.amount),
          smooth: true,
          lineStyle: {
            width: 3,
            color: transactionType === 'expense' ? '#ef4444' : '#22c55e',
          },
          itemStyle: {
            color: transactionType === 'expense' ? '#ef4444' : '#22c55e',
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color:
                    transactionType === 'expense'
                      ? 'rgba(239, 68, 68, 0.3)'
                      : 'rgba(34, 197, 94, 0.3)',
                },
                {
                  offset: 1,
                  color:
                    transactionType === 'expense'
                      ? 'rgba(239, 68, 68, 0.05)'
                      : 'rgba(34, 197, 94, 0.05)',
                },
              ],
            },
          },
        },
      ],
    }
  }, [categoryData, isDark, transactionType])

  const totalAmount = categoryData.reduce((sum, item) => sum + item.amount, 0)
  const totalTransactions = categoryData.reduce(
    (sum, item) => sum + item.transactionCount,
    0,
  )

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
              <span className="text-sm font-medium">Tipo:</span>
              <Select
                value={transactionType}
                onValueChange={(value: TransactionType) =>
                  setTransactionType(value)
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Despesas</SelectItem>
                  <SelectItem value="income">Receitas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Categoria:</span>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories
                    .filter(
                      (cat) => cat.type === transactionType && !cat.parentId,
                    )
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
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
                  variant={chartType === 'line' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartType('line')}
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total
                </p>
                <p
                  className={`text-2xl font-bold ${
                    transactionType === 'expense'
                      ? 'text-red-600'
                      : 'text-green-600'
                  }`}
                >
                  {formatCurrency(totalAmount)}
                </p>
              </div>
              <div
                className={`rounded-full p-3 ${
                  transactionType === 'expense'
                    ? 'bg-red-100 dark:bg-red-900'
                    : 'bg-green-100 dark:bg-green-900'
                }`}
              >
                <PieChart
                  className={`h-6 w-6 ${
                    transactionType === 'expense'
                      ? 'text-red-600'
                      : 'text-green-600'
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
                <p className="text-2xl font-bold">{totalTransactions}</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Categorias
                </p>
                <p className="text-2xl font-bold">{categoryData.length}</p>
              </div>
              <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
                <Filter className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico */}
      <Card>
        <CardHeader>
          <CardTitle>
            {transactionType === 'expense' ? 'Despesas' : 'Receitas'} por
            Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="h-[400px] w-full">
                <ReactECharts
                  option={
                    chartType === 'doughnut' ? doughnutOptions : lineOptions
                  }
                  style={{ height: '100%', width: '100%' }}
                  opts={{ renderer: 'canvas' }}
                />
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <PieChart className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="mb-2 text-lg font-medium">Nenhum dado encontrado</p>
              <p className="text-sm">
                Não há {transactionType === 'expense' ? 'despesas' : 'receitas'}{' '}
                para o período selecionado
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista detalhada */}
      {categoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detalhamento por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.map((item) => {
                const category = categories.find(
                  (c) => c.id === item.categoryId,
                )

                // Buscar subcategorias que pertencem a esta categoria pai
                const subcategoriesData = filteredTransactions
                  .filter((transaction) => {
                    const transactionCategory = categories.find(
                      (c) => c.id === transaction.categoryId,
                    )
                    return transactionCategory?.parentId === item.categoryId
                  })
                  .reduce((acc, transaction) => {
                    const subCategory = categories.find(
                      (c) => c.id === transaction.categoryId,
                    )
                    if (!subCategory) return acc

                    const existing = acc.find(
                      (sub) => sub.categoryId === subCategory.id,
                    )
                    if (existing) {
                      existing.amount += transaction.amount
                      existing.transactionCount += 1
                    } else {
                      acc.push({
                        categoryId: subCategory.id,
                        categoryName: subCategory.name,
                        amount: transaction.amount,
                        percentage: 0,
                        color: subCategory.color,
                        icon: subCategory.icon,
                        transactionCount: 1,
                      })
                    }
                    return acc
                  }, [] as CategoryData[])
                  .map((sub) => ({
                    ...sub,
                    percentage:
                      item.amount > 0 ? (sub.amount / item.amount) * 100 : 0,
                  }))
                  .sort((a, b) => b.amount - a.amount)

                return (
                  <div key={item.categoryId} className="space-y-2">
                    {/* Categoria Principal */}
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-full"
                          style={{ backgroundColor: item.color }}
                        >
                          {category?.icon && (
                            <CategoryIcon
                              iconName={category.icon}
                              className="h-5 w-5 text-white"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{item.categoryName}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.transactionCount} transaç
                            {item.transactionCount === 1 ? 'ão' : 'ões'}
                            {subcategoriesData.length > 0 && (
                              <span className="ml-1">
                                • {subcategoriesData.length} subcategoria
                                {subcategoriesData.length === 1 ? '' : 's'}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold ${
                            transactionType === 'expense'
                              ? 'text-red-600'
                              : 'text-green-600'
                          }`}
                        >
                          {formatCurrency(item.amount)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* Subcategorias */}
                    {subcategoriesData.length > 0 && (
                      <div className="ml-6 space-y-2">
                        {subcategoriesData.map((subItem) => {
                          const subCategory = categories.find(
                            (c) => c.id === subItem.categoryId,
                          )
                          return (
                            <div
                              key={subItem.categoryId}
                              className="flex items-center justify-between rounded-lg border border-dashed bg-muted/30 p-3"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="flex h-8 w-8 items-center justify-center rounded-full"
                                  style={{ backgroundColor: subItem.color }}
                                >
                                  {subCategory?.icon && (
                                    <CategoryIcon
                                      iconName={subCategory.icon}
                                      className="h-4 w-4 text-white"
                                    />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    {subItem.categoryName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {subItem.transactionCount} transaç
                                    {subItem.transactionCount === 1
                                      ? 'ão'
                                      : 'ões'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p
                                  className={`text-sm font-medium ${
                                    transactionType === 'expense'
                                      ? 'text-red-600'
                                      : 'text-green-600'
                                  }`}
                                >
                                  {formatCurrency(subItem.amount)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {subItem.percentage.toFixed(1)}% da categoria
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
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
