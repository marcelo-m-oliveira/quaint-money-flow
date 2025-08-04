'use client'

import { CreditCard, Edit, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { AccountFormModal } from '@/components/account-form-modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { formatCurrency } from '@/lib/format'
import { useAccounts } from '@/lib/hooks/use-accounts'
import { Account, AccountFormData } from '@/lib/types'

export default function ContasPage() {
  const { accounts, addAccount, updateAccount, deleteAccount } = useAccounts()
  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | undefined>()
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    description: string
    onConfirm: () => void
  }>({ isOpen: false, title: '', description: '', onConfirm: () => {} })

  const handleAddAccount = () => {
    setEditingAccount(undefined)
    setIsAccountFormOpen(true)
  }

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account)
    setIsAccountFormOpen(true)
  }

  const handleDeleteAccount = (account: Account) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Excluir conta',
      description: `Tem certeza que deseja excluir a conta "${account.name}"? Esta ação não pode ser desfeita.`,
      onConfirm: () => {
        deleteAccount(account.id)
        setConfirmDialog({ ...confirmDialog, isOpen: false })
      },
    })
  }

  const handleSubmitAccount = (accountData: AccountFormData) => {
    if (editingAccount) {
      updateAccount(editingAccount.id, accountData)
    } else {
      addAccount(accountData)
    }
    setIsAccountFormOpen(false)
    setEditingAccount(undefined)
  }

  const handleCloseModal = () => {
    setIsAccountFormOpen(false)
    setEditingAccount(undefined)
  }

  // Calcular totais
  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.balance,
    0,
  )
  const generalBalance = accounts
    .filter((account) => account.includeInGeneralBalance)
    .reduce((sum, account) => sum + account.balance, 0)

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Contas
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure suas contas bancárias e cartões
              </p>
            </div>
            <Button onClick={handleAddAccount} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova conta
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <CreditCard className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="mb-2 text-lg font-medium">
                Nenhuma conta cadastrada
              </p>
              <p className="mb-4 text-sm">
                Adicione suas contas bancárias e cartões para começar
              </p>
              <Button onClick={handleAddAccount} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar primeira conta
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Resumo */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">
                      Saldo Total
                    </div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(totalBalance)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">
                      Saldo Geral (incluído no dashboard)
                    </div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(generalBalance)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lista de contas */}
              <div className="space-y-3">
                {accounts.map((account) => (
                  <Card key={account.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            {account.icon ? (
                              <img
                                src={account.icon}
                                alt={account.name}
                                className="h-6 w-6 rounded-full object-contain"
                              />
                            ) : (
                              <CreditCard className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{account.name}</div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{formatCurrency(account.balance)}</span>
                              {!account.includeInGeneralBalance && (
                                <span className="rounded bg-muted px-2 py-0.5 text-xs">
                                  Não incluído no saldo geral
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditAccount(account)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteAccount(account)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
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
      <AccountFormModal
        isOpen={isAccountFormOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitAccount}
        account={editingAccount}
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
