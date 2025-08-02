'use client'

import { useState } from 'react'
import { CurrencyInput } from './ui/currency-input'
import { Button } from './ui/button'

export function TestCurrency() {
  const [value, setValue] = useState('')
  const [testValues] = useState([
    '1234567.89',
    '123.45',
    '0.50',
    '1000000',
    '0.01'
  ])

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-bold">Teste do CurrencyInput</h2>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Valor atual:</label>
        <CurrencyInput
          value={value}
          onChange={setValue}
        />
        <p className="text-xs text-muted-foreground">
          Valor decimal: {value || '0'}
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Testar valores:</label>
        <div className="grid grid-cols-2 gap-2">
          {testValues.map((testValue, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => setValue(testValue)}
            >
              {testValue}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Button
          variant="outline"
          onClick={() => setValue('')}
          className="w-full"
        >
          Limpar
        </Button>
      </div>
    </div>
  )
}