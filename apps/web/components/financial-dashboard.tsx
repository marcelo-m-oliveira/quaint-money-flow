'use client'

import { CircleMinus, CirclePlus } from 'lucide-react'
import { useEffect, useState } from 'react'

import { formatCurrency, getDayPeriod } from '@/lib/format'
import { useFinancialData } from '@/lib/hooks/use-financial-data'
import { Transaction, TransactionFormData } from '@/lib/types'

import { BillsToPayCard, ExpenseSummaryCard } from './dashboard'
import { PageLayout } from './layouts/page-layout'
import { TransactionFormModal } from './transaction-form-modal'
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
    Transaction | undefined
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

  const handleExpenseSubmit = (
    data: TransactionFormData,
    shouldClose = true,
  ) => {
    const expenseData = { ...data, type: 'expense' as const }
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

  const handleIncomeSubmit = (
    data: TransactionFormData,
    shouldClose = true,
  ) => {
    const incomeData = { ...data, type: 'income' as const }
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

                {/* Modais reformulados */}
                <TransactionFormModal
                  isOpen={isExpenseDialogOpen}
                  onClose={closeExpenseDialog}
                  transaction={editingTransaction}
                  onSubmit={handleExpenseSubmit}
                  categories={categories}
                  type="expense"
                  title="Nova despesa"
                />

                <TransactionFormModal
                  isOpen={isIncomeDialogOpen}
                  onClose={closeIncomeDialog}
                  transaction={editingTransaction}
                  onSubmit={handleIncomeSubmit}
                  categories={categories}
                  type="income"
                  title="Nova receita"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards de Informações Adicionais */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Card de Maiores Despesas */}
          <ExpenseSummaryCard
            transactions={transactionsWithCategories}
            categories={categories}
          />

          {/* Card de Contas a Pagar */}
          <BillsToPayCard
            transactions={transactionsWithCategories}
            categories={categories}
            onUpdateTransaction={updateTransactionStatus}
          />
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
