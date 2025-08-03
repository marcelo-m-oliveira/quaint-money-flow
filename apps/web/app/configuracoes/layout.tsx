'use client'

import {
  Settings,
  Tag,
  CreditCard,
  User,
  Bell,
  Shield,
  Palette,
  Database,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface ConfigLayoutProps {
  children: React.ReactNode
}

const menuItems = [
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80">
              <Settings className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">Configurações</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-sm text-muted-foreground mb-4">
                    CONFIGURAÇÕES
                  </h3>
                  {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    
                    return (
                      <Link key={item.id} href={item.href}>
                        <Button
                          variant={isActive ? 'secondary' : 'ghost'}
                          className={`w-full justify-start gap-3 h-auto p-3 ${
                            isActive ? 'bg-primary/10 text-primary' : ''
                          }`}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <div className="text-left">
                            <div className="font-medium text-sm">{item.label}</div>
                            <div className="text-xs text-muted-foreground mt-1 hidden sm:block">
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
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}