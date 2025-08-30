'use client'

import React from 'react'
import { AlertTriangle, Crown, Info } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePlanLimits } from '@/lib/hooks/use-permissions'

interface PlanLimitsIndicatorProps {
  resource: 'accounts' | 'categories' | 'creditCards'
  showDetails?: boolean
}

const resourceLabels = {
  accounts: 'Contas',
  categories: 'Categorias', 
  creditCards: 'Cartões de Crédito'
}

export function PlanLimitsIndicator({ resource, showDetails = true }: PlanLimitsIndicatorProps) {
  const limits = usePlanLimits(resource)

  if (limits.isLoading) {
    return (
      <div className="animate-pulse bg-muted h-4 w-24 rounded" data-testid="loading-skeleton"></div>
    )
  }

  if (limits.error || !limits.limit) {
    return null
  }

  const current = limits.current || 0
  const limit = limits.limit
  const percentage = (current / limit) * 100
  const isNearLimit = percentage >= 80
  const isAtLimit = !limits.allowed

  if (!showDetails && !isNearLimit) {
    return null
  }

  return (
    <Card className={`${isAtLimit ? 'border-destructive' : isNearLimit ? 'border-warning' : ''}`} data-testid={`plan-limits-${resource}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {resourceLabels[resource]}
          </CardTitle>
          {isAtLimit && <AlertTriangle className="h-4 w-4 text-destructive" />}
          {isNearLimit && !isAtLimit && <Info className="h-4 w-4 text-warning" />}
        </div>
        <CardDescription className="text-xs" data-testid="limit-description">
          <span data-testid="limit-current">{current}</span> de <span data-testid="limit-max">{limit === -1 ? '∞' : limit}</span> utilizados
        </CardDescription>
      </CardHeader>
      
      {showDetails && (
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span>{limit === -1 ? 'Ilimitado' : `${Math.round(percentage)}%`}</span>
            </div>
            {limit !== -1 && (
              <Progress 
                value={percentage} 
                className={`h-2 ${isAtLimit ? 'text-destructive' : isNearLimit ? 'text-warning' : ''}`}
                data-testid="limit-progress"
              />
            )}
          </div>

          {isAtLimit && (
            <div className="flex items-center gap-2 text-destructive text-sm" data-testid="limits-warning">
              <AlertTriangle className="h-4 w-4" />
              <span>Limite atingido. Considere fazer upgrade do seu plano.</span>
            </div>
          )}

          {isNearLimit && !isAtLimit && (
            <div className="flex items-center gap-2 text-warning text-sm" data-testid="limits-warning">
              <Info className="h-4 w-4" />
              <span>Próximo do limite. Restam {limits.remaining} itens.</span>
            </div>
          )}

          {limit === -1 && (
            <div className="flex items-center gap-2 text-success text-sm">
              <Crown className="h-4 w-4" />
              <span>Ilimitado no seu plano</span>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

// Componente compacto para exibir apenas badge de status
export function PlanLimitsBadge({ resource }: Pick<PlanLimitsIndicatorProps, 'resource'>) {
  const limits = usePlanLimits(resource)

  if (limits.isLoading || limits.error || !limits.limit) {
    return null
  }

  const current = limits.current || 0
  const limit = limits.limit
  const percentage = (current / limit) * 100
  const isNearLimit = percentage >= 80
  const isAtLimit = !limits.allowed

  if (!isNearLimit) return null

  return (
    <Badge variant={isAtLimit ? 'destructive' : 'outline'} className="text-xs">
      {current}/{limit === -1 ? '∞' : limit}
      {isAtLimit && ' (Limite atingido)'}
    </Badge>
  )
}