'use client'

import { formatCurrency, formatDate } from '@saas/utils'
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
import { useCrudToast } from '@/lib/hooks/use-crud-toast'
import { useFinancialData } from '@/lib/hooks/use-financial-data'
import { CategoryIcon } from '@/lib/icon-map'
import { Category, Transaction } from '@/lib/types'

interface BillsToPayCardProps {
  transactions: Transaction[]
  categories: Category[]
  onUpdateTransaction?: (
    transactionId: string,
    updatedData: Partial<Transaction>,
  ) => void
  onEditTransaction?: (transaction: Transaction) => void
}

interface BillData {
  id: string
  description: string
  amount: number
  dueDate: Date
  categoryName: string
  categoryColor: string
  icon: string
  isOverdue: boolean
  daysUntilDue: number
}

export function BillsToPayCard({
  transactions,
  categories,
  onUpdateTransaction,
  onEditTransaction,
}: BillsToPayCardProps) {
  const { getCategoryIcon } = useFinancialData()
  const { success, error } = useCrudToast()
  const [visibleOverdueBills, setVisibleOverdueBills] = useState(5)
  const [visibleUpcomingBills, setVisibleUpcomingBills] = useState(5)

  const handleTogglePaidStatus = (transactionId: string) => {
    try {
      if (onUpdateTransaction) {
        onUpdateTransaction(transactionId, { paid: true })
        success.update('Pagamento')
      }
    } catch (err) {
      error.update('Pagamento', 'Não foi possível marcar como pago.')
    }
  }

  const { overdueBills, upcomingBills } = useMemo(() => {
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0) // Zerar horas para comparação precisa

    // Filtrar apenas despesas não pagas
    const unpaidExpenses = transactions.filter(
      (transaction) => transaction.type === 'expense' && !transaction.paid,
    )

    const billsData: BillData[] = unpaidExpenses.map((transaction) => {
      const category = categories.find(
        (cat) => cat.id === transaction.categoryId,
      )
      const dueDate = new Date(transaction.date)
      dueDate.setHours(0, 0, 0, 0)

      const timeDiff = dueDate.getTime() - currentDate.getTime()
      const daysUntilDue = Math.ceil(timeDiff / (1000 * 3600 * 24))

      return {
        id: transaction.id,
        description: transaction.description,
        amount: transaction.amount,
        dueDate,
        categoryName: category?.name || 'Categoria não encontrada',
        categoryColor: category?.color || '#6B7280',
        icon: getCategoryIcon(category),
        isOverdue: daysUntilDue < 0,
        daysUntilDue,
      }
    })

    // Separar em atrasadas e próximas
    const overdue = billsData
      .filter((bill) => bill.isOverdue)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())

    const upcoming = billsData
      .filter((bill) => !bill.isOverdue)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())

    return {
      overdueBills: overdue,
      upcomingBills: upcoming,
    }
  }, [transactions, categories])

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
                const transaction = transactions.find((t) => t.id === bill.id)
                return (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50/50 p-3 transition-colors hover:bg-red-100/50 dark:border-red-800 dark:bg-red-950/10 dark:hover:bg-red-950/20"
                  >
                    <div
                      className="flex cursor-pointer items-center gap-3"
                      onClick={() => {
                        if (onEditTransaction && transaction) {
                          onEditTransaction(transaction)
                        }
                      }}
                    >
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
                      {onUpdateTransaction && (
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
                const transaction = transactions.find((t) => t.id === bill.id)

                return (
                  <div
                    key={bill.id}
                    className="flex  items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div
                      className="flex cursor-pointer items-center gap-3"
                      onClick={() => {
                        if (onEditTransaction && transaction) {
                          onEditTransaction(transaction)
                        }
                      }}
                    >
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
                      {onUpdateTransaction && (
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
