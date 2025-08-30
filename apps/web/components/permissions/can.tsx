'use client'

import React from 'react'

import { usePermissions } from '@/lib/contexts/permissions-context'

export interface CanProps {
  I: string // action
  a?: string // subject
  this?: any // specific instance
  field?: string // specific field
  not?: boolean // invert check
  passThrough?: boolean // pass ability result to children
  children: React.ReactNode | ((props: { allowed: boolean }) => React.ReactNode)
  fallback?: React.ReactNode
}

export function Can({
  I: action,
  a: subject = 'all',
  this: instance,
  field,
  not = false,
  passThrough = false,
  children,
  fallback = null,
}: CanProps) {
  const { ability } = usePermissions()

  let allowed = false

  try {
    if (instance) {
      // Check permission for specific instance
      allowed = ability.can(action, instance, field)
    } else {
      // Check permission for subject type
      allowed = ability.can(action, subject, field)
    }

    // Invert if not prop is true
    if (not) {
      allowed = !allowed
    }
  } catch (error) {
    console.error('Error checking permission:', error)
    allowed = false
  }

  if (passThrough) {
    // Pass allowed state to children function
    if (typeof children === 'function') {
      return <>{children({ allowed })}</>
    }
    // Return children with allowed prop (for components that accept it)
    return React.cloneElement(children as React.ReactElement, { allowed })
  }

  // Regular conditional rendering
  if (allowed) {
    return <>{children}</>
  }

  return <>{fallback}</>
}

// Convenience components for common actions
export const CanCreate = ({
  subject,
  ...props
}: Omit<CanProps, 'I'> & { subject: string }) => (
  <Can I="create" a={subject} {...props} />
)

export const CanRead = ({
  subject,
  ...props
}: Omit<CanProps, 'I'> & { subject: string }) => (
  <Can I="read" a={subject} {...props} />
)

export const CanUpdate = ({
  subject,
  ...props
}: Omit<CanProps, 'I'> & { subject: string }) => (
  <Can I="update" a={subject} {...props} />
)

export const CanDelete = ({
  subject,
  ...props
}: Omit<CanProps, 'I'> & { subject: string }) => (
  <Can I="delete" a={subject} {...props} />
)

export const CanManage = ({
  subject,
  ...props
}: Omit<CanProps, 'I'> & { subject: string }) => (
  <Can I="manage" a={subject} {...props} />
)

// Higher-order component to wrap components with permission checking
export function withPermissions<T extends Record<string, any>>(
  WrappedComponent: React.ComponentType<T>,
  requiredPermission: { action: string; subject: string },
  fallbackComponent?: React.ComponentType<T>,
) {
  return function PermissionWrapper(props: T) {
    const { ability } = usePermissions()

    const allowed = ability.can(
      requiredPermission.action,
      requiredPermission.subject,
    )

    if (!allowed) {
      if (fallbackComponent) {
        const FallbackComponent = fallbackComponent
        return <FallbackComponent {...props} />
      }
      return null
    }

    return <WrappedComponent {...props} />
  }
}
