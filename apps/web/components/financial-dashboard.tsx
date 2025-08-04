'use client'

import { CircleMinus, CirclePlus } from 'lucide-react'
import { useEffect, useState } from 'react'

import { formatCurrency, getDayPeriod } from '@/lib/format'
import { useFinancialData } from '@/lib/hooks/use-financial-data'
import { Transaction, TransactionFormData } from '@/lib/types'

import { Topbar } from './topbar'
import { TransactionFormModal } from './transaction-form-modal'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { ConfirmationDialog } from './ui/confirmation-dialog'

export function FinancialDashboard() {
  const {
    categories,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    deleteCategory,
    getTotals,
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

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen bg-background flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
  //         <p className="text-muted-foreground">Carregando...</p>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Topbar />

      <main className="container mx-auto px-4 py-8">
        {/* Saudação e Resumo */}
        <div className="w-full">
          {/* Card Principal - Saudação, Totais e Acesso Rápido */}
          <Card>
            <CardContent className="flex flex-wrap gap-6 p-6">
              <div className="w-full flex-auto md:w-1/2">
                {/* Saudação */}
                <div className="mb-6 text-center md:text-start">
                  <p className="mb-1 text-muted-foreground">
                    {dayPeriod.greeting},
                  </p>
                  <p className="flex flex-wrap items-center justify-center gap-2 text-2xl font-bold text-foreground md:justify-start">
                    Marcelo Oliveira!
                    <span className="text-2xl">{dayPeriod.icon}</span>
                  </p>
                </div>

                {/* Totais */}
                <div className="mb-6 grid grid-cols-1 gap-6 text-center sm:grid-cols-2 md:text-start">
                  <div className="flex flex-col">
                    <p className="mb-1 text-sm text-muted-foreground">
                      Receitas no mês atual
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(totals.income)}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <p className="mb-1 text-sm text-muted-foreground">
                      Despesas no mês atual
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(totals.expenses)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="hidden border-l px-3 md:block"></div>
              <div className="block w-full border-t px-3 md:hidden"></div>
              <div className="w-full flex-auto md:w-1/3">
                {/* Acesso Rápido */}
                <div className="mt-6 pt-6">
                  <h3 className="mb-4 text-center text-lg font-semibold md:text-start">
                    Acesso rápido
                  </h3>

                  <div className="flex flex-wrap justify-center gap-4 md:justify-start">
                    <Button
                      variant="outline"
                      className="flex h-auto w-full flex-col items-center justify-center gap-2 p-4 sm:w-auto [&_svg]:!size-9"
                      onClick={() => setIsExpenseDialogOpen(true)}
                    >
                      <CircleMinus className="text-red-600" />
                      <span className="text-xs font-medium opacity-40">
                        DESPESA
                      </span>
                    </Button>

                    <Button
                      variant="outline"
                      className="flex h-auto w-full flex-col items-center justify-center gap-2 p-4 sm:w-auto [&_svg]:!size-9"
                      onClick={() => setIsIncomeDialogOpen(true)}
                    >
                      <CirclePlus className="text-green-600" />
                      <span className="text-xs font-medium opacity-40">
                        RECEITA
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
        </div>
      </main>

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
    </div>
  )
}
