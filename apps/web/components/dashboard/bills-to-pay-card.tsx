'use client'

import { formatCurrency, formatDate, secondsToDate } from '@saas/utils'
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

interface BillsToPayCardProps {
  onUpdateEntry?: (entryId: string, updatedData: Partial<EntryFormData>) => void
}

export function BillsToPayCard({ onUpdateEntry }: BillsToPayCardProps) {
  const { generalOverview } = useOverviewContext()
  const { success, error } = useCrudToast()
  const [visibleOverdueBills, setVisibleOverdueBills] = useState(5)
  const [visibleUpcomingBills, setVisibleUpcomingBills] = useState(5)

  const handleTogglePaidStatus = (entryId: string) => {
    try {
      if (onUpdateEntry) {
        onUpdateEntry(entryId, { paid: true })
        success.update('Pagamento')
      }
    } catch (err) {
      error.update('Pagamento', 'Não foi possível marcar como pago.')
    }
  }

  const { overdueBills, upcomingBills } = useMemo(() => {
    // Usar dados do overview
    if (!generalOverview?.accountsPayable) {
      return {
        overdueBills: [],
        upcomingBills: [],
      }
    }

    const overviewBills = generalOverview.accountsPayable
      .map((bill) => {
        try {
          // Verificar se dueDate é válido
          if (
            !bill.dueDate ||
            typeof bill.dueDate !== 'number' ||
            bill.dueDate <= 0
          ) {
            console.warn('Invalid dueDate for bill:', bill.id, bill.dueDate)
            return null
          }

          const dueDate = secondsToDate(bill.dueDate) // Convert from seconds to Date

          // Verificar se a data convertida é válida
          if (isNaN(dueDate.getTime())) {
            console.warn(
              'Invalid date conversion for bill:',
              bill.id,
              bill.dueDate,
            )
            return null
          }

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
            categoryColor: '#6B7280', // Default color since not available in overview
            icon: 'Receipt', // Default icon since not available in overview
            isOverdue: bill.isOverdue,
            daysUntilDue,
          }
        } catch (error) {
          console.error('Error processing bill:', bill.id, error)
          return null
        }
      })
      .filter((bill): bill is NonNullable<typeof bill> => bill !== null)

    const overdue = overviewBills
      .filter((bill) => bill.isOverdue)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())

    const upcoming = overviewBills
      .filter((bill) => !bill.isOverdue)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())

    return {
      overdueBills: overdue,
      upcomingBills: upcoming,
    }

    return {
      overdueBills: [],
      upcomingBills: [],
    }
  }, [generalOverview])

  const totalBills = overdueBills.length + upcomingBills.length

  if (totalBills === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Contas a pagar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p className="text-sm">Nenhuma conta pendente encontrada</p>
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
          Contas a pagar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contas em atraso */}
        {overdueBills.length > 0 && (
          <div>
            <div className="mb-4 rounded-lg bg-red-50 p-3 dark:bg-red-950/20">
              <div className="flex items-center justify-between text-red-700 dark:text-red-400">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Contas a pagar atrasadas
                  </span>
                </div>
                <span className="text-sm font-semibold">
                  {formatCurrency(
                    overdueBills.reduce((sum, bill) => sum + bill.amount, 0),
                  )}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {overdueBills.slice(0, visibleOverdueBills).map((bill) => {
                return (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50/50 p-3 transition-colors hover:bg-red-100/50 dark:border-red-800 dark:bg-red-950/10 dark:hover:bg-red-950/20"
                  >
                    <div className="flex cursor-pointer items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border">
                        <div
                          className="flex h-full w-full items-center justify-center rounded-full text-white"
                          style={{ backgroundColor: bill.categoryColor }}
                        >
                          <CategoryIcon
                            iconName={bill.icon}
                            size={16}
                            className="text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {bill.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(bill.dueDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-red-600 dark:text-red-400">
                        {formatCurrency(bill.amount)}
                      </p>
                      {onUpdateEntry && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleTogglePaidStatus(bill.id)}
                                className="h-8 w-8 text-gray-400 hover:text-green-600"
                              >
                                <ThumbsDown className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Marcar como pago</p>
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
              {overdueBills.length > visibleOverdueBills && (
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={() => setVisibleOverdueBills((prev) => prev + 5)}
                >
                  ver mais
                </Button>
              )}
              {visibleOverdueBills > 5 && (
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={() =>
                    setVisibleOverdueBills((prev) => Math.max(5, prev - 5))
                  }
                >
                  recolher
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Próximas contas */}
        {upcomingBills.length > 0 && (
          <div>
            <div className="mb-4 flex items-center justify-between text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Próximas</span>
              </div>
              <span className="text-sm font-semibold">
                {formatCurrency(
                  upcomingBills.reduce((sum, bill) => sum + bill.amount, 0),
                )}
              </span>
            </div>

            <div className="space-y-3">
              {upcomingBills.slice(0, visibleUpcomingBills).map((bill) => {
                const isNearDue = bill.daysUntilDue <= 7

                return (
                  <div
                    key={bill.id}
                    className="flex  items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex cursor-pointer items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border">
                        <div
                          className="flex h-full w-full items-center justify-center rounded-full text-white"
                          style={{ backgroundColor: bill.categoryColor }}
                        >
                          <CategoryIcon
                            iconName={bill.icon}
                            size={16}
                            className="text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {bill.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">
                            {formatDate(bill.dueDate)}
                          </p>
                          {isNearDue && (
                            <Badge variant="secondary" className="text-xs">
                              {bill.daysUntilDue === 0
                                ? 'Hoje'
                                : bill.daysUntilDue === 1
                                  ? 'Amanhã'
                                  : `${bill.daysUntilDue} dias`}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">
                        {formatCurrency(bill.amount)}
                      </p>
                      {onUpdateEntry && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleTogglePaidStatus(bill.id)}
                                className="h-8 w-8 text-gray-400 hover:text-green-600"
                              >
                                <ThumbsDown className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Marcar como pago</p>
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
              {upcomingBills.length > visibleUpcomingBills && (
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={() => setVisibleUpcomingBills((prev) => prev + 5)}
                >
                  ver mais
                </Button>
              )}
              {visibleUpcomingBills > 5 && (
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={() =>
                    setVisibleUpcomingBills((prev) => Math.max(5, prev - 5))
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
