'use client'

import { Database, RefreshCw, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { populateWithMockData } from '@/lib/mocks'

import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Separator } from './ui/separator'

export function MockDataLoader() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLoadMockData = async () => {
    setIsLoading(true)
    try {
      const data = populateWithMockData()
      console.log('✅ Dados mock carregados:', data)

      // Recarregar a página para atualizar os dados
      window.location.reload()
    } catch (error) {
      console.error('❌ Erro ao carregar dados mock:', error)
    } finally {
      setIsLoading(false)
      setIsOpen(false)
    }
  }

  const handleClearData = () => {
    localStorage.removeItem('quaint-money-categories')
    localStorage.removeItem('quaint-money-transactions')
    localStorage.removeItem('quaint-money-accounts')
    localStorage.removeItem('quaint-money-credit-cards')

    console.log('🗑️ Dados limpos do localStorage')

    // Recarregar a página para atualizar os dados
    window.location.reload()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Database className="mr-2 h-4 w-4" />
          Dados Mock
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Dados Mock</DialogTitle>
          <DialogDescription>
            Carregue dados de exemplo para testar o fluxo da aplicação ou limpe
            todos os dados existentes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Carregar Dados Mock</h4>
            <p className="text-sm text-muted-foreground">
              Isso irá gerar e carregar dados de exemplo incluindo:
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>📊 12+ categorias (despesas e receitas)</li>
              <li>💰 100 transações variadas</li>
              <li>🏦 6 contas diferentes (banco, cartão, etc.)</li>
              <li>💳 4 cartões de crédito com limites realistas</li>
              <li>⚙️ Preferências de usuário configuradas</li>
            </ul>
            <Button
              onClick={handleLoadMockData}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Carregando...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Carregar Dados Mock
                </>
              )}
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Limpar Dados</h4>
            <p className="text-sm text-muted-foreground">
              Remove todos os dados salvos (categorias, transações e contas).
            </p>
            <Button
              onClick={handleClearData}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Limpar Todos os Dados
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
