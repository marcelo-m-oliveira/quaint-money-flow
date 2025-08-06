'use client'

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleMinus,
  CirclePlus,
  CreditCard,
  Edit,
  Eye,
  Plus,
  Search,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Topbar } from '@/components/topbar'
import { TransactionFormModal } from '@/components/transaction-form-modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatCurrency, formatDate } from '@/lib/format'
import { useFinancialData } from '@/lib/hooks/use-financial-data'
import { usePreferences } from '@/lib/hooks/use-preferences'
import { TransactionFormSchema } from '@/lib/schemas'
import { Transaction } from '@/lib/types'

// Funções utilitárias para filtros de período
function getStartOfWeek(date: Date): Date {
  const start = new Date(date)
  const day = start.getDay()
  const diff = start.getDate() - day
  start.setDate(diff)
  start.setHours(0, 0, 0, 0)
  return start
}

function getEndOfWeek(date: Date): Date {
  const end = new Date(date)
  const day = end.getDay()
  const diff = end.getDate() + (6 - day)
  end.setDate(diff)
  end.setHours(23, 59, 59, 999)
  return end
}

function getStartOfMonth(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  start.setHours(0, 0, 0, 0)
  return start
}

function getEndOfMonth(date: Date): Date {
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  end.setHours(23, 59, 59, 999)
  return end
}

function getStartOfDay(date: Date): Date {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  return start
}

function getEndOfDay(date: Date): Date {
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return end
}

export default function TransacoesPage() {
  const {
    categories,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionsWithCategories,
  } = useFinancialData()

  const { preferences, updatePreference } = usePreferences()

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

  // Estados para controle de período
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentPeriod, setCurrentPeriod] = useState(
    preferences.defaultNavigationPeriod,
  )

  // Estados para modo de visualização
  const [viewMode, setViewMode] = useState<'cashflow' | 'all'>(
    preferences.viewMode,
  )
  const [isViewModeModalOpen, setIsViewModeModalOpen] = useState(false)
  const [tempViewMode, setTempViewMode] = useState<'cashflow' | 'all'>(
    preferences.viewMode,
  )

  // Estado para controlar expansão do resumo financeiro
  const [isFinancialSummaryExpanded, setIsFinancialSummaryExpanded] = useState(
    preferences.isFinancialSummaryExpanded,
  )

  // Função para alterar modo de visualização e salvar preferência
  const handleViewModeChange = (newViewMode: 'cashflow' | 'all') => {
    setViewMode(newViewMode)
    updatePreference('viewMode', newViewMode)
  }

  // Função para confirmar mudança de modo de visualização
  const handleConfirmViewMode = () => {
    handleViewModeChange(tempViewMode)
    setIsViewModeModalOpen(false)
  }

  // Função para abrir modal e sincronizar estado temporário
  const handleOpenViewModeModal = () => {
    setTempViewMode(viewMode)
    setIsViewModeModalOpen(true)
  }

  // Função para alterar expansão e salvar preferência
  const handleToggleExpansion = () => {
    const newExpanded = !isFinancialSummaryExpanded
    setIsFinancialSummaryExpanded(newExpanded)
    updatePreference('isFinancialSummaryExpanded', newExpanded)
  }

  // Sincronizar estados locais com preferências quando mudarem
  useEffect(() => {
    setViewMode(preferences.viewMode)
    setTempViewMode(preferences.viewMode)
    setIsFinancialSummaryExpanded(preferences.isFinancialSummaryExpanded)
  }, [preferences.viewMode, preferences.isFinancialSummaryExpanded])

  // Funções para navegação de período
  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)

    if (currentPeriod === 'diario') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    } else if (currentPeriod === 'semanal') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    } else if (currentPeriod === 'mensal') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    }

    setCurrentDate(newDate)
  }

  // Função para obter o range de datas do período atual
  const getCurrentPeriodRange = () => {
    switch (currentPeriod) {
      case 'diario':
        return {
          start: getStartOfDay(currentDate),
          end: getEndOfDay(currentDate),
        }
      case 'semanal':
        return {
          start: getStartOfWeek(currentDate),
          end: getEndOfWeek(currentDate),
        }
      case 'mensal':
        return {
          start: getStartOfMonth(currentDate),
          end: getEndOfMonth(currentDate),
        }
      default:
        return {
          start: getStartOfMonth(currentDate),
          end: getEndOfMonth(currentDate),
        }
    }
  }

  const transactionsWithCategories = getTransactionsWithCategories()

  // Filtrar transações
  const filteredTransactions = useMemo(() => {
    const { start, end } = getCurrentPeriodRange()

    return transactionsWithCategories.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      const matchesSearch = transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      const matchesCategory =
        selectedCategory === 'all'
          ? true
          : transaction.categoryId === selectedCategory
      const matchesType = (() => {
        switch (selectedType) {
          case 'all':
            return true
          case 'income':
            return transaction.type === 'income'
          case 'expense':
            return transaction.type === 'expense'
          case 'income-paid':
            return transaction.type === 'income' && transaction.paid
          case 'income-unpaid':
            return transaction.type === 'income' && !transaction.paid
          case 'expense-paid':
            return transaction.type === 'expense' && transaction.paid
          case 'expense-unpaid':
            return transaction.type === 'expense' && !transaction.paid
          default:
            return true
        }
      })()
      const matchesPeriod = transactionDate >= start && transactionDate <= end

      return matchesSearch && matchesCategory && matchesType && matchesPeriod
    })
  }, [
    transactionsWithCategories,
    searchTerm,
    selectedCategory,
    selectedType,
    currentDate,
    currentPeriod,
  ])

  // Ordenar transações por data (mais recentes primeiro)
  const sortedTransactions = useMemo(() => {
    return filteredTransactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
  }, [filteredTransactions])

  // Agrupar transações por data
  const groupedTransactions = useMemo(() => {
    const groups = sortedTransactions.reduce(
      (groups, transaction) => {
        const date = new Date(transaction.date).toDateString()
        if (!groups[date]) {
          groups[date] = []
        }
        groups[date].push(transaction)
        return groups
      },
      {} as Record<string, typeof sortedTransactions>,
    )

    // Converter para array ordenado
    return Object.entries(groups).sort(
      ([dateA], [dateB]) =>
        new Date(dateB).getTime() - new Date(dateA).getTime(),
    )
  }, [sortedTransactions])

  // Função para formatar o título do período
  const getPeriodTitle = () => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }

    switch (currentPeriod) {
      case 'diario':
        return currentDate.toLocaleDateString('pt-BR', options)
      case 'semanal': {
        const start = getStartOfWeek(currentDate)
        const end = getEndOfWeek(currentDate)
        return `${start.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}`
      }
      case 'mensal':
        return currentDate.toLocaleDateString('pt-BR', {
          year: 'numeric',
          month: 'long',
        })
      default:
        return currentDate.toLocaleDateString('pt-BR', {
          year: 'numeric',
          month: 'long',
        })
    }
  }

  // Calcular totais das transações filtradas
  const filteredTotals = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const expense = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      income,
      expense,
      balance: income - expense,
    }
  }, [filteredTransactions])

  // Calcular dados do fluxo de caixa
  const cashflowData = useMemo(() => {
    const { start } = getCurrentPeriodRange()
    const allTransactions = getTransactionsWithCategories()

    // Saldo anterior (antes do período atual)
    const previousBalance = allTransactions
      .filter((t) => new Date(t.date) < start)
      .reduce((sum, t) => {
        return t.type === 'income' ? sum + t.amount : sum - t.amount
      }, 0)

    // Receitas e despesas realizadas (pagas)
    const realizedIncome = filteredTransactions
      .filter((t) => t.type === 'income' && t.paid)
      .reduce((sum, t) => sum + t.amount, 0)

    const realizedExpense = filteredTransactions
      .filter((t) => t.type === 'expense' && t.paid)
      .reduce((sum, t) => sum + t.amount, 0)

    // Receitas e despesas previstas (não pagas)
    const expectedIncome = filteredTransactions
      .filter((t) => t.type === 'income' && !t.paid)
      .reduce((sum, t) => sum + t.amount, 0)

    const expectedExpense = filteredTransactions
      .filter((t) => t.type === 'expense' && !t.paid)
      .reduce((sum, t) => sum + t.amount, 0)

    // Saldo atual e previsto
    const currentBalance = previousBalance + realizedIncome - realizedExpense
    const projectedBalance = currentBalance + expectedIncome - expectedExpense

    return {
      previousBalance,
      realizedIncome,
      expectedIncome,
      realizedExpense,
      expectedExpense,
      currentBalance,
      projectedBalance,
    }
  }, [
    filteredTransactions,
    getCurrentPeriodRange,
    getTransactionsWithCategories,
  ])

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

  const handleTogglePaidStatus = (transaction: Transaction) => {
    const updatedData = {
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type,
      categoryId: transaction.categoryId,
      date: transaction.date.toISOString().split('T')[0],
      paid: !transaction.paid,
    }
    updateTransaction(transaction.id, updatedData)
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
    <div className="flex h-screen flex-col">
      <Topbar />
      <div className="flex-1 overflow-auto p-4 pb-80">
        <div className="mx-auto max-w-4xl space-y-6">
          <Card>
            <CardHeader>
              {/* Controle de Período e Lançamentos */}
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Lançamentos
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => handleAddTransaction('income')}
                        className="text-green-600"
                      >
                        <CirclePlus className="mr-2 h-4 w-4" />
                        Nova Receita
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAddTransaction('expense')}
                        className="text-red-600"
                      >
                        <CircleMinus className="mr-2 h-4 w-4" />
                        Nova Despesa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigatePeriod('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex min-w-[140px] items-center gap-2"
                      >
                        {getPeriodTitle()}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => setCurrentPeriod('diario')}
                      >
                        Diário
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setCurrentPeriod('semanal')}
                      >
                        Semanal
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setCurrentPeriod('mensal')}
                      >
                        Mensal
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigatePeriod('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  {/* Botão de Modo de Visualização */}
                  <Dialog
                    open={isViewModeModalOpen}
                    onOpenChange={setIsViewModeModalOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={handleOpenViewModeModal}
                      >
                        <Eye className="h-4 w-4" />
                        Modo
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Modo de visualização</DialogTitle>
                        <DialogDescription>
                          Escolha como você deseja visualizar suas transações
                        </DialogDescription>
                      </DialogHeader>

                      <div className="py-4">
                        <Tabs
                          value={tempViewMode}
                          onValueChange={(value) =>
                            setTempViewMode(value as 'cashflow' | 'all')
                          }
                        >
                          <TabsList className="mb-6 grid w-full grid-cols-2">
                            <TabsTrigger value="cashflow">
                              Fluxo de caixa
                            </TabsTrigger>
                            <TabsTrigger value="all">
                              Todos os lançamentos
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="cashflow" className="mt-0">
                            <div className="space-y-4">
                              <div className="rounded-lg border p-4">
                                <h4 className="mb-2 font-medium">
                                  Fluxo de caixa
                                </h4>
                                <p className="mb-3 text-sm text-muted-foreground">
                                  Apenas lançamentos que afetam seu saldo
                                  diretamente
                                </p>
                                <div className="text-sm text-muted-foreground">
                                  <p className="mb-2 font-medium">
                                    O que você verá:
                                  </p>
                                  <ul className="list-inside list-disc space-y-1">
                                    <li>
                                      Apenas lançamentos que afetam seu saldo
                                      diretamente
                                    </li>
                                    <li>
                                      Não vai aparecer gastos de cartão de
                                      crédito
                                    </li>
                                    <li>
                                      Vai aparecer Faturas e Pagamentos de
                                      Fatura
                                    </li>
                                    <li>
                                      Barra de Resultados com somatório simples
                                      do período
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="all" className="mt-0">
                            <div className="space-y-4">
                              <div className="rounded-lg border p-4">
                                <h4 className="mb-2 font-medium">
                                  Todos os lançamentos
                                </h4>
                                <p className="mb-3 text-sm text-muted-foreground">
                                  Todos os gastos feitos por você, incluindo
                                  cartão de crédito
                                </p>
                                <div className="text-sm text-muted-foreground">
                                  <p className="mb-2 font-medium">
                                    O que você verá:
                                  </p>
                                  <ul className="list-inside list-disc space-y-1">
                                    <li>
                                      Todos os lançamentos feitos por você
                                    </li>
                                    <li>
                                      Todos os gastos feitos por cartão de
                                      crédito
                                    </li>
                                    <li>
                                      Não vamos mostrar Faturas e Pagamentos de
                                      Fatura
                                    </li>
                                    <li>
                                      Barra de Resultados com Saldo e Previsão
                                      de Saldo
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>

                      <DialogFooter>
                        <Button
                          onClick={handleConfirmViewMode}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          Confirmar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              {/* Filtros */}
              <div className="!mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
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
                      <SelectItem value="income-paid">
                        Receitas Pagas
                      </SelectItem>
                      <SelectItem value="income-unpaid">
                        Receitas Não Pagas
                      </SelectItem>
                      <SelectItem value="expense">Despesas</SelectItem>
                      <SelectItem value="expense-paid">
                        Despesas Pagas
                      </SelectItem>
                      <SelectItem value="expense-unpaid">
                        Despesas Não Pagas
                      </SelectItem>
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
              <CardTitle>Transações ({sortedTransactions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Lista de transações */}
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
                <div className="space-y-6">
                  {groupedTransactions.map(([dateString, transactions]) => {
                    const date = new Date(dateString)
                    const today = new Date()
                    const yesterday = new Date(today)
                    yesterday.setDate(yesterday.getDate() - 1)

                    let dateLabel = formatDate(date)
                    if (date.toDateString() === today.toDateString()) {
                      dateLabel = 'Hoje'
                    } else if (
                      date.toDateString() === yesterday.toDateString()
                    ) {
                      dateLabel = 'Ontem'
                    }

                    const dayTotal = transactions.reduce((sum, t) => {
                      return sum + (t.type === 'income' ? t.amount : -t.amount)
                    }, 0)

                    return (
                      <div key={dateString} className="space-y-3">
                        {/* Cabeçalho do grupo de data */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-medium text-muted-foreground">
                              {dateLabel}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {transactions.length} transaç
                              {transactions.length === 1 ? 'ão' : 'ões'}
                            </span>
                            <span className="text-xs">•</span>
                            <span
                              className={`text-sm font-medium ${
                                dayTotal >= 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {dayTotal >= 0 ? '+' : ''}
                              {formatCurrency(Math.abs(dayTotal))}
                            </span>
                          </div>
                        </div>

                        {/* Lista de transações do dia */}
                        <div className="space-y-2">
                          {transactions.map((transaction) => (
                            <div key={transaction.id}>
                              <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
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
                                    <p className="font-medium">
                                      {transaction.description}
                                    </p>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <div
                                          className="h-2 w-2 rounded-full"
                                          style={{
                                            backgroundColor:
                                              transaction.category.color,
                                          }}
                                        />
                                        {transaction.category.name}
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
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                              handleTogglePaidStatus(
                                                transaction,
                                              )
                                            }
                                            className={`${
                                              transaction.paid
                                                ? 'text-green-600 hover:text-green-700'
                                                : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                          >
                                            {transaction.paid ? (
                                              <ThumbsUp className="h-4 w-4" />
                                            ) : (
                                              <ThumbsDown className="h-4 w-4" />
                                            )}
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>
                                            Marcar como{' '}
                                            {transaction.paid
                                              ? 'não pago'
                                              : 'pago'}
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        handleEditTransaction(transaction)
                                      }
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
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Resumo financeiro fixo na parte inferior */}
      {(viewMode === 'all' || viewMode === 'cashflow') && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto max-w-4xl p-4">
            {viewMode === 'cashflow' ? (
              // Visualização de Fluxo de Caixa
              !isFinancialSummaryExpanded ? (
                // Visualização simplificada - apenas saldo e previsto
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        Fluxo de Caixa
                      </span>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          cashflowData.currentBalance >= 0
                            ? 'text-blue-600'
                            : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(cashflowData.currentBalance)}
                      </p>
                      <p
                        className={`text-xs ${
                          cashflowData.projectedBalance >= 0
                            ? 'text-muted-foreground'
                            : 'text-red-500'
                        }`}
                      >
                        Prev: {formatCurrency(cashflowData.projectedBalance)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleExpansion}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">Expandir</span>
                  </Button>
                </div>
              ) : (
                // Visualização expandida - detalhamento completo
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Detalhamento do Fluxo de Caixa
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleToggleExpansion}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <ChevronDown className="h-4 w-4" />
                      <span className="text-sm">Recolher</span>
                    </Button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        saldo anterior
                      </span>
                      <span
                        className={`font-medium ${
                          cashflowData.previousBalance >= 0
                            ? 'text-foreground'
                            : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(cashflowData.previousBalance)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        receita realizada
                      </span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(cashflowData.realizedIncome)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        receita prevista
                      </span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(cashflowData.expectedIncome)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        despesa realizada
                      </span>
                      <span className="font-medium text-red-600">
                        -{formatCurrency(cashflowData.realizedExpense)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        despesa prevista
                      </span>
                      <span className="font-medium text-red-600">
                        -{formatCurrency(cashflowData.expectedExpense)}
                      </span>
                    </div>

                    {/* Separador */}
                    <div className="mt-3 border-t pt-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-muted-foreground">
                          saldo
                        </span>
                        <span
                          className={`text-lg font-bold ${
                            cashflowData.currentBalance >= 0
                              ? 'text-blue-600'
                              : 'text-red-600'
                          }`}
                        >
                          {formatCurrency(cashflowData.currentBalance)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-muted-foreground">
                          previsto
                        </span>
                        <span
                          className={`text-lg font-bold ${
                            cashflowData.projectedBalance >= 0
                              ? 'text-foreground'
                              : 'text-red-600'
                          }`}
                        >
                          {formatCurrency(cashflowData.projectedBalance)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ) : // Visualização para modo 'all'
            !isFinancialSummaryExpanded ? (
              // Visualização simplificada - apenas saldo
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Saldo Total</span>
                  </div>
                  <p
                    className={`text-xl font-bold ${
                      filteredTotals.balance >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(filteredTotals.balance)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleExpansion}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm">Expandir</span>
                </Button>
              </div>
            ) : (
              // Visualização expandida - receitas, despesas e saldo
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Detalhamento Financeiro
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleExpansion}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <ChevronDown className="h-4 w-4" />
                    <span className="text-sm">Recolher</span>
                  </Button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <ArrowUpIcon className="h-4 w-4 text-green-600" />
                      Receitas
                    </span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(filteredTotals.income)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <ArrowDownIcon className="h-4 w-4 text-red-600" />
                      Despesas
                    </span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(filteredTotals.expense)}
                    </span>
                  </div>

                  {/* Separador */}
                  <div className="mt-3 border-t pt-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 font-medium text-muted-foreground">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        Saldo
                      </span>
                      <span
                        className={`text-lg font-bold ${
                          filteredTotals.balance >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(filteredTotals.balance)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
