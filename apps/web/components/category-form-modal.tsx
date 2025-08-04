'use client'

import {
  Book,
  Briefcase,
  Building,
  Camera,
  Car,
  Clock,
  Coffee,
  CreditCard,
  DollarSign,
  Dumbbell,
  FileText,
  Fuel,
  Gamepad2,
  Gift,
  GraduationCap,
  Heart,
  Home,
  MapPin,
  Monitor,
  Moon,
  Music,
  PiggyBank,
  Plane,
  Plus,
  Scissors,
  Settings,
  Shirt,
  ShoppingCart,
  Smartphone,
  Star,
  Stethoscope,
  Sun,
  Trash2,
  TrendingUp,
  Truck,
  User,
  Utensils,
  Wallet,
  Wifi,
  Wrench,
  Zap,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'

import { Category, CategoryFormData } from '@/lib/types'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion'
import { Button } from './ui/button'
import { ConfirmationDialog } from './ui/confirmation-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

interface CategoryFormModalProps {
  isOpen: boolean
  onClose: () => void
  category?: Category
  onSubmit: (data: CategoryFormData) => void
  onDelete?: (id: string) => void
  categories: Category[]
  categoryType?: 'income' | 'expense'
  parentCategory?: Category
}

const PRESET_COLORS = [
  // Primeira linha
  '#E91E63',
  '#673AB7',
  '#3F51B5',
  '#2196F3',
  '#9C27B0',
  '#F44336',
  '#FF5722',
  '#3F51B5',
  '#4CAF50',
  '#FF9800',
  '#E91E63',
  // Segunda linha
  '#4CAF50',
  '#FF5722',
  '#FF9800',
  '#795548',
  '#2196F3',
  '#9E9E9E',
  '#009688',
  '#00695C',
  '#80CBC4',
  '#F44336',
]

const PRESET_ICONS = [
  // Primeira linha - Essenciais
  { icon: Home, name: 'Casa' },
  { icon: Heart, name: 'Saúde' },
  { icon: Car, name: 'Carro' },
  { icon: ShoppingCart, name: 'Compras' },
  { icon: Coffee, name: 'Café' },
  { icon: Utensils, name: 'Alimentação' },
  { icon: User, name: 'Pessoa' },
  { icon: DollarSign, name: 'Dinheiro' },
  { icon: Star, name: 'Favorito' },
  { icon: Plus, name: 'Adicionar' },
  // Segunda linha - Trabalho e Tecnologia
  { icon: Briefcase, name: 'Trabalho' },
  { icon: Monitor, name: 'Tecnologia' },
  { icon: FileText, name: 'Documentos' },
  { icon: CreditCard, name: 'Cartão' },
  { icon: Smartphone, name: 'Celular' },
  { icon: Wifi, name: 'Internet' },
  { icon: Settings, name: 'Configurações' },
  { icon: Clock, name: 'Tempo' },
  { icon: MapPin, name: 'Local' },
  { icon: Wrench, name: 'Ferramentas' },
  // Terceira linha - Entretenimento e Lazer
  { icon: Gamepad2, name: 'Jogos' },
  { icon: Book, name: 'Livros' },
  { icon: Music, name: 'Música' },
  { icon: Camera, name: 'Fotografia' },
  { icon: Plane, name: 'Viagem' },
  { icon: Gift, name: 'Presentes' },
  { icon: Sun, name: 'Dia' },
  { icon: Moon, name: 'Noite' },
  { icon: Truck, name: 'Transporte' },
  { icon: Fuel, name: 'Combustível' },
  // Quarta linha - Saúde e Educação
  { icon: Stethoscope, name: 'Médico' },
  { icon: Dumbbell, name: 'Academia' },
  { icon: GraduationCap, name: 'Educação' },
  { icon: Shirt, name: 'Roupas' },
  { icon: Scissors, name: 'Beleza' },
  { icon: PiggyBank, name: 'Poupança' },
  { icon: TrendingUp, name: 'Investimentos' },
  { icon: Wallet, name: 'Carteira' },
  { icon: Building, name: 'Imóveis' },
  { icon: Zap, name: 'Energia' },
]

export function CategoryFormModal({
  isOpen,
  onClose,
  category,
  onSubmit,
  onDelete,
  categories,
  categoryType = 'expense',
  parentCategory,
}: CategoryFormModalProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: category?.name || '',
    color: category?.color || PRESET_COLORS[0],
    type: category?.type || categoryType,
    parentId: category?.parentId || parentCategory?.id,
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [categoryMode, setCategoryMode] = useState<'main' | 'sub'>(
    category?.parentId || parentCategory ? 'sub' : 'main',
  )
  const [selectedIcon, setSelectedIcon] = useState(PRESET_ICONS[0])

  // Resetar formData quando as props mudarem
  useEffect(() => {
    setFormData({
      name: category?.name || '',
      color: category?.color || PRESET_COLORS[0],
      type: category?.type || categoryType,
      parentId: category?.parentId || parentCategory?.id,
    })
    setCategoryMode(category?.parentId || parentCategory ? 'sub' : 'main')
    setSelectedIcon(PRESET_ICONS[0])
  }, [category, categoryType, parentCategory])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      // TODO: Implementar toast para mostrar erro
      console.error('Por favor, digite o nome da categoria.')
      return
    }

    // Verificar se já existe uma categoria com o mesmo nome (exceto a atual)
    const existingCategory = categories.find(
      (cat) =>
        cat.name.toLowerCase() === formData.name.toLowerCase() &&
        cat.id !== category?.id,
    )

    if (existingCategory) {
      // TODO: Implementar toast para mostrar erro
      console.error('Já existe uma categoria com este nome.')
      return
    }

    onSubmit(formData)
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      name: '',
      color: PRESET_COLORS[0],
      type: categoryType,
      parentId: parentCategory?.id,
    })
    setCategoryMode('main')
    setSelectedIcon(PRESET_ICONS[0])
    onClose()
  }

  const handleDelete = () => {
    if (category && onDelete) {
      setShowDeleteConfirm(true)
    }
  }

  const confirmDelete = () => {
    if (category && onDelete) {
      onDelete(category.id)
      handleClose()
    }
  }

  // Filtrar categorias principais para o dropdown de subcategoria
  const mainCategories = categories.filter(
    (cat) => !cat.parentId && cat.type === categoryType,
  )

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-xl font-semibold">
              Criando categoria de despesa
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleção do tipo de categoria */}
            <div className="space-y-4">
              <RadioGroup
                value={categoryMode}
                onValueChange={(value: 'main' | 'sub') => {
                  setCategoryMode(value)
                  setFormData({
                    ...formData,
                    parentId: value === 'main' ? undefined : formData.parentId,
                  })
                }}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="main" id="main" />
                  <Label
                    htmlFor="main"
                    className="cursor-pointer text-sm font-medium"
                  >
                    Categoria principal
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sub" id="sub" />
                  <Label
                    htmlFor="sub"
                    className="cursor-pointer text-sm font-medium"
                  >
                    Subcategoria
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Avatar/Ícone da categoria - apenas para categoria principal */}
            {categoryMode === 'main' && (
              <div className="flex items-center gap-4 duration-300 animate-in fade-in-0 slide-in-from-top-2">
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-full text-white transition-all duration-300"
                  style={{ backgroundColor: formData.color }}
                >
                  {selectedIcon &&
                    React.createElement(selectedIcon.icon, {
                      className: 'w-10 h-10 transition-all duration-300',
                    })}
                </div>
                <div className="flex-1 space-y-3">
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
                      className="mt-1 transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Nome da subcategoria - apenas para subcategoria */}
            {categoryMode === 'sub' && (
              <div className="duration-300 animate-in fade-in-0 slide-in-from-top-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nome da subcategoria
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Digite o nome da subcategoria"
                  className="mt-1 transition-all duration-200"
                  required
                />
              </div>
            )}

            {/* Seletor de ícones - apenas para categoria principal */}
            {categoryMode === 'main' && (
              <div className="delay-100 duration-500 animate-in fade-in-0 slide-in-from-bottom-2">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="icons">
                    <AccordionTrigger className="text-sm font-medium transition-all duration-200 hover:no-underline">
                      Escolha um ícone
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-10 gap-2 rounded-lg bg-muted p-4">
                        {PRESET_ICONS.map((icon, index) => {
                          const IconComponent = icon.icon
                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setSelectedIcon(icon)}
                              className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:scale-105 hover:bg-background ${
                                selectedIcon === icon
                                  ? 'scale-105 bg-background shadow-md'
                                  : 'bg-muted-foreground/10'
                              }`}
                              title={icon.name}
                            >
                              <IconComponent className="h-5 w-5 text-muted-foreground transition-all duration-200" />
                            </button>
                          )
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}

            {/* Seletor de cores - apenas para categoria principal */}
            {categoryMode === 'main' && (
              <div className="delay-200 duration-500 animate-in fade-in-0 slide-in-from-bottom-2">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="colors">
                    <AccordionTrigger className="text-sm font-medium transition-all duration-200 hover:no-underline">
                      Escolha uma cor
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 rounded-lg bg-muted p-4">
                        {/* Primeira linha de cores */}
                        <div className="flex justify-center gap-2">
                          {PRESET_COLORS.slice(0, 11).map((color, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() =>
                                setFormData({ ...formData, color })
                              }
                              className={`h-8 w-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                                formData.color === color
                                  ? 'scale-110 border-foreground shadow-lg'
                                  : 'border-transparent'
                              }`}
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                        {/* Segunda linha de cores */}
                        <div className="flex justify-center gap-2">
                          {PRESET_COLORS.slice(11, 21).map((color, index) => (
                            <button
                              key={index + 11}
                              type="button"
                              onClick={() =>
                                setFormData({ ...formData, color })
                              }
                              className={`h-8 w-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                                formData.color === color
                                  ? 'scale-110 border-foreground shadow-lg'
                                  : 'border-transparent'
                              }`}
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}

            {/* Seleção de categoria pai para subcategorias */}
            {categoryMode === 'sub' && (
              <div className="space-y-2 delay-100 duration-500 animate-in fade-in-0 slide-in-from-bottom-2">
                <Label className="text-sm font-medium">Categoria pai</Label>
                <Select
                  value={formData.parentId || ''}
                  onValueChange={(value) =>
                    setFormData({ ...formData, parentId: value })
                  }
                >
                  <SelectTrigger className="w-full transition-all duration-200">
                    <SelectValue placeholder="Selecione a categoria pai" />
                  </SelectTrigger>
                  <SelectContent>
                    {mainCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded-full transition-all duration-200"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Footer com botões */}
            <div className="flex justify-end gap-3 pt-6">
              {category && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  className="h-12 px-4"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                type="submit"
                className="h-12 bg-primary px-8 transition-all duration-200 hover:scale-105 hover:bg-primary/90"
                disabled={
                  !formData.name.trim() ||
                  (categoryMode === 'sub' && !formData.parentId)
                }
              >
                {category
                  ? `Atualizar ${categoryMode === 'main' ? 'categoria' : 'subcategoria'}`
                  : `Criar ${categoryMode === 'main' ? 'categoria' : 'subcategoria'}`}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Excluir Categoria"
        description="Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />
    </>
  )
}
