'use client'

import { format, isValid, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon, Clock } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface DateTimePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  required?: boolean
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = 'Selecione data e hora',
  className,
  disabled,
  required,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState('')
  const [inputDate, setInputDate] = React.useState<Date | undefined>(value)
  const [selectedHour, setSelectedHour] = React.useState<string>('')
  const [selectedMinute, setSelectedMinute] = React.useState<string>('')

  // Sincroniza o valor do input com a data selecionada
  React.useEffect(() => {
    if (value) {
      setInputValue(format(value, 'dd/MM/yyyy HH:mm'))
      setInputDate(value)
      setSelectedHour(String(value.getHours()).padStart(2, '0'))
      setSelectedMinute(String(value.getMinutes()).padStart(2, '0'))
    } else {
      setInputValue('')
      setInputDate(undefined)
      setSelectedHour('')
      setSelectedMinute('')
    }
  }, [value])

  // Função para validar e converter string para data
  const parseInputDate = (input: string): Date | undefined => {
    // Remove caracteres não numéricos
    const cleanInput = input.replace(/\D/g, '')

    if (cleanInput.length === 12) {
      // Formato: ddmmaaaahhmm
      const day = cleanInput.slice(0, 2)
      const month = cleanInput.slice(2, 4)
      const year = cleanInput.slice(4, 8)
      const hour = cleanInput.slice(8, 10)
      const minute = cleanInput.slice(10, 12)

      try {
        const dateString = `${day}/${month}/${year} ${hour}:${minute}`
        const parsedDate = parse(dateString, 'dd/MM/yyyy HH:mm', new Date())

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
    } else if (cleanInput.length <= 10) {
      return `${cleanInput.slice(0, 2)}/${cleanInput.slice(2, 4)}/${cleanInput.slice(4, 8)} ${cleanInput.slice(8, 10)}`
    } else if (cleanInput.length <= 12) {
      return `${cleanInput.slice(0, 2)}/${cleanInput.slice(2, 4)}/${cleanInput.slice(4, 8)} ${cleanInput.slice(8, 10)}:${cleanInput.slice(10, 12)}`
    }

    return `${cleanInput.slice(0, 2)}/${cleanInput.slice(2, 4)}/${cleanInput.slice(4, 8)} ${cleanInput.slice(8, 10)}:${cleanInput.slice(10, 12)}`
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    const formattedInput = formatInput(input)
    setInputValue(formattedInput)

    // Tenta fazer parse da data se o input estiver completo
    if (formattedInput.length === 16) {
      const parsedDate = parseInputDate(formattedInput)
      if (parsedDate) {
        setInputDate(parsedDate)
        onChange?.(parsedDate)
      }
    }
  }

  const handleInputBlur = () => {
    if (inputValue.length === 16) {
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
    if (date) {
      // Mantém a hora atual se existir, senão usa 00:00
      const currentHour = selectedHour || '00'
      const currentMinute = selectedMinute || '00'

      const newDate = new Date(date)
      newDate.setHours(parseInt(currentHour), parseInt(currentMinute), 0, 0)

      setInputDate(newDate)
      onChange?.(newDate)
      setInputValue(format(newDate, 'dd/MM/yyyy HH:mm'))
    } else {
      setInputDate(undefined)
      onChange?.(undefined)
      setInputValue('')
    }
  }

  const handleTimeChange = (type: 'hour' | 'minute', value: string) => {
    if (!inputDate) return

    const newDate = new Date(inputDate)

    if (type === 'hour') {
      setSelectedHour(value)
      newDate.setHours(parseInt(value), newDate.getMinutes(), 0, 0)
    } else {
      setSelectedMinute(value)
      newDate.setHours(newDate.getHours(), parseInt(value), 0, 0)
    }

    setInputDate(newDate)
    onChange?.(newDate)
    setInputValue(format(newDate, 'dd/MM/yyyy HH:mm'))
  }

  // Gerar opções de hora (00-23)
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))

  // Gerar opções de minuto (00-59)
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, '0'),
  )

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
              maxLength={16}
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
          <div className="p-3">
            <Calendar
              mode="single"
              selected={inputDate}
              onSelect={handleCalendarSelect}
              locale={ptBR}
              initialFocus
            />

            {/* Seletor de hora */}
            <div className="mt-3 flex items-center gap-2 border-t pt-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Hora:</span>

              <Select
                value={selectedHour}
                onValueChange={(value) => handleTimeChange('hour', value)}
              >
                <SelectTrigger className="h-8 w-20">
                  <SelectValue placeholder="HH" />
                </SelectTrigger>
                <SelectContent>
                  {hours.map((hour) => (
                    <SelectItem key={hour} value={hour}>
                      {hour}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-sm">:</span>

              <Select
                value={selectedMinute}
                onValueChange={(value) => handleTimeChange('minute', value)}
              >
                <SelectTrigger className="h-8 w-20">
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent>
                  {minutes.map((minute) => (
                    <SelectItem key={minute} value={minute}>
                      {minute}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
