'use client'

import {
  createLocalDateFromTimestamp,
  dateToSeconds,
  timestampToDateInputString,
} from '@saas/utils'
import { Decimal } from 'decimal.js'
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

import { AccountCardIcon } from '@/components/account-card-icon'
import { EntryFormModal } from '@/components/entry-form-modal'
import { PageLayout } from '@/components/layouts/page-layout'
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
import { formatCurrency, formatDate, timestampToDateString } from '@/lib/format'
import { useAccounts } from '@/lib/hooks/use-accounts'
import { useCrudToast } from '@/lib/hooks/use-crud-toast'
import { useEntries } from '@/lib/hooks/use-entries'
import { useUserPreferencesWithAutoInit } from '@/lib/hooks/use-user-preferences'
import { EntryFormSchema } from '@/lib/schemas'
import { Entry, EntryFormData } from '@/lib/types'

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

export default function LancamentoPage() {
  // Estados para controle de período
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentPeriod, setCurrentPeriod] = useState<
    'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  >('monthly')

  // Função para obter o range de datas do período atual
  const getCurrentPeriodRange = () => {
    const PERIOD_RANGE_FUNCTIONS = {
      daily: () => ({
        start: getStartOfDay(currentDate),
        end: getEndOfDay(currentDate),
      }),
      weekly: () => ({
        start: getStartOfWeek(currentDate),
        end: getEndOfWeek(currentDate),
      }),
      monthly: () => ({
        start: getStartOfMonth(currentDate),
        end: getEndOfMonth(currentDate),
      }),
    } as const

    const periodFunction =
      PERIOD_RANGE_FUNCTIONS[
        currentPeriod as keyof typeof PERIOD_RANGE_FUNCTIONS
      ]
    return periodFunction ? periodFunction() : PERIOD_RANGE_FUNCTIONS.monthly()
  }

  // Calcular filtros de data baseados no período atual
  const getDateFilters = () => {
    const { start, end } = getCurrentPeriodRange()
    return {
      startDate: dateToSeconds(start).toString(),
      endDate: dateToSeconds(end).toString(),
    }
  }

  const {
    entries,
    isLoading,
    addEntry,
    updateEntry,
    deleteEntry,
    updateFilters,
  } = useEntries(getDateFilters())

  const { accounts } = useAccounts()

  const { success, error } = useCrudToast()

  const { preferences, isInitialized, updatePreferences } =
    useUserPreferencesWithAutoInit()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Entry | undefined>(undefined)
  const [entryType, setEntryType] = useState<'income' | 'expense'>('expense')
  const [searchTerm, setSearchTerm] = useState('')

  const [selectedType, setSelectedType] = useState<string>('all')
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    entryId: string | null
  }>({ isOpen: false, entryId: null })

  // Estados para modo de visualização
  const [viewMode, setViewMode] = useState<'cashflow' | 'all'>('all')
  const [isViewModeModalOpen, setIsViewModeModalOpen] = useState(false)
  const [tempViewMode, setTempViewMode] = useState<'cashflow' | 'all'>('all')

  // Estado para controlar expansão do resumo financeiro
  const [isFinancialSummaryExpanded, setIsFinancialSummaryExpanded] =
    useState(false)

  // Função para alterar modo de visualização e salvar preferência
  const handleViewModeChange = (newViewMode: 'cashflow' | 'all') => {
    setViewMode(newViewMode)
    updatePreferences({ viewMode: newViewMode })
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
    updatePreferences({ isFinancialSummaryExpanded: newExpanded })
  }

  // Sincronizar estados locais com preferências quando mudarem
  useEffect(() => {
    if (preferences && isInitialized) {
      setCurrentPeriod(preferences.defaultNavigationPeriod)
      setViewMode(preferences.viewMode)
      setTempViewMode(preferences.viewMode)
      setIsFinancialSummaryExpanded(preferences.isFinancialSummaryExpanded)
    }
  }, [preferences, isInitialized])

  // Funções para navegação de período
  const navigatePeriod = async (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)

    if (currentPeriod === 'daily') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    } else if (currentPeriod === 'weekly') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    } else if (currentPeriod === 'monthly') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    }

    setCurrentDate(newDate)

    // Calcular novos filtros de data baseados na nova data
    const PERIOD_RANGE_FUNCTIONS = {
      daily: () => ({
        start: getStartOfDay(newDate),
        end: getEndOfDay(newDate),
      }),
      weekly: () => ({
        start: getStartOfWeek(newDate),
        end: getEndOfWeek(newDate),
      }),
      monthly: () => ({
        start: getStartOfMonth(newDate),
        end: getEndOfMonth(newDate),
      }),
    } as const

    const periodFunction =
      PERIOD_RANGE_FUNCTIONS[
        currentPeriod as keyof typeof PERIOD_RANGE_FUNCTIONS
      ]
    const range = periodFunction
      ? periodFunction()
      : PERIOD_RANGE_FUNCTIONS.monthly()

    // Atualizar filtros no hook
    await updateFilters({
      startDate: dateToSeconds(range.start).toString(),
      endDate: dateToSeconds(range.end).toString(),
    })
  }

  // Filtrar lançamentos
  const filteredEntries = useMemo(() => {
    const { start, end } = getCurrentPeriodRange()

    // Filtrar lançamentos por período, busca e tipo

    const filtered = entries.filter((entry) => {
      const entryTimestamp = entry.date * 1000 // Converter segundos para milissegundos
      const matchesSearch = entry.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      const matchesCategory = true
      // Key mapping para filtros de tipo de lançamento
      const TYPE_FILTERS = {
        all: () => true,
        income: (e: Entry) => e.type === 'income',
        expense: (e: Entry) => e.type === 'expense',
        'income-paid': (e: Entry) => e.type === 'income' && e.paid,
        'income-unpaid': (e: Entry) => e.type === 'income' && !e.paid,
        'expense-paid': (e: Entry) => e.type === 'expense' && e.paid,
        'expense-unpaid': (e: Entry) => e.type === 'expense' && !e.paid,
      } as const

      const typeFilter = TYPE_FILTERS[selectedType as keyof typeof TYPE_FILTERS]
      const matchesType = typeFilter ? typeFilter(entry) : true
      const matchesPeriod =
        entryTimestamp >= start.getTime() && entryTimestamp <= end.getTime()

      return matchesSearch && matchesCategory && matchesType && matchesPeriod
    })

    return filtered
  }, [entries, searchTerm, selectedType, currentDate, currentPeriod])

  // Ordenar lançamentos por data (mais recentes primeiro)
  const sortedEntries = useMemo(() => {
    return filteredEntries.sort((a, b) => b.date - a.date)
  }, [filteredEntries])

  // Agrupar lançamentos por data
  const groupedEntries = useMemo(() => {
    const groups = sortedEntries.reduce(
      (groups, entry) => {
        const date = createLocalDateFromTimestamp(entry.date).toDateString()
        if (!groups[date]) {
          groups[date] = []
        }
        groups[date].push(entry)
        return groups
      },
      {} as Record<string, Entry[]>,
    )

    // Converter para array ordenado
    return Object.entries(groups).sort(
      ([dateA], [dateB]) =>
        new Date(dateB).getTime() - new Date(dateA).getTime(),
    ) as [string, Entry[]][]
  }, [sortedEntries])

  // Key mapping para formatação de títulos de período
  const PERIOD_TITLE_FORMATTERS = {
    daily: () => {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
      return currentDate.toLocaleDateString('pt-BR', options)
    },
    weekly: () => {
      const start = getStartOfWeek(currentDate)
      const end = getEndOfWeek(currentDate)
      return `${start.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}`
    },
    monthly: () => {
      return currentDate.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
      })
    },
  } as const

  // Função para formatar o título do período
  const getPeriodTitle = () => {
    const formatter =
      PERIOD_TITLE_FORMATTERS[
        currentPeriod as keyof typeof PERIOD_TITLE_FORMATTERS
      ]
    return formatter ? formatter() : PERIOD_TITLE_FORMATTERS.monthly()
  }

  // Calcular totais dos lançamentos filtrados
  const filteredTotals = useMemo(() => {
    const income = filteredEntries
      .filter((e) => e.type === 'income')
      .reduce((sum, e) => new Decimal(sum).plus(e.amount).toNumber(), 0)

    const expense = filteredEntries
      .filter((e) => e.type === 'expense')
      .reduce((sum, e) => new Decimal(sum).plus(e.amount).toNumber(), 0)

    return {
      income,
      expense,
      balance: new Decimal(income).minus(expense).toNumber(),
    }
  }, [filteredEntries])

  // Calcular dados do fluxo de caixa
  const cashflowData = useMemo(() => {
    const { start } = getCurrentPeriodRange()

    // Saldo anterior (antes do período atual)
    const previousBalance = entries
      .filter((e) => createLocalDateFromTimestamp(e.date) < start)
      .reduce((sum, e) => {
        return e.type === 'income'
          ? new Decimal(sum).plus(e.amount).toNumber()
          : new Decimal(sum).minus(e.amount).toNumber()
      }, 0)

    // Receitas e despesas realizadas (pagas)
    const realizedIncome = filteredEntries
      .filter((e) => e.type === 'income' && e.paid)
      .reduce((sum, e) => new Decimal(sum).plus(e.amount).toNumber(), 0)

    const realizedExpense = filteredEntries
      .filter((e) => e.type === 'expense' && e.paid)
      .reduce((sum, e) => new Decimal(sum).plus(e.amount).toNumber(), 0)

    // Receitas e despesas previstas (não pagas)
    const expectedIncome = filteredEntries
      .filter((e) => e.type === 'income' && !e.paid)
      .reduce((sum, e) => new Decimal(sum).plus(e.amount).toNumber(), 0)

    const expectedExpense = filteredEntries
      .filter((e) => e.type === 'expense' && !e.paid)
      .reduce((sum, e) => new Decimal(sum).plus(e.amount).toNumber(), 0)

    // Saldo atual e previsto
    const currentBalance = new Decimal(previousBalance)
      .plus(realizedIncome)
      .minus(realizedExpense)
      .toNumber()
    const projectedBalance = new Decimal(currentBalance)
      .plus(expectedIncome)
      .minus(expectedExpense)
      .toNumber()

    return {
      previousBalance,
      realizedIncome,
      expectedIncome,
      realizedExpense,
      expectedExpense,
      currentBalance,
      projectedBalance,
    }
  }, [filteredEntries, getCurrentPeriodRange, entries])

  const handleAddEntry = (type: 'income' | 'expense') => {
    setEntryType(type)
    setEditingEntry(undefined)
    setIsModalOpen(true)
  }

  const handleEditEntry = (entry: Entry) => {
    setEditingEntry(entry)
    setEntryType(entry.type)
    setIsModalOpen(true)
  }

  const handleSubmitEntry = (data: EntryFormSchema, shouldClose = true) => {
    // Convert EntryFormSchema to EntryFormData format
    const formData: EntryFormData = {
      description: data.description,
      amount: data.amount,
      type: data.type,
      categoryId: data.categoryId,
      accountId: data.accountId,
      creditCardId: data.creditCardId,
      date: timestampToDateInputString(data.date),
      paid: data.paid,
    }

    if (editingEntry) {
      updateEntry(editingEntry.id, formData)
    } else {
      addEntry(formData)
    }

    if (shouldClose) {
      setIsModalOpen(false)
      setEditingEntry(undefined)
    }
  }

  const handleDeleteEntry = (id: string) => {
    setDeleteConfirmation({ isOpen: true, entryId: id })
  }

  const confirmDelete = () => {
    if (deleteConfirmation.entryId) {
      deleteEntry(deleteConfirmation.entryId)
    }
    setDeleteConfirmation({ isOpen: false, entryId: null })
  }

  const handleTogglePaidStatus = (entry: Entry) => {
    try {
      // Apenas alterar o status de pagamento, preservando todos os outros dados
      const updatedData = {
        description: entry.description,
        amount: entry.amount.toString(),
        type: entry.type,
        categoryId: entry.categoryId,
        accountId: entry.accountId || undefined,
        creditCardId: entry.creditCardId || undefined,
        date: timestampToDateString(entry.date * 1000), // Converter timestamp para string de data
        paid: !entry.paid,
      }

      updateEntry(entry.id, updatedData)

      const statusText = !entry.paid ? 'pago' : 'não pago'
      const entityType = entry.type === 'income' ? 'Receita' : 'Despesa'
      success.update(`${entityType} marcada como ${statusText}`)
    } catch (err) {
      error.update(
        'Status de pagamento',
        'Não foi possível alterar o status de pagamento.',
      )
    }
  }

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-2 text-sm text-muted-foreground">
              Carregando lançamentos...
            </p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="mx-auto mb-16 max-w-4xl space-y-6">
        <Card className="overflow-hidden">
          <CardHeader className="px-4 sm:px-6">
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
                      onClick={() => handleAddEntry('income')}
                      className="text-green-600"
                    >
                      <CirclePlus className="mr-2 h-4 w-4" />
                      Nova Receita
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleAddEntry('expense')}
                      className="text-red-600"
                    >
                      <CircleMinus className="mr-2 h-4 w-4" />
                      Nova Despesa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigatePeriod('prev')}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Período anterior</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

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
                    <DropdownMenuItem onClick={() => setCurrentPeriod('daily')}>
                      Diário
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setCurrentPeriod('weekly')}
                    >
                      Semanal
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setCurrentPeriod('monthly')}
                    >
                      Mensal
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigatePeriod('next')}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Próximo período</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

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
                                    Não vai aparecer gastos de cartão de crédito
                                  </li>
                                  <li>
                                    Vai aparecer Faturas e Pagamentos de Fatura
                                  </li>
                                  <li>
                                    Barra de Resultados com somatório simples do
                                    período
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
                                  <li>Todos os lançamentos feitos por você</li>
                                  <li>
                                    Todos os gastos feitos por cartão de crédito
                                  </li>
                                  <li>
                                    Não vamos mostrar Faturas e Pagamentos de
                                    Fatura
                                  </li>
                                  <li>
                                    Barra de Resultados com Saldo e Previsão de
                                    Saldo
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
            <div className="!mb-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <div className="min-w-0 flex-1">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Buscar lançamentos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <Label htmlFor="type-filter">Tipo</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="income">Receitas</SelectItem>
                    <SelectItem value="income-paid">Receitas Pagas</SelectItem>
                    <SelectItem value="income-unpaid">
                      Receitas Não Pagas
                    </SelectItem>
                    <SelectItem value="expense">Despesas</SelectItem>
                    <SelectItem value="expense-paid">Despesas Pagas</SelectItem>
                    <SelectItem value="expense-unpaid">
                      Despesas Não Pagas
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-shrink-0 items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedType('all')
                  }}
                  className="w-full whitespace-nowrap sm:w-auto"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
            <CardTitle>Lançamentos ({sortedEntries.length})</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto px-4 py-4 sm:px-6">
            {/* Lista de lançamentos */}
            {sortedEntries.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <CreditCard className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p className="mb-2 text-lg font-medium">
                  {searchTerm || selectedType !== 'all'
                    ? 'Nenhum lançamento encontrado'
                    : 'Nenhum lançamento cadastrado'}
                </p>
                <p className="mb-4 text-sm">
                  {searchTerm || selectedType !== 'all'
                    ? 'Tente ajustar os filtros para encontrar seus lançamentos'
                    : 'Comece adicionando seu primeiro lançamento'}
                </p>
                {!searchTerm && selectedType === 'all' && (
                  <div className="flex justify-center gap-2">
                    <Button
                      onClick={() => handleAddEntry('income')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CirclePlus className="mr-2 h-4 w-4" />
                      Nova Receita
                    </Button>
                    <Button
                      onClick={() => handleAddEntry('expense')}
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
                {groupedEntries.map(([dateString, entries]) => {
                  const date = new Date(dateString)
                  const today = new Date()
                  const yesterday = new Date(today)
                  yesterday.setDate(yesterday.getDate() - 1)

                  let dateLabel = formatDate(date)
                  if (date.toDateString() === today.toDateString()) {
                    dateLabel = 'Hoje'
                  } else if (date.toDateString() === yesterday.toDateString()) {
                    dateLabel = 'Ontem'
                  }

                  const dayTotal = entries.reduce((sum, e) => {
                    return sum + (e.type === 'income' ? e.amount : -e.amount)
                  }, 0)

                  return (
                    <div key={dateString} className="space-y-3">
                      {/* Cabeçalho do grupo de data */}
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-2">
                          <CalendarIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                          <h3 className="truncate text-sm font-medium text-muted-foreground">
                            {dateLabel}
                          </h3>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {entries.length} lançamento
                            {entries.length === 1 ? '' : 's'}
                          </span>
                          {preferences?.showDailyBalance && (
                            <>
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
                            </>
                          )}
                        </div>
                      </div>

                      {/* Lista de lançamentos do dia */}
                      <div className="space-y-2">
                        {entries.map((entry) => (
                          <div key={entry.id}>
                            <div className="flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:gap-4">
                              {/* Linha superior em mobile / Coluna esquerda em desktop: Ícone + Nome + Categoria */}
                              <div className="flex min-w-0 flex-1 items-center gap-3">
                                <div
                                  className={`flex-shrink-0 rounded-full p-2 ${
                                    entry.type === 'income'
                                      ? 'bg-green-100 dark:bg-green-900'
                                      : 'bg-red-100 dark:bg-red-900'
                                  }`}
                                >
                                  {entry.type === 'income' ? (
                                    <ArrowUpIcon
                                      className={`h-4 w-4 ${
                                        entry.type === 'income'
                                          ? 'text-green-600'
                                          : 'text-red-600'
                                      }`}
                                    />
                                  ) : (
                                    <ArrowDownIcon className="h-4 w-4 text-red-600" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-medium">
                                    {entry.description}
                                  </p>
                                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                    <div className="flex min-w-0 items-center gap-1">
                                      <div
                                        className="h-2 w-2 flex-shrink-0 rounded-full"
                                        style={{
                                          backgroundColor:
                                            entry.category?.color,
                                        }}
                                      />
                                      <span className="truncate">
                                        {entry.category?.name}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Linha do meio em mobile / Coluna centro em desktop: Conta/Cartão */}
                              <div className="flex justify-center sm:flex-1 sm:justify-center">
                                {(entry.accountId || entry.creditCardId) && (
                                  <AccountCardIcon
                                    entry={entry}
                                    accounts={accounts}
                                  />
                                )}
                              </div>

                              {/* Linha inferior em mobile / Coluna direita em desktop: Valor + Ações */}
                              <div className="flex flex-col gap-2 sm:flex-1 sm:flex-row sm:items-center sm:justify-end">
                                <p
                                  className={`truncate text-lg font-semibold ${
                                    entry.type === 'income'
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }`}
                                >
                                  {entry.type === 'income' ? '+' : '-'}
                                  {formatCurrency(entry.amount)}
                                </p>
                                <div className="flex flex-shrink-0 gap-1">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() =>
                                            handleTogglePaidStatus(entry)
                                          }
                                          className={`${
                                            entry.paid
                                              ? 'text-green-600 hover:text-green-700'
                                              : 'text-gray-400 hover:text-gray-600'
                                          }`}
                                        >
                                          {entry.paid ? (
                                            <ThumbsUp className="h-4 w-4" />
                                          ) : (
                                            <ThumbsDown className="h-4 w-4" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>
                                          Marcar como{' '}
                                          {entry.paid ? 'não pago' : 'pago'}
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleEditEntry(entry)}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Editar lançamento</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="text-destructive hover:text-destructive"
                                          onClick={() =>
                                            handleDeleteEntry(entry.id)
                                          }
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Excluir lançamento</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
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

        {/* Modal de lançamento */}
        <EntryFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingEntry(undefined)
          }}
          entry={editingEntry}
          onSubmit={handleSubmitEntry}
          type={entryType}
          title={
            editingEntry
              ? `Editar ${entryType === 'income' ? 'Receita' : 'Despesa'}`
              : `Nova ${entryType === 'income' ? 'Receita' : 'Despesa'}`
          }
        />

        {/* Confirmação de exclusão */}
        <ConfirmationDialog
          isOpen={deleteConfirmation.isOpen}
          onClose={() =>
            setDeleteConfirmation({ isOpen: false, entryId: null })
          }
          onConfirm={confirmDelete}
          title="Excluir Lançamento"
          description="Tem certeza que deseja excluir este lançamento? Esta ação não pode ser desfeita."
          confirmText="Excluir"
          cancelText="Cancelar"
        />
      </div>
    </PageLayout>
  )
}
