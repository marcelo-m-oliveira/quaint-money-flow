'use client'

import {
  Calendar,
  Check,
  Copy,
  DollarSign,
  Edit,
  MoreHorizontal,
  Percent,
  Plus,
  Search,
  Ticket,
  Trash2,
  X,
} from 'lucide-react'
import React, { useState } from 'react'

import { CouponFormModal } from '@/components/coupon-form-modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAdminCoupons, useCrudToast } from '@/lib'
import type { AdminCoupon } from '@/lib/services/admin'

export default function AdminCouponsPage() {
  const {
    coupons,
    isLoading,
    error,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    activateCoupon,
    deactivateCoupon,
    refetch,
  } = useAdminCoupons()
  const { showSuccess } = useCrudToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | undefined>()
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    description: string
    onConfirm: () => void
    variant?: 'default' | 'destructive'
  }>({ isOpen: false, title: '', description: '', onConfirm: () => {} })

  const filteredCoupons = coupons.filter((coupon) =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getDiscountText = (coupon: AdminCoupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}%`
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(coupon.discountValue)
  }

  const getStatusBadge = (coupon: AdminCoupon) => {
    if (!coupon.isActive) {
      return <Badge variant="destructive">Inativo</Badge>
    }

    if (coupon.expiresAt && coupon.expiresAt > 0) {
      try {
        const expiryDate = new Date(coupon.expiresAt * 1000)
        if (!isNaN(expiryDate.getTime()) && expiryDate < new Date()) {
          return <Badge variant="destructive">Expirado</Badge>
        }
      } catch (error) {
        console.error('Erro ao processar data de expiração:', error)
      }
    }

    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      return <Badge variant="destructive">Esgotado</Badge>
    }

    return <Badge className="bg-green-100 text-green-800">Ativo</Badge>
  }

  const formatDate = (timestamp: number) => {
    if (!timestamp || timestamp <= 0) {
      return 'Data inválida'
    }

    try {
      const date = new Date(timestamp * 1000)
      if (isNaN(date.getTime())) {
        return 'Data inválida'
      }

      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date)
    } catch (error) {
      console.error('Erro ao formatar data:', error)
      return 'Data inválida'
    }
  }

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      showSuccess(
        'Código copiado!',
        `O código "${code}" foi copiado para a área de transferência.`,
      )
    } catch (error) {
      console.error('Erro ao copiar código:', error)
    }
  }

  const handleCreateCoupon = () => {
    setEditingCoupon(undefined)
    setIsFormModalOpen(true)
  }

  const handleEditCoupon = (coupon: AdminCoupon) => {
    setEditingCoupon(coupon)
    setIsFormModalOpen(true)
  }

  const handleDeleteCoupon = (coupon: AdminCoupon) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Excluir cupom',
      description: `Tem certeza que deseja excluir o cupom "${coupon.code}"? Esta ação não pode ser desfeita.`,
      variant: 'destructive',
      onConfirm: async () => {
        const success = await deleteCoupon(coupon.id)
        if (success) {
          setConfirmDialog({
            isOpen: false,
            title: '',
            description: '',
            onConfirm: () => {},
          })
        }
      },
    })
  }

  const handleFormSubmit = async (data: any, shouldClose = true) => {
    if (editingCoupon) {
      await updateCoupon(editingCoupon.id, data)
    } else {
      await createCoupon(data)
    }

    if (shouldClose) {
      setIsFormModalOpen(false)
      setEditingCoupon(undefined)
    }
  }

  const handleToggleActive = async (coupon: AdminCoupon) => {
    if (coupon.isActive) {
      await deactivateCoupon(coupon.id)
    } else {
      await activateCoupon(coupon.id)
    }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <Button onClick={refetch} className="mt-4">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Gerenciar Cupons</h2>
            <p className="text-muted-foreground">
              Crie e gerencie cupons de desconto para usuários
            </p>
          </div>
          <Button onClick={handleCreateCoupon}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cupom
          </Button>
        </div>

        {/* Search and Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="md:col-span-2">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar cupons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{coupons.length}</div>
                <div className="text-sm text-muted-foreground">
                  Total de Cupons
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {coupons.filter((c) => c.isActive).length}
                </div>
                <div className="text-sm text-muted-foreground">Ativos</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coupons Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Cupons ({filteredCoupons.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="text-muted-foreground">
                  Carregando cupons...
                </div>
              </div>
            ) : filteredCoupons.length === 0 ? (
              <div className="p-8 text-center">
                <Ticket className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium">
                  Nenhum cupom encontrado
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? 'Nenhum cupom corresponde à sua busca'
                    : 'Comece criando seu primeiro cupom'}
                </p>
                <Button onClick={handleCreateCoupon} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Cupom
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Desconto</TableHead>
                    <TableHead>Uso</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="rounded bg-muted px-2 py-1 font-mono text-sm">
                            {coupon.code}
                          </code>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(coupon.code)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Copiar código</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {coupon.discountType === 'percentage' ? (
                            <Percent className="h-4 w-4 text-green-600" />
                          ) : (
                            <DollarSign className="h-4 w-4 text-green-600" />
                          )}
                          <span className="font-medium">
                            {getDiscountText(coupon)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{coupon.currentUses} utilizações</div>
                          {coupon.maxUses && (
                            <div className="text-muted-foreground">
                              de {coupon.maxUses} máximo
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {coupon.expiresAt && coupon.expiresAt > 0 ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {formatDate(coupon.expiresAt)}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Sem expiração
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(coupon)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <DropdownMenuItem
                                  onClick={() => handleEditCoupon(coupon)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Editar cupom</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <DropdownMenuItem
                                  onClick={() => copyToClipboard(coupon.code)}
                                >
                                  <Copy className="mr-2 h-4 w-4" />
                                  Copiar Código
                                </DropdownMenuItem>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copiar código para área de transferência</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <DropdownMenuItem
                                  onClick={() => handleToggleActive(coupon)}
                                >
                                  {coupon.isActive ? (
                                    <>
                                      <X className="mr-2 h-4 w-4" />
                                      Desativar
                                    </>
                                  ) : (
                                    <>
                                      <Check className="mr-2 h-4 w-4" />
                                      Ativar
                                    </>
                                  )}
                                </DropdownMenuItem>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {coupon.isActive
                                    ? 'Desativar cupom'
                                    : 'Ativar cupom'}
                                </p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeleteCoupon(coupon)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Excluir cupom permanentemente</p>
                              </TooltipContent>
                            </Tooltip>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Form Modal */}
        <CouponFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false)
            setEditingCoupon(undefined)
          }}
          coupon={editingCoupon}
          onSubmit={handleFormSubmit}
        />

        {/* Dialog de Confirmação */}
        <ConfirmationDialog
          isOpen={confirmDialog.isOpen}
          onClose={() =>
            setConfirmDialog({
              isOpen: false,
              title: '',
              description: '',
              onConfirm: () => {},
            })
          }
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          description={confirmDialog.description}
          variant={confirmDialog.variant}
        />
      </div>
    </TooltipProvider>
  )
}
