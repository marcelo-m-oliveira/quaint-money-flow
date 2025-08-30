'use client'

import React from 'react'

import { RoleBadge } from './role-badge'
import { useUserRole } from '@/lib/hooks/use-permissions'

interface UserRoleDisplayProps {
  showIcon?: boolean
  className?: string
}

export function UserRoleDisplay({ showIcon = true, className }: UserRoleDisplayProps) {
  const { getCurrentRole } = useUserRole()
  const role = getCurrentRole()

  return (
    <div className={className} data-testid="user-role-badge">
      <RoleBadge role={role} showIcon={showIcon} />
    </div>
  )
}