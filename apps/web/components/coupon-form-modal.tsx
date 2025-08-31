'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Save } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { type AdminCoupon } from '@/lib/services/admin'

import { Button } from './ui/button'
import { CurrencyInput } from './ui/currency-input'
import { DateTimePicker } from './ui/datetime-picker'
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
import { Switch } from './ui/switch'

const couponFormSchema = z.object({
  code: z
    .string()
    .min(1, 'Código é obrigatório')
    .max(20, 'Código deve ter no máximo 20 caracteres')
    .regex(
      /^[A-Z0-9]+$/,
      'Código deve conter apenas letras maiúsculas e números',
    ),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.string().min(1, 'Valor do desconto é obrigatório'),
  maxUses: z.string().optional(),
  expiresAt: z.date().optional(),
  isActive: z.boolean(),
})

type CouponFormSchema = z.infer<typeof couponFormSchema>

interface CouponFormModalProps {
  isOpen: boolean
  onClose: () => void
  coupon?: AdminCoupon
  onSubmit: (data: CouponFormSchema, shouldClose?: boolean) => void
  showCreateAnotherButton?: boolean
}

export function CouponFormModal({
  isOpen,
  onClose,
  coupon,
  onSubmit,
  showCreateAnotherButton = true,
}: CouponFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CouponFormSchema>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: '',
      discountType: 'percentage',
      discountValue: '',
      maxUses: '',
      expiresAt: '',
      isActive: true,
    },
  })

  const discountType = watch('discountType')

  // Resetar formulário quando o modal abrir/fechar
  useEffect(() => {
    if (isOpen && coupon) {
      reset({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: String(coupon.discountValue),
        maxUses: coupon.maxUses ? String(coupon.maxUses) : '',
        expiresAt: coupon.expiresAt
          ? new Date(coupon.expiresAt * 1000)
          : undefined,
        isActive: coupon.isActive,
      })
    } else if (isOpen && !coupon) {
      reset({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        maxUses: '',
        expiresAt: undefined,
        isActive: true,
      })
    }
  }, [isOpen, coupon, reset])

  const handleFormSubmit = (
    data: CouponFormSchema,
    shouldCreateAnother = false,
  ) => {
    // Converter dados para o formato esperado pela API
    const formattedData = {
      ...data,
      discountValue: parseFloat(data.discountValue),
      maxUses: data.maxUses ? parseInt(data.maxUses) : null,
      expiresAt: data.expiresAt
        ? new Date(data.expiresAt).getTime() / 1000
        : null,
    }

    onSubmit(formattedData, !shouldCreateAnother)
    if (!shouldCreateAnother) {
      handleClose()
    } else {
      // Resetar apenas os campos do formulário
      reset({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        maxUses: '',
        expiresAt: undefined,
        isActive: true,
      })
    }
  }

  const onSubmitForm = (data: CouponFormSchema) => {
    handleFormSubmit(data, false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setValue('code', result)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {coupon ? 'Editar Cupom' : 'Criar Novo Cupom'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          {/* Código do Cupom */}
          <div className="space-y-2">
            <Label htmlFor="code" className="text-sm font-medium">
              Código do Cupom *
            </Label>
            <div className="flex gap-2">
              <Input
                id="code"
                placeholder="Ex: DESCONTO50"
                className="h-12 flex-1"
                {...register('code')}
                style={{ textTransform: 'uppercase' }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateRandomCode}
                className="h-12 px-3"
              >
                Gerar
              </Button>
            </div>
            {errors.code && (
              <p className="text-sm text-red-500">{errors.code.message}</p>
            )}
          </div>

          {/* Tipo e Valor do Desconto */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discountType" className="text-sm font-medium">
                Tipo de Desconto *
              </Label>
              <Controller
                name="discountType"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentual (%)</SelectItem>
                      <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.discountType && (
                <p className="text-sm text-red-500">
                  {errors.discountType.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountValue" className="text-sm font-medium">
                Valor do Desconto *
              </Label>
              <Controller
                name="discountValue"
                control={control}
                render={({ field }) =>
                  discountType === 'percentage' ? (
                    <Input
                      id="discountValue"
                      placeholder="Ex: 10"
                      value={field.value}
                      onChange={field.onChange}
                      className="h-12"
                      type="number"
                      min="0"
                      max="100"
                    />
                  ) : (
                    <CurrencyInput
                      id="discountValue"
                      placeholder="R$ 0,00"
                      value={field.value}
                      onChange={field.onChange}
                      className="h-12"
                    />
                  )
                }
              />
              {errors.discountValue && (
                <p className="text-sm text-red-500">
                  {errors.discountValue.message}
                </p>
              )}
            </div>
          </div>

          {/* Limite de Usos e Data de Expiração */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxUses" className="text-sm font-medium">
                Limite de Usos
              </Label>
              <Input
                id="maxUses"
                placeholder="Ex: 100 (opcional)"
                className="h-12"
                type="number"
                min="1"
                {...register('maxUses')}
              />
              <p className="text-xs text-muted-foreground">
                Deixe em branco para uso ilimitado
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt" className="text-sm font-medium">
                Data de Expiração
              </Label>
              <Controller
                name="expiresAt"
                control={control}
                render={({ field }) => (
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Selecione data e hora de expiração"
                    className="h-12"
                  />
                )}
              />
              <p className="text-xs text-muted-foreground">
                Deixe em branco para sem expiração
              </p>
            </div>
          </div>

          {/* Status Ativo */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Controller
                name="isActive"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Switch
                    id="isActive"
                    checked={value}
                    onCheckedChange={onChange}
                  />
                )}
              />
              <Label
                htmlFor="isActive"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Cupom Ativo
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
              {coupon ? 'Atualizar' : 'Salvar'}
            </Button>
            {showCreateAnotherButton && !coupon && (
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
