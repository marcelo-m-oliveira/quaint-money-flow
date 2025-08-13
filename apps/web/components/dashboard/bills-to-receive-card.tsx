'use client'

import {
  createLocalDateFromTimestamp,
  formatCurrency,
  formatDate,
} from '@saas/utils'
import { AlertTriangle, Calendar, Clock, ThumbsDown } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CategoryIcon } from '@/lib/components/category-icon'
import { useOverviewContext } from '@/lib/contexts/overview-context'
import { useCrudToast } from '@/lib/hooks/use-crud-toast'
import { EntryFormData } from '@/lib/types'

interface BillsToReceiveCardProps {
  onUpdateEntry?: (entryId: string, updatedData: Partial<EntryFormData>) => void
}

export function BillsToReceiveCard({ onUpdateEntry }: BillsToReceiveCardProps) {
  const { generalOverview } = useOverviewContext()
  const { error } = useCrudToast()
  const [visibleOverdueReceivables, setVisibleOverdueReceivables] = useState(5)
  const [visibleUpcomingReceivables, setVisibleUpcomingReceivables] =
    useState(5)

  const handleToggleReceivedStatus = (entryId: string) => {
    try {
      if (onUpdateEntry) {
        onUpdateEntry(entryId, { paid: true })
      }
    } catch (err) {
      error.update('Receita', 'Não foi possível marcar como recebida.')
    }
  }

  const { overdueReceivables, upcomingReceivables } = useMemo(() => {
    // Usar dados do overview quando disponíveis
    if (generalOverview?.accountsReceivable) {
      const overviewReceivables = generalOverview.accountsReceivable
        .map((bill) => {
          try {
            // Verificar se date é válido (timestamp em segundos)
            if (!bill.date) {
              console.warn('Invalid date for bill:', bill.id, bill.date)
              return null
            }

            // Converter timestamp para Date
            const dueDate = createLocalDateFromTimestamp(bill.date)

            // Criar novas instâncias de Date para evitar mutação durante renderização
            const currentDate = new Date()
            currentDate.setHours(0, 0, 0, 0)
            const dueDateCopy = new Date(dueDate)
            dueDateCopy.setHours(0, 0, 0, 0)

            const timeDiff = dueDateCopy.getTime() - currentDate.getTime()
            const daysUntilDue = Math.ceil(timeDiff / (1000 * 3600 * 24))

            return {
              id: bill.id,
              description: bill.description || 'Descrição não disponível',
              amount: bill.amount || 0,
              dueDate: dueDateCopy,
              categoryName: bill.categoryName || 'Categoria não informada',
              categoryColor: bill.color, // Default color since not available in overview
              icon: bill.icon, // Default icon since not available in overview
              isOverdue: bill.isOverdue,
              daysUntilDue,
            }
          } catch (error) {
            console.error('Error processing bill:', bill.id, error)
            return null
          }
        })
        .filter((bill): bill is NonNullable<typeof bill> => bill !== null)

      const overdue = overviewReceivables
        .filter((receivable) => receivable.isOverdue)
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())

      const upcoming = overviewReceivables
        .filter((receivable) => !receivable.isOverdue)
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())

      return {
        overdueReceivables: overdue,
        upcomingReceivables: upcoming,
      }
    }

    return {
      overdueReceivables: [],
      upcomingReceivables: [],
    }
  }, [generalOverview])

  const totalReceivables =
    overdueReceivables.length + upcomingReceivables.length

  if (totalReceivables === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Contas a receber
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p className="text-sm">Nenhuma conta a receber encontrada</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Contas a receber
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contas em atraso */}
        {overdueReceivables.length > 0 && (
          <div>
            <div className="mb-4 rounded-lg bg-red-50 p-3 dark:bg-red-950/20">
              <div className="flex items-center justify-between text-red-700 dark:text-red-400">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Contas a receber atrasadas
                  </span>
                </div>
                <span className="text-sm font-semibold">
                  {formatCurrency(
                    overdueReceivables.reduce(
                      (sum, receivable) => sum + receivable.amount,
                      0,
                    ),
                  )}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {overdueReceivables
                .slice(0, visibleOverdueReceivables)
                .map((receivable) => {
                  return (
                    <div
                      key={receivable.id}
                      className="flex  items-center justify-between rounded-lg border border-red-200 bg-red-50/50 p-3 transition-colors hover:bg-red-100/50 dark:border-red-800 dark:bg-red-950/10 dark:hover:bg-red-950/20"
                    >
                      <div className="flex cursor-pointer items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border">
                          <div
                            className="flex h-full w-full items-center justify-center rounded-full text-white"
                            style={{
                              backgroundColor: receivable.categoryColor,
                            }}
                          >
                            <CategoryIcon
                              iconName={receivable.icon}
                              size={16}
                              className="text-white"
                            />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {receivable.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(receivable.dueDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(receivable.amount)}
                        </p>
                        {onUpdateEntry && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleToggleReceivedStatus(receivable.id)
                                  }
                                  className="h-8 w-8 text-gray-400 hover:text-green-600"
                                >
                                  <ThumbsDown className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Marcar como recebido</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>

            {/* Botões de controle para contas atrasadas */}
            <div className="space-y-2 pt-3">
              {overdueReceivables.length > visibleOverdueReceivables && (
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={() =>
                    setVisibleOverdueReceivables((prev) => prev + 5)
                  }
                >
                  ver mais
                </Button>
              )}
              {visibleOverdueReceivables > 5 && (
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={() =>
                    setVisibleOverdueReceivables((prev) =>
                      Math.max(5, prev - 5),
                    )
                  }
                >
                  recolher
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Próximas contas */}
        {upcomingReceivables.length > 0 && (
          <div>
            <div className="mb-4 flex items-center justify-between text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Próximas</span>
              </div>
              <span className="text-sm font-semibold">
                {formatCurrency(
                  upcomingReceivables.reduce(
                    (sum, receivable) => sum + receivable.amount,
                    0,
                  ),
                )}
              </span>
            </div>

            <div className="space-y-3">
              {upcomingReceivables
                .slice(0, visibleUpcomingReceivables)
                .map((receivable) => {
                  const isNearDue = receivable.daysUntilDue <= 7

                  return (
                    <div
                      key={receivable.id}
                      className="flex  items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex cursor-pointer items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border">
                          <div
                            className="flex h-full w-full items-center justify-center rounded-full text-white"
                            style={{
                              backgroundColor: receivable.categoryColor,
                            }}
                          >
                            <CategoryIcon
                              iconName={receivable.icon}
                              size={16}
                              className="text-white"
                            />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {receivable.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">
                              {formatDate(receivable.dueDate)}
                            </p>
                            {isNearDue && (
                              <Badge variant="secondary" className="text-xs">
                                {receivable.daysUntilDue === 0
                                  ? 'Hoje'
                                  : receivable.daysUntilDue === 1
                                    ? 'Amanhã'
                                    : `${receivable.daysUntilDue} dias`}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-green-600">
                          {formatCurrency(receivable.amount)}
                        </p>
                        {onUpdateEntry && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleToggleReceivedStatus(receivable.id)
                                  }
                                  className="h-8 w-8 text-gray-400 hover:text-green-600"
                                >
                                  <ThumbsDown className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Marcar como recebido</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>

            {/* Botões de controle para próximas contas */}
            <div className="space-y-2 pt-3">
              {upcomingReceivables.length > visibleUpcomingReceivables && (
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={() =>
                    setVisibleUpcomingReceivables((prev) => prev + 5)
                  }
                >
                  ver mais
                </Button>
              )}
              {visibleUpcomingReceivables > 5 && (
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={() =>
                    setVisibleUpcomingReceivables((prev) =>
                      Math.max(5, prev - 5),
                    )
                  }
                >
                  recolher
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
