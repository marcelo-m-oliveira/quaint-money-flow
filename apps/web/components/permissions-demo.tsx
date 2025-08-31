'use client'

import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  CreditCard,
  Crown,
  Shield,
  Tag,
  User,
  Users,
  XCircle,
} from 'lucide-react'
import React from 'react'

import { Can, CanCreate, CanManage } from '@/components/permissions/can'
import { PlanBadge, PlanFeatureList } from '@/components/plan-limit-warning'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Actions, getPlanLimitInfo, hasAdvancedReports } from '@/lib/casl'
import { usePermissions, useUser } from '@/lib/contexts/permissions-context'

export function PermissionsDemo() {
  const { user } = useUser()
  const { ability } = usePermissions()

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Faça login para ver as permissões
          </div>
        </CardContent>
      </Card>
    )
  }

  const accountLimits = getPlanLimitInfo(user, 'accounts')
  const categoryLimits = getPlanLimitInfo(user, 'categories')
  const creditCardLimits = getPlanLimitInfo(user, 'creditCards')

  const permissions = [
    {
      action: Actions.CREATE,
      subject: 'Account' as const,
      label: 'Criar Contas',
    },
    {
      action: Actions.CREATE,
      subject: 'Category' as const,
      label: 'Criar Categorias',
    },
    {
      action: Actions.CREATE,
      subject: 'CreditCard' as const,
      label: 'Criar Cartões',
    },
    { action: Actions.CREATE, subject: 'Plan' as const, label: 'Criar Planos' },
    {
      action: Actions.MANAGE,
      subject: 'User' as const,
      label: 'Gerenciar Usuários',
    },
    {
      action: Actions.MANAGE,
      subject: 'Coupon' as const,
      label: 'Gerenciar Cupons',
    },
  ]

  return (
    <div className="space-y-6">
      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações do Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{user?.name}</span>
                  {user?.role === 'admin' ? (
                    <Badge className="bg-purple-100 text-purple-800">
                      <Shield className="mr-1 h-3 w-3" />
                      Admin
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <User className="mr-1 h-3 w-3" />
                      Usuário
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {user?.email}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Plano:</span>
                  <PlanBadge plan={user?.plan} />
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-2 font-medium">Funcionalidades do Plano:</h4>
              <PlanFeatureList plan={user?.plan} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Status das Permissões
          </CardTitle>
          <CardDescription>
            Verificação em tempo real das permissões do usuário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {permissions.map((perm) => {
              const hasPermission = ability.can(perm.action, perm.subject)

              return (
                <div
                  key={`${perm.action}-${perm.subject}`}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <span className="text-sm">{perm.label}</span>
                  {hasPermission ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Plan Limits */}
      {user?.role !== 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Limites do Plano
            </CardTitle>
            <CardDescription>
              Verificação dos limites baseados no seu plano atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">Contas</span>
                    <CreditCard className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {accountLimits.isUnlimited
                      ? 'Ilimitado'
                      : `Máximo: ${accountLimits.max}`}
                  </div>
                </div>

                <div className="rounded-lg border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">Categorias</span>
                    <Tag className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {categoryLimits.isUnlimited
                      ? 'Ilimitado'
                      : `Máximo: ${categoryLimits.max}`}
                  </div>
                </div>

                <div className="rounded-lg border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">Cartões</span>
                    <CreditCard className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {creditCardLimits.isUnlimited
                      ? 'Ilimitado'
                      : `Máximo: ${creditCardLimits.max}`}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Relatórios Avançados
                  </span>
                  <BarChart3 className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex items-center gap-2">
                  {hasAdvancedReports(user) ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {hasAdvancedReports(user)
                      ? 'Disponível'
                      : 'Requer plano pago'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Component Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Exemplo de Componentes Condicionais
          </CardTitle>
          <CardDescription>
            Demonstração do uso do componente `Can` para renderização
            condicional
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h4 className="mb-3 font-medium">Apenas para Admins:</h4>
              <div className="space-y-2">
                <CanManage subject="User">
                  <Button variant="outline" size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    Gerenciar Usuários
                  </Button>
                </CanManage>

                <Can I={Actions.CREATE} a="Plan">
                  <Button variant="outline" size="sm">
                    <Crown className="mr-2 h-4 w-4" />
                    Criar Planos
                  </Button>
                </Can>

                <Can I={Actions.MANAGE} a="Coupon">
                  <Button variant="outline" size="sm">
                    <Shield className="mr-2 h-4 w-4" />
                    Gerenciar Cupons
                  </Button>
                </Can>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="mb-3 font-medium">Para Todos os Usuários:</h4>
              <div className="space-y-2">
                <CanCreate subject="Account">
                  <Button variant="outline" size="sm">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Criar Conta
                  </Button>
                </CanCreate>

                <CanCreate subject="Category">
                  <Button variant="outline" size="sm">
                    <Tag className="mr-2 h-4 w-4" />
                    Criar Categoria
                  </Button>
                </CanCreate>

                <Can I={Actions.READ} a="Entry">
                  <Button variant="outline" size="sm">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Ver Relatórios
                  </Button>
                </Can>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
