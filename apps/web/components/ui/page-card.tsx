import { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './card'

interface PageCardProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
  variant?: 'default' | 'compact'
}

export function PageCard({
  title,
  description,
  children,
  className,
  headerClassName,
  contentClassName,
  variant = 'default',
}: PageCardProps) {
  const hasHeader = title || description

  return (
    <Card className={cn('w-full overflow-hidden', className)}>
      {hasHeader && (
        <CardHeader
          className={cn(
            variant === 'compact' ? 'pb-3' : 'pb-4',
            'px-4 sm:px-6',
            headerClassName,
          )}
        >
          {title && (
            <CardTitle
              className={cn(
                'text-lg font-semibold text-foreground',
                variant === 'compact' ? 'text-base' : 'text-lg lg:text-xl',
              )}
            >
              {title}
            </CardTitle>
          )}
          {description && (
            <CardDescription className="text-sm text-muted-foreground">
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent
        className={cn(
          'px-4 py-4 sm:px-6',
          hasHeader && 'pt-0',
          'overflow-x-auto',
          contentClassName,
        )}
      >
        {children}
      </CardContent>
    </Card>
  )
}
