'use client'

import {
  BarChart3,
  Crown,
  DollarSign,
  Package,
  Settings,
  Shield,
  Ticket,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useUser } from '@/lib/contexts/permissions-context'
import { usePlanStats } from '@/lib/hooks/use-plans'

const adminSections = [
  {
    id: 'users',
    title: 'Gerenciar Usuários',
    description: 'Visualizar, criar, editar e excluir usuários do sistema',
    icon: Users,
    href: '/admin/users',
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
  },
  {
    id: 'plans',
    title: 'Gerenciar Planos',
    description: 'Configurar planos de assinatura, preços e funcionalidades',
    icon: Crown,
    href: '/admin/plans',
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600',
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
  },
  {
    id: 'coupons',
    title: 'Gerenciar Cupons',
    description: 'Criar e gerenciar cupons de desconto para usuários',
    icon: Ticket,
    href: '/admin/coupons',
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
    iconColor: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950',
  },
  {
    id: 'analytics',
    title: 'Análises e Relatórios',
    description: 'Visualizar estatísticas e métricas do sistema',
    icon: BarChart3,
    href: '/admin/analytics',
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600',
    iconColor: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
  },
]

export default function AdminDashboard() {
  const { user } = useUser()
  const { stats, isLoading: statsLoading } = usePlanStats()

  // Redirect se não for admin
  if (user?.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Acesso Negado
            </CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta área.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">Voltar para Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {statsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
                <div className="mt-2 h-3 w-20 animate-pulse rounded bg-gray-200" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Planos
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalPlans || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.activePlans || 0} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Usuários por Plano
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {stats?.planUsage?.slice(0, 3).map((plan) => (
                  <div key={plan.id} className="flex justify-between text-sm">
                    <span className="truncate">{plan.name}</span>
                    <span className="font-medium">{plan.userCount}</span>
                  </div>
                )) || (
                  <div className="text-sm text-muted-foreground">
                    Carregando...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Receita Potencial
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(
                  stats?.planUsage?.reduce(
                    (total, plan) => total + plan.price * plan.userCount,
                    0,
                  ) || 0,
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Valor mensal estimado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {(stats?.activePlans || 0) > 0 ? '100%' : '0%'}
              </div>
              <p className="text-xs text-muted-foreground">
                Planos disponíveis
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {adminSections.map((section) => {
          const Icon = section.icon
          return (
            <Card
              key={section.id}
              className="relative overflow-hidden transition-all hover:shadow-md"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`rounded-lg p-2 ${section.bgColor}`}>
                    <Icon className={`h-6 w-6 ${section.iconColor}`} />
                  </div>
                </div>
                <CardTitle className="text-xl">{section.title}</CardTitle>
                <CardDescription className="text-sm">
                  {section.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={section.href}>
                  <Button
                    className={`w-full ${section.color} ${section.hoverColor} text-white`}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Gerenciar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Tarefas administrativas mais comuns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" asChild>
              <Link href="/admin/users?action=create">
                <Users className="mr-2 h-4 w-4" />
                Novo Usuário
              </Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href="/admin/plans?action=create">
                <Crown className="mr-2 h-4 w-4" />
                Novo Plano
              </Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href="/admin/coupons?action=create">
                <Ticket className="mr-2 h-4 w-4" />
                Novo Cupom
              </Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href="/admin/analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                Ver Relatórios
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
