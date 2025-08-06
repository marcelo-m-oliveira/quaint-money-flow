'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

import { Toggle } from './ui/toggle'

export function ThemeToggleExample() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Evita problemas de hidratação
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDark = theme === 'dark'

  return (
    <div className="flex flex-col gap-4 p-4">
      <h3 className="text-lg font-semibold">Exemplo de uso do Toggle</h3>

      {/* Toggle simples para tema */}
      <div className="flex items-center gap-2">
        <span className="text-sm">Tema escuro:</span>
        <Toggle
          pressed={isDark}
          onPressedChange={(pressed) => setTheme(pressed ? 'dark' : 'light')}
          aria-label="Alternar tema"
        >
          {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Toggle>
      </div>

      {/* Toggle com variantes */}
      <div className="space-y-2">
        <h4 className="text-md font-medium">Variantes do Toggle:</h4>

        <div className="flex items-center gap-2">
          <span className="w-20 text-sm">Default:</span>
          <Toggle aria-label="Toggle default">
            <Sun className="h-4 w-4" />
          </Toggle>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-20 text-sm">Outline:</span>
          <Toggle variant="outline" aria-label="Toggle outline">
            <Moon className="h-4 w-4" />
          </Toggle>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-20 text-sm">Small:</span>
          <Toggle size="sm" aria-label="Toggle small">
            <Sun className="h-4 w-4" />
          </Toggle>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-20 text-sm">Large:</span>
          <Toggle size="lg" aria-label="Toggle large">
            <Moon className="h-4 w-4" />
          </Toggle>
        </div>
      </div>

      {/* Estado atual do tema */}
      <div className="mt-4 rounded-md bg-muted p-3">
        <p className="text-sm">
          <strong>Tema atual:</strong> {theme}
        </p>
      </div>
    </div>
  )
}
