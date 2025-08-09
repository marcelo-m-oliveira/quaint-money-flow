'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { usePreferences } from '@/lib/hooks/use-preferences'
import { useUserPreferencesWithAutoInit } from '@/lib/hooks/use-user-preferences'
import { preferencesSchema } from '@/lib/schemas'
import { UserPreferencesFormData } from '@/lib/types'

export default function PreferenciasPage() {
  const { preferences, updatePreferences } = useUserPreferencesWithAutoInit()
  const { clearAllTransactions, deleteAccount } = usePreferences()
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    description: string
    onConfirm: () => void
    variant?: 'default' | 'destructive'
  }>({ isOpen: false, title: '', description: '', onConfirm: () => {} })

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UserPreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      transactionOrder: preferences?.transactionOrder || 'descending',
      defaultNavigationPeriod:
        preferences?.defaultNavigationPeriod || 'monthly',
      showDailyBalance: preferences?.showDailyBalance ?? true,
      viewMode: preferences?.viewMode || 'all',
      isFinancialSummaryExpanded:
        preferences?.isFinancialSummaryExpanded ?? true,
    },
  })

  // Resetar formulário quando as preferências mudarem
  useEffect(() => {
    if (preferences) {
      reset(preferences)
    }
  }, [preferences, reset])

  const onSubmit = async (data: UserPreferencesFormData) => {
    try {
      await updatePreferences(data)
      // Resetar o formulário para remover o estado isDirty
      reset(data)
    } catch (error) {
      console.error('❌ Erro ao salvar preferências:', error)
    }
  }

  const handleClearTransactions = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Excluir minhas transações',
      description:
        'Tem certeza que deseja excluir todas as suas transações? Esta ação não pode ser desfeita.',
      variant: 'destructive',
      onConfirm: () => {
        clearAllTransactions()
        setConfirmDialog({
          isOpen: false,
          title: '',
          description: '',
          onConfirm: () => {},
        })
      },
    })
  }

  const handleDeleteAccount = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Excluir conta por completo',
      description:
        'Tem certeza que deseja excluir sua conta completamente? Todos os seus dados serão perdidos permanentemente. Esta ação não pode ser desfeita.',
      variant: 'destructive',
      onConfirm: () => {
        deleteAccount()
        setConfirmDialog({
          isOpen: false,
          title: '',
          description: '',
          onConfirm: () => {},
        })
      },
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Preferências
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Ordenação dos seus Lançamentos */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-base font-medium">
                  Ordenação dos seus Lançamentos
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ordem (baseado na data) que suas transações serão listadas na
                  tela de Lançamentos
                </p>
              </div>
              <div className="w-32">
                <Controller
                  name="transactionOrder"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex flex-col space-y-3"
                    >
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="ascending" id="ascending" />
                        <Label
                          htmlFor="ascending"
                          className="cursor-pointer text-sm font-normal"
                        >
                          Crescente
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="descending" id="descending" />
                        <Label
                          htmlFor="descending"
                          className="cursor-pointer text-sm font-normal"
                        >
                          Decrescente
                        </Label>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>
            </div>
            {errors.transactionOrder && (
              <p className="text-sm text-red-500">
                {errors.transactionOrder.message}
              </p>
            )}
          </div>

          <Separator />

          {/* Período de navegação padrão */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-base font-medium">
                  Período de navegação padrão
                </h3>
                <p className="text-sm text-muted-foreground">
                  Para quem faz muitos lançamentos durante o mês, o ideal é
                  escolher semanal ou diário
                </p>
              </div>
              <div className="w-32">
                <Controller
                  name="defaultNavigationPeriod"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex flex-col space-y-3"
                    >
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="daily" id="daily" />
                        <Label
                          htmlFor="daily"
                          className="cursor-pointer text-sm font-normal"
                        >
                          Diário
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="weekly" id="weekly" />
                        <Label
                          htmlFor="weekly"
                          className="cursor-pointer text-sm font-normal"
                        >
                          Semanal
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="monthly" id="monthly" />
                        <Label
                          htmlFor="monthly"
                          className="cursor-pointer text-sm font-normal"
                        >
                          Mensal
                        </Label>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>
            </div>
            {errors.defaultNavigationPeriod && (
              <p className="text-sm text-red-500">
                {errors.defaultNavigationPeriod.message}
              </p>
            )}
          </div>

          <Separator />

          {/* Modo de Visualização */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-base font-medium">Modo de Visualização</h3>
                <p className="text-sm text-muted-foreground">
                  Escolha como você deseja visualizar suas transações por padrão
                </p>
              </div>
              <div className="w-32">
                <Controller
                  name="viewMode"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex flex-col space-y-3"
                    >
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="cashflow" id="cashflow" />
                        <Label
                          htmlFor="cashflow"
                          className="cursor-pointer text-sm font-normal"
                        >
                          Fluxo de caixa
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="all" id="all" />
                        <Label
                          htmlFor="all"
                          className="cursor-pointer text-sm font-normal"
                        >
                          Todos os lançamentos
                        </Label>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>
            </div>
            {errors.viewMode && (
              <p className="text-sm text-red-500">{errors.viewMode.message}</p>
            )}
          </div>

          <Separator />

          {/* Saldo diário */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-base font-medium">Saldo diário</h3>
                <p className="text-sm text-muted-foreground">
                  Mostra saldos listados na tela de Lançamentos ao final de cada
                  dia
                </p>
              </div>
              <div className="w-32">
                <Controller
                  name="showDailyBalance"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value ? 'sim' : 'nao'}
                      onValueChange={(value) => field.onChange(value === 'sim')}
                      className="flex flex-col space-y-3"
                    >
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="sim" id="daily-balance-sim" />
                        <Label
                          htmlFor="daily-balance-sim"
                          className="cursor-pointer text-sm font-normal"
                        >
                          Sim
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="nao" id="daily-balance-nao" />
                        <Label
                          htmlFor="daily-balance-nao"
                          className="cursor-pointer text-sm font-normal"
                        >
                          Não
                        </Label>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>
            </div>
            {errors.showDailyBalance && (
              <p className="text-sm text-red-500">
                {errors.showDailyBalance.message}
              </p>
            )}
          </div>

          <Separator />

          {/* Começar do zero */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="pr-16 md:pr-0">
                <h3 className="text-base font-medium">Começar do zero</h3>
                <p className="text-sm text-muted-foreground">
                  Aqui você pode zerar sua conta, deletando toda sua
                  movimentação financeira. Suas contas, cartões, categorias e
                  tags cadastradas permanecerão intactadas.
                </p>
              </div>
              <Button
                variant="outline"
                className="whitespace-nowrap border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950"
                onClick={handleClearTransactions}
              >
                Excluir minhas transações
              </Button>
            </div>
          </div>

          <Separator />

          {/* Excluir conta */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium">Excluir conta</h3>
                <p className="text-sm text-muted-foreground">
                  Já é hora de dizer tchau? Aqui você pode excluir sua conta
                  definitivamente
                </p>
              </div>
              <Button
                variant="outline"
                className="whitespace-nowrap border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950"
                onClick={handleDeleteAccount}
              >
                Excluir conta por completo
              </Button>
            </div>
          </div>

          <Separator />

          {/* Botão Salvar alterações */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={!isDirty}
              className="bg-green-600 px-8 text-white hover:bg-green-700 disabled:opacity-50"
            >
              Salvar alterações
            </Button>
          </div>
        </CardContent>
      </Card>

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
        requiresTimer={confirmDialog.title === 'Excluir conta por completo'}
        timerSeconds={10}
      />
    </>
  )
}
