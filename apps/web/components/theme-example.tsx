'use client'

import { useTheme } from '@/lib/hooks/use-theme'

import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

/**
 * Componente de exemplo mostrando como usar o hook useTheme
 * Este componente pode ser removido após a implementação
 */
export function ThemeExample() {
  const {
    theme,
    isDark,
    isLight,
    toggleTheme,
    setDarkTheme,
    setLightTheme,
    isLoading,
  } = useTheme()

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="animate-pulse">Carregando tema...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Controle de Tema</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>
            Tema atual: <span className="font-medium">{theme}</span>
          </p>
          <p>
            É escuro:{' '}
            <span className="font-medium">{isDark ? 'Sim' : 'Não'}</span>
          </p>
          <p>
            É claro:{' '}
            <span className="font-medium">{isLight ? 'Sim' : 'Não'}</span>
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={toggleTheme} variant="outline">
            Alternar Tema
          </Button>
          <Button onClick={setDarkTheme} variant="outline">
            Tema Escuro
          </Button>
          <Button onClick={setLightTheme} variant="outline">
            Tema Claro
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
