'use client'

import { CheckCircle, Database, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'

interface MockDataInfo {
  categories: number
  transactions: number
  accounts: number
  creditCards: number
  hasData: boolean
}

export function MockDataStatus() {
  const [mockInfo, setMockInfo] = useState<MockDataInfo>({
    categories: 0,
    transactions: 0,
    accounts: 0,
    creditCards: 0,
    hasData: false,
  })

  useEffect(() => {
    const checkMockData = () => {
      try {
        const categories = localStorage.getItem('quaint-money-categories')
        const transactions = localStorage.getItem('quaint-money-transactions')
        const accounts = localStorage.getItem('quaint-money-accounts')
        const creditCards = localStorage.getItem('quaint-money-credit-cards')

        const categoriesCount = categories ? JSON.parse(categories).length : 0
        const transactionsCount = transactions
          ? JSON.parse(transactions).length
          : 0
        const accountsCount = accounts ? JSON.parse(accounts).length : 0
        const creditCardsCount = creditCards
          ? JSON.parse(creditCards).length
          : 0

        const hasData =
          categoriesCount > 5 ||
          transactionsCount > 0 ||
          accountsCount > 0 ||
          creditCardsCount > 0

        setMockInfo({
          categories: categoriesCount,
          transactions: transactionsCount,
          accounts: accountsCount,
          creditCards: creditCardsCount,
          hasData,
        })
      } catch (error) {
        console.error('Erro ao verificar dados mock:', error)
        setMockInfo({
          categories: 0,
          transactions: 0,
          accounts: 0,
          creditCards: 0,
          hasData: false,
        })
      }
    }

    checkMockData()

    // Verificar novamente quando o localStorage mudar
    const interval = setInterval(checkMockData, 2000)

    return () => clearInterval(interval)
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const tooltipContent = mockInfo.hasData
    ? `Dados carregados:\n📊 ${mockInfo.categories} categorias\n💰 ${mockInfo.transactions} transações\n🏦 ${mockInfo.accounts} contas`
    : 'Nenhum dado mock encontrado'

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`inline-flex cursor-help items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors ${
              mockInfo.hasData
                ? 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80'
                : 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            <Database className="mr-1 h-3 w-3" />
            {mockInfo.hasData ? (
              <>
                <CheckCircle className="mr-1 h-3 w-3" />
                Mock Ativo
              </>
            ) : (
              <>
                <XCircle className="mr-1 h-3 w-3" />
                Sem Dados
              </>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            {mockInfo.hasData ? (
              <div className="space-y-1">
                <p className="font-medium">Dados carregados:</p>
                <p>📊 {mockInfo.categories} categorias</p>
                <p>💰 {mockInfo.transactions} transações</p>
                <p>🏦 {mockInfo.accounts} contas</p>
                <p>💳 {mockInfo.creditCards} cartões</p>
              </div>
            ) : (
              <p>Nenhum dado mock encontrado</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
