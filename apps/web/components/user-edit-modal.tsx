'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useAdminPlans, useCrudToast } from '@/lib'
import { type AdminUser } from '@/lib/services/admin'

import { Button } from './ui/button'
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

// Schema para edição de usuário
const userEditSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  planId: z.string().optional(),
  isActive: z.boolean(),
})

type UserEditSchema = z.infer<typeof userEditSchema>

interface UserEditModalProps {
  isOpen: boolean
  onClose: () => void
  user?: AdminUser
  onSubmit: (data: UserEditSchema) => void
  onDelete?: () => void
}

export function UserEditModal({
  isOpen,
  onClose,
  user,
  onSubmit,
  onDelete,
}: UserEditModalProps) {
  const { plans, isLoading: plansLoading } = useAdminPlans(true) // Incluir planos inativos
  const { warning } = useCrudToast()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserEditSchema>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      name: '',
      email: '',
      planId: 'none',
      isActive: true,
    },
  })

  // Resetar formulário quando o modal abrir/fechar
  useEffect(() => {
    if (isOpen && user) {
      reset({
        name: user.name,
        email: user.email,
        planId: user.plan?.id || 'none',
        isActive: user.isActive,
      })
    }
  }, [isOpen, user, reset])

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmitForm = (data: UserEditSchema) => {
    onSubmit(data)
    handleClose()
  }

  const handleDelete = () => {
    if (onDelete) {
      warning.general(
        'Tem certeza?',
        'Esta ação não pode ser desfeita. O usuário será excluído permanentemente.',
      )
      onDelete()
      handleClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nome
            </Label>
            <Input
              id="name"
              placeholder="Nome do usuário"
              {...register('name')}
              className="h-12"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="email@exemplo.com"
              {...register('email')}
              className="h-12"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Plano */}
          <div className="space-y-2">
            <Label htmlFor="planId" className="text-sm font-medium">
              Plano
            </Label>
            <Select
              value={watch('planId')}
              onValueChange={(value) => setValue('planId', value)}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem Plano</SelectItem>
                {plansLoading ? (
                  <SelectItem value="loading" disabled>
                    Carregando planos...
                  </SelectItem>
                ) : (
                  plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - R$ {Number(plan.price).toFixed(2)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Status Ativo */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Usuário Ativo</Label>
              <p className="text-xs text-muted-foreground">
                Desabilite para suspender o acesso do usuário
              </p>
            </div>
            <Switch
              checked={watch('isActive')}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            {onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="flex-1"
              >
                Excluir
              </Button>
            )}
            <Button type="submit" className="flex-1">
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
