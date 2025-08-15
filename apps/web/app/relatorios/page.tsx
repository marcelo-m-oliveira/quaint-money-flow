'use client'

import { CreditCard, PieChart, TrendingUp } from 'lucide-react'
import { useState } from 'react'

import { AccountsReport } from '@/components/reports/accounts-report'
import { CashflowReport } from '@/components/reports/cashflow-report'
import { CategoriesReport } from '@/components/reports/categories-report'
import { Topbar } from '@/components/topbar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type ReportPeriod =
  | 'day'
  | 'week'
  | 'month'
  | '3months'
  | '6months'
  | '1year'

const PERIOD_OPTIONS = [
  { value: 'day' as const, label: 'Dia' },
  { value: 'week' as const, label: 'Semana' },
  { value: 'month' as const, label: 'Mês' },
  { value: '3months' as const, label: '3 Meses' },
  { value: '6months' as const, label: '6 Meses' },
  { value: '1year' as const, label: '1 Ano' },
]

export default function RelatoriosPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('month')
  const [activeTab, setActiveTab] = useState<string>('categories')

  return (
    <div className="min-h-screen bg-background">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
              <p className="text-muted-foreground">
                Analise seus dados financeiros com relatórios detalhados
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Período:</span>
              <Select
                value={selectedPeriod}
                onValueChange={(value: ReportPeriod) =>
                  setSelectedPeriod(value)
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Tabs
          defaultValue="categories"
          className="space-y-6"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Categorias
            </TabsTrigger>
            <TabsTrigger value="cashflow" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Fluxo de Caixa
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Contas & Cartões
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <CategoriesReport
              period={selectedPeriod}
              isActive={activeTab === 'categories'}
            />
          </TabsContent>

          <TabsContent value="cashflow">
            <CashflowReport
              period={selectedPeriod}
              isActive={activeTab === 'cashflow'}
            />
          </TabsContent>

          <TabsContent value="accounts">
            <AccountsReport
              period={selectedPeriod}
              isActive={activeTab === 'accounts'}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
