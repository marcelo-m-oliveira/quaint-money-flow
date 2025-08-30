'use client'

import React from 'react'
import { AlertTriangle, Crown, Zap } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useUser } from '@/lib/contexts/permissions-context'
import { getPlanLimitInfo } from '@/lib/casl'
import { plansService } from '@/lib/services/plans.service'

interface PlanLimitWarningProps {
  resource: 'accounts' | 'categories' | 'creditCards'
  currentCount: number
  className?: string
  showUpgrade?: boolean
}

const resourceLabels = {
  accounts: 'contas',
  categories: 'categorias',
  creditCards: 'cartões de crédito',
}

const resourceLabelsSingular = {
  accounts: 'conta',
  categories: 'categoria',
  creditCards: 'cartão de crédito',
}

export function PlanLimitWarning({
  resource,
  currentCount,
  className = '',
  showUpgrade = true,
}: PlanLimitWarningProps) {
  const { user } = useUser()
  const limitInfo = getPlanLimitInfo(user, resource)

  // Se for ilimitado ou admin, não mostrar aviso
  if (limitInfo.isUnlimited || user?.role === 'admin') {
    return null
  }

  const max = limitInfo.max || 0
  const remaining = max - currentCount
  const percentage = max > 0 ? (currentCount / max) * 100 : 100

  // Mostrar aviso apenas quando próximo do limite (>= 80%) ou limite atingido
  if (percentage < 80 && remaining > 0) {
    return null
  }

  const isAtLimit = remaining <= 0
  const resourceLabel = resourceLabels[resource]
  const resourceLabelSingular = resourceLabelsSingular[resource]

  return (
    <Alert className={`${className} ${isAtLimit ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'}`}>
      <AlertTriangle className={`h-4 w-4 ${isAtLimit ? 'text-red-600' : 'text-yellow-600'}`} />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-medium ${isAtLimit ? 'text-red-800' : 'text-yellow-800'}`}>
              {isAtLimit ? 'Limite atingido!' : 'Limite quase atingido!'}
            </span>
            <Badge variant="outline" className="text-xs">
              {user?.plan?.name || 'Plano Free'}
            </Badge>
          </div>
          
          <p className={`text-sm ${isAtLimit ? 'text-red-700' : 'text-yellow-700'}`}>
            {isAtLimit ? (
              <>
                Você atingiu o limite de <strong>{max}</strong> {max === 1 ? resourceLabelSingular : resourceLabel} 
                do seu plano. Para criar mais {resourceLabel}, faça upgrade para um plano pago.
              </>
            ) : (
              <>
                Você tem <strong>{remaining}</strong> {remaining === 1 ? resourceLabelSingular : resourceLabel} 
                restante(s) do seu limite de <strong>{max}</strong>.
              </>
            )}
          </p>

          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  percentage >= 100 ? 'bg-red-500' : 
                  percentage >= 80 ? 'bg-yellow-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-gray-600">{currentCount} utilizadas</span>
              <span className="text-gray-600">{max} máximo</span>
            </div>
          </div>
        </div>

        {showUpgrade && (
          <div className="ml-4">
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Crown className="h-4 w-4 mr-1" />
              Fazer Upgrade
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}

interface PlanBadgeProps {
  plan?: { name: string; type: string } | null
  className?: string
}

export function PlanBadge({ plan, className = '' }: PlanBadgeProps) {
  if (!plan) {
    return (
      <Badge variant="outline" className={`text-xs ${className}`}>
        Plano Free
      </Badge>
    )
  }

  const badgeColor = plansService.getPlanBadgeColor(plan.type as any)
  
  return (
    <Badge 
      className={`text-xs ${badgeColor} ${className}`}
      variant="secondary"
    >
      {plan.name}
    </Badge>
  )
}

interface PlanFeatureListProps {
  plan?: { features: any } | null
  className?: string
}

export function PlanFeatureList({ plan, className = '' }: PlanFeatureListProps) {
  if (!plan) return null

  const features = plan.features || {}

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2 text-sm">
        <Zap className="h-4 w-4 text-blue-600" />
        <span>Lançamentos ilimitados</span>
      </div>

      {features.categories?.unlimited ? (
        <div className="flex items-center gap-2 text-sm">
          <Zap className="h-4 w-4 text-green-600" />
          <span>Categorias ilimitadas</span>
        </div>
      ) : features.categories?.limited && (
        <div className="flex items-center gap-2 text-sm">
          <Zap className="h-4 w-4 text-yellow-600" />
          <span>Até {features.categories.max} categorias</span>
        </div>
      )}

      {features.accounts?.unlimited ? (
        <div className="flex items-center gap-2 text-sm">
          <Zap className="h-4 w-4 text-green-600" />
          <span>Contas ilimitadas</span>
        </div>
      ) : features.accounts?.limited && (
        <div className="flex items-center gap-2 text-sm">
          <Zap className="h-4 w-4 text-yellow-600" />
          <span>Até {features.accounts.max} contas</span>
        </div>
      )}

      {features.creditCards?.unlimited ? (
        <div className="flex items-center gap-2 text-sm">
          <Zap className="h-4 w-4 text-green-600" />
          <span>Cartões de crédito ilimitados</span>
        </div>
      ) : features.creditCards?.limited && (
        <div className="flex items-center gap-2 text-sm">
          <Zap className="h-4 w-4 text-yellow-600" />
          <span>Até {features.creditCards.max} cartões de crédito</span>
        </div>
      )}

      {features.reports?.advanced ? (
        <div className="flex items-center gap-2 text-sm">
          <Zap className="h-4 w-4 text-purple-600" />
          <span>Relatórios avançados</span>
        </div>
      ) : features.reports?.basic && (
        <div className="flex items-center gap-2 text-sm">
          <Zap className="h-4 w-4 text-blue-600" />
          <span>Relatórios básicos</span>
        </div>
      )}
    </div>
  )
}

