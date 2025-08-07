'use client'

import { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface DetailItemProps {
  children: ReactNode
  className?: string
}

interface DetailItemContentProps {
  children: ReactNode
  className?: string
}

interface DetailItemInfoProps {
  children: ReactNode
  className?: string
}

interface DetailItemValuesProps {
  children: ReactNode
  className?: string
}

interface DetailItemValueProps {
  label: string
  value: string
  valueClassName?: string
  className?: string
}

/**
 * Componente base para itens de detalhamento em relatórios
 * Otimizado para responsividade em dispositivos móveis
 */
function DetailItem({ children, className }: DetailItemProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      {children}
    </div>
  )
}

/**
 * Container para o conteúdo principal do item (ícone + informações)
 */
function DetailItemContent({ children, className }: DetailItemContentProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>{children}</div>
  )
}

/**
 * Container para informações textuais (nome, descrição)
 */
function DetailItemInfo({ children, className }: DetailItemInfoProps) {
  return <div className={cn('min-w-0 flex-1', className)}>{children}</div>
}

/**
 * Container para valores financeiros
 * Otimizado para responsividade - stack vertical em mobile, horizontal em desktop
 */
function DetailItemValues({ children, className }: DetailItemValuesProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:gap-4 md:gap-6',
        className,
      )}
    >
      {children}
    </div>
  )
}

/**
 * Componente individual para exibir um valor com label
 */
function DetailItemValue({
  label,
  value,
  valueClassName,
  className,
}: DetailItemValueProps) {
  return (
    <div className={cn('text-right sm:text-right', className)}>
      <p className={cn('font-medium', valueClassName)}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

// Exportar componentes compostos
DetailItem.Content = DetailItemContent
DetailItem.Info = DetailItemInfo
DetailItem.Values = DetailItemValues
DetailItem.Value = DetailItemValue

export {
  DetailItem,
  DetailItemContent,
  DetailItemInfo,
  DetailItemValue,
  DetailItemValues,
}
