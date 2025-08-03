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

interface TopbarProps {
  onCategoriesClick?: () => void
}

export function Topbar({ onCategoriesClick }: TopbarProps) {
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
            <Button variant="ghost" className="text-sm font-medium">
              visão geral
            </Button>
            <Button variant="ghost" className="text-sm font-medium">
              lançamentos
            </Button>
            <Button variant="ghost" className="text-sm font-medium">
              relatórios
            </Button>
            <Button variant="ghost" className="text-sm font-medium">
              limite de gastos
            </Button>
            <Button variant="ghost" className="text-sm font-medium">
              conexão bancária
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
                <DropdownMenuItem onClick={onCategoriesClick}>
                  <Tag className="mr-2 h-4 w-4" />
                  <span>Categorias</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <DollarSign className="mr-2 h-4 w-4" />
                  <span>Contas</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Cartões de crédito</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Preferências</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Zap className="mr-2 h-4 w-4" />
                  <span>Meu Plano</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Tag className="mr-2 h-4 w-4" />
                  <span>Tags</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Alertas</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Atividades</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <MoreHorizontal className="mr-2 h-4 w-4" />
                  <span>mais opções</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notificações */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                3
              </span>
            </Button>

            {/* Menu do Usuário */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={userName} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium">
                    {userName}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
