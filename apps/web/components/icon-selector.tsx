'use client'

import {
  ArrowLeft,
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

import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'

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

  const renderGenericIcon = (iconData: (typeof GENERIC_ICONS)[0]) => {
    const isSelected =
      selectedIcon === iconData.id && selectedIconType === 'generic'
    const Icon = iconData.icon

    return (
      <TooltipProvider key={iconData.id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => handleIconSelect(iconData.id, 'generic')}
              className={`flex h-16 w-16 items-center justify-center rounded-full border-2 bg-muted transition-all duration-200 hover:scale-105 hover:shadow-md ${
                isSelected
                  ? 'border-primary shadow-lg ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Icon className="h-8 w-8 text-muted-foreground" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{iconData.name}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle>Selecione um ícone</DialogTitle>
          </div>
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

              <div className="max-h-80 overflow-y-auto">
                <div className="grid grid-cols-5 gap-2 p-1">
                  {filteredBanks.map((bank) => (
                    <TooltipProvider key={bank.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleIconSelect(bank.id, 'bank')}
                            className={`flex h-16 w-16 items-center justify-center rounded-full border-2 p-1 transition-all duration-200 hover:scale-105 hover:shadow-md ${
                              selectedIcon === bank.id &&
                              selectedIconType === 'bank'
                                ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20'
                                : 'border-border bg-transparent hover:border-primary/50'
                            }`}
                          >
                            <img
                              src={bank.icon}
                              alt={bank.name}
                              className="h-full w-full rounded-full object-contain"
                            />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{bank.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
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

              <div className="grid grid-cols-5 gap-2">
                {GENERIC_ICONS.map(renderGenericIcon)}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
