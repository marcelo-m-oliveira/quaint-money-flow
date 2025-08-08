'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Repeat, Save, ThumbsDown, ThumbsUp } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { formatDateForInput, timestampToDateString } from '@/lib/format'
import { useAccounts } from '@/lib/hooks/use-accounts'
import { useCreditCards } from '@/lib/hooks/use-credit-cards'
import { CategoryIcon } from '@/lib/icon-map'
import { TransactionFormSchema, transactionSchema } from '@/lib/schemas'
import { Category, Transaction } from '@/lib/types'

import { Button } from './ui/button'
import { CurrencyInput } from './ui/currency-input'
import { DatePicker } from './ui/date-picker'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

interface TransactionFormModalProps {
  isOpen: boolean
  onClose: () => void
  transaction?: Transaction
  onSubmit: (data: TransactionFormSchema, shouldClose?: boolean) => void
  categories: Category[]
  type: 'income' | 'expense'
  title: string
  showCreateAnotherButton?: boolean
}

export function TransactionFormModal({
  isOpen,
  onClose,
  transaction,
  onSubmit,
  categories,
  type,
  title,
  showCreateAnotherButton = true,
}: TransactionFormModalProps) {
  const { accounts } = useAccounts()
  const { creditCards } = useCreditCards()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
  } = useForm<TransactionFormSchema>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: '',
      amount: '',
      type,
      categoryId: '',
      accountId: '',
      creditCardId: '',
      date: formatDateForInput(new Date()),
      paid: false,
      isRecurring: false,
      recurringType: undefined,
      fixedFrequency: undefined,
      installmentCount: undefined,
      installmentPeriod: undefined,
      currentInstallment: undefined,
      parentTransactionId: undefined,
    },
  })

  // Atualizar formulário quando transaction mudar
  useEffect(() => {
    if (transaction) {
      reset({
        description: transaction.description,
        amount: transaction.amount.toString(),
        type: transaction.type,
        categoryId: transaction.categoryId,
        accountId: transaction.accountId || '',
        creditCardId: transaction.creditCardId || '',
        date: timestampToDateString(transaction.date),
        paid: transaction.paid || false,
        isRecurring: transaction.isRecurring || false,
        recurringType: transaction.recurringType,
        fixedFrequency: transaction.fixedFrequency,
        installmentCount: transaction.installmentCount,
        installmentPeriod: transaction.installmentPeriod,
        currentInstallment: transaction.currentInstallment,
        parentTransactionId: transaction.parentTransactionId,
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
        isRecurring: false,
        recurringType: undefined,
        fixedFrequency: undefined,
        installmentCount: undefined,
        installmentPeriod: undefined,
        currentInstallment: undefined,
        parentTransactionId: undefined,
      })
    }
  }, [transaction, type, reset])

  // Observar mudanças no status de recorrência para limpar campos relacionados
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'isRecurring' && !value.isRecurring) {
        // Limpar todos os campos de recorrência quando desmarcar
        setValue('recurringType', undefined)
        setValue('fixedFrequency', undefined)
        setValue('installmentCount', undefined)
        setValue('installmentPeriod', undefined)
        setValue('currentInstallment', undefined)
        setValue('parentTransactionId', undefined)
      }
    })
    return () => subscription.unsubscribe()
  }, [watch, setValue])

  const handleFormSubmit = (
    data: TransactionFormSchema,
    shouldCreateAnother = false,
  ) => {
    const shouldClose = !shouldCreateAnother
    onSubmit(data, shouldClose)

    if (!shouldCreateAnother) {
      handleClose()
    } else {
      // Limpar formulário mas manter tipo e data
      reset({
        description: '',
        amount: '',
        type,
        categoryId: '',
        accountId: '',
        creditCardId: '',
        date: formatDateForInput(new Date()),
        paid: false,
        isRecurring: false,
        recurringType: undefined,
        fixedFrequency: undefined,
        installmentCount: undefined,
        installmentPeriod: undefined,
        currentInstallment: undefined,
        parentTransactionId: undefined,
      })
    }
  }

  // Wrapper para o react-hook-form
  const onSubmitForm = (data: TransactionFormSchema) => {
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

  const watchedDate = watch('date')
  const selectedDate = watchedDate
    ? new Date(watchedDate + 'T12:00:00')
    : new Date()

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descrição
            </Label>
            <Input
              id="description"
              {...register('description')}
              placeholder="Digite a descrição..."
              className="h-12"
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
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  R$
                </span>
                <Controller
                  name="amount"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <CurrencyInput
                      id="amount"
                      value={value}
                      onChange={onChange}
                      className="h-12 pl-10"
                      placeholder="0,00"
                    />
                  )}
                />
              </div>
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
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Buscar a categoria..." />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((category) => {
                      // Filtrar categorias baseado no tipo de transação
                      return category.type === type
                    })
                    // Ordenar categorias principais primeiro, depois subcategorias
                    .sort((a, b) => {
                      if (!a.parentId && b.parentId) return -1
                      if (a.parentId && !b.parentId) return 1
                      return a.name.localeCompare(b.name)
                    })
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div
                          className={`flex items-center gap-3 ${category.parentId ? 'pl-4' : ''}`}
                        >
                          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-border">
                            <div
                              className="flex h-full w-full items-center justify-center rounded-full"
                              style={{ backgroundColor: category.color }}
                            >
                              {category.icon && (
                                <CategoryIcon
                                  iconName={category.icon}
                                  className="h-3 w-3 text-white"
                                />
                              )}
                            </div>
                          </div>
                          <span className={category.parentId ? 'text-sm' : ''}>
                            {category.parentId && '└ '}
                            {category.name}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
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
                  const isAccount = accounts.some(
                    (account) => account.id === value,
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
                  <SelectValue placeholder="Selecionar conta/cartão..." />
                </SelectTrigger>
                <SelectContent>
                  {/* Contas */}
                  {accounts.length > 0 && (
                    <>
                      <SelectItem value="accounts-header" disabled>
                        <span className="font-medium text-muted-foreground">
                          Contas
                        </span>
                      </SelectItem>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex items-center gap-3">
                            <div className="h-3 w-3 flex-shrink-0 rounded-full bg-blue-500" />
                            <span>{account.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </>
                  )}

                  {/* Cartões de Crédito */}
                  {creditCards.length > 0 && (
                    <>
                      {accounts.length > 0 && (
                        <SelectItem value="separator" disabled>
                          <span>—</span>
                        </SelectItem>
                      )}
                      <SelectItem value="cards-header" disabled>
                        <span className="font-medium text-muted-foreground">
                          Cartões
                        </span>
                      </SelectItem>
                      {creditCards.map((card) => (
                        <SelectItem key={card.id} value={card.id}>
                          <div className="flex items-center gap-3">
                            <div className="h-3 w-3 flex-shrink-0 rounded-full bg-purple-500" />
                            <span>{card.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </>
                  )}

                  {/* Opção para não selecionar */}
                  {(accounts.length > 0 || creditCards.length > 0) && (
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

          {/* Controles de Status */}
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              {/* Status de Pagamento */}
              <div className="flex items-center space-x-2">
                <Controller
                  name="paid"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Button
                      type="button"
                      variant={value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onChange(!value)}
                      className={`h-8 px-3 ${value ? 'bg-green-600 text-white hover:bg-green-700' : 'hover:border-green-300 hover:bg-green-100 hover:text-green-700'}`}
                    >
                      {value ? (
                        <ThumbsUp className="mr-1 h-4 w-4" />
                      ) : (
                        <ThumbsDown className="mr-1 h-4 w-4" />
                      )}
                      {value ? 'Pago' : 'Não pago'}
                    </Button>
                  )}
                />
              </div>

              {/* Status de Recorrência */}
              <div className="flex items-center space-x-2">
                <Controller
                  name="isRecurring"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Button
                      type="button"
                      variant={value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onChange(!value)}
                      className={`h-8 px-3 ${value ? 'bg-blue-600 text-white hover:bg-blue-700' : 'hover:border-blue-300 hover:bg-blue-100 hover:text-blue-700'}`}
                    >
                      <Repeat className="mr-1 h-4 w-4" />
                      {value ? 'Recorrente' : 'Única'}
                    </Button>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Configurações de Recorrência */}
          <div className="space-y-4">
            {/* Opções de recorrência - só aparecem se isRecurring for true */}
            {watch('isRecurring') && (
              <div className="space-y-4 rounded-lg border p-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Tipo de recorrência
                  </Label>
                  <Controller
                    name="recurringType"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <RadioGroup
                        value={value || ''}
                        onValueChange={onChange}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="fixed" id="fixed" />
                          <Label
                            htmlFor="fixed"
                            className="text-sm font-normal"
                          >
                            É uma despesa fixa
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="installment"
                            id="installment"
                          />
                          <Label
                            htmlFor="installment"
                            className="text-sm font-normal"
                          >
                            É um lançamento parcelado
                          </Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                </div>

                {/* Configurações para despesa fixa */}
                {watch('recurringType') === 'fixed' && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="fixedFrequency"
                      className="text-sm font-medium"
                    >
                      Frequência
                    </Label>
                    <Select
                      value={watch('fixedFrequency') || ''}
                      onValueChange={(value) =>
                        setValue(
                          'fixedFrequency',
                          value as
                            | 'daily'
                            | 'weekly'
                            | 'biweekly'
                            | 'monthly'
                            | 'quarterly'
                            | 'semiannual'
                            | 'annual',
                        )
                      }
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Selecione a frequência..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diário</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="biweekly">Quinzenal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="quarterly">Trimestral</SelectItem>
                        <SelectItem value="semiannual">Semestral</SelectItem>
                        <SelectItem value="annual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Configurações para lançamento parcelado */}
                {watch('recurringType') === 'installment' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="installmentCount"
                        className="text-sm font-medium"
                      >
                        Número de parcelas
                      </Label>
                      <Select
                        value={watch('installmentCount')?.toString() || ''}
                        onValueChange={(value) =>
                          setValue('installmentCount', parseInt(value))
                        }
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Selecione o número de parcelas..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {Array.from({ length: 24 }, (_, i) => i + 1).map(
                            (num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num === 1 ? 'parcela' : 'parcelas'}
                              </SelectItem>
                            ),
                          )}
                          {[
                            30, 36, 48, 60, 72, 84, 96, 120, 180, 240, 360, 480,
                            500,
                          ].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} parcelas
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="installmentPeriod"
                        className="text-sm font-medium"
                      >
                        Período entre parcelas
                      </Label>
                      <Select
                        value={watch('installmentPeriod') || ''}
                        onValueChange={(value) =>
                          setValue(
                            'installmentPeriod',
                            value as
                              | 'days'
                              | 'weeks'
                              | 'biweeks'
                              | 'months'
                              | 'bimonths'
                              | 'quarters'
                              | 'semesters'
                              | 'years',
                          )
                        }
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Selecione o período..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="days">Dias</SelectItem>
                          <SelectItem value="weeks">Semanas</SelectItem>
                          <SelectItem value="biweeks">Quinzenas</SelectItem>
                          <SelectItem value="months">Meses</SelectItem>
                          <SelectItem value="bimonths">Bimestres</SelectItem>
                          <SelectItem value="quarters">Trimestres</SelectItem>
                          <SelectItem value="semesters">Semestres</SelectItem>
                          <SelectItem value="years">Anos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Informação sobre divisão do valor para parcelado */}
                {watch('recurringType') === 'installment' &&
                  watch('installmentCount') &&
                  watch('amount') && (
                    <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                      <p className="font-medium">Valor por parcela:</p>
                      <p>
                        R${' '}
                        {(
                          parseFloat(watch('amount').replace(',', '.')) /
                          (watch('installmentCount') || 1)
                        )
                          .toFixed(2)
                          .replace('.', ',')}
                        {' × '}
                        {watch('installmentCount')} parcelas
                      </p>
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* Footer com botões */}
          <div className="flex gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="h-12 flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="h-12 bg-green-600 px-4 text-white hover:bg-green-700"
            >
              <Save className="h-4 w-4" />
            </Button>
            {showCreateAnotherButton && (
              <Button
                type="button"
                onClick={handleSubmit((data) => handleFormSubmit(data, true))}
                className="h-12 flex-1 bg-green-600 text-white hover:bg-green-700"
              >
                <Check className="mr-2 h-4 w-4" />
                Salvar e criar outra
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
