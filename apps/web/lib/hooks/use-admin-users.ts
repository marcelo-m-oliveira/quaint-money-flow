import { useCallback, useEffect, useState } from 'react'

import { useCrudToast } from '@/lib/hooks/use-crud-toast'
import { type AdminUser, adminUsersService } from '@/lib/services/admin'

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { success, error: showError } = useCrudToast()

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await adminUsersService.getAll()
      setUsers(response.users || [])
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro ao carregar usuários'
      setError(errorMessage)
      showError.general(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const createUser = useCallback(
    async (data: Partial<AdminUser>): Promise<AdminUser | null> => {
      try {
        setError(null)
        const newUser = await adminUsersService.create(data)
        setUsers((prev) => [...prev, newUser])
        success.create('usuário')
        return newUser
      } catch (err: any) {
        const errorMessage = err?.message || 'Erro ao criar usuário'
        setError(errorMessage)
        showError.create('usuário', errorMessage)
        return null
      }
    },
    [],
  )

  const updateUser = useCallback(
    async (id: string, data: Partial<AdminUser>): Promise<AdminUser | null> => {
      try {
        setError(null)
        const updatedUser = await adminUsersService.update(id, data)
        setUsers((prev) =>
          prev.map((user) => (user.id === id ? updatedUser : user)),
        )
        success.update('usuário')
        return updatedUser
      } catch (err: any) {
        const errorMessage = err?.message || 'Erro ao atualizar usuário'
        setError(errorMessage)
        showError.update('usuário', errorMessage)
        return null
      }
    },
    [],
  )

  const deleteUser = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null)
      await adminUsersService.delete(id)
      setUsers((prev) => prev.filter((user) => user.id !== id))
      success.delete('usuário')
      return true
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro ao excluir usuário'
      setError(errorMessage)
      showError.delete('usuário', errorMessage)
      return false
    }
  }, [])

  const changeUserPassword = useCallback(
    async (id: string, password: string): Promise<boolean> => {
      try {
        setError(null)
        await adminUsersService.changePassword(id, password)
        success.update('senha do usuário')
        return true
      } catch (err: any) {
        const errorMessage = err?.message || 'Erro ao alterar senha'
        setError(errorMessage)
        showError.update('senha', errorMessage)
        return false
      }
    },
    [],
  )

  const changeUserPlan = useCallback(
    async (id: string, planId: string): Promise<boolean> => {
      try {
        setError(null)
        await adminUsersService.changePlan(id, planId)
        // Recarregar usuários para atualizar o plano
        await loadUsers()
        success.update('plano do usuário')
        return true
      } catch (err: any) {
        const errorMessage = err?.message || 'Erro ao alterar plano'
        setError(errorMessage)
        showError.update('plano', errorMessage)
        return false
      }
    },
    [loadUsers],
  )

  const toggleUserActive = useCallback(
    async (id: string, isActive: boolean): Promise<boolean> => {
      try {
        setError(null)
        await adminUsersService.toggleActive(id, isActive)
        // Recarregar usuários para atualizar o status
        await loadUsers()
        success.update('status do usuário')
        return true
      } catch (err: any) {
        const errorMessage = err?.message || 'Erro ao alterar status do usuário'
        setError(errorMessage)
        showError.update('status do usuário', errorMessage)
        return false
      }
    },
    [loadUsers],
  )

  const getUserById = useCallback(
    (id: string) => users.find((user) => user.id === id),
    [users],
  )

  const refetch = useCallback(() => {
    return loadUsers()
  }, [loadUsers])

  return {
    users,
    isLoading,
    error,
    createUser,
    updateUser,
    deleteUser,
    changeUserPassword,
    changeUserPlan,
    toggleUserActive,
    getUserById,
    refetch,
  }
}
