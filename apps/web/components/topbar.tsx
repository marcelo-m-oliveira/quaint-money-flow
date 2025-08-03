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
import { useState } from 'react'

import { useTheme } from '@/lib/hooks/use-theme'

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
  const { toggleTheme, isDark } = useTheme()
  const [userName] = useState('Marcelo Oliveira')
  const [userInitials] = useState('MO')

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo e Título */}
          <div className="flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Quaint Money</h1>
          </div>

          {/* Menu de Navegação Central */}
          <nav className="hidden md:flex items-center gap-6">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Dashboard
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Transações
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Relatórios
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Metas
            </Button>
          </nav>

          {/* Menu de Ações */}
          <div className="flex items-center gap-4">
            {/* Menu de Configurações */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={toggleTheme}>
                  {isDark ? (
                    <Sun className="mr-2 h-4 w-4" />
                  ) : (
                    <Moon className="mr-2 h-4 w-4" />
                  )}
                  <span>{isDark ? 'Tema Claro' : 'Tema Escuro'}</span>
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
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Menu do Usuário */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={userName} />
                    <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium text-foreground">{userName}</span>
                    <span className="text-xs text-muted-foreground">Plano Gratuito</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
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
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
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
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Transações</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Relatórios</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Metas</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
