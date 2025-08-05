'use client'

import { format, isValid, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  required?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Selecione uma data',
  className,
  disabled,
  required,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState('')
  const [inputDate, setInputDate] = React.useState<Date | undefined>(value)

  // Sincroniza o valor do input com a data selecionada
  React.useEffect(() => {
    if (value) {
      setInputValue(format(value, 'dd/MM/yyyy'))
      setInputDate(value)
    } else {
      setInputValue('')
      setInputDate(undefined)
    }
  }, [value])

  // Função para validar e converter string para data
  const parseInputDate = (input: string): Date | undefined => {
    // Remove caracteres não numéricos
    const cleanInput = input.replace(/\D/g, '')

    if (cleanInput.length === 8) {
      // Formato: ddmmaaaa
      const day = cleanInput.slice(0, 2)
      const month = cleanInput.slice(2, 4)
      const year = cleanInput.slice(4, 8)

      try {
        const dateString = `${day}/${month}/${year}`
        const parsedDate = parse(dateString, 'dd/MM/yyyy', new Date())

        if (isValid(parsedDate)) {
          return parsedDate
        }
      } catch {
        return undefined
      }
    }

    return undefined
  }

  // Formatar input enquanto digita
  const formatInput = (input: string): string => {
    const cleanInput = input.replace(/\D/g, '')

    if (cleanInput.length <= 2) {
      return cleanInput
    } else if (cleanInput.length <= 4) {
      return `${cleanInput.slice(0, 2)}/${cleanInput.slice(2)}`
    } else if (cleanInput.length <= 8) {
      return `${cleanInput.slice(0, 2)}/${cleanInput.slice(2, 4)}/${cleanInput.slice(4, 8)}`
    }

    return `${cleanInput.slice(0, 2)}/${cleanInput.slice(2, 4)}/${cleanInput.slice(4, 8)}`
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    const formattedInput = formatInput(input)
    setInputValue(formattedInput)

    // Tenta fazer parse da data se o input estiver completo
    if (formattedInput.length === 10) {
      const parsedDate = parseInputDate(formattedInput)
      if (parsedDate) {
        setInputDate(parsedDate)
        onChange?.(parsedDate)
      }
    }
  }

  const handleInputBlur = () => {
    if (inputValue.length === 10) {
      const parsedDate = parseInputDate(inputValue)
      if (parsedDate) {
        setInputDate(parsedDate)
        onChange?.(parsedDate)
      } else {
        // Se a data não for válida, limpa o input
        setInputValue('')
        setInputDate(undefined)
        onChange?.(undefined)
      }
    } else if (inputValue.length === 0) {
      setInputDate(undefined)
      onChange?.(undefined)
    }
  }

  const handleCalendarSelect = (date: Date | undefined) => {
    setInputDate(date)
    onChange?.(date)
    setOpen(false)

    if (date) {
      setInputValue(format(date, 'dd/MM/yyyy'))
    } else {
      setInputValue('')
    }
  }

  return (
    <div className={cn('relative', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder={placeholder}
              disabled={disabled}
              required={required}
              className={cn('pr-10', className)}
              maxLength={10}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setOpen(!open)}
              disabled={disabled}
            >
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={inputDate}
            onSelect={handleCalendarSelect}
            locale={ptBR}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
