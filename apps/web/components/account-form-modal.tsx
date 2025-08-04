'use client'

import {
  Building2,
  CreditCard,
  DollarSign,
  Landmark,
  PiggyBank,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { BANK_ICONS, findBankByName } from '@/lib/data/banks'
import { Account, AccountFormData } from '@/lib/types'

import { IconSelector } from './icon-selector'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'

interface AccountFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AccountFormData) => void
  account?: Account
  title?: string
}

const GENERIC_ICON_MAP = {
  wallet: Wallet,
  'credit-card': CreditCard,
  bank: Landmark,
  building: Building2,
  'piggy-bank': PiggyBank,
  'trending-up': TrendingUp,
  'dollar-sign': DollarSign,
}

export function AccountFormModal({
  isOpen,
  onClose,
  onSubmit,
  account,
  title = 'Nova conta manual',
}: AccountFormModalProps) {
  const [formData, setFormData] = useState<AccountFormData>({
    name: '',
    type: 'bank',
    icon: 'wallet',
    iconType: 'generic',
    includeInGeneralBalance: true,
  })
  const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false)

  // Resetar formulário quando o modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      if (account) {
        setFormData({
          name: account.name,
          type: account.type,
          icon: account.icon,
          iconType: account.iconType,
          includeInGeneralBalance: account.includeInGeneralBalance,
        })
      } else {
        setFormData({
          name: '',
          type: 'bank',
          icon: 'wallet',
          iconType: 'generic',
          includeInGeneralBalance: true,
        })
      }
    }
  }, [isOpen, account])

  // Auto-seleção de ícone baseado no nome
  useEffect(() => {
    if (formData.name && !account) {
      const foundBank = findBankByName(formData.name)
      if (foundBank) {
        setFormData((prev) => ({
          ...prev,
          icon: foundBank.id,
          iconType: 'bank',
        }))
      }
    }
  }, [formData.name, account])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    onSubmit(formData)
    onClose()
  }

  const handleIconSelect = (icon: string, iconType: 'bank' | 'generic') => {
    setFormData((prev) => ({ ...prev, icon, iconType }))
  }

  const renderSelectedIcon = () => {
    if (formData.iconType === 'bank') {
      // Para bancos, mostrar a imagem real do banco
      const bank = BANK_ICONS.find((b) => b.id === formData.icon)
      if (bank) {
        return (
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-border bg-white p-2 shadow-sm">
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
              className="h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xl font-bold text-white"
              style={{ display: 'none' }}
            >
              {bank.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )
      } else {
        // Fallback se o banco não for encontrado
        const bankName = formData.icon.charAt(0).toUpperCase()
        return (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xl font-bold text-white">
            {bankName}
          </div>
        )
      }
    } else {
      // Para ícones genéricos, mostrar o ícone do Lucide
      const IconComponent =
        GENERIC_ICON_MAP[formData.icon as keyof typeof GENERIC_ICON_MAP] ||
        Wallet
      return (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <IconComponent className="h-8 w-8 text-muted-foreground" />
        </div>
      )
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">{title}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seletor de Ícone */}
            <div className="flex flex-col items-center space-y-4">
              <button
                type="button"
                onClick={() => setIsIconSelectorOpen(true)}
                className="group relative"
              >
                {renderSelectedIcon()}
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="text-xs font-medium text-white">
                    Alterar
                  </span>
                </div>
              </button>
              <p className="text-center text-sm text-muted-foreground">
                Escolha um ícone
              </p>
            </div>

            {/* Nome da Conta */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome da conta</Label>
              <Input
                id="name"
                placeholder="Dê um nome para identificar esta conta"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>

            {/* Checkbox - Não somar no Saldo Geral */}
            <div className="flex items-center space-x-3">
              <Checkbox
                id="includeInGeneralBalance"
                checked={!formData.includeInGeneralBalance}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    includeInGeneralBalance: !checked,
                  }))
                }
              />
              <div className="space-y-1">
                <Label
                  htmlFor="includeInGeneralBalance"
                  className="cursor-pointer text-sm font-normal"
                >
                  Não somar no Saldo Geral{' '}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-pointer text-orange-600 underline">
                          saiba mais
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="max-w-xs text-sm">
                          Marque esta opção para que o saldo desta conta não
                          seja contabilizado no <strong>Saldo Geral</strong>{' '}
                          (disponível na visão geral). O saldo continua sendo
                          contabilizado na tela de lançamentos e relatórios.
                        </p>
                        <div className="order-l-2 mt-3 rounded-md border-l-4 border-l-orange-600 bg-muted p-2">
                          <p className="max-w-xs text-sm text-muted-foreground">
                            Por exemplo, use para contas que representem seu
                            dinheiro guardado, como uma{' '}
                            <strong>Conta Poupança</strong> ou{' '}
                            <strong>Conta Investimento</strong>.
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
              </div>
            </div>

            {/* Botão de Ação */}
            <Button
              type="submit"
              className="w-full"
              disabled={!formData.name.trim()}
            >
              {account ? 'Atualizar conta' : 'Adicionar conta'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Seleção de Ícone */}
      <IconSelector
        isOpen={isIconSelectorOpen}
        onClose={() => setIsIconSelectorOpen(false)}
        onSelect={handleIconSelect}
        selectedIcon={formData.icon}
        selectedIconType={formData.iconType}
      />
    </>
  )
}
