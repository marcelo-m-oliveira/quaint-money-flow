'use client'

import {
  Activity,
  BarChart3,
  Calendar,
  CreditCard,
  DollarSign,
  PieChart,
  TrendingUp,
  Users,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AnalyticsData {
  users: {
    total: number
    active: number
    newThisMonth: number
    growth: number
  }
  revenue: {
    total: number
    thisMonth: number
    growth: number
  }
  plans: {
    total: number
    active: number
    distribution: Array<{
      name: string
      count: number
      percentage: number
    }>
  }
  usage: {
    totalEntries: number
    totalAccounts: number
    totalCategories: number
    totalCreditCards: number
  }
  recentActivity: Array<{
    id: string
    type: string
    description: string
    timestamp: number
    user: string
  }>
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Mock data - substitua por chamada real da API
      const mockData: AnalyticsData = {
        users: {
          total: 1247,
          active: 892,
          newThisMonth: 156,
          growth: 12.5,
        },
        revenue: {
          total: 45678.9,
          thisMonth: 12345.67,
          growth: 8.3,
        },
        plans: {
          total: 3,
          active: 3,
          distribution: [
            { name: 'Free', count: 892, percentage: 71.5 },
            { name: 'Mensal', count: 298, percentage: 23.9 },
            { name: 'Anual', count: 57, percentage: 4.6 },
          ],
        },
        usage: {
          totalEntries: 45678,
          totalAccounts: 2345,
          totalCategories: 1234,
          totalCreditCards: 567,
        },
        recentActivity: [
          {
            id: '1',
            type: 'user_signup',
            description: 'Novo usuário registrado',
            timestamp: Date.now() - 1000 * 60 * 30, // 30 min atrás
            user: 'João Silva',
          },
          {
            id: '2',
            type: 'plan_upgrade',
            description: 'Upgrade para plano mensal',
            timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2h atrás
            user: 'Maria Santos',
          },
          {
            id: '3',
            type: 'entry_created',
            description: 'Novo lançamento criado',
            timestamp: Date.now() - 1000 * 60 * 60 * 4, // 4h atrás
            user: 'Pedro Costa',
          },
        ],
      }

      setData(mockData)
    } catch (err: any) {
      setError('Erro ao carregar analytics')
      console.error('Erro ao carregar analytics:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp))
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_signup':
        return <Users className="h-4 w-4 text-blue-600" />
      case 'plan_upgrade':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'entry_created':
        return <Activity className="h-4 w-4 text-purple-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <Button onClick={loadAnalytics} className="mt-4">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics</h2>
          <p className="text-muted-foreground">
            Métricas e insights do seu negócio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
              <SelectItem value="1y">1 ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadAnalytics}>
            <Activity className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="mb-2 h-4 rounded bg-gray-200"></div>
                <div className="h-8 rounded bg-gray-200"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data ? (
        <>
          {/* Key Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Usuários Totais
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(data.users.total)}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-600" />+
                  {data.users.growth}% este mês
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Receita Total
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(data.revenue.total)}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-600" />+
                  {data.revenue.growth}% este mês
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Usuários Ativos
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(data.users.active)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {((data.users.active / data.users.total) * 100).toFixed(1)}%
                  do total
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Novos Este Mês
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(data.users.newThisMonth)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Novos registros
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Lançamentos
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(data.usage.totalEntries)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Total de lançamentos
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contas</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(data.usage.totalAccounts)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Contas criadas
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Categorias
                </CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(data.usage.totalCategories)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Categorias criadas
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cartões</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(data.usage.totalCreditCards)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Cartões cadastrados
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Plan Distribution */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Planos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.plans.distribution.map((plan) => (
                    <div
                      key={plan.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-medium">{plan.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {formatNumber(plan.count)} usuários
                        </span>
                        <Badge variant="secondary">{plan.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.user} • {formatDate(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  )
}
