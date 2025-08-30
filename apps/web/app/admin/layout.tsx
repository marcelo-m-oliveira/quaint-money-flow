'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Users, 
  Crown, 
  Ticket, 
  BarChart3, 
  ArrowLeft,
  Shield,
  Home
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useUser } from '@/lib/contexts/permissions-context'
import { PageLayout } from '@/components/layouts/page-layout'

interface AdminLayoutProps {
  children: React.ReactNode
}

const adminMenuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/admin',
    description: 'Visão geral do sistema',
  },
  {
    id: 'users',
    label: 'Usuários',
    icon: Users,
    href: '/admin/users',
    description: 'Gerenciar usuários do sistema',
  },
  {
    id: 'plans',
    label: 'Planos',
    icon: Crown,
    href: '/admin/plans',
    description: 'Gerenciar planos de assinatura',
  },
  {
    id: 'coupons',
    label: 'Cupons',
    icon: Ticket,
    href: '/admin/coupons',
    description: 'Gerenciar cupons de desconto',
  },
  {
    id: 'analytics',
    label: 'Análises',
    icon: BarChart3,
    href: '/admin/analytics',
    description: 'Relatórios e estatísticas',
  },
  {
    id: 'demo',
    label: 'Demo Permissões',
    icon: Shield,
    href: '/admin/demo',
    description: 'Demonstração do sistema de permissões',
  },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const { user } = useUser()

  // Redirect se não for admin
  if (user?.role !== 'admin') {
    return (
      <PageLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" />
                Acesso Negado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Você não tem permissão para acessar esta área administrativa.
              </p>
              <Link href="/">
                <Button className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    )
  }

  const isMainAdminPage = pathname === '/admin'

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/admin" className="hover:text-foreground">
            Admin
          </Link>
          {!isMainAdminPage && pathname !== '/admin' && (
            <>
              <span>/</span>
              <span className="text-foreground">
                {adminMenuItems.find(item => pathname.startsWith(item.href))?.label || 'Página'}
              </span>
            </>
          )}
        </div>

        {/* Admin Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Painel Administrativo</h1>
              <p className="text-sm text-muted-foreground">
                Bem-vindo, {user?.name || 'Admin'}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            <Shield className="mr-1 h-3 w-3" />
            Administrator
          </Badge>
        </div>

        {/* Navigation Menu (para subpáginas) */}
        {!isMainAdminPage && (
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2 overflow-x-auto">
                {adminMenuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || 
                    (item.href !== '/admin' && pathname.startsWith(item.href))

                  return (
                    <Link key={item.id} href={item.href}>
                      <Button
                        variant={isActive ? 'default' : 'ghost'}
                        size="sm"
                        className="flex-shrink-0"
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content */}
        {children}
      </div>
    </PageLayout>
  )
}
