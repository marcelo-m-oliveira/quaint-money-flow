'use client'

import {
  ArrowLeft,
  Bell,
  CreditCard,
  Database,
  Settings,
  Tag,
  User,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { PageLayout } from '@/components/layouts/page-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ConfigLayoutProps {
  children: React.ReactNode
}

const menuItems = [
  {
    id: 'perfil',
    label: 'Perfil',
    icon: User,
    href: '/configuracoes/perfil',
    description: 'Atualize informações da sua conta',
  },
  {
    id: 'categorias',
    label: 'Categorias',
    icon: Tag,
    href: '/configuracoes/categorias',
    description: 'Gerencie suas categorias de receitas e despesas',
  },
  {
    id: 'contas',
    label: 'Contas',
    icon: CreditCard,
    href: '/configuracoes/contas',
    description: 'Configure suas contas bancárias e cartões',
  },
  {
    id: 'cartoes',
    label: 'Cartões de crédito',
    icon: CreditCard,
    href: '/configuracoes/cartoes',
    description: 'Gerencie seus cartões de crédito',
  },
  {
    id: 'preferencias',
    label: 'Preferências',
    icon: Settings,
    href: '/configuracoes/preferencias',
    description: 'Personalize suas preferências do sistema',
  },
  {
    id: 'plano',
    label: 'Plano',
    icon: Database,
    href: '/configuracoes/plano',
    description: 'Gerencie seu plano e assinatura',
  },
  {
    id: 'tags',
    label: 'Tags',
    icon: Tag,
    href: '/configuracoes/tags',
    description: 'Organize suas transações com tags',
  },
  {
    id: 'alertas',
    label: 'Alertas',
    icon: Bell,
    href: '/configuracoes/alertas',
    description: 'Configure notificações e alertas',
  },
  {
    id: 'atividades',
    label: 'Atividades',
    icon: User,
    href: '/configuracoes/atividades',
    description: 'Visualize o histórico de atividades',
  },
]

export default function ConfigLayout({ children }: ConfigLayoutProps) {
  const pathname = usePathname()

  return (
    <PageLayout>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="mb-4 text-sm font-medium text-muted-foreground">
                  CONFIGURAÇÕES
                </h3>

                {/* Botão Voltar para Configurações */}
                {pathname !== '/configuracoes' && (
                  <Link href="/configuracoes">
                    <Button
                      variant="outline"
                      className="mb-4 h-auto w-full justify-start gap-3 border-dashed p-3"
                    >
                      <ArrowLeft className="h-4 w-4 flex-shrink-0" />
                      <div className="text-left">
                        <div className="text-sm font-medium">
                          Voltar para Configurações
                        </div>
                      </div>
                    </Button>
                  </Link>
                )}

                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <Link key={item.id} href={item.href}>
                      <Button
                        variant={isActive ? 'secondary' : 'ghost'}
                        className={`h-auto w-full justify-start gap-3 p-3 ${
                          isActive ? 'bg-primary/10 text-primary' : ''
                        }`}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <div className="text-left">
                          <div className="text-sm font-medium">
                            {item.label}
                          </div>
                          <div className="mt-1 hidden text-xs text-muted-foreground sm:block">
                            {item.description}
                          </div>
                        </div>
                      </Button>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">{children}</div>
      </div>
    </PageLayout>
  )
}
