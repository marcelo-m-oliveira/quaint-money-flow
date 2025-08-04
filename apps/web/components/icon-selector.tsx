'use client'

import {
  Building2,
  CreditCard,
  DollarSign,
  Landmark,
  PiggyBank,
  Search,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useState } from 'react'

import { searchBanks } from '@/lib/data/banks'
import { BankIcon } from '@/lib/types'

import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'

interface IconSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (icon: string, iconType: 'bank' | 'generic') => void
  selectedIcon?: string
  selectedIconType?: 'bank' | 'generic'
}

const GENERIC_ICONS = [
  { id: 'wallet', name: 'Carteira', icon: Wallet },
  { id: 'credit-card', name: 'Cartão', icon: CreditCard },
  { id: 'bank', name: 'Banco', icon: Landmark },
  { id: 'building', name: 'Empresa', icon: Building2 },
  { id: 'piggy-bank', name: 'Poupança', icon: PiggyBank },
  { id: 'trending-up', name: 'Investimentos', icon: TrendingUp },
  { id: 'dollar-sign', name: 'Dinheiro', icon: DollarSign },
]

export function IconSelector({
  isOpen,
  onClose,
  onSelect,
  selectedIcon,
  selectedIconType,
}: IconSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'banks' | 'generic'>('banks')

  const filteredBanks = searchBanks(searchQuery)

  const handleIconSelect = (iconId: string, iconType: 'bank' | 'generic') => {
    onSelect(iconId, iconType)
    onClose()
  }

  const renderBankIcon = (bank: BankIcon) => {
    const isSelected = selectedIcon === bank.id && selectedIconType === 'bank'

    return (
      <button
        key={bank.id}
        onClick={() => handleIconSelect(bank.id, 'bank')}
        className={`flex h-16 w-16 items-center justify-center rounded-full border-2 transition-all duration-200 hover:scale-105 ${
          isSelected
            ? 'border-primary bg-primary/10 shadow-md'
            : 'border-border bg-background hover:border-primary/50'
        }`}
        title={bank.name}
      >
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white p-1">
          <img
            src={bank.logo}
            alt={bank.name}
            className="h-full w-full object-contain"
            onError={(e) => {
              // Fallback para círculo com letra se a imagem falhar
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const fallback = target.nextElementSibling as HTMLElement
              if (fallback) fallback.style.display = 'flex'
            }}
          />
          <div
            className="h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-bold text-white"
            style={{ display: 'none' }}
          >
            {bank.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </button>
    )
  }

  const renderGenericIcon = (iconData: (typeof GENERIC_ICONS)[0]) => {
    const isSelected =
      selectedIcon === iconData.id && selectedIconType === 'generic'
    const Icon = iconData.icon

    return (
      <button
        key={iconData.id}
        onClick={() => handleIconSelect(iconData.id, 'generic')}
        className={`flex h-16 w-16 items-center justify-center rounded-full border-2 transition-all duration-200 hover:scale-105 ${
          isSelected
            ? 'border-primary bg-primary/10 shadow-md'
            : 'border-border bg-background hover:border-primary/50'
        }`}
      >
        <Icon className="h-6 w-6 text-muted-foreground" />
      </button>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Selecione um ícone</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'banks' | 'generic')}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="banks">Instituições financeiras</TabsTrigger>
            <TabsTrigger value="generic">Ícones genéricos</TabsTrigger>
          </TabsList>

          <TabsContent value="banks" className="mt-4">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar banco..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="grid max-h-64 grid-cols-4 gap-3 overflow-y-auto p-2">
                {filteredBanks.map(renderBankIcon)}
              </div>

              {filteredBanks.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  <p>Nenhum banco encontrado</p>
                  <p className="text-sm">Tente buscar por outro termo</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="generic" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Você pode mudar a cor de fundo após selecionar um ícone genérico
              </p>

              <div className="grid grid-cols-4 gap-3">
                {GENERIC_ICONS.map(renderGenericIcon)}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
