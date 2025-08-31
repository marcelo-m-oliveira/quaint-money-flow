'use client'

import {
  Crown,
  Edit,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react'
import React, { useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { UserEditModal } from '@/components/user-edit-modal'
import { useAdminUsers } from '@/lib'
import type { AdminUser } from '@/lib/services/admin'

export default function AdminUsersPage() {
  const {
    users,
    isLoading,
    error,
    deleteUser,
    changeUserPassword,
    changeUserPlan,
    updateUser,
    toggleUserActive,
    refetch,
  } = useAdminUsers()
  const [searchTerm, setSearchTerm] = useState('')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | undefined>()

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <Badge className="bg-purple-100 text-purple-800">
          <Shield className="mr-1 h-3 w-3" />
          Admin
        </Badge>
      )
    }
    return (
      <Badge variant="secondary">
        <UserCheck className="mr-1 h-3 w-3" />
        Usuário
      </Badge>
    )
  }

  const getPlanBadge = (plan: AdminUser['plan']) => {
    if (!plan) {
      return (
        <Badge variant="outline" className="text-gray-600">
          Sem Plano
        </Badge>
      )
    }

    const badgeColors = {
      free: 'bg-gray-100 text-gray-800',
      monthly: 'bg-blue-100 text-blue-800',
      annual: 'bg-green-100 text-green-800',
    }

    return (
      <Badge
        className={
          badgeColors[plan.type as keyof typeof badgeColors] ||
          'bg-gray-100 text-gray-800'
        }
      >
        <Crown className="mr-1 h-3 w-3" />
        {plan.name}
      </Badge>
    )
  }

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <div className="mr-1 h-2 w-2 rounded-full bg-green-500" />
          Ativo
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="border-red-200 text-red-600">
        <div className="mr-1 h-2 w-2 rounded-full bg-red-500" />
        Inativo
      </Badge>
    )
  }

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(timestamp * 1000))
  }

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user)
    setIsEditModalOpen(true)
  }

  const handleDeleteUser = async (userId: string) => {
    const success = await deleteUser(userId)
    if (success) {
      // Usuário já foi removido da lista pelo hook
    }
  }

  const handleSubmitEdit = async (data: {
    name: string
    email: string
    planId: string
    isActive: boolean
  }) => {
    if (!editingUser) return

    const updateData: Partial<AdminUser> = {
      name: data.name,
      email: data.email,
    }

    // Atualizar usuário
    const updatedUser = await updateUser(editingUser.id, updateData)
    if (updatedUser) {
      // Se o plano mudou, atualizar o plano
      if (data.planId !== editingUser.plan?.id) {
        if (data.planId && data.planId !== 'none') {
          await changeUserPlan(editingUser.id, data.planId)
        } else {
          // Remover plano (definir como null)
          await changeUserPlan(editingUser.id, '')
        }
      }

      // Se o status ativo mudou, atualizar o status
      if (data.isActive !== editingUser.isActive) {
        await toggleUserActive(editingUser.id, data.isActive)
      }
    }
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingUser(undefined)
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <Button onClick={refetch} className="mt-4">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
          <p className="text-muted-foreground">
            Visualize e gerencie todos os usuários do sistema
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-2">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{users.length}</div>
              <div className="text-sm text-muted-foreground">
                Total de Usuários
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {users.filter((u) => u.role === 'admin').length}
              </div>
              <div className="text-sm text-muted-foreground">
                Administradores
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuários ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="text-muted-foreground">
                Carregando usuários...
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <div className="mt-2 text-muted-foreground">
                {searchTerm
                  ? 'Nenhum usuário encontrado'
                  : 'Nenhum usuário cadastrado'}
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recursos</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatarUrl || ''} />
                          <AvatarFallback className="text-xs">
                            {getUserInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{user.name}</span>
                            {getRoleBadge(user.role)}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getPlanBadge(user.plan)}</TableCell>
                    <TableCell>{getStatusBadge(user.isActive)}</TableCell>
                    <TableCell>
                      {user._count && (
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div>{user._count.accounts} contas</div>
                          <div>{user._count.categories} categorias</div>
                          <div>{user._count.entries} lançamentos</div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de edição de usuário */}
      <UserEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        user={editingUser}
        onSubmit={handleSubmitEdit}
        onDelete={
          editingUser ? () => handleDeleteUser(editingUser.id) : undefined
        }
      />
    </div>
  )
}
