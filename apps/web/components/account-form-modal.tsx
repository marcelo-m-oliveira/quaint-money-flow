'use client'

import { zodResolver } from '@hookform/resolvers/zod'
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
import { useForm } from 'react-hook-form'

import { BANK_ICONS, findBankByName } from '@/lib/data/banks'
import { AccountFormSchema, accountSchema } from '@/lib/schemas'
import { Account } from '@/lib/types'

import { IconSelector } from './icon-selector'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'

interface AccountFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AccountFormSchema) => void
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

const ACCOUNT_TYPE_LABELS = {
  bank: 'Conta Bancária',
  investment: 'Investimento',
  cash: 'Dinheiro',
  other: 'Outros',
} as const

const ACCOUNT_TYPES = [
  { value: 'bank', label: ACCOUNT_TYPE_LABELS.bank },
  { value: 'investment', label: ACCOUNT_TYPE_LABELS.investment },
  { value: 'cash', label: ACCOUNT_TYPE_LABELS.cash },
  { value: 'other', label: ACCOUNT_TYPE_LABELS.other },
] as const

export function AccountFormModal({
  isOpen,
  onClose,
  onSubmit,
  account,
  title = 'Nova conta manual',
}: AccountFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AccountFormSchema>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      type: 'bank',
      icon: 'wallet',
      iconType: 'generic',
      includeInGeneralBalance: true,
    },
  })
  const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false)

  // Resetar formulário quando o modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      if (account) {
        reset({
          name: account.name,
          type: account.type,
          icon: account.icon,
          iconType: account.iconType,
          includeInGeneralBalance: account.includeInGeneralBalance,
        })
      } else {
        reset({
          name: '',
          type: 'bank',
          icon: 'wallet',
          iconType: 'generic',
          includeInGeneralBalance: true,
        })
      }
    }
  }, [isOpen, account, reset])

  // Auto-seleção de ícone baseado no nome
  const watchedName = watch('name')
  useEffect(() => {
    if (watchedName && !account) {
      const foundBank = findBankByName(watchedName)
      if (foundBank) {
        setValue('icon', foundBank.id)
        setValue('iconType', 'bank')
      }
    }
  }, [watchedName, account, setValue])

  const onSubmitForm = (data: AccountFormSchema) => {
    onSubmit(data)
    handleClose()
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleIconSelect = (icon: string, iconType: 'bank' | 'generic') => {
    setValue('icon', icon)
    setValue('iconType', iconType)
  }

  const renderSelectedIcon = () => {
    const icon = watch('icon')
    const iconType = watch('iconType')

    if (iconType === 'bank') {
      const bankIcon = BANK_ICONS.find((bank) => bank.id === icon)
      if (bankIcon) {
        return (
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-border bg-background p-1">
            <img
              src={bankIcon.icon}
              alt={bankIcon.name}
              className="h-full w-full rounded-full object-contain"
              loading="lazy"
            />
          </div>
        )
      } else {
        // Fallback para ícone genérico se não encontrar o banco
        const bankName = icon
          ?.split('-')
          .map((word) => word.charAt(0).toUpperCase())
          .join('')
          .slice(0, 2)
        return (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xl font-bold text-white">
            {bankName}
          </div>
        )
      }
    } else {
      // Para ícones genéricos, mostrar o ícone do Lucide
      const IconComponent =
        GENERIC_ICON_MAP[icon as keyof typeof GENERIC_ICON_MAP] || Wallet
      return (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <IconComponent className="h-8 w-8 text-muted-foreground" />
        </div>
      )
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">{title}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
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
                {...register('name')}
                required
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Tipo de Conta */}
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de conta</Label>
              <Select
                value={watch('type')}
                onValueChange={(value) =>
                  setValue(
                    'type',
                    value as
                      | 'bank'
                      | 'credit_card'
                      | 'investment'
                      | 'cash'
                      | 'other',
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de conta" />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            {/* Checkbox - Não somar no Saldo Geral */}
            <div className="flex items-center space-x-3">
              <Checkbox
                id="includeInGeneralBalance"
                checked={!watch('includeInGeneralBalance')}
                onCheckedChange={(checked) =>
                  setValue('includeInGeneralBalance', !checked)
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
              disabled={!watch('name')?.trim()}
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
        selectedIcon={watch('icon')}
        selectedIconType={watch('iconType')}
      />
    </>
  )
}
