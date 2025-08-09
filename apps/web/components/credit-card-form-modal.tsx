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
import { Controller, useForm } from 'react-hook-form'

import { BANK_ICONS, findBankByName } from '@/lib/data/banks'
import { useAccountSelectOptions } from '@/lib/hooks/use-account-select-options'
import { CreditCardFormSchema, creditCardSchema } from '@/lib/schemas'
import { CreditCard as CreditCardType } from '@/lib/types'

import { AccountSelectIcon } from './account-select-icon'
import { IconSelector } from './icon-selector'
import { Button } from './ui/button'
import { CurrencyInput } from './ui/currency-input'
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

interface CreditCardFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreditCardFormSchema) => void
  creditCard?: CreditCardType
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

// Gerar opções de dias (1-31)
const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1)

export function CreditCardFormModal({
  isOpen,
  onClose,
  onSubmit,
  creditCard,
  title = 'Novo cartão manual',
}: CreditCardFormModalProps) {
  const { options: accountOptions } = useAccountSelectOptions()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CreditCardFormSchema>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      name: '',
      icon: 'credit-card',
      iconType: 'generic',
      limit: '',
      closingDay: 1,
      dueDay: 1,
      defaultPaymentAccountId: '',
    },
  })
  const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false)

  // Resetar formulário quando o modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      if (creditCard) {
        reset({
          name: creditCard.name,
          icon: creditCard.icon,
          iconType: creditCard.iconType,
          limit: creditCard.limit.toString(),
          closingDay: creditCard.closingDay,
          dueDay: creditCard.dueDay,
          defaultPaymentAccountId: creditCard.defaultPaymentAccountId || '',
        })
      } else {
        reset({
          name: '',
          icon: 'credit-card',
          iconType: 'generic',
          limit: '',
          closingDay: 1,
          dueDay: 1,
          defaultPaymentAccountId: '',
        })
      }
    }
  }, [isOpen, creditCard, reset])

  // Auto-seleção de ícone baseado no nome
  const watchedName = watch('name')
  useEffect(() => {
    if (watchedName && !creditCard) {
      const foundBank = findBankByName(watchedName)
      if (foundBank) {
        setValue('icon', foundBank.id)
        setValue('iconType', 'bank')
      }
    }
  }, [watchedName, creditCard, setValue])

  const onSubmitForm = (data: CreditCardFormSchema) => {
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

  const watchedIcon = watch('icon')
  const watchedIconType = watch('iconType')

  // Renderizar ícone selecionado
  const renderSelectedIcon = () => {
    if (watchedIconType === 'bank') {
      const bankIcon = BANK_ICONS.find((bank) => bank.id === watchedIcon)
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
        const bankName = watchedIcon
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
      const GenericIcon =
        GENERIC_ICON_MAP[watchedIcon as keyof typeof GENERIC_ICON_MAP] ||
        CreditCard
      return (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <GenericIcon className="h-8 w-8 text-muted-foreground" />
        </div>
      )
    }
  }

  // Todas as contas disponíveis para pagamento
  const availableAccounts = accountOptions || []

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
            {/* Seleção de Ícone */}
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

            {/* Nome do Cartão */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome do cartão</Label>
              <Input
                id="name"
                placeholder="Dê um nome para identificar este cartão"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Limite */}
            <div className="space-y-2">
              <Label htmlFor="limit">Limite</Label>
              <Controller
                name="limit"
                control={control}
                render={({ field }) => (
                  <CurrencyInput
                    id="limit"
                    placeholder="R$ 0,00"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.limit && (
                <p className="text-sm text-red-500">{errors.limit.message}</p>
              )}
            </div>

            {/* Datas de Fechamento e Vencimento */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="closingDay">Fecha dia</Label>
                <Select
                  value={watch('closingDay')?.toString()}
                  onValueChange={(value) =>
                    setValue('closingDay', parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dayOptions.map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.closingDay && (
                  <p className="text-sm text-red-500">
                    {errors.closingDay.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDay">Vence dia</Label>
                <Select
                  value={watch('dueDay')?.toString()}
                  onValueChange={(value) => setValue('dueDay', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dayOptions.map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.dueDay && (
                  <p className="text-sm text-red-500">
                    {errors.dueDay.message}
                  </p>
                )}
              </div>
            </div>

            {/* Conta de Pagamento Padrão */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="defaultPaymentAccountId"
                  className="text-sm font-medium"
                >
                  Conta de pagamento padrão
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-pointer text-sm text-orange-600 underline">
                        saiba mais
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs" side="bottom">
                      <p className="text-sm">
                        Ao definir uma conta padrão,{' '}
                        <strong>
                          o valor da fatura irá contar na previsão de saldo
                        </strong>{' '}
                        desta conta, antes mesmo do pagamento dela.
                      </p>
                      <div className="order-l-2 mt-3 rounded-md border-l-4 border-l-orange-600 bg-muted p-2">
                        <p className="text-xs">
                          Sempre que você for efetuar um novo pagamento de
                          fatura, é possível trocar a conta de pagamento
                          normalmente.
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select
                value={watch('defaultPaymentAccountId') || ''}
                onValueChange={(value) =>
                  setValue('defaultPaymentAccountId', value || undefined)
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecione uma conta (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {availableAccounts.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <AccountSelectIcon
                          icon={option.icon}
                          iconType={option.iconType}
                          name={option.label}
                          size="sm"
                        />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botão de Ação */}
            <Button type="submit" className="w-full">
              {creditCard ? 'Atualizar cartão' : 'Adicionar cartão'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Seleção de Ícone */}
      <IconSelector
        isOpen={isIconSelectorOpen}
        onClose={() => setIsIconSelectorOpen(false)}
        onSelect={handleIconSelect}
        selectedIcon={watchedIcon}
        selectedIconType={watchedIconType}
      />
    </>
  )
}
