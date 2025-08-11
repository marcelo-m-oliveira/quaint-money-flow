'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Save } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { formatDateForInput, timestampToDateString } from '@/lib/format'
import { useAccountSelectOptions } from '@/lib/hooks/use-account-select-options'
import { useCategorySelectOptions } from '@/lib/hooks/use-category-select-options'
import { useCreditCardSelectOptions } from '@/lib/hooks/use-credit-card-select-options'
import { CategoryIcon } from '@/lib/icon-map'
import { EntryFormSchema, entrySchema } from '@/lib/schemas'
import { Entry } from '@/lib/types'

import { AccountSelectIcon } from './account-select-icon'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { CurrencyInput } from './ui/currency-input'
import { DatePicker } from './ui/date-picker'
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

interface EntryFormModalProps {
  isOpen: boolean
  onClose: () => void
  entry?: Entry
  onSubmit: (data: EntryFormSchema, shouldClose?: boolean) => void
  type: 'income' | 'expense'
  title: string
  showCreateAnotherButton?: boolean
}

export function EntryFormModal({
  isOpen,
  onClose,
  entry,
  onSubmit,
  type,
  title,
  showCreateAnotherButton = true,
}: EntryFormModalProps) {
  const { options: accountOptions } = useAccountSelectOptions()
  const { options: categoryOptions, isLoading: categoryLoading } =
    useCategorySelectOptions(type, isOpen)
  const { options: creditCardOptions } = useCreditCardSelectOptions()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
  } = useForm<EntryFormSchema>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      description: '',
      amount: '',
      type,
      categoryId: '',
      accountId: '',
      creditCardId: '',
      date: formatDateForInput(new Date()),
      paid: false,
    },
  })

  // Atualizar formulário quando entry mudar
  useEffect(() => {
    if (entry) {
      reset({
        description: entry.description,
        amount: entry.amount.toString(),
        type: entry.type,
        categoryId: entry.categoryId,
        accountId: entry.accountId || '',
        creditCardId: entry.creditCardId || '',
        date: timestampToDateString(entry.date * 1000),
        paid: entry.paid || false,
      })
    } else {
      reset({
        description: '',
        amount: '',
        type,
        categoryId: '',
        accountId: '',
        creditCardId: '',
        date: formatDateForInput(new Date()),
        paid: false,
      })
    }
  }, [entry, type, reset])

  const selectedDate = watch('date') ? new Date(watch('date')) : new Date()

  const handleFormSubmit = (
    data: EntryFormSchema,
    shouldCreateAnother = false,
  ) => {
    onSubmit(data, !shouldCreateAnother)
    if (!shouldCreateAnother) {
      handleClose()
    } else {
      // Resetar apenas os campos do formulário, mantendo o tipo
      reset({
        description: '',
        amount: '',
        type,
        categoryId: '',
        accountId: '',
        creditCardId: '',
        date: formatDateForInput(new Date()),
        paid: false,
      })
    }
  }

  const onSubmitForm = (data: EntryFormSchema) => {
    handleFormSubmit(data, false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setValue('date', formatDateForInput(date))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descrição
            </Label>
            <Input
              id="description"
              placeholder="Digite a descrição..."
              className="h-12"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Valor e Data */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">
                Valor
              </Label>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <CurrencyInput
                    id="amount"
                    placeholder="R$ 0,00"
                    value={field.value}
                    onChange={field.onChange}
                    className="h-12"
                  />
                )}
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium">
                Data
              </Label>
              <DatePicker
                value={selectedDate}
                onChange={handleDateChange}
                placeholder="Selecione a data"
                className="h-12"
                required
              />
            </div>
          </div>

          {/* Categoria e Conta/Cartão */}
          <div className="grid grid-cols-2 gap-4">
            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Categoria
              </Label>
              <Select
                value={watch('categoryId')}
                onValueChange={(value) => setValue('categoryId', value)}
                disabled={categoryLoading}
              >
                <SelectTrigger className="h-12">
                  <SelectValue
                    placeholder={
                      categoryLoading
                        ? 'Carregando...'
                        : 'Selecione a categoria...'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {categoryLoading ? (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span>Carregando categorias...</span>
                      </div>
                    </SelectItem>
                  ) : (
                    categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-border">
                            <div
                              className="flex h-full w-full items-center justify-center rounded-full"
                              style={{ backgroundColor: option.color }}
                            >
                              {option.icon && (
                                <CategoryIcon
                                  iconName={option.icon}
                                  className="h-3 w-3 text-white"
                                />
                              )}
                            </div>
                          </div>
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-red-500">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            {/* Conta/Cartão */}
            <div className="space-y-2">
              <Label htmlFor="account" className="text-sm font-medium">
                Conta/Cartão
              </Label>
              <Select
                value={watch('accountId') || watch('creditCardId') || undefined}
                onValueChange={(value) => {
                  // Se o valor for 'none', limpar ambos os campos
                  if (value === 'none') {
                    setValue('accountId', '')
                    setValue('creditCardId', '')
                    return
                  }

                  // Verificar se é uma conta ou cartão e definir o campo apropriado
                  const isAccount = accountOptions.some(
                    (account) => account.value === value,
                  )
                  if (isAccount) {
                    setValue('accountId', value)
                    setValue('creditCardId', '')
                  } else {
                    setValue('creditCardId', value)
                    setValue('accountId', '')
                  }
                }}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecione conta/cartão..." />
                </SelectTrigger>
                <SelectContent>
                  {/* Contas */}
                  {accountOptions.length > 0 && (
                    <>
                      <SelectItem value="accounts-header" disabled>
                        <span className="font-medium text-muted-foreground">
                          Contas
                        </span>
                      </SelectItem>
                      {accountOptions.map((option) => (
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
                    </>
                  )}

                  {/* Cartões de Crédito */}
                  {creditCardOptions.length > 0 && (
                    <>
                      {accountOptions.length > 0 && (
                        <SelectItem value="separator" disabled>
                          <span>—</span>
                        </SelectItem>
                      )}
                      <SelectItem value="cards-header" disabled>
                        <span className="font-medium text-muted-foreground">
                          Cartões
                        </span>
                      </SelectItem>
                      {creditCardOptions.map((option) => (
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
                    </>
                  )}

                  {/* Opção para não selecionar */}
                  {(accountOptions.length > 0 ||
                    creditCardOptions.length > 0) && (
                    <>
                      <SelectItem value="separator2" disabled>
                        <span>—</span>
                      </SelectItem>
                      <SelectItem value="none">
                        <span className="text-muted-foreground">
                          Nenhuma conta/cartão
                        </span>
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status de Pagamento */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Controller
                name="paid"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Checkbox
                    id="paid"
                    checked={value}
                    onCheckedChange={onChange}
                  />
                )}
              />
              <Label
                htmlFor="paid"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {type === 'income' ? 'Receita recebida' : 'Despesa paga'}
              </Label>
            </div>
          </div>

          {/* Footer com botões */}
          <div className="flex gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              Salvar
            </Button>
            {showCreateAnotherButton && (
              <Button
                type="button"
                onClick={() => handleFormSubmit(watch(), true)}
                className="flex-1"
              >
                <Check className="mr-2 h-4 w-4" />
                Salvar e criar outro
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
