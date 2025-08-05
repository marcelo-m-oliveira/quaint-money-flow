'use client'

import {
  Building2,
  CreditCard,
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
import { formatCurrency } from '@/lib/format'
import { useCreditCards } from '@/lib/hooks/use-credit-cards'
import { CreditCard as CreditCardType, CreditCardFormData } from '@/lib/types'

export default function CartoesPage() {
  const { creditCards, addCreditCard, updateCreditCard, deleteCreditCard } =
    useCreditCards()
  const [isCreditCardFormOpen, setIsCreditCardFormOpen] = useState(false)
  const [editingCreditCard, setEditingCreditCard] = useState<
    CreditCardType | undefined
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

  const handleEditCreditCard = (creditCard: CreditCardType) => {
    setEditingCreditCard(creditCard)
    setIsCreditCardFormOpen(true)
  }

  const handleDeleteCreditCard = (creditCard: CreditCardType) => {
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

  const handleSubmitCreditCard = (cardData: CreditCardFormData) => {
    if (editingCreditCard) {
      updateCreditCard(editingCreditCard.id, cardData)
    } else {
      addCreditCard(cardData)
    }
    setIsCreditCardFormOpen(false)
    setEditingCreditCard(undefined)
  }

  const handleCloseModal = () => {
    setIsCreditCardFormOpen(false)
    setEditingCreditCard(undefined)
  }

  // Calcular totais
  const totalLimit = creditCards.reduce((sum, card) => sum + card.limit, 0)
  const totalUsed = creditCards.reduce(
    (sum, card) => sum + card.currentBalance,
    0,
  )
  const totalAvailable = totalLimit - totalUsed

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Cartões de crédito
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Gerencie seus cartões de crédito
              </p>
            </div>
            <Button
              onClick={handleAddCreditCard}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Novo cartão
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {creditCards.length === 0 ? (
            <div className="py-12 text-center">
              <CreditCard className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mb-2 text-lg font-medium">
                Nenhum cartão cadastrado
              </h3>
              <p className="text-sm text-muted-foreground">
                Adicione seu primeiro cartão de crédito para começar
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Resumo */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">
                      Limite Total
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(totalLimit)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">
                      Valor Usado
                    </div>
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(totalUsed)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">
                      Limite Disponível
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(totalAvailable)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lista de cartões */}
              <div className="space-y-3">
                {creditCards.map((creditCard) => {
                  const availableLimit =
                    creditCard.limit - creditCard.currentBalance
                  const usagePercentage =
                    (creditCard.currentBalance / creditCard.limit) * 100

                  return (
                    <Card key={creditCard.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-border">
                              {creditCard.iconType === 'bank' ? (
                                <img
                                  src={
                                    creditCard.icon.startsWith('/')
                                      ? creditCard.icon
                                      : `/icons/banks/${creditCard.icon}.png`
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
                                      'credit-card': CreditCard,
                                      bank: Landmark,
                                      building: Building2,
                                      'piggy-bank': PiggyBank,
                                      'trending-up': TrendingUp,
                                      'dollar-sign': DollarSign,
                                    }
                                    const IconComponent =
                                      GENERIC_ICON_MAP[
                                        creditCard.icon as keyof typeof GENERIC_ICON_MAP
                                      ] || CreditCard
                                    return (
                                      <IconComponent className="h-5 w-5 text-muted-foreground" />
                                    )
                                  })()}
                                </div>
                              ) : (
                                <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">
                                  {creditCard.name}
                                </h3>
                              </div>
                              <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                                <span>
                                  Limite: {formatCurrency(creditCard.limit)}
                                </span>
                                <span>
                                  Usado:{' '}
                                  {formatCurrency(creditCard.currentBalance)}
                                </span>
                                <span>
                                  Disponível: {formatCurrency(availableLimit)}
                                </span>
                                <span>
                                  Fecha dia {creditCard.closingDay}, vence dia{' '}
                                  {creditCard.dueDay}
                                </span>
                              </div>
                              {/* Barra de progresso do uso */}
                              <div className="mt-2">
                                <div className="h-2 w-full rounded-full bg-muted">
                                  <div
                                    className={`h-2 rounded-full transition-all ${
                                      usagePercentage > 80
                                        ? 'bg-red-500'
                                        : usagePercentage > 60
                                          ? 'bg-yellow-500'
                                          : 'bg-green-500'
                                    }`}
                                    style={{
                                      width: `${Math.min(usagePercentage, 100)}%`,
                                    }}
                                  />
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                  {usagePercentage.toFixed(1)}% utilizado
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditCreditCard(creditCard)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCreditCard(creditCard)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Formulário de Cartão */}
      <CreditCardFormModal
        isOpen={isCreditCardFormOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitCreditCard}
        creditCard={editingCreditCard}
        title={editingCreditCard ? 'Editar cartão' : 'Novo cartão manual'}
      />

      {/* Dialog de Confirmação */}
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
