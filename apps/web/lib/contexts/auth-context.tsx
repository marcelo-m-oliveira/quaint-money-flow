'use client'

import React, { createContext, useContext } from 'react'

import { useAuth } from '@/lib/hooks/use-auth'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: any
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth()

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
