'use client'

import {
  AlertCircle,
  ArrowRight,
  Bell,
  CheckCircle,
  CreditCard,
  Mail,
  Settings,
  Shield,
  Tag,
  User,
} from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAccountsWithAutoInit } from '@/lib/hooks/use-accounts'
import { useFinancialData } from '@/lib/hooks/use-financial-data'

const quickActions = [
  {
    id: 'categorias',
    label: 'Categorias',
    icon: Tag,
    href: '/configuracoes/categorias',
    description: 'Gerencie suas categorias de receitas e despesas',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950',
  },
  {
    id: 'contas',
    label: 'Contas',
    icon: CreditCard,
    href: '/configuracoes/contas',
    description: 'Configure suas contas bancárias',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
  },
  {
    id: 'preferencias',
    label: 'Preferências',
    icon: Settings,
    href: '/configuracoes/preferencias',
    description: 'Personalize suas preferências',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
  },
  {
    id: 'alertas',
    label: 'Alertas',
    icon: Bell,
    href: '/configuracoes/alertas',
    description: 'Configure notificações',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
  },
]

export default function ConfiguracoesPage() {
  const { data: session } = useSession()
  const [userProviders, setUserProviders] = useState<string[]>([])
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    // Verificar status da conta do usuário
    const checkAccountStatus = async () => {
      try {
        const response = await fetch('/api/proxy/users/account-status')
        if (response.ok) {
          const accountStatus = await response.json()

          // Definir provedores baseado no status
          const providers = []
          if (accountStatus.hasGoogleProvider) {
            providers.push('google')
          }
          setUserProviders(providers)

          // Definir se precisa configurar senha
          setNeedsPasswordSetup(accountStatus.needsPasswordSetup)
        }
      } catch (error) {
        console.error('Erro ao verificar status da conta:', error)
      }
    }

    if (session) {
      checkAccountStatus()
    }
  }, [session])

  // Verificar se acabou de retornar de uma autenticação Google
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const googleConnected = urlParams.get('google_connected')

    if (googleConnected === 'true') {
      // Remover o parâmetro da URL
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)

      // Recarregar o status da conta
      refreshAccountStatus()
      setIsConnecting(false)
    }
  }, [])

  // Função para conectar com Google
  const handleConnectGoogle = async () => {
    try {
      setIsConnecting(true)
      // Redirecionar para o fluxo OAuth do Google com parâmetro de vinculação
      // Adicionar state parameter para indicar que é uma vinculação
      window.location.href = '/api/auth/google?link_account=true'
    } catch (error) {
      console.error('Erro ao conectar com Google:', error)
      setIsConnecting(false)
    }
  }

  // Função para recarregar o status da conta após conexão
  const refreshAccountStatus = async () => {
    try {
      const response = await fetch('/api/proxy/users/account-status')
      if (response.ok) {
        const accountStatus = await response.json()

        // Definir provedores baseado no status
        const providers = []
        if (accountStatus.hasGoogleProvider) {
          providers.push('google')
        }
        setUserProviders(providers)

        // Definir se precisa configurar senha
        setNeedsPasswordSetup(accountStatus.needsPasswordSetup)
      }
    } catch (error) {
      console.error('Erro ao verificar status da conta:', error)
    }
  }

  const { categories, isLoading: categoriesLoading } = useFinancialData()
  const { accounts, isLoading: accountsLoading } = useAccountsWithAutoInit()

  // Calcular estatísticas
  const expenseCategories = categories.filter((cat) => cat.type === 'expense')
  const incomeCategories = categories.filter((cat) => cat.type === 'income')
  const connectedAccounts = accounts.length
  const activeAlerts = 0 // Por enquanto fixo, pode ser implementado futuramente

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie suas preferências e configurações da conta
          </p>
        </div>
      </div>

      {/* Seção de Conta e Autenticação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Conta e Autenticação
          </CardTitle>
          <CardDescription>
            Gerencie suas informações de conta e métodos de login
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Informações do Usuário */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <h3 className="font-semibold">{session?.user?.name}</h3>
              <p className="text-sm text-muted-foreground">
                {session?.user?.email}
              </p>
            </div>
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={session?.user?.image || ''}
                alt={session?.user?.name || ''}
              />
              <AvatarFallback>{session?.user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>

          {/* Métodos de Login */}
          <div className="space-y-3">
            <h4 className="font-medium">Métodos de Login</h4>

            {/* Login com Email/Senha */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Email e Senha</p>
                  <p className="text-sm text-muted-foreground">
                    Login tradicional
                  </p>
                </div>
              </div>
              <Badge variant="secondary">Ativo</Badge>
            </div>

            {/* Login com Google */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-white">
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Google</p>
                  <p className="text-sm text-muted-foreground">
                    Login com conta Google
                  </p>
                </div>
              </div>
              {userProviders.includes('google') ? (
                <Badge variant="default">Conectado</Badge>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleConnectGoogle}
                  disabled={isConnecting}
                >
                  {isConnecting ? 'Conectando...' : 'Conectar'}
                </Button>
              )}
            </div>
          </div>

          {/* Aviso sobre Configuração de Senha */}
          {userProviders.includes('google') && needsPasswordSetup && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    Configure sua senha
                  </h4>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                    Para ter acesso completo ao sistema, configure uma senha
                    para sua conta. Isso permitirá que você faça login tanto com
                    Google quanto com email/senha.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      // Redirecionar para configuração de senha
                      window.location.href = '/auth/setup-password'
                    }}
                  >
                    Configurar Senha
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Informações sobre Vinculação */}
          {userProviders.includes('google') && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium text-green-900 dark:text-green-100">
                    Conta vinculada com sucesso
                  </h4>
                  <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                    Sua conta está vinculada ao Google. Você pode fazer login
                    usando qualquer um dos métodos disponíveis.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resto das configurações existentes */}
      <Separator />

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Ações Rápidas</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.id} href={action.href}>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`rounded-lg p-3 ${action.bgColor}`}>
                          <Icon className={`h-6 w-6 ${action.color}`} />
                        </div>
                        <div>
                          <h3 className="mb-1 font-semibold">{action.label}</h3>
                          <p className="text-sm text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categorias Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categoriesLoading ? '...' : categories.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {categoriesLoading
                ? 'Carregando...'
                : `${expenseCategories.length} despesas, ${incomeCategories.length} receitas`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contas Conectadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accountsLoading ? '...' : connectedAccounts}
            </div>
            <p className="text-xs text-muted-foreground">
              {accountsLoading
                ? 'Carregando...'
                : connectedAccounts === 0
                  ? 'Nenhuma conta conectada'
                  : `${connectedAccounts} conta${connectedAccounts > 1 ? 's' : ''} conectada${connectedAccounts > 1 ? 's' : ''}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Alertas Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAlerts}</div>
            <p className="text-xs text-muted-foreground">
              {activeAlerts === 0
                ? 'Nenhum alerta configurado'
                : `${activeAlerts} alerta${activeAlerts > 1 ? 's' : ''} ativo${activeAlerts > 1 ? 's' : ''}`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            <User className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p className="text-sm">Nenhuma atividade recente</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
