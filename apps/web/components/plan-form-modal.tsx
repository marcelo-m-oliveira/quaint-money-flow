'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Save } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { type AdminPlan } from '@/lib/services/admin'

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
import { Switch } from './ui/switch'
import { Textarea } from './ui/textarea'

const planFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['free', 'monthly', 'annual']),
  price: z.string().min(1, 'Preço é obrigatório'),
  description: z.string().optional(),
  isActive: z.boolean(),
  features: z.object({
    entries: z.object({
      unlimited: z.boolean(),
    }),
    categories: z.object({
      unlimited: z.boolean(),
      canCreate: z.boolean(),
      canEdit: z.boolean(),
    }),
    accounts: z.object({
      unlimited: z.boolean(),
      canCreate: z.boolean(),
    }),
    creditCards: z.object({
      unlimited: z.boolean(),
      canCreate: z.boolean(),
    }),
    reports: z.object({
      canAccess: z.boolean(),
      advanced: z.boolean(),
    }),
  }),
})

type PlanFormSchema = z.infer<typeof planFormSchema>

interface PlanFormModalProps {
  isOpen: boolean
  onClose: () => void
  plan?: AdminPlan
  onSubmit: (data: PlanFormSchema, shouldClose?: boolean) => void
  showCreateAnotherButton?: boolean
}

export function PlanFormModal({
  isOpen,
  onClose,
  plan,
  onSubmit,
  showCreateAnotherButton = true,
}: PlanFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<PlanFormSchema>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: '',
      type: 'free',
      price: '0',
      description: '',
      isActive: true,
      features: {
        entries: { unlimited: true },
        categories: { unlimited: false, canCreate: false, canEdit: false },
        accounts: { unlimited: false, canCreate: false },
        creditCards: { unlimited: false, canCreate: false },
        reports: { canAccess: false, advanced: false },
      },
    },
  })

  const planType = watch('type')

  // Resetar formulário quando o modal abrir/fechar
  useEffect(() => {
    if (isOpen && plan) {
      reset({
        name: plan.name,
        type: plan.type,
        price: String(plan.price),
        description: plan.description || '',
        isActive: plan.isActive,
        features: plan.features || {
          entries: { unlimited: true },
          categories: { unlimited: false, canCreate: false, canEdit: false },
          accounts: { unlimited: false, canCreate: false },
          creditCards: { unlimited: false, canCreate: false },
          reports: { canAccess: false, advanced: false },
        },
      })
    } else if (isOpen && !plan) {
      reset({
        name: '',
        type: 'free',
        price: '0',
        description: '',
        isActive: true,
        features: {
          entries: { unlimited: true },
          categories: { unlimited: false, canCreate: false, canEdit: false },
          accounts: { unlimited: false, canCreate: false },
          creditCards: { unlimited: false, canCreate: false },
          reports: { canAccess: false, advanced: false },
        },
      })
    }
  }, [isOpen, plan, reset])

  // Configurar features baseado no tipo de plano
  useEffect(() => {
    if (planType === 'free') {
      setValue('features', {
        entries: { unlimited: true },
        categories: { unlimited: false, canCreate: false, canEdit: false },
        accounts: { unlimited: false, canCreate: false },
        creditCards: { unlimited: false, canCreate: false },
        reports: { canAccess: false, advanced: false },
      })
      setValue('price', '0')
    } else if (planType === 'monthly') {
      setValue('features', {
        entries: { unlimited: true },
        categories: { unlimited: true, canCreate: true, canEdit: true },
        accounts: { unlimited: true, canCreate: true },
        creditCards: { unlimited: true, canCreate: true },
        reports: { canAccess: true, advanced: true },
      })
    } else if (planType === 'annual') {
      setValue('features', {
        entries: { unlimited: true },
        categories: { unlimited: true, canCreate: true, canEdit: true },
        accounts: { unlimited: true, canCreate: true },
        creditCards: { unlimited: true, canCreate: true },
        reports: { canAccess: true, advanced: true },
      })
    }
  }, [planType, setValue])

  const handleFormSubmit = (
    data: PlanFormSchema,
    shouldCreateAnother = false,
  ) => {
    onSubmit(data, !shouldCreateAnother)
    if (!shouldCreateAnother) {
      handleClose()
    } else {
      // Resetar apenas os campos do formulário
      reset({
        name: '',
        type: 'free',
        price: '0',
        description: '',
        isActive: true,
        features: {
          entries: { unlimited: true },
          categories: { unlimited: false, canCreate: false, canEdit: false },
          accounts: { unlimited: false, canCreate: false },
          creditCards: { unlimited: false, canCreate: false },
          reports: { canAccess: false, advanced: false },
        },
      })
    }
  }

  const onSubmitForm = (data: PlanFormSchema) => {
    handleFormSubmit(data, false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {plan ? 'Editar Plano' : 'Criar Novo Plano'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          {/* Nome do Plano */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nome do Plano
            </Label>
            <Input
              id="name"
              placeholder="Ex: Plano Básico"
              className="h-12"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Tipo e Preço */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                Tipo
              </Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Gratuito</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="annual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium">
                Preço
              </Label>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <CurrencyInput
                    id="price"
                    placeholder="R$ 0,00"
                    value={field.value}
                    onChange={field.onChange}
                    className="h-12"
                    disabled={planType === 'free'}
                  />
                )}
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price.message}</p>
              )}
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
                Plano Ativo
              </Label>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descrição
            </Label>
            <Textarea
              id="description"
              placeholder="Descrição do plano..."
              className="min-h-[80px]"
              {...register('description')}
            />
          </div>

          {/* Funcionalidades */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Funcionalidades</h3>

            <div className="space-y-4 rounded-lg border p-4">
              {/* Lançamentos */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Lançamentos</h4>
                  <p className="text-sm text-muted-foreground">
                    Capacidade de criar lançamentos financeiros
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Controller
                    name="features.entries.unlimited"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <Switch
                        checked={value}
                        onCheckedChange={onChange}
                        disabled
                      />
                    )}
                  />
                  <Label className="text-sm font-medium">Ilimitados</Label>
                </div>
              </div>

              {/* Categorias */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Categorias</h4>
                    <p className="text-sm text-muted-foreground">
                      Gerenciamento de categorias de lançamentos
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="features.categories.unlimited"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <Switch checked={value} onCheckedChange={onChange} />
                      )}
                    />
                    <Label className="text-sm font-medium">Ilimitadas</Label>
                  </div>
                </div>
                <div className="ml-6 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="features.categories.canCreate"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <Switch checked={value} onCheckedChange={onChange} />
                      )}
                    />
                    <Label className="text-sm">Pode criar categorias</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="features.categories.canEdit"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <Switch checked={value} onCheckedChange={onChange} />
                      )}
                    />
                    <Label className="text-sm">Pode editar categorias</Label>
                  </div>
                </div>
              </div>

              {/* Contas */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Contas</h4>
                    <p className="text-sm text-muted-foreground">
                      Gerenciamento de contas bancárias
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="features.accounts.unlimited"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <Switch checked={value} onCheckedChange={onChange} />
                      )}
                    />
                    <Label className="text-sm font-medium">Ilimitadas</Label>
                  </div>
                </div>
                <div className="ml-6">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="features.accounts.canCreate"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <Switch checked={value} onCheckedChange={onChange} />
                      )}
                    />
                    <Label className="text-sm">Pode criar contas</Label>
                  </div>
                </div>
              </div>

              {/* Cartões de Crédito */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Cartões de Crédito</h4>
                    <p className="text-sm text-muted-foreground">
                      Gerenciamento de cartões de crédito
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="features.creditCards.unlimited"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <Switch checked={value} onCheckedChange={onChange} />
                      )}
                    />
                    <Label className="text-sm font-medium">Ilimitados</Label>
                  </div>
                </div>
                <div className="ml-6">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="features.creditCards.canCreate"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <Switch checked={value} onCheckedChange={onChange} />
                      )}
                    />
                    <Label className="text-sm">Pode criar cartões</Label>
                  </div>
                </div>
              </div>

              {/* Relatórios */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Relatórios</h4>
                    <p className="text-sm text-muted-foreground">
                      Acesso a relatórios financeiros
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="features.reports.canAccess"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <Switch checked={value} onCheckedChange={onChange} />
                      )}
                    />
                    <Label className="text-sm font-medium">Pode acessar</Label>
                  </div>
                </div>
                <div className="ml-6">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="features.reports.advanced"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <Switch checked={value} onCheckedChange={onChange} />
                      )}
                    />
                    <Label className="text-sm">Relatórios avançados</Label>
                  </div>
                </div>
              </div>
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
              {plan ? 'Atualizar' : 'Salvar'}
            </Button>
            {showCreateAnotherButton && !plan && (
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
