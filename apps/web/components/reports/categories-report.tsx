/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { formatCurrency } from '@saas/utils'
import ReactECharts from 'echarts-for-react'
import { BarChart3, Filter, PieChart } from 'lucide-react'
import {
  AwaitedReactNode,
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
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
import { CategoryIcon } from '@/lib/components/category-icon'
import { useReports } from '@/lib/hooks/use-reports'
import { useTheme } from '@/lib/hooks/use-theme'
import { CategoryReportData } from '@/lib/services/reports'

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

export function CategoriesReport({ period }: CategoriesReportProps) {
  const { isDark } = useTheme()
  const [chartType, setChartType] = useState<ChartType>('doughnut')
  const [transactionType, setTransactionType] =
    useState<TransactionType>('expense')

  // Configurar filtros para o relatório
  const reportFilters = useMemo(() => {
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
      startDate: Math.floor(startDate.getTime() / 1000), // timestamp em segundos
      endDate: Math.floor(now.getTime() / 1000), // timestamp em segundos
      type: transactionType as 'income' | 'expense',
    }
  }, [period, transactionType])

  const {
    data: categoriesData,
    loading,
    error,
  } = useReports('categories', reportFilters)

  // Processar dados das categorias vindos da API
  const categoryData = useMemo(() => {
    if (!categoriesData?.categories) return []

    return categoriesData.categories.map((item: CategoryReportData) => ({
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      amount: item.amount,
      percentage: item.percentage,
      color: item.categoryColor,
      icon: item.categoryIcon,
      transactionCount: item.transactionCount,
      subcategories: [], // Por enquanto, subcategorias serão implementadas posteriormente
    }))
  }, [categoriesData])

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
              show: false,
              fontSize: 14,
              fontWeight: 'bold',
              color: isDark ? '#f9fafb' : '#111827',
            },
          },
          data: categoryData.map(
            (item: { amount: any; categoryName: any; color: any }) => ({
              value: item.amount,
              name: item.categoryName,
              itemStyle: {
                color: item.color,
              },
            }),
          ),
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
        data: categoryData.map(
          (item: { categoryName: any }) => item.categoryName,
        ),
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
          data: categoryData.map((item: { amount: any }) => item.amount),
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

  const totalAmount = useMemo(() => {
    if (categoriesData?.summary) {
      return transactionType === 'expense'
        ? categoriesData.summary.totalExpense
        : categoriesData.summary.totalIncome
    }

    // Fallback: calcular manualmente a partir dos dados das categorias
    return categoryData.reduce((sum, category) => sum + category.amount, 0)
  }, [categoriesData, transactionType, categoryData])

  const totalEntries = useMemo(() => {
    return categoryData.reduce(
      (sum: any, item: { transactionCount: any }) =>
        sum + item.transactionCount,
      0,
    )
  }, [categoryData])

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-48" />
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p className="mb-2 text-lg font-medium">Erro ao carregar dados</p>
            <p className="text-sm">
              {error.message || 'Ocorreu um erro inesperado'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

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
                  Entradas
                </p>
                <p className="text-2xl font-bold">{totalEntries}</p>
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
          <div className="flex items-center justify-between">
            <CardTitle>
              {transactionType === 'expense' ? 'Despesas' : 'Receitas'} por
              Categoria
            </CardTitle>
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
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="h-[400px] w-full">
                <ReactECharts
                  key={`${chartType}-${transactionType}`}
                  option={
                    chartType === 'doughnut' ? doughnutOptions : lineOptions
                  }
                  style={{ height: '100%', width: '100%' }}
                  opts={{ renderer: 'canvas' }}
                  notMerge={true}
                  lazyUpdate={true}
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
              {categoryData.map(
                (item: {
                  categoryId: Key | null | undefined
                  color: any
                  icon: string
                  categoryName:
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
                  transactionCount:
                    | string
                    | number
                    | bigint
                    | boolean
                    | ReactElement<any, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | Promise<AwaitedReactNode>
                    | null
                    | undefined
                  subcategories: CategoryData[]
                  percentage: number
                  amount: number | null | undefined
                }) => {
                  return (
                    <div key={item.categoryId} className="space-y-2">
                      {/* Categoria Principal */}
                      <DetailItem>
                        <DetailItem.Content>
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-full"
                            style={{ backgroundColor: item.color }}
                          >
                            <CategoryIcon
                              iconName={item.icon}
                              className="h-5 w-5 text-white"
                            />
                          </div>
                          <DetailItem.Info>
                            <p className="font-medium">{item.categoryName}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.transactionCount} entrada
                              {item.transactionCount === 1 ? '' : 's'}
                              {item.subcategories &&
                                item.subcategories.length > 0 && (
                                  <span className="ml-1">
                                    • {item.subcategories?.length || 0}{' '}
                                    subcategoria
                                    {(item.subcategories?.length || 0) === 1
                                      ? ''
                                      : 's'}
                                  </span>
                                )}
                            </p>
                          </DetailItem.Info>
                        </DetailItem.Content>
                        <DetailItem.Values>
                          <DetailItem.Value
                            label={`${item.percentage.toFixed(1)}%`}
                            value={formatCurrency(item.amount)}
                            valueClassName={`font-bold ${
                              transactionType === 'expense'
                                ? 'text-red-600'
                                : transactionType === 'income'
                                  ? 'text-green-600'
                                  : 'text-blue-600'
                            }`}
                          />
                        </DetailItem.Values>
                      </DetailItem>

                      {/* Subcategorias */}
                      {item.subcategories && item.subcategories.length > 0 && (
                        <div className="space-y-2">
                          {item.subcategories.map((subItem: CategoryData) => (
                            <DetailItem
                              key={subItem.categoryId}
                              className="ml-6 border-dashed bg-muted/30"
                            >
                              <DetailItem.Content>
                                <div
                                  className="flex h-8 w-8 items-center justify-center rounded-full"
                                  style={{ backgroundColor: subItem.color }}
                                >
                                  <CategoryIcon
                                    iconName={subItem.icon}
                                    className="h-4 w-4 text-white"
                                  />
                                </div>
                                <DetailItem.Info>
                                  <p className="text-sm font-medium">
                                    {subItem.categoryName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {subItem.transactionCount} entrada
                                    {subItem.transactionCount === 1 ? '' : 's'}
                                  </p>
                                </DetailItem.Info>
                              </DetailItem.Content>
                              <DetailItem.Values>
                                <DetailItem.Value
                                  label={`${subItem.percentage.toFixed(1)}% da categoria`}
                                  value={formatCurrency(subItem.amount)}
                                  valueClassName={`text-sm font-medium ${
                                    transactionType === 'expense'
                                      ? 'text-red-600'
                                      : transactionType === 'income'
                                        ? 'text-green-600'
                                        : 'text-blue-600'
                                  }`}
                                />
                              </DetailItem.Values>
                            </DetailItem>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                },
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
