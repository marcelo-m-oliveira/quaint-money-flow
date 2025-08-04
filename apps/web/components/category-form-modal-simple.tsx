'use client'

import { Car, Heart, Home } from 'lucide-react'
import React, { useState } from 'react'

import { Category, CategoryFormData } from '@/lib/types'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'

interface CategoryFormModalProps {
  isOpen: boolean
  onClose: () => void
  category?: Category
  onSubmit: (data: CategoryFormData) => void
  categories: Category[]
  categoryType?: 'income' | 'expense'
  parentCategory?: Category
}

const SIMPLE_ICONS = [
  { icon: Home, name: 'Casa' },
  { icon: Heart, name: 'Saúde' },
  { icon: Car, name: 'Carro' },
]

const SIMPLE_COLORS = ['#E91E63', '#3F51B5', '#4CAF50']

export function CategoryFormModalSimple({
  isOpen,
  onClose,
  category,
  onSubmit,
  categoryType = 'expense',
}: CategoryFormModalProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: category?.name || '',
    color: category?.color || SIMPLE_COLORS[0],
    type: category?.type || categoryType,
    parentId: category?.parentId,
  })
  const [selectedIcon, setSelectedIcon] = useState(SIMPLE_ICONS[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Editar Categoria' : 'Nova Categoria'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome da categoria */}
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Nome da categoria
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Digite o nome da categoria"
              className="mt-1"
              required
            />
          </div>

          {/* Seletor de ícones */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="icons">
              <AccordionTrigger className="text-sm font-medium">
                Escolha um ícone
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted p-4">
                  {SIMPLE_ICONS.map((icon, index) => {
                    const IconComponent = icon.icon
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedIcon(icon)}
                        className={`flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-background ${
                          selectedIcon === icon
                            ? 'bg-background shadow-md'
                            : 'bg-muted-foreground/10'
                        }`}
                        title={icon.name}
                      >
                        <IconComponent className="h-5 w-5 text-muted-foreground" />
                      </button>
                    )
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Seletor de cores */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="colors">
              <AccordionTrigger className="text-sm font-medium">
                Escolha uma cor
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex justify-center gap-2 rounded-lg bg-muted p-4">
                  {SIMPLE_COLORS.map((color, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`h-8 w-8 rounded-full border-2 transition-all hover:scale-110 ${
                        formData.color === color
                          ? 'border-foreground shadow-lg'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Botões */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {category ? 'Atualizar' : 'Criar'} Categoria
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
