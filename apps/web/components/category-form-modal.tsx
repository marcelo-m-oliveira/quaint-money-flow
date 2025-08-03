'use client'

import { Palette, Save, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'

import { Category, CategoryFormData } from '@/lib/types'

import { Button } from './ui/button'
import { ConfirmationDialog } from './ui/confirmation-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'

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
  '#10B981', // Verde
  '#3B82F6', // Azul
  '#F59E0B', // Amarelo
  '#EF4444', // Vermelho
  '#8B5CF6', // Roxo
  '#F97316', // Laranja
  '#06B6D4', // Ciano
  '#84CC16', // Lima
  '#EC4899', // Rosa
  '#6B7280', // Cinza
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

  // Resetar formData quando as props mudarem
  useEffect(() => {
    setFormData({
      name: category?.name || '',
      color: category?.color || PRESET_COLORS[0],
      type: category?.type || categoryType,
      parentId: category?.parentId || parentCategory?.id,
    })
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold">
              {category ? 'Editar Categoria' : 
                parentCategory ? `Nova Subcategoria - ${parentCategory.name}` : 
                `Nova Categoria de ${categoryType === 'expense' ? 'Despesa' : 'Receita'}`
              }
            </DialogTitle>
            {parentCategory && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: parentCategory.color }}
                />
                <span>Categoria pai: {parentCategory.name}</span>
              </div>
            )}
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome da Categoria */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nome da Categoria
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Digite o nome da categoria..."
                className="h-12"
                required
              />
            </div>

            {/* Cor da Categoria */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Cor da Categoria
              </Label>
              <div className="grid grid-cols-5 gap-3">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-12 h-12 rounded-lg border-2 transition-all hover:scale-110 ${
                      formData.color === color
                        ? 'border-foreground shadow-lg'
                        : 'border-border hover:border-foreground/50'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>

              {/* Input de cor customizada */}
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="w-12 h-8 rounded border border-border cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">
                  Ou escolha uma cor personalizada
                </span>
              </div>
            </div>

            {/* Preview da Categoria */}
            <div className="p-4 bg-muted rounded-lg">
              <Label className="text-sm font-medium mb-2 block">
                Visualização
              </Label>
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: formData.color }}
                />
                <span className="font-medium">
                  {formData.name || 'Nome da categoria'}
                </span>
              </div>
            </div>

            {/* Footer com botões */}
            <div className="flex gap-3 pt-6">
              {category && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  className="h-12 px-4"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 h-12"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 bg-primary hover:bg-primary/90"
              >
                <Save className="w-4 h-4 mr-2" />
                {category ? 'Atualizar' : 'Criar'}
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
