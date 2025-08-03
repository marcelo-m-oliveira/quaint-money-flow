'use client'

import { CircleMinus, CirclePlus, DollarSign, Moon, Sun } from 'lucide-react'
import { useState } from 'react'

import { formatCurrency, formatDateForInput } from '@/lib/format'
import { useFinancialData } from '@/lib/hooks/use-financial-data'
import { useTheme } from '@/lib/hooks/use-theme'
import {
  Category,
  CategoryFormData,
  Transaction,
  TransactionFormData,
} from '@/lib/types'

import { Button } from './ui/button'
import { CurrencyInput } from './ui/currency-input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Switch } from './ui/switch'

interface TransactionFormProps {
  transaction?: Transaction
  onSubmit: (data: TransactionFormData) => void
  categories: Category[]
  onClose: () => void
  fixedType?: 'income' | 'expense'
}

function TransactionForm({
  transaction,
  onSubmit,
  categories,
  onClose,
  fixedType,
}: TransactionFormProps) {
  const [formData, setFormData] = useState<TransactionFormData>({
    description: transaction?.description || '',
    amount: transaction?.amount.toString() || '',
    type: transaction?.type || fixedType || 'expense',
    categoryId: transaction?.categoryId || '',
    date: transaction
      ? formatDateForInput(transaction.date)
      : formatDateForInput(new Date()),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.description || !formData.amount || !formData.categoryId) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }
    onSubmit(formData)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="description">Descrição *</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Ex: Compra no supermercado"
          required
        />
      </div>

      <div>
        <Label htmlFor="amount">Valor *</Label>
        <CurrencyInput
          id="amount"
          value={formData.amount}
          onChange={(value) => setFormData({ ...formData, amount: value })}
          required
        />
      </div>

      {!fixedType && (
        <div>
          <Label htmlFor="type">Tipo *</Label>
          <Select
            value={formData.type}
            onValueChange={(value: 'income' | 'expense') =>
              setFormData({ ...formData, type: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Receita</SelectItem>
              <SelectItem value="expense">Despesa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor="category">Categoria *</Label>
        <Select
          value={formData.categoryId}
          onValueChange={(value) =>
            setFormData({ ...formData, categoryId: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="date">Data *</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {transaction ? 'Atualizar' : 'Adicionar'} Transação
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

export function FinancialDashboard() {
  const {
    categories,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    getTransactionsWithCategories,
    getTotals,
  } = useFinancialData()

  const { toggleTheme, isDark } = useTheme()

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false)
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<
    Transaction | undefined
  >()
  const [editingCategory, setEditingCategory] = useState<Category | undefined>()

  const transactionsWithCategories = getTransactionsWithCategories()
  const totals = getTotals()

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsExpenseDialogOpen(editingTransaction?.type === 'expense')
    setIsIncomeDialogOpen(editingTransaction?.type === 'income')
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setIsCategoryDialogOpen(true)
  }

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      deleteTransaction(id)
    }
  }

  const handleDeleteCategory = (id: string) => {
    try {
      if (confirm('Tem certeza que deseja excluir esta categoria?')) {
        deleteCategory(id)
      }
    } catch (error) {
      alert(
        error instanceof Error ? error.message : 'Erro ao excluir categoria',
      )
    }
  }

  const handleCategorySubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      updateCategory(editingCategory.id, data)
      setEditingCategory(undefined)
    } else {
      addCategory(data)
    }
  }

  const closeExpenseDialog = () => {
    setIsExpenseDialogOpen(false)
    setEditingTransaction(undefined)
  }

  const closeIncomeDialog = () => {
    setIsIncomeDialogOpen(false)
    setEditingTransaction(undefined)
  }

  const closeCategoryDialog = () => {
    setIsCategoryDialogOpen(false)
    setEditingCategory(undefined)
  }

  const handleExpenseSubmit = (data: TransactionFormData) => {
    const expenseData = { ...data, type: 'expense' as const }
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, expenseData)
      setEditingTransaction(undefined)
    } else {
      addTransaction(expenseData)
    }
    closeExpenseDialog()
  }

  const handleIncomeSubmit = (data: TransactionFormData) => {
    const incomeData = { ...data, type: 'income' as const }
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, incomeData)
      setEditingTransaction(undefined)
    } else {
      addTransaction(incomeData)
    }
    closeIncomeDialog()
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
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">
                Quaint Money
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                <Switch checked={isDark} onCheckedChange={toggleTheme} />
                <Moon className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Saudação e Resumo */}
        <div className="w-full">
          {/* Card Principal - Saudação, Totais e Acesso Rápido */}
          <div className="bg-card p-6 rounded-lg border flex flex-wrap gap-6">
            <div className="flex-auto md:w-1/2">
              {/* Saudação */}
              <div className="mb-6 text-center md:text-start">
                <p className="text-muted-foreground mb-1">Boa noite,</p>
                <p className="text-2xl font-bold text-foreground flex flex-wrap items-center gap-2">
                  Marcelo Oliveira!
                  <span className="text-2xl hidden md:block">🌙</span>
                </p>
              </div>

              {/* Totais */}
              <div className="flex flex-wrap text-center md:text-start gap-6 mb-6">
                <div className="flex-auto md:w-1/4">
                  <p className="text-sm text-muted-foreground mb-1">
                    Receitas no mês atual
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(totals.income)}
                  </p>
                </div>
                <div className="flex-auto md:w-1/4">
                  <p className="text-sm text-muted-foreground mb-1">
                    Despesas no mês atual
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(totals.expenses)}
                  </p>
                </div>
              </div>
            </div>
            <div className="border-l px-3 hidden md:block"></div>
            <div className="border-t w-full px-3 block md:hidden"></div>
            <div className="flex-auto md:w-1/3">
              {/* Acesso Rápido */}
              <div className="mt-6 pt-6">
                <h3 className="text-lg font-semibold mb-4">Acesso rápido</h3>

                <div className="flex flex-wrap gap-4">
                  <Dialog
                    open={isExpenseDialogOpen}
                    onOpenChange={setIsExpenseDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-auto w-full md:w-auto flex flex-col items-center justify-center gap-2 "
                      >
                        <CircleMinus className="h-8 w-8 text-red-600" />
                        <span className="text-sm font-medium text-red-600">
                          DESPESA
                        </span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nova Despesa</DialogTitle>
                      </DialogHeader>
                      <TransactionForm
                        transaction={editingTransaction}
                        onSubmit={handleExpenseSubmit}
                        categories={categories}
                        onClose={closeExpenseDialog}
                        fixedType="expense"
                      />
                    </DialogContent>
                  </Dialog>

                  <Dialog
                    open={isIncomeDialogOpen}
                    onOpenChange={setIsIncomeDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full md:w-auto h-auto flex flex-col items-center justify-center gap-2"
                      >
                        <CirclePlus className="h-8 w-8 text-green-600" />
                        <span className="text-sm font-medium text-green-600">
                          RECEITA
                        </span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nova Receita</DialogTitle>
                      </DialogHeader>
                      <TransactionForm
                        transaction={editingTransaction}
                        onSubmit={handleIncomeSubmit}
                        categories={categories}
                        onClose={closeIncomeDialog}
                        fixedType="income"
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
