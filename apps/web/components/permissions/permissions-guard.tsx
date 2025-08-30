'use client'

import React from 'react'
import { AlertTriangle, Lock } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCanPerform, useUserRole } from '@/lib/hooks/use-permissions'

interface PermissionsGuardProps {
  action: string
  subject: string
  children: React.ReactNode
  fallback?: React.ReactNode
  showFallback?: boolean
}

interface RoleGuardProps {
  roles: string | string[]
  children: React.ReactNode
  fallback?: React.ReactNode
  showFallback?: boolean
}

/**
 * Componente para proteger conteúdo baseado em permissões específicas
 */
export function PermissionsGuard({ 
  action, 
  subject, 
  children, 
  fallback,
  showFallback = true 
}: PermissionsGuardProps) {
  const { can } = useCanPerform()

  if (can(action, subject)) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (!showFallback) {
    return null
  }

  return (
    <Card className="border-dashed">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle className="text-lg">Permissão Necessária</CardTitle>
        <CardDescription>
          Você precisa de permissão para "{action}" em "{subject}" para ver este conteúdo.
        </CardDescription>
      </CardHeader>
    </Card>
  )
}

/**
 * Componente para proteger conteúdo baseado em papel/role do usuário
 */
export function RoleGuard({ 
  roles, 
  children, 
  fallback,
  showFallback = true 
}: RoleGuardProps) {
  const { hasRole } = useUserRole()

  if (hasRole(roles)) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (!showFallback) {
    return null
  }

  const roleList = Array.isArray(roles) ? roles.join(', ') : roles

  return (
    <Card className="border-dashed">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle className="text-lg">Acesso Restrito</CardTitle>
        <CardDescription>
          Apenas usuários com papel "{roleList}" podem acessar este conteúdo.
        </CardDescription>
      </CardHeader>
    </Card>
  )
}

/**
 * Componente combinado que verifica tanto papel quanto permissões específicas
 */
export function FullPermissionsGuard({
  roles,
  action,
  subject,
  children,
  fallback,
  showFallback = true
}: RoleGuardProps & Omit<PermissionsGuardProps, 'children' | 'fallback' | 'showFallback'>) {
  return (
    <RoleGuard roles={roles} showFallback={false}>
      <PermissionsGuard 
        action={action} 
        subject={subject} 
        showFallback={showFallback}
        fallback={fallback}
      >
        {children}
      </PermissionsGuard>
    </RoleGuard>
  )
}