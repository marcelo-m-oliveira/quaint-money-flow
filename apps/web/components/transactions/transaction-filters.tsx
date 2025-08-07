'use client'

import { ChevronLeft, ChevronRight, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PERIOD_TITLE_FORMATTERS, PeriodType } from '@/lib/date-utils'
import { CategoryIcon } from '@/lib/icon-map'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

interface TransactionFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedCategory: string
  onCategoryChange: (value: string) => void
  selectedType: string
  onTypeChange: (value: string) => void
  currentPeriod: PeriodType
  onPeriodChange: (value: PeriodType) => void
  currentDate: Date
  onDateChange: (date: Date) => void
  startDate: Date
  endDate: Date
  categories: Array<{ id: string; name: string; color: string; icon?: string }>
  onClearFilters: () => void
}

export function TransactionFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedType,
  onTypeChange,
  currentPeriod,
  onPeriodChange,
  currentDate,
  onDateChange,
  startDate,
  endDate,
  categories,
  onClearFilters,
}: TransactionFiltersProps) {
  const handlePreviousPeriod = () => {
    const newDate = new Date(currentDate)
    if (currentPeriod === 'diario') {
      newDate.setDate(newDate.getDate() - 1)
    } else if (currentPeriod === 'semanal') {
      newDate.setDate(newDate.getDate() - 7)
    } else if (currentPeriod === 'mensal') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else if (currentPeriod === 'trimestral') {
      newDate.setMonth(newDate.getMonth() - 3)
    } else if (currentPeriod === 'anual') {
      newDate.setFullYear(newDate.getFullYear() - 1)
    }
    onDateChange(newDate)
  }

  const handleNextPeriod = () => {
    const newDate = new Date(currentDate)
    if (currentPeriod === 'diario') {
      newDate.setDate(newDate.getDate() + 1)
    } else if (currentPeriod === 'semanal') {
      newDate.setDate(newDate.getDate() + 7)
    } else if (currentPeriod === 'mensal') {
      newDate.setMonth(newDate.getMonth() + 1)
    } else if (currentPeriod === 'trimestral') {
      newDate.setMonth(newDate.getMonth() + 3)
    } else if (currentPeriod === 'anual') {
      newDate.setFullYear(newDate.getFullYear() + 1)
    }
    onDateChange(newDate)
  }

  const getPeriodTitle = () => {
    const formatter = PERIOD_TITLE_FORMATTERS[currentPeriod]
    if (currentPeriod === 'semanal') {
      return formatter(startDate, endDate)
    }
    return formatter(startDate, endDate)
  }

  return (
    <div className="space-y-4">
      {/* Controles de período */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <Select value={currentPeriod} onValueChange={onPeriodChange}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="diario">Diário</SelectItem>
              <SelectItem value="semanal">Semanal</SelectItem>
              <SelectItem value="mensal">Mensal</SelectItem>
              <SelectItem value="trimestral">Trimestral</SelectItem>
              <SelectItem value="anual">Anual</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPeriod}
              className="h-9 w-9 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1 text-center sm:min-w-[200px]">
              <span className="text-sm font-medium">{getPeriodTitle()}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPeriod}
              className="h-9 w-9 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar transações..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="min-w-0 flex-1 sm:w-[180px] sm:flex-initial">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-3 w-3 items-center justify-center rounded-full"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.icon && (
                      <CategoryIcon
                        iconName={category.icon}
                        size={10}
                        className="text-white"
                      />
                    )}
                  </div>
                  {category.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedType} onValueChange={onTypeChange}>
          <SelectTrigger className="min-w-0 flex-1 sm:w-[180px] sm:flex-initial">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="income">Receitas</SelectItem>
            <SelectItem value="expense">Despesas</SelectItem>
            <SelectItem value="income-paid">Receitas pagas</SelectItem>
            <SelectItem value="expense-unpaid">Despesas não pagas</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={onClearFilters}
          className="flex-shrink-0 sm:w-auto"
        >
          Limpar Filtros
        </Button>
      </div>
    </div>
  )
}
