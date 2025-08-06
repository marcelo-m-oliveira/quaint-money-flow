'use client'

import { useTheme as useNextTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const setDarkTheme = () => setTheme('dark')
  const setLightTheme = () => setTheme('light')

  // Evita hidratação mismatch
  if (!mounted) {
    return {
      theme: undefined,
      isLoading: true,
      toggleTheme: () => {},
      setDarkTheme: () => {},
      setLightTheme: () => {},
      isDark: false,
      isLight: false,
    }
  }

  return {
    theme: resolvedTheme,
    isLoading: false,
    toggleTheme,
    setDarkTheme,
    setLightTheme,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
  }
}
