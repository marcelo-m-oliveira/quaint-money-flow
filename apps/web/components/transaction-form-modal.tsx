'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Save } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { formatDateForInput } from '@/lib/format'
import { TransactionFormSchema, transactionSchema } from '@/lib/schemas'
import { Category, Transaction } from '@/lib/types'

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

interface TransactionFormModalProps {
  isOpen: boolean
  onClose: () => void
  transaction?: Transaction
  onSubmit: (data: TransactionFormSchema, shouldClose?: boolean) => void
  categories: Category[]
  type: 'income' | 'expense'
  title: string
}

export function TransactionFormModal({
  isOpen,
  onClose,
  transaction,
  onSubmit,
  categories,
  type,
  title,
}: TransactionFormModalProps) {
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
      date: formatDateForInput(new Date()),
      paid: false,
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
        date: formatDateForInput(transaction.date),
        paid: transaction.paid || false,
      })
    } else {
      reset({
        description: '',
        amount: '',
        type,
        categoryId: '',
        date: formatDateForInput(new Date()),
        paid: false,
      })
    }
  }, [transaction, type, reset])

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
        date: formatDateForInput(new Date()),
        paid: false,
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
    ? new Date(watchedDate.split('/').reverse().join('-'))
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
                        <div
                          className="h-3 w-3 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
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
            <Button
              type="button"
              onClick={handleSubmit((data) => handleFormSubmit(data, true))}
              className="h-12 flex-1 bg-green-600 text-white hover:bg-green-700"
            >
              <Check className="mr-2 h-4 w-4" />
              Salvar e criar outra
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
