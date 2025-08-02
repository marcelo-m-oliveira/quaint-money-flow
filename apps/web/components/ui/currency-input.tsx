'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

export interface CurrencyInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'value'
  > {
  value?: string
  onChange?: (value: string) => void
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value = '', onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState('')

    // Função para converter valor decimal para centavos
    const decimalToCents = (decimalValue: string): string => {
      if (!decimalValue || decimalValue === '0') return ''
      const numericValue = parseFloat(decimalValue)
      if (isNaN(numericValue)) return ''

      // Limite máximo de segurança: 12.345.678.900.000.000,00
      const MAX_VALUE_IN_REAIS = 12345678900000000
      if (numericValue > MAX_VALUE_IN_REAIS) return ''

      return Math.round(numericValue * 100).toString()
    }

    // Função para formatar valor em centavos para exibição
    const formatCentsToDisplay = (cents: string): string => {
      if (!cents) return ''
      const valueInCents = parseInt(cents, 10)
      const valueInReais = valueInCents / 100

      const reaisInteiros = Math.floor(valueInReais)
      const centavos = Math.round((valueInReais - reaisInteiros) * 100)

      const reaisFormatted = reaisInteiros.toLocaleString('pt-BR')
      const centavosFormatted = centavos.toString().padStart(2, '0')

      return `${reaisFormatted},${centavosFormatted}`
    }

    React.useEffect(() => {
      if (value) {
        const centsValue = decimalToCents(value)
        const formatted = formatCentsToDisplay(centsValue)
        setDisplayValue(formatted)
      } else {
        setDisplayValue('')
      }
    }, [value])

    const formatCurrency = (inputValue: string): string => {
      // Remove tudo que não é dígito
      const numericValue = inputValue.replace(/\D/g, '')

      if (!numericValue) return ''

      // Limite máximo de segurança: 12.345.678.900.000.000,00 (em centavos)
      const MAX_VALUE_IN_CENTS = 1234567890000000000

      // Converte para número
      const valueInCents = parseInt(numericValue, 10)

      // Verifica se é um número válido e dentro do limite
      if (isNaN(valueInCents) || valueInCents > MAX_VALUE_IN_CENTS) {
        return displayValue // Mantém o valor anterior se inválido ou exceder limite
      }

      const valueInReais = valueInCents / 100

      // Formata manualmente no padrão brasileiro
      const reaisInteiros = Math.floor(valueInReais)
      const centavos = Math.round((valueInReais - reaisInteiros) * 100)

      // Formata os reais com separadores de milhares
      const reaisFormatted = reaisInteiros.toLocaleString('pt-BR')

      // Garante que os centavos tenham sempre 2 dígitos
      const centavosFormatted = centavos.toString().padStart(2, '0')

      return `${reaisFormatted},${centavosFormatted}`
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value

      // Remove caracteres não numéricos
      const numericOnly = inputValue.replace(/\D/g, '')

      // Se está vazio, mantém vazio para mostrar placeholder
      if (!numericOnly) {
        setDisplayValue('')
        onChange?.('0')
        return
      }

      // Limite máximo de segurança: 12.345.678.900.000.000,00 (em centavos)
      const MAX_VALUE_IN_CENTS = 1234567890000000000
      const valueInCents = parseInt(numericOnly, 10)

      // Verifica se é um número válido e dentro do limite
      if (isNaN(valueInCents) || valueInCents > MAX_VALUE_IN_CENTS) {
        return // Mantém o valor atual se inválido ou exceder limite
      }

      const formatted = formatCurrency(numericOnly)
      setDisplayValue(formatted)

      // Converte para valor decimal (divide por 100)
      const finalValue = (valueInCents / 100).toString()
      onChange?.(finalValue)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Permite Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
        return
      }

      // Permite apenas números, backspace, delete, tab, escape, enter
      const allowedKeys = [
        'Backspace',
        'Delete',
        'Tab',
        'Escape',
        'Enter',
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Home',
        'End',
      ]

      if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key)) {
        e.preventDefault()
      }
    }

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
          R$
        </span>
        <input
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
            className,
          )}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="0,00"
          {...props}
        />
      </div>
    )
  },
)
CurrencyInput.displayName = 'CurrencyInput'

export { CurrencyInput }
