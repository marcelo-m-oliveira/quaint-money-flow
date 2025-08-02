'use client'

import { useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

const THEME_STORAGE_KEY = 'quaint-money-theme'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTheme = () => {
      try {
        const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme
        if (
          storedTheme &&
          (storedTheme === 'dark' || storedTheme === 'light')
        ) {
          setTheme(storedTheme)
        } else {
          // Default para dark mode
          setTheme('dark')
          localStorage.setItem(THEME_STORAGE_KEY, 'dark')
        }
      } catch (error) {
        console.error('Erro ao carregar tema:', error)
        setTheme('dark')
      } finally {
        setIsLoading(false)
      }
    }

    loadTheme()
  }, [])

  useEffect(() => {
    if (!isLoading) {
      const root = document.documentElement

      if (theme === 'dark') {
        root.classList.add('dark')
        root.classList.remove('light')
      } else {
        root.classList.add('light')
        root.classList.remove('dark')
      }

      localStorage.setItem(THEME_STORAGE_KEY, theme)
    }
  }, [theme, isLoading])

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'))
  }

  const setDarkTheme = () => setTheme('dark')
  const setLightTheme = () => setTheme('light')

  return {
    theme,
    isLoading,
    toggleTheme,
    setDarkTheme,
    setLightTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  }
}
