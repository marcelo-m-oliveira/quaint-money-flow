import { Category, PrismaClient } from '@prisma/client'

export const defaultCategories = {
  income: [
    { name: 'Salário', color: '#4CAF50', icon: 'Trabalho' },
    { name: 'Freelance', color: '#2196F3', icon: 'Dinheiro' },
    { name: 'Investimentos', color: '#673AB7', icon: 'Investimentos' },
    { name: 'Vendas', color: '#F44336', icon: 'Favorito' },
    { name: 'Outros Receitas', color: '#9E9E9E', icon: 'Adicionar' },
  ],
  expense: [
    { name: 'Alimentação', color: '#FF5722', icon: 'Alimentação' },
    { name: 'Supermercado', color: '#FF9800', icon: 'Compras' },
    { name: 'Transporte', color: '#009688', icon: 'Transporte' },
    { name: 'Moradia', color: '#3F51B5', icon: 'Casa' },
    { name: 'Saúde', color: '#E91E63', icon: 'Saúde' },
    { name: 'Educação', color: '#673AB7', icon: 'Educação' },
    { name: 'Lazer', color: '#9C27B0', icon: 'Jogos' },
    { name: 'Roupas', color: '#795548', icon: 'Roupas' },
    { name: 'Tecnologia', color: '#00695C', icon: 'Tecnologia' },
    { name: 'Outros Despesas', color: '#9E9E9E', icon: 'Adicionar' },
  ],
}

export async function createDefaultCategories(
  userId: string,
  prisma: PrismaClient,
) {
  const createdCategories: Category[] = []

  // Criar categorias de receita
  for (const category of defaultCategories.income) {
    const createdCategory = await prisma.category.create({
      data: {
        name: category.name,
        color: category.color,
        type: 'income',
        icon: category.icon,
        userId,
      },
    })
    createdCategories.push(createdCategory)
  }

  // Criar categorias de despesa
  for (const category of defaultCategories.expense) {
    const createdCategory = await prisma.category.create({
      data: {
        name: category.name,
        color: category.color,
        type: 'expense',
        icon: category.icon,
        userId,
      },
    })
    createdCategories.push(createdCategory)
  }

  return createdCategories
}
