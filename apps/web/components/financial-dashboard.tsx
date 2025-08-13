'use client'

import { timestampToDateInputString } from '@saas/utils'
import { EntryFormSchema } from '@saas/validations'
import { CircleMinus, CirclePlus } from 'lucide-react'
import { useEffect, useState } from 'react'

import { useOverviewContext } from '@/lib/contexts/overview-context'
import { formatCurrency, getDayPeriod } from '@/lib/format'
import { useCategories } from '@/lib/hooks/use-categories'
import { useEntries } from '@/lib/hooks/use-entries'
import { Entry, EntryFormData, PendingAccount } from '@/lib/types'

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
  // Usar hooks existentes sem carregar dados (shouldFetch=false)
  const { addEntry, updateEntry, patchEntry, deleteEntry } = useEntries(
    undefined,
    false,
  )

  const { deleteCategory } = useCategories(false)

  const {
    generalOverview,
    isLoading,
    refreshGeneralOverview,
    refreshTopExpenses,
  } = useOverviewContext()

  // Função customizada para patch que também atualiza o overview
  const handlePatchEntry = async (id: string, data: Partial<EntryFormData>) => {
    try {
      await patchEntry(id, data)
      // Atualizar o overview em tempo real após a alteração
      await refreshGeneralOverview()
      // Atualizar também os maiores gastos para refletir mudanças nas categorias
      // Forçar atualização ignorando cache para garantir que mudanças sejam refletidas
      await refreshTopExpenses({ period: 'current-month' }, true)
    } catch (error) {
      console.error('Erro ao atualizar lançamento:', error)
    }
  }

  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false)
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Entry | undefined>()

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

  // Usar dados do overview
  const displayTotals = {
    income: generalOverview?.monthlyIncome ?? 0,
    expenses: generalOverview?.monthlyExpenses ?? 0,
  }

  // TODO: Estas funções serão utilizadas quando implementarmos a lista de transações e categorias
  const handleDeleteEntry = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Excluir Transação',
      description:
        'Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.',
      onConfirm: () => deleteEntry(id),
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

  // Função para editar entrada a partir dos cards de contas
  const handleEditEntry = (account: PendingAccount) => {
    // Converter PendingAccount para Entry para compatibilidade com o modal
    const entry: Entry = {
      id: account.id,
      description: account.description,
      amount: account.amount,
      date: account.date,
      type: account.type || 'expense', // Assumir expense se não especificado
      categoryId: account.categoryId || '',
      accountId: account.accountId,
      creditCardId: account.creditCardId,
      paid: false,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    }

    setEditingEntry(entry)
    if (entry.type === 'expense') {
      setIsExpenseDialogOpen(true)
    } else {
      setIsIncomeDialogOpen(true)
    }
  }

  // Evita warning do ESLint sobre variáveis não utilizadas
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _unusedFunctions = { handleDeleteEntry, handleDeleteCategory }

  const closeExpenseDialog = () => {
    setIsExpenseDialogOpen(false)
    setEditingEntry(undefined)
    refreshGeneralOverview()
  }

  const closeIncomeDialog = () => {
    setIsIncomeDialogOpen(false)
    setEditingEntry(undefined)
    refreshGeneralOverview()
  }

  const handleExpenseSubmit = async (
    data: EntryFormSchema,
    shouldClose = true,
  ) => {
    // Convert EntryFormSchema to EntryFormData
    const expenseData: EntryFormData = {
      ...data,
      type: 'expense' as const,
      date: timestampToDateInputString(data.date),
    }
    if (editingEntry) {
      await updateEntry(editingEntry.id, expenseData)
      setEditingEntry(undefined)
      // Atualizar maiores gastos após editar despesa
      await refreshTopExpenses({ period: 'current-month' }, true)
    } else {
      await addEntry(expenseData)
    }
    if (shouldClose) {
      closeExpenseDialog()
    }
  }

  const handleIncomeSubmit = async (
    data: EntryFormSchema,
    shouldClose = true,
  ) => {
    // Convert EntryFormSchema to EntryFormData
    const incomeData: EntryFormData = {
      ...data,
      type: 'income' as const,
      date: timestampToDateInputString(data.date),
    }
    if (editingEntry) {
      await updateEntry(editingEntry.id, incomeData)
      setEditingEntry(undefined)
    } else {
      await addEntry(incomeData)
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

  // Os dados de entries e categories virão do OverviewContext quando necessário

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
                    {formatCurrency(displayTotals.income)}
                  </p>
                </div>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Despesas no mês atual
                  </p>
                  <p className="text-xl font-bold text-red-600 lg:text-2xl">
                    {formatCurrency(displayTotals.expenses)}
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
                    entry={editingEntry}
                    onSubmit={handleExpenseSubmit}
                    type="expense"
                    title={editingEntry ? 'Editar despesa' : 'Nova despesa'}
                    showCreateAnotherButton={!editingEntry}
                  />
                )}

                {isIncomeDialogOpen && (
                  <EntryFormModal
                    isOpen={isIncomeDialogOpen}
                    onClose={closeIncomeDialog}
                    entry={editingEntry}
                    onSubmit={handleIncomeSubmit}
                    type="income"
                    title={editingEntry ? 'Editar receita' : 'Nova receita'}
                    showCreateAnotherButton={!editingEntry}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards de Informações Adicionais */}
        <div className="space-y-6">
          {/* Card de Maiores Despesas - Largura total */}
          <ExpenseSummaryCard />

          {/* Cards de Contas - Flexbox com 50% cada */}
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Card de Contas a Pagar */}
            <div className="flex-1">
              <BillsToPayCard
                onUpdateEntry={handlePatchEntry}
                onEditEntry={handleEditEntry}
              />
            </div>

            {/* Card de Contas a Receber */}
            <div className="flex-1">
              <BillsToReceiveCard
                onUpdateEntry={handlePatchEntry}
                onEditEntry={handleEditEntry}
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
