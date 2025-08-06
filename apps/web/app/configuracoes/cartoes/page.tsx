'use client'

import {
  Building2,
  CreditCard as CreditCardIcon,
  DollarSign,
  Edit,
  Landmark,
  PiggyBank,
  Plus,
  Trash2,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useState } from 'react'

import { CreditCardFormModal } from '@/components/credit-card-form-modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { getBankIcon } from '@/lib/data/banks'
import { formatCurrency } from '@/lib/format'
import { useCreditCards } from '@/lib/hooks/use-credit-cards'
import { CreditCard, CreditCardFormData } from '@/lib/types'

export default function CartoesPage() {
  const { creditCards, addCreditCard, updateCreditCard, deleteCreditCard } =
    useCreditCards()
  const [isCreditCardFormOpen, setIsCreditCardFormOpen] = useState(false)
  const [editingCreditCard, setEditingCreditCard] = useState<
    CreditCard | undefined
  >()
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    description: string
    onConfirm: () => void
  }>({ isOpen: false, title: '', description: '', onConfirm: () => {} })

  const handleAddCreditCard = () => {
    setEditingCreditCard(undefined)
    setIsCreditCardFormOpen(true)
  }

  const handleEditCreditCard = (creditCard: CreditCard) => {
    setEditingCreditCard(creditCard)
    setIsCreditCardFormOpen(true)
  }

  const handleDeleteCreditCard = (creditCard: CreditCard) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Excluir cartão',
      description: `Tem certeza que deseja excluir o cartão "${creditCard.name}"? Esta ação não pode ser desfeita.`,
      onConfirm: () => {
        deleteCreditCard(creditCard.id)
        setConfirmDialog({ ...confirmDialog, isOpen: false })
      },
    })
  }

  const handleSubmitCreditCard = (data: CreditCardFormData) => {
    if (editingCreditCard) {
      updateCreditCard(editingCreditCard.id, data)
    } else {
      addCreditCard(data)
    }
    setIsCreditCardFormOpen(false)
    setEditingCreditCard(undefined)
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <CardTitle className="flex items-center gap-2">
                <CreditCardIcon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">Cartões de Crédito</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Gerencie seus cartões de crédito
              </p>
            </div>
            <Button onClick={handleAddCreditCard} className="flex-shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Adicionar Cartão</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto px-4 py-4 sm:px-6">
          {creditCards.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <CreditCardIcon className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="mb-2 text-lg font-medium">
                Nenhum cartão cadastrado
              </p>
              <p className="mb-4 text-sm">
                Adicione seus cartões de crédito para começar a controlar seus
                gastos
              </p>
              <Button onClick={handleAddCreditCard}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeiro Cartão
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4">
                {creditCards.map((creditCard) => (
                  <Card
                    key={creditCard.id}
                    className="transition-colors hover:bg-muted/50"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border">
                            {creditCard.iconType === 'bank' &&
                            creditCard.icon ? (
                              <img
                                src={
                                  getBankIcon(creditCard.icon, 'icon') ||
                                  creditCard.icon
                                }
                                alt={creditCard.name}
                                className="h-full w-full rounded-full object-contain p-0.5"
                              />
                            ) : creditCard.iconType === 'generic' &&
                              creditCard.icon ? (
                              <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                                {(() => {
                                  const GENERIC_ICON_MAP = {
                                    wallet: Wallet,
                                    'credit-card': CreditCardIcon,
                                    bank: Landmark,
                                    building: Building2,
                                    'piggy-bank': PiggyBank,
                                    'trending-up': TrendingUp,
                                    'dollar-sign': DollarSign,
                                  }
                                  const IconComponent =
                                    GENERIC_ICON_MAP[
                                      creditCard.icon as keyof typeof GENERIC_ICON_MAP
                                    ] || CreditCardIcon
                                  return (
                                    <IconComponent className="h-5 w-5 text-muted-foreground" />
                                  )
                                })()}
                              </div>
                            ) : (
                              <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                                <CreditCardIcon className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium">
                              {creditCard.name}
                            </div>
                            <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-4">
                              <span className="truncate">
                                Limite: {formatCurrency(creditCard.limit)}
                              </span>
                              <span className="truncate">
                                Usado:{' '}
                                {formatCurrency(creditCard.currentBalance)}
                              </span>
                              <span className="truncate">
                                Disponível:{' '}
                                {formatCurrency(
                                  creditCard.limit - creditCard.currentBalance,
                                )}
                              </span>
                            </div>
                            <div className="mt-1 flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-4">
                              <span className="truncate">
                                Fechamento: dia {creditCard.closingDay}
                              </span>
                              <span className="truncate">
                                Vencimento: dia {creditCard.dueDay}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleEditCreditCard(creditCard)
                                  }
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Editar cartão</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteCreditCard(creditCard)
                                  }
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Excluir cartão</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de formulário */}
      <CreditCardFormModal
        isOpen={isCreditCardFormOpen}
        onClose={() => {
          setIsCreditCardFormOpen(false)
          setEditingCreditCard(undefined)
        }}
        onSubmit={handleSubmitCreditCard}
        creditCard={editingCreditCard}
        title={editingCreditCard ? 'Editar Cartão' : 'Adicionar Cartão'}
      />

      {/* Dialog de confirmação */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
      />
    </>
  )
}
