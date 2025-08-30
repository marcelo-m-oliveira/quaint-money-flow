'use client'

import React from 'react'
import { usePermission } from '@/lib/contexts/permissions-context'
import type { Actions, Subjects } from '@/lib/contexts/permissions-context'

interface CanProps {
  action: Actions
  subject: Subjects
  field?: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Componente para renderização condicional baseada em permissões
 * 
 * @example
 * <Can action="create" subject="Account">
 *   <CreateAccountButton />
 * </Can>
 * 
 * @example
 * <Can action="delete" subject="Entry" fallback={<p>Sem permissão</p>}>
 *   <DeleteButton />
 * </Can>
 */
export function Can({ action, subject, field, children, fallback = null }: CanProps) {
  const { can } = usePermission()

  if (can(action, subject)) {
    return <>{children}</>
  }

  return <>{fallback}</>
}

/**
 * Componente para renderização condicional inversa (quando NÃO tem permissão)
 */
export function Cannot({ action, subject, field, children, fallback = null }: CanProps) {
  const { cannot } = usePermission()

  if (cannot(action, subject)) {
    return <>{children}</>
  }

  return <>{fallback}</>
}