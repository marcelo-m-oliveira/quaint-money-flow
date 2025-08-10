'use client'

import {
  Bell,
  ChevronDown,
  CreditCard,
  DollarSign,
  LogOut,
  Moon,
  MoreHorizontal,
  Settings,
  Sun,
  Tag,
  User,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

export function Topbar() {
  const { setTheme } = useTheme()
  const [userName] = useState('Marcelo Oliveira')
  const [userInitials] = useState('MO')

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo e Título */}
          <div className="flex min-w-0 items-center gap-2">
            <DollarSign className="h-6 w-6 flex-shrink-0 text-primary" />
            <h1 className="truncate text-lg font-bold text-foreground sm:text-xl lg:text-2xl">
              Quaint Money
            </h1>
          </div>

          {/* Menu de Navegação Central */}
          <nav className="hidden items-center gap-2 lg:flex xl:gap-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Visão Geral
              </Button>
            </Link>
            <Link href="/transacoes">
              <Button
                variant="ghost"
                size="sm"
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Lancamentos
              </Button>
            </Link>
            <Link href="/relatorios">
              <Button
                variant="ghost"
                size="sm"
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Relatórios
              </Button>
            </Link>
            <Link href="/metas">
              <Button
                variant="ghost"
                size="sm"
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Metas
              </Button>
            </Link>
          </nav>

          {/* Menu de Ações */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Menu de Configurações */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Tema</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Claro</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Escuro</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Sistema</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <Link href="/configuracoes/categorias">
                  <DropdownMenuItem>
                    <Tag className="mr-2 h-4 w-4" />
                    <span>Categorias</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/configuracoes/contas">
                  <DropdownMenuItem>
                    <DollarSign className="mr-2 h-4 w-4" />
                    <span>Contas</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/configuracoes/cartoes">
                  <DropdownMenuItem>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Cartões de crédito</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <Link href="/configuracoes/preferencias">
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Preferências</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/configuracoes/plano">
                  <DropdownMenuItem>
                    <Zap className="mr-2 h-4 w-4" />
                    <span>Meu Plano</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/configuracoes/tags">
                  <DropdownMenuItem>
                    <Tag className="mr-2 h-4 w-4" />
                    <span>Tags</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/configuracoes/alertas">
                  <DropdownMenuItem>
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Alertas</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/configuracoes/atividades">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Atividades</span>
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Menu do Usuário */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex h-auto items-center gap-2 px-2 py-2"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src="" alt={userName} />
                    <AvatarFallback className="text-xs">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden flex-col items-start lg:flex">
                    <span className="text-sm font-medium leading-tight text-foreground">
                      {userName}
                    </span>
                    <span className="text-xs leading-tight text-muted-foreground">
                      Plano Gratuito
                    </span>
                  </div>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {userName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      marcelo@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <Link href="/configuracoes">
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem>
                  <Zap className="mr-2 h-4 w-4" />
                  <span>Upgrade</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Menu Mobile */}
            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="px-2">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <Link href="/">
                    <DropdownMenuItem>
                      <span>Visão Geral</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/transacoes">
                    <DropdownMenuItem>
                      <span>Transações</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/relatorios">
                    <DropdownMenuItem>
                      <span>Relatórios</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/metas">
                    <DropdownMenuItem>
                      <span>Metas</span>
                    </DropdownMenuItem>
                  </Link>
                  <div className="sm:hidden">
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <span>Mock Data</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
