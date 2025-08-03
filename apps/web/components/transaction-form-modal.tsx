'use client'

import { Calendar, Check, Save } from 'lucide-react'
import { useState } from 'react'

import { formatDateForInput } from '@/lib/format'
import { Category, Transaction, TransactionFormData } from '@/lib/types'

import { Button } from './ui/button'
import { CurrencyInput } from './ui/currency-input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

interface TransactionFormModalProps {
  isOpen: boolean
  onClose: () => void
  transaction?: Transaction
  onSubmit: (data: TransactionFormData, shouldClose?: boolean) => void
  categories: Category[]
  type: 'income' | 'expense'
  title: string
}

export function TransactionFormModal({
  isOpen,
  onClose,
  transaction,
  onSubmit,
  categories,
  type,
  title,
}: TransactionFormModalProps) {
  const [formData, setFormData] = useState<TransactionFormData>({
    description: transaction?.description || '',
    amount: transaction?.amount.toString() || '',
    type: transaction?.type || type,
    categoryId: transaction?.categoryId || '',
    date: transaction
      ? formatDateForInput(transaction.date)
      : formatDateForInput(new Date()),
  })

  const handleSubmit = (e: React.FormEvent, shouldCreateAnother = false) => {
    e.preventDefault()
    if (!formData.description || !formData.amount || !formData.categoryId) {
      // TODO: Implementar toast para mostrar erro
      console.error('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    // Passa shouldClose baseado em shouldCreateAnother
    const shouldClose = !shouldCreateAnother
    onSubmit(formData, shouldClose)

    // Sempre limpa o formulário após salvar
    setFormData({
      description: '',
      amount: '',
      type,
      categoryId: '',
      date: formatDateForInput(new Date()),
    })
  }

  const handleClose = () => {
    setFormData({
      description: '',
      amount: '',
      type,
      categoryId: '',
      date: formatDateForInput(new Date()),
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descrição
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Digite a descrição..."
              className="h-12"
              required
            />
          </div>

          {/* Valor e Data */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">
                Valor
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  R$
                </span>
                <CurrencyInput
                  id="amount"
                  value={formData.amount}
                  onChange={(value) =>
                    setFormData({ ...formData, amount: value })
                  }
                  className="h-12 pl-10"
                  placeholder="0,00"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium">
                Data
              </Label>
              <div className="relative">
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="h-12 pr-10"
                  required
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Categoria
            </Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) =>
                setFormData({ ...formData, categoryId: value })
              }
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Buscar a categoria..." />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter((category) => {
                    // Filtrar categorias baseado no tipo de transação
                    const incomeCategories = ['Salário', 'Freelance']
                    const expenseCategories = [
                      'Alimentação',
                      'Moradia',
                      'Transporte',
                    ]

                    if (type === 'income') {
                      return incomeCategories.includes(category.name)
                    } else {
                      return expenseCategories.includes(category.name)
                    }
                  })
                  .map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Footer com botões */}
          <div className="flex gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-12"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              className="h-12 px-4 bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Salvar e criar outra
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
