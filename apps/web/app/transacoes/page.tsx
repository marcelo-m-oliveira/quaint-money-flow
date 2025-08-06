'use client'

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  CircleMinus,
  CirclePlus,
  CreditCard,
  Edit,
  Filter,
  Search,
  Trash2,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { Topbar } from '@/components/topbar'
import { TransactionFormModal } from '@/components/transaction-form-modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency, formatDate } from '@/lib/format'
import { useFinancialData } from '@/lib/hooks/use-financial-data'
import { TransactionFormSchema } from '@/lib/schemas'
import { Transaction } from '@/lib/types'

export default function TransacoesPage() {
  const {
    categories,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionsWithCategories,
    getTotals,
  } = useFinancialData()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<
    Transaction | undefined
  >(undefined)
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>(
    'expense',
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    transactionId: string | null
  }>({ isOpen: false, transactionId: null })

  const transactionsWithCategories = getTransactionsWithCategories()
  const totals = getTotals()

  // Filtrar transações
  const filteredTransactions = useMemo(() => {
    return transactionsWithCategories.filter((transaction) => {
      const matchesSearch = transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      const matchesCategory =
        selectedCategory === 'all' ||
        transaction.categoryId === selectedCategory
      const matchesType =
        selectedType === 'all' || transaction.type === selectedType

      return matchesSearch && matchesCategory && matchesType
    })
  }, [transactionsWithCategories, searchTerm, selectedCategory, selectedType])

  // Ordenar transações por data (mais recentes primeiro)
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
  }, [filteredTransactions])

  const handleAddTransaction = (type: 'income' | 'expense') => {
    setTransactionType(type)
    setEditingTransaction(undefined)
    setIsModalOpen(true)
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setTransactionType(transaction.type)
    setIsModalOpen(true)
  }

  const handleSubmitTransaction = (
    data: TransactionFormSchema,
    shouldClose = true,
  ) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, data)
    } else {
      addTransaction(data)
    }

    if (shouldClose) {
      setIsModalOpen(false)
      setEditingTransaction(undefined)
    }
  }

  const handleDeleteTransaction = (id: string) => {
    setDeleteConfirmation({ isOpen: true, transactionId: id })
  }

  const confirmDelete = () => {
    if (deleteConfirmation.transactionId) {
      deleteTransaction(deleteConfirmation.transactionId)
    }
    setDeleteConfirmation({ isOpen: false, transactionId: null })
  }

  const incomeCategories = categories.filter((cat) => cat.type === 'income')
  const expenseCategories = categories.filter((cat) => cat.type === 'expense')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Topbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="mt-2 text-sm text-muted-foreground">
                Carregando transações...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header com resumo */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold">
                <CreditCard className="h-6 w-6" />
                Transações
              </h1>
              <p className="text-sm text-muted-foreground">
                Visualize e gerencie todas as suas transações
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleAddTransaction('income')}
                className="bg-green-600 hover:bg-green-700"
              >
                <CirclePlus className="mr-2 h-4 w-4" />
                Nova Receita
              </Button>
              <Button
                onClick={() => handleAddTransaction('expense')}
                variant="destructive"
              >
                <CircleMinus className="mr-2 h-4 w-4" />
                Nova Despesa
              </Button>
            </div>
          </div>

          {/* Cards de resumo */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Receitas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(totals.income)}
                    </p>
                  </div>
                  <ArrowUpIcon className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Despesas</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(totals.expenses)}
                    </p>
                  </div>
                  <ArrowDownIcon className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo</p>
                    <p
                      className={`text-2xl font-bold ${
                        totals.balance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(totals.balance)}
                    </p>
                  </div>
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Buscar transações..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="type-filter">Tipo</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="income">Receitas</SelectItem>
                    <SelectItem value="expense">Despesas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category-filter">Categoria</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                    setSelectedType('all')
                  }}
                  className="w-full"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de transações */}
        <Card>
          <CardHeader>
            <CardTitle>Transações ({sortedTransactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedTransactions.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <CreditCard className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p className="mb-2 text-lg font-medium">
                  {searchTerm ||
                  selectedCategory !== 'all' ||
                  selectedType !== 'all'
                    ? 'Nenhuma transação encontrada'
                    : 'Nenhuma transação cadastrada'}
                </p>
                <p className="mb-4 text-sm">
                  {searchTerm ||
                  selectedCategory !== 'all' ||
                  selectedType !== 'all'
                    ? 'Tente ajustar os filtros para encontrar suas transações'
                    : 'Comece adicionando sua primeira transação'}
                </p>
                {!searchTerm &&
                  selectedCategory === 'all' &&
                  selectedType === 'all' && (
                    <div className="flex justify-center gap-2">
                      <Button
                        onClick={() => handleAddTransaction('income')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CirclePlus className="mr-2 h-4 w-4" />
                        Nova Receita
                      </Button>
                      <Button
                        onClick={() => handleAddTransaction('expense')}
                        variant="destructive"
                      >
                        <CircleMinus className="mr-2 h-4 w-4" />
                        Nova Despesa
                      </Button>
                    </div>
                  )}
              </div>
            ) : (
              <div className="space-y-2">
                {sortedTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`rounded-full p-2 ${
                          transaction.type === 'income'
                            ? 'bg-green-100 dark:bg-green-900'
                            : 'bg-red-100 dark:bg-red-900'
                        }`}
                      >
                        {transaction.type === 'income' ? (
                          <ArrowUpIcon
                            className={`h-4 w-4 ${
                              transaction.type === 'income'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{
                                backgroundColor: transaction.category.color,
                              }}
                            />
                            {transaction.category.name}
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {formatDate(transaction.date)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-lg font-semibold ${
                          transaction.type === 'income'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditTransaction(transaction)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
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
          </CardContent>
        </Card>
      </div>

      {/* Modal de transação */}
      <TransactionFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTransaction(undefined)
        }}
        transaction={editingTransaction}
        onSubmit={handleSubmitTransaction}
        categories={
          transactionType === 'income' ? incomeCategories : expenseCategories
        }
        type={transactionType}
        title={
          editingTransaction
            ? `Editar ${transactionType === 'income' ? 'Receita' : 'Despesa'}`
            : `Nova ${transactionType === 'income' ? 'Receita' : 'Despesa'}`
        }
      />

      {/* Confirmação de exclusão */}
      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={() =>
          setDeleteConfirmation({ isOpen: false, transactionId: null })
        }
        onConfirm={confirmDelete}
        title="Excluir Transação"
        description="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  )
}
