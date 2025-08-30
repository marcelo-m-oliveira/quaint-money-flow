'use client'

import { Check, Crown, Plus, Settings } from 'lucide-react'
import React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePlans } from '@/lib/hooks/use-plans'
import { plansService } from '@/lib/services/plans'

export default function AdminPlansPage() {
  const { plans, isLoading, error } = usePlans(true) // incluir inativos

  const getPlanTypeColor = (type: string) => {
    switch (type) {
      case 'free':
        return 'bg-gray-100 text-gray-800'
      case 'monthly':
        return 'bg-blue-100 text-blue-800'
      case 'annual':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getFeaturesList = (features: any) => {
    const featureList = []

    if (features?.entries?.unlimited) {
      featureList.push('Lançamentos ilimitados')
    }

    if (features?.categories?.unlimited) {
      featureList.push('Categorias ilimitadas')
    } else if (features?.categories?.limited) {
      featureList.push(`Até ${features.categories.max} categorias`)
    }

    if (features?.accounts?.unlimited) {
      featureList.push('Contas ilimitadas')
    } else if (features?.accounts?.limited) {
      featureList.push(`Até ${features.accounts.max} contas`)
    }

    if (features?.creditCards?.unlimited) {
      featureList.push('Cartões ilimitados')
    } else if (features?.creditCards?.limited) {
      featureList.push(`Até ${features.creditCards.max} cartões`)
    }

    if (features?.reports?.advanced) {
      featureList.push('Relatórios avançados')
    } else if (features?.reports?.basic) {
      featureList.push('Relatórios básicos')
    }

    return featureList
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
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
          <h2 className="text-2xl font-bold">Gerenciar Planos</h2>
          <p className="text-muted-foreground">
            Configure planos de assinatura, preços e funcionalidades
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Plano
        </Button>
      </div>

      {/* Plans Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="mb-4 h-4 rounded bg-gray-200"></div>
                <div className="mb-2 h-6 rounded bg-gray-200"></div>
                <div className="h-4 rounded bg-gray-200"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const features = getFeaturesList(plan.features)

            return (
              <Card
                key={plan.id}
                className={`relative ${!plan.isActive ? 'opacity-60' : ''}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-purple-600" />
                      {plan.name}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge className={getPlanTypeColor(plan.type)}>
                        {plansService.getPlanTypeLabel(plan.type as any)}
                      </Badge>
                      {!plan.isActive && (
                        <Badge variant="destructive">Inativo</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    {plansService.formatPrice(plan.price)}
                    {plan.type === 'monthly' && (
                      <span className="text-sm font-normal text-muted-foreground">
                        /mês
                      </span>
                    )}
                    {plan.type === 'annual' && (
                      <span className="text-sm font-normal text-muted-foreground">
                        /ano
                      </span>
                    )}
                  </div>
                  {plan.description && (
                    <p className="text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Features */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Funcionalidades:</h4>
                      <div className="space-y-1">
                        {features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <Check className="h-3 w-3 flex-shrink-0 text-green-600" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 border-t pt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="mr-1 h-3 w-3" />
                        Editar
                      </Button>

                      {plan.isActive ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-orange-600"
                        >
                          Desativar
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600"
                        >
                          Ativar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && plans.length === 0 && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Crown className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium">
                Nenhum plano encontrado
              </h3>
              <p className="text-muted-foreground">
                Comece criando seu primeiro plano de assinatura
              </p>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Plano
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
