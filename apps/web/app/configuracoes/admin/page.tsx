'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'

import { Can } from '@/components/permissions/can-component'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { PermissionsService } from '@/lib/services/permissions.service'
import { useUserRole } from '@/lib/hooks/use-permissions'

export default function AdminPage() {
  const { isAdmin } = useUserRole()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'USER' | 'PREMIUM' | 'ADMIN' | ''>('')
  const [isChangingRole, setIsChangingRole] = useState<string | null>(null)

  const { data: usersData, error, mutate } = useSWR(
    isAdmin ? 'users-list' : null,
    () => PermissionsService.listUsers({ 
      search: searchTerm || undefined,
      role: roleFilter || undefined,
      page: 1,
      limit: 50 
    }),
    { revalidateOnFocus: false }
  )

  const handleRoleChange = async (userId: string, newRole: 'USER' | 'PREMIUM' | 'ADMIN') => {
    try {
      setIsChangingRole(userId)
      await PermissionsService.changeUserRole(userId, newRole)
      toast.success('Papel do usuário alterado com sucesso')
      mutate() // Recarregar lista
    } catch (error) {
      toast.error('Erro ao alterar papel do usuário')
      console.error('Erro ao alterar papel:', error)
    } finally {
      setIsChangingRole(null)
    }
  }

  const getRoleBadge = (role: string) => {
    const variants = {
      ADMIN: 'destructive',
      PREMIUM: 'default',
      USER: 'secondary',
    } as const

    return (
      <Badge variant={variants[role as keyof typeof variants] || 'secondary'}>
        {role}
      </Badge>
    )
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('pt-BR')
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle data-testid="access-denied">Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta página.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Administração</h1>
        <p className="text-muted-foreground">
          Gerencie usuários e permissões do sistema
        </p>
      </div>

      <Can action="read" subject="User">
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Usuários</CardTitle>
            <CardDescription>
              Visualize e altere os papéis dos usuários do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Buscar usuários</Label>
                <Input
                  id="search"
                  data-testid="user-search-input"
                  placeholder="Nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="min-w-[150px]">
                <Label htmlFor="role-filter">Filtrar por papel</Label>
                <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="USER">Usuário</SelectItem>
                    <SelectItem value="PREMIUM">Premium</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={() => mutate()} variant="outline" data-testid="search-button">
                  Atualizar
                </Button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm">
                Erro ao carregar usuários: {error.message}
              </div>
            )}

            {usersData && (
              <div className="border rounded-lg">
                <Table data-testid="users-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Papel</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersData.users.map((user) => (
                      <TableRow key={user.id} data-testid={`user-row-${user.email}`}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell data-testid="role-badge">{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(newRole) => 
                              handleRoleChange(user.id, newRole as any)
                            }
                            disabled={isChangingRole === user.id}
                            data-testid="user-role-select"
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USER" data-testid="role-option-user">Usuário</SelectItem>
                              <SelectItem value="PREMIUM" data-testid="role-option-premium">Premium</SelectItem>
                              <SelectItem value="ADMIN" data-testid="role-option-admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {usersData.users.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum usuário encontrado
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </Can>
    </div>
  )
}