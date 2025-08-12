'use client'

import { timestampToDateInputString } from '@saas/utils'
import { EntryFormSchema } from '@saas/validations'
import { CircleMinus, CirclePlus } from 'lucide-react'
import { useEffect, useState } from 'react'

import { formatCurrency, getDayPeriod } from '@/lib/format'
import { useFinancialData } from '@/lib/hooks/use-financial-data'
import { Entry, EntryFormData } from '@/lib/types'

import {
  BillsToPayCard,
  BillsToReceiveCard,
  ExpenseSummaryCard,
} from './dashboard'
import { EntryFormModal } from './entry-form-modal'
import { PageLayout } from './layouts/page-layout'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { ConfirmationDialog } from './ui/confirmation-dialog'

export function FinancialDashboard() {
  const {
    categories,
    addTransaction,
    updateTransaction,
    updateTransactionStatus,
    deleteTransaction,
    deleteCategory,
    getTotals,
    getTransactionsWithCategories,
    isLoading,
  } = useFinancialData()

  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false)
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<
    Entry | undefined
  >()

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    description: string
    onConfirm: () => void
  }>({ isOpen: false, title: '', description: '', onConfirm: () => {} })

  // Estado para armazenar o período do dia
  const [dayPeriod, setDayPeriod] = useState(getDayPeriod())

  // Atualiza o período do dia a cada minuto
  useEffect(() => {
    const updateDayPeriod = () => setDayPeriod(getDayPeriod())

    // Atualiza imediatamente
    updateDayPeriod()

    // Configura intervalo para atualizar a cada minuto
    const intervalId = setInterval(updateDayPeriod, 60000)

    // Limpa o intervalo quando o componente é desmontado
    return () => clearInterval(intervalId)
  }, [])

  const totals = getTotals()

  // TODO: Estas funções serão utilizadas quando implementarmos a lista de transações e categorias
  const handleDeleteTransaction = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Excluir Transação',
      description:
        'Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.',
      onConfirm: () => deleteTransaction(id),
    })
  }

  const handleDeleteCategory = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Excluir Categoria',
      description:
        'Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.',
      onConfirm: () => {
        try {
          deleteCategory(id)
        } catch (error) {
          // TODO: Implementar toast para mostrar erro
          console.error('Erro ao excluir categoria:', error)
        }
      },
    })
  }

  // Evita warning do ESLint sobre variáveis não utilizadas
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _unusedFunctions = { handleDeleteTransaction, handleDeleteCategory }

  const closeExpenseDialog = () => {
    setIsExpenseDialogOpen(false)
    setEditingTransaction(undefined)
  }

  const closeIncomeDialog = () => {
    setIsIncomeDialogOpen(false)
    setEditingTransaction(undefined)
  }

  const handleExpenseSubmit = (data: EntryFormSchema, shouldClose = true) => {
    // Convert EntryFormSchema to EntryFormData
    const expenseData: EntryFormData = {
      ...data,
      type: 'expense' as const,
      date: timestampToDateInputString(data.date),
    }
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, expenseData)
      setEditingTransaction(undefined)
    } else {
      addTransaction(expenseData)
    }
    if (shouldClose) {
      closeExpenseDialog()
    }
  }

  const handleIncomeSubmit = (data: EntryFormSchema, shouldClose = true) => {
    // Convert EntryFormSchema to EntryFormData
    const incomeData: EntryFormData = {
      ...data,
      type: 'income' as const,
      date: timestampToDateInputString(data.date),
    }
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, incomeData)
      setEditingTransaction(undefined)
    } else {
      addTransaction(incomeData)
    }
    if (shouldClose) {
      closeIncomeDialog()
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  const transactionsWithCategories = getTransactionsWithCategories()

  return (
    <PageLayout>
      {/* Saudação e Resumo */}
      <div className="w-full space-y-6">
        {/* Card Principal - Saudação, Totais e Acesso Rápido */}
        <Card>
          <CardContent className="flex flex-col gap-6 p-4 sm:p-6 lg:flex-row lg:gap-8">
            <div className="min-w-0 flex-1">
              {/* Saudação */}
              <div className="mb-6 text-center lg:text-start">
                <p className="mb-2 text-sm text-muted-foreground">
                  {dayPeriod.greeting},
                </p>
                <p className="flex flex-wrap items-center justify-center gap-2 text-xl font-bold text-foreground lg:justify-start lg:text-2xl">
                  Marcelo Oliveira!
                  <span className="text-xl lg:text-2xl">{dayPeriod.icon}</span>
                </p>
              </div>

              {/* Totais */}
              <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-2 lg:text-start">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Receitas no mês atual
                  </p>
                  <p className="text-xl font-bold text-green-600 lg:text-2xl">
                    {formatCurrency(totals.income)}
                  </p>
                </div>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Despesas no mês atual
                  </p>
                  <p className="text-xl font-bold text-red-600 lg:text-2xl">
                    {formatCurrency(totals.expenses)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 lg:w-80">
              {/* Acesso Rápido */}
              <div className="lg:border-l lg:pl-6">
                <h3 className="mb-4 text-center text-lg font-semibold lg:text-start">
                  Acesso rápido
                </h3>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:flex-col lg:justify-start">
                  <Button
                    variant="outline"
                    className="flex h-auto w-full flex-col items-center justify-center gap-2 p-4 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20 [&_svg]:!size-8"
                    onClick={() => setIsExpenseDialogOpen(true)}
                  >
                    <CircleMinus className="text-red-600" />
                    <span className="text-xs font-medium text-muted-foreground">
                      NOVA DESPESA
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    className="flex h-auto w-full flex-col items-center justify-center gap-2 p-4 hover:border-green-200 hover:bg-green-50 dark:hover:bg-green-950/20 [&_svg]:!size-8"
                    onClick={() => setIsIncomeDialogOpen(true)}
                  >
                    <CirclePlus className="text-green-600" />
                    <span className="text-xs font-medium text-muted-foreground">
                      NOVA RECEITA
                    </span>
                  </Button>
                </div>

                {/* Modais reformulados - Renderização condicional para evitar carregamento desnecessário */}
                {isExpenseDialogOpen && (
                  <EntryFormModal
                    isOpen={isExpenseDialogOpen}
                    onClose={closeExpenseDialog}
                    entry={editingTransaction}
                    onSubmit={handleExpenseSubmit}
                    type="expense"
                    title={
                      editingTransaction ? 'Editar despesa' : 'Nova despesa'
                    }
                    showCreateAnotherButton={!editingTransaction}
                  />
                )}

                {isIncomeDialogOpen && (
                  <EntryFormModal
                    isOpen={isIncomeDialogOpen}
                    onClose={closeIncomeDialog}
                    entry={editingTransaction}
                    onSubmit={handleIncomeSubmit}
                    type="income"
                    title={
                      editingTransaction ? 'Editar receita' : 'Nova receita'
                    }
                    showCreateAnotherButton={!editingTransaction}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards de Informações Adicionais */}
        <div className="space-y-6">
          {/* Card de Maiores Despesas - Largura total */}
          <ExpenseSummaryCard
            transactions={transactionsWithCategories}
            categories={categories}
          />

          {/* Cards de Contas - Flexbox com 50% cada */}
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Card de Contas a Pagar */}
            <div className="flex-1">
              <BillsToPayCard
                transactions={transactionsWithCategories}
                categories={categories}
                onUpdateTransaction={updateTransactionStatus}
                onEditTransaction={(transaction) => {
                  setEditingTransaction(transaction)
                  setIsExpenseDialogOpen(true)
                }}
              />
            </div>

            {/* Card de Contas a Receber */}
            <div className="flex-1">
              <BillsToReceiveCard
                transactions={transactionsWithCategories}
                categories={categories}
                onUpdateTransaction={updateTransactionStatus}
                onEditTransaction={(transaction) => {
                  setEditingTransaction(transaction)
                  setIsIncomeDialogOpen(true)
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de Confirmação */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />
    </PageLayout>
  )
}
