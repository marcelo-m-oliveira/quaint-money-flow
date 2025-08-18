'use client'
import {
  getCsrfToken,
  signIn,
  signOut,
  useSession as useNextSession,
} from 'next-auth/react'

export function useSession() {
  const session = useNextSession()
  return session
}

export { signIn, signOut, getCsrfToken }
