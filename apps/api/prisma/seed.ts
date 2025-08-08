import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Criar usuário de exemplo
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Usuário Exemplo',
      password: '$2b$10$example.hash.for.development', // Hash de exemplo para desenvolvimento
    },
  })

  console.log('👤 User created:', user.email)

  // Criar categorias padrão de receita
  const incomeCategories = [
    { name: 'Salário', color: '#10B981', icon: 'salary' },
    { name: 'Freelance', color: '#3B82F6', icon: 'freelance' },
    { name: 'Investimentos', color: '#8B5CF6', icon: 'investment' },
    { name: 'Outros', color: '#6B7280', icon: 'other' },
  ]

  for (const category of incomeCategories) {
    await prisma.category.upsert({
      where: {
        id: user.id,
      },
      update: {},
      create: {
        id: user.id,
        name: category.name,
        color: category.color,
        type: 'income',
        icon: category.icon,
        userId: user.id,
      },
    })
  }

  // Criar categorias padrão de despesa
  const expenseCategories = [
    { name: 'Alimentação', color: '#EF4444', icon: 'food' },
    { name: 'Transporte', color: '#F59E0B', icon: 'transport' },
    { name: 'Moradia', color: '#84CC16', icon: 'home' },
    { name: 'Saúde', color: '#06B6D4', icon: 'health' },
    { name: 'Educação', color: '#8B5CF6', icon: 'education' },
    { name: 'Lazer', color: '#EC4899', icon: 'entertainment' },
    { name: 'Outros', color: '#6B7280', icon: 'other' },
  ]

  for (const category of expenseCategories) {
    await prisma.category.upsert({
      where: {
        id: user.id,
      },
      update: {},
      create: {
        id: user.id,
        name: category.name,
        color: category.color,
        type: 'expense',
        icon: category.icon,
        userId: user.id,
      },
    })
  }

  console.log('📂 Categories created')

  // Criar conta padrão
  const account = await prisma.account.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      name: 'Conta Corrente',
      type: 'bank',
      icon: 'bank',
      iconType: 'bank',
      includeInGeneralBalance: true,
      userId: user.id,
    },
  })

  console.log('🏦 Account created:', account.name)

  // Criar preferências padrão do usuário
  await prisma.userPreferences.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      transactionOrder: 'decrescente',
      defaultNavigationPeriod: 'mensal',
      showDailyBalance: false,
      viewMode: 'all',
      isFinancialSummaryExpanded: false,
    },
  })

  console.log('⚙️ User preferences created')

  console.log('✅ Database seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
