'use client'

import { Edit, FolderPlus, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { CategoryFormModal } from '@/components/category-form-modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useFinancialData } from '@/lib/hooks/use-financial-data'
import { Category, CategoryFormData } from '@/lib/types'

export default function CategoriasPage() {
  const { categories, addCategory, updateCategory, deleteCategory } =
    useFinancialData()

  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense')
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | undefined>()
  const [categoryType, setCategoryType] = useState<'income' | 'expense'>(
    'expense',
  )
  const [parentCategory, setParentCategory] = useState<Category | undefined>()
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    description: string
    onConfirm: () => void
  }>({ isOpen: false, title: '', description: '', onConfirm: () => {} })

  // Filtrar categorias por tipo
  const expenseCategories = categories.filter((cat) => cat.type === 'expense')
  const incomeCategories = categories.filter((cat) => cat.type === 'income')

  // Separar categorias principais e subcategorias
  const getMainCategories = (categoryList: Category[]) =>
    categoryList.filter((cat) => !cat.parentId)

  const getSubCategories = (categoryList: Category[], parentId: string) =>
    categoryList.filter((cat) => cat.parentId === parentId)

  const handleAddCategory = (type: 'income' | 'expense', parent?: Category) => {
    setEditingCategory(undefined)
    setCategoryType(type)
    setParentCategory(parent)
    setIsCategoryFormOpen(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setCategoryType(category.type)

    // Se for uma subcategoria, precisamos encontrar e definir a categoria pai
    if (category.parentId) {
      const parent = categories.find((cat) => cat.id === category.parentId)
      setParentCategory(parent)
    } else {
      setParentCategory(undefined)
    }

    setIsCategoryFormOpen(true)
  }

  const handleDeleteCategory = (category: Category) => {
    // Verificar se há subcategorias
    const hasSubcategories = categories.some(
      (cat) => cat.parentId === category.id,
    )

    if (hasSubcategories) {
      setConfirmDialog({
        isOpen: true,
        title: 'Categoria possui subcategorias',
        description:
          'Esta categoria possui subcategorias. Ao excluí-la, todas as subcategorias também serão removidas. Deseja continuar?',
        onConfirm: () => {
          // Deletar categoria e suas subcategorias
          const subcategories = categories.filter(
            (cat) => cat.parentId === category.id,
          )
          subcategories.forEach((sub) => deleteCategory(sub.id))
          deleteCategory(category.id)
          setConfirmDialog({ ...confirmDialog, isOpen: false })
        },
      })
    } else {
      setConfirmDialog({
        isOpen: true,
        title: 'Excluir categoria',
        description:
          'Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.',
        onConfirm: () => {
          deleteCategory(category.id)
          setConfirmDialog({ ...confirmDialog, isOpen: false })
        },
      })
    }
  }

  const handleCategorySubmit = (data: CategoryFormData) => {
    // Não sobrescrever o parentId que vem do formulário
    // Isso garante que o status de subcategoria seja mantido
    const categoryData = {
      ...data,
      type: categoryType,
      // Usar o parentId que vem do formulário, ou o parentCategory.id se for uma nova subcategoria
      parentId:
        data.parentId !== undefined ? data.parentId : parentCategory?.id,
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, categoryData)
    } else {
      addCategory(categoryData)
    }

    setIsCategoryFormOpen(false)
    setEditingCategory(undefined)
    setParentCategory(undefined)
  }

  const renderCategoryList = (categoryList: Category[]) => {
    const mainCategories = getMainCategories(categoryList)

    return (
      <div className="space-y-4">
        {mainCategories.map((category) => {
          const subcategories = getSubCategories(categoryList, category.id)

          return (
            <Card key={category.id} className="border border-border">
              <CardContent className="p-4">
                {/* Categoria Principal */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-4 w-4 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleAddCategory(category.type, category)
                            }
                            className="h-8 w-8 p-0"
                          >
                            <FolderPlus className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Adicionar subcategoria</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Editar categoria</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(category)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Excluir categoria</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                {/* Subcategorias */}
                {subcategories.length > 0 && (
                  <>
                    <Separator className="my-3" />
                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground">
                        Subcategorias:
                      </span>
                      {subcategories.map((subcategory) => (
                        <div
                          key={subcategory.id}
                          className="flex items-center justify-between pl-4"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="h-3 w-3 flex-shrink-0 rounded-full"
                              style={{ backgroundColor: subcategory.color }}
                            />
                            <span className="text-sm">{subcategory.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleEditCategory(subcategory)
                                    }
                                    className="h-6 w-6 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Editar subcategoria</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteCategory(subcategory)
                                    }
                                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Excluir subcategoria</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}

        {mainCategories.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            <p>Nenhuma categoria encontrada</p>
            <p className="text-sm">Clique em "Nova Categoria" para começar</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">
              Gerenciar Categorias
            </CardTitle>
            <Button
              onClick={() => handleAddCategory(activeTab)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Categoria
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Organize suas transações criando categorias e subcategorias
            personalizadas
          </p>
        </CardHeader>

        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as 'expense' | 'income')
            }
          >
            <TabsList className="mb-6 grid w-[400px] grid-cols-2">
              <TabsTrigger value="expense">Despesas</TabsTrigger>
              <TabsTrigger value="income">Receitas</TabsTrigger>
            </TabsList>

            <TabsContent value="expense" className="mt-0">
              {renderCategoryList(expenseCategories)}
            </TabsContent>

            <TabsContent value="income" className="mt-0">
              {renderCategoryList(incomeCategories)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal de Formulário de Categoria */}
      <CategoryFormModal
        isOpen={isCategoryFormOpen}
        onClose={() => {
          setIsCategoryFormOpen(false)
          setEditingCategory(undefined)
          setParentCategory(undefined)
        }}
        category={editingCategory}
        onSubmit={handleCategorySubmit}
        categories={categories}
        categoryType={categoryType}
        parentCategory={parentCategory}
      />

      {/* Dialog de Confirmação */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />
    </>
  )
}
