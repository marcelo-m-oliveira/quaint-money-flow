'use client'

import {
  DollarSign,
  Edit,
  Moon,
  Plus,
  Sun,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { useState } from 'react'

import { formatCurrency, formatDate, formatDateForInput } from '@/lib/format'
import { useFinancialData } from '@/lib/hooks/use-financial-data'
import { useTheme } from '@/lib/hooks/use-theme'
import {
  Category,
  CategoryFormData,
  Transaction,
  TransactionFormData,
} from '@/lib/types'
import { cn } from '@/lib/utils'

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
}

function TransactionForm({
  transaction,
  onSubmit,
  categories,
  onClose,
}: TransactionFormProps) {
  const [formData, setFormData] = useState<TransactionFormData>({
    description: transaction?.description || '',
    amount: transaction?.amount.toString() || '',
    type: transaction?.type || 'expense',
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

interface CategoryFormProps {
  category?: Category
  onSubmit: (data: CategoryFormData) => void
  onClose: () => void
}

function CategoryForm({ category, onSubmit, onClose }: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: category?.name || '',
    color: category?.color || '#FF6400',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) {
      alert('Por favor, informe o nome da categoria.')
      return
    }
    onSubmit(formData)
    onClose()
  }

  const colorOptions = [
    '#FF6400',
    '#10B981',
    '#3B82F6',
    '#F59E0B',
    '#8B5CF6',
    '#EF4444',
    '#06B6D4',
    '#84CC16',
    '#F97316',
    '#EC4899',
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome da Categoria *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Alimentação"
          required
        />
      </div>

      <div>
        <Label>Cor da Categoria</Label>
        <div className="grid grid-cols-5 gap-2 mt-2">
          {colorOptions.map((color) => (
            <button
              key={color}
              type="button"
              className={cn(
                'w-8 h-8 rounded-full border-2 transition-all',
                formData.color === color
                  ? 'border-primary scale-110'
                  : 'border-border',
              )}
              style={{ backgroundColor: color }}
              onClick={() => setFormData({ ...formData, color })}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {category ? 'Atualizar' : 'Criar'} Categoria
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
    transactions,
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

  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<
    Transaction | undefined
  >()
  const [editingCategory, setEditingCategory] = useState<Category | undefined>()

  const transactionsWithCategories = getTransactionsWithCategories()
  const totals = getTotals()

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsTransactionDialogOpen(true)
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

  const handleTransactionSubmit = (data: TransactionFormData) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, data)
      setEditingTransaction(undefined)
    } else {
      addTransaction(data)
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

  const closeTransactionDialog = () => {
    setIsTransactionDialogOpen(false)
    setEditingTransaction(undefined)
  }

  const closeCategoryDialog = () => {
    setIsCategoryDialogOpen(false)
    setEditingCategory(undefined)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

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
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receitas</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totals.income)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Despesas</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(totals.expenses)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saldo</p>
                <p
                  className={cn(
                    'text-2xl font-bold',
                    totals.balance >= 0 ? 'text-green-600' : 'text-red-600',
                  )}
                >
                  {formatCurrency(totals.balance)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Dialog
            open={isTransactionDialogOpen}
            onOpenChange={setIsTransactionDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
                </DialogTitle>
              </DialogHeader>
              <TransactionForm
                transaction={editingTransaction}
                onSubmit={handleTransactionSubmit}
                categories={categories}
                onClose={closeTransactionDialog}
              />
            </DialogContent>
          </Dialog>

          <Dialog
            open={isCategoryDialogOpen}
            onOpenChange={setIsCategoryDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                </DialogTitle>
              </DialogHeader>
              <CategoryForm
                category={editingCategory}
                onSubmit={handleCategorySubmit}
                onClose={closeCategoryDialog}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Transações */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Transações Recentes</h2>
              </div>
              <div className="p-6">
                {transactionsWithCategories.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Nenhuma transação encontrada.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Clique em "Nova Transação" para começar.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactionsWithCategories
                      .sort(
                        (a, b) =>
                          new Date(b.date).getTime() -
                          new Date(a.date).getTime(),
                      )
                      .map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: transaction.category.color,
                              }}
                            />
                            <div>
                              <p className="font-medium">
                                {transaction.description}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {transaction.category.name} •{' '}
                                {formatDate(transaction.date)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                'font-semibold',
                                transaction.type === 'income'
                                  ? 'text-green-600'
                                  : 'text-red-600',
                              )}
                            >
                              {transaction.type === 'income' ? '+' : '-'}
                              {formatCurrency(transaction.amount)}
                            </span>

                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() =>
                                  handleEditTransaction(transaction)
                                }
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() =>
                                  handleDeleteTransaction(transaction.id)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lista de Categorias */}
          <div>
            <div className="bg-card rounded-lg border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Categorias</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {categories.map((category) => {
                    const categoryTransactions = transactions.filter(
                      (t) => t.categoryId === category.id,
                    )
                    const categoryTotal = categoryTransactions.reduce(
                      (sum, t) => sum + t.amount,
                      0,
                    )

                    return (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <div>
                            <p className="font-medium">{category.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {categoryTransactions.length} transação(ões)
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {categoryTotal > 0 && (
                            <span className="text-sm font-medium">
                              {formatCurrency(categoryTotal)}
                            </span>
                          )}

                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditCategory(category)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
