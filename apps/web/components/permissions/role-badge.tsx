'use client'

import React from 'react'
import { Crown, Shield, User } from 'lucide-react'

import { Badge } from '@/components/ui/badge'

interface RoleBadgeProps {
  role: string
  showIcon?: boolean
}

const roleConfig = {
  ADMIN: {
    label: 'Administrador',
    variant: 'destructive' as const,
    icon: Shield,
    description: 'Acesso total ao sistema'
  },
  PREMIUM: {
    label: 'Premium',
    variant: 'default' as const,
    icon: Crown,
    description: 'Recursos avançados disponíveis'
  },
  USER: {
    label: 'Usuário',
    variant: 'secondary' as const,
    icon: User,
    description: 'Acesso básico'
  }
}

export function RoleBadge({ role, showIcon = false }: RoleBadgeProps) {
  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.USER
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  )
}

export function RoleDescription({ role }: { role: string }) {
  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.USER
  
  return (
    <p className="text-sm text-muted-foreground">{config.description}</p>
  )
}