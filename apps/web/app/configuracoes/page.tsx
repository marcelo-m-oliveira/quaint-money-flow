'use client'

import { ArrowRight, Bell, CreditCard, Settings, Tag, User } from 'lucide-react'
import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAccounts } from '@/lib/hooks/use-accounts'
import { useFinancialData } from '@/lib/hooks/use-financial-data'

const quickActions = [
  {
    id: 'categorias',
    label: 'Categorias',
    icon: Tag,
    href: '/configuracoes/categorias',
    description: 'Gerencie suas categorias de receitas e despesas',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950',
  },
  {
    id: 'contas',
    label: 'Contas',
    icon: CreditCard,
    href: '/configuracoes/contas',
    description: 'Configure suas contas bancárias',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
  },
  {
    id: 'preferencias',
    label: 'Preferências',
    icon: Settings,
    href: '/configuracoes/preferencias',
    description: 'Personalize suas preferências',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
  },
  {
    id: 'alertas',
    label: 'Alertas',
    icon: Bell,
    href: '/configuracoes/alertas',
    description: 'Configure notificações',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
  },
]

export default function ConfiguracoesPage() {
  const { categories, isLoading: categoriesLoading } = useFinancialData()
  const { accounts, isLoading: accountsLoading } = useAccounts()

  // Calcular estatísticas
  const expenseCategories = categories.filter((cat) => cat.type === 'expense')
  const incomeCategories = categories.filter((cat) => cat.type === 'income')
  const connectedAccounts = accounts.length
  const activeAlerts = 0 // Por enquanto fixo, pode ser implementado futuramente

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie suas preferências e configurações do sistema
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Ações Rápidas</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.id} href={action.href}>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`rounded-lg p-3 ${action.bgColor}`}>
                          <Icon className={`h-6 w-6 ${action.color}`} />
                        </div>
                        <div>
                          <h3 className="mb-1 font-semibold">{action.label}</h3>
                          <p className="text-sm text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categorias Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categoriesLoading ? '...' : categories.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {categoriesLoading
                ? 'Carregando...'
                : `${expenseCategories.length} despesas, ${incomeCategories.length} receitas`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contas Conectadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accountsLoading ? '...' : connectedAccounts}
            </div>
            <p className="text-xs text-muted-foreground">
              {accountsLoading
                ? 'Carregando...'
                : connectedAccounts === 0
                  ? 'Nenhuma conta conectada'
                  : `${connectedAccounts} conta${connectedAccounts > 1 ? 's' : ''} conectada${connectedAccounts > 1 ? 's' : ''}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Alertas Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAlerts}</div>
            <p className="text-xs text-muted-foreground">
              {activeAlerts === 0
                ? 'Nenhum alerta configurado'
                : `${activeAlerts} alerta${activeAlerts > 1 ? 's' : ''} ativo${activeAlerts > 1 ? 's' : ''}`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            <User className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p className="text-sm">Nenhuma atividade recente</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
