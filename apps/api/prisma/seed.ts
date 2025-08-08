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
        id: `income-${category.name.toLowerCase()}-${user.id}`,
      },
      update: {},
      create: {
        id: `income-${category.name.toLowerCase()}-${user.id}`,
        name: category.name,
        color: category.color,
        type: 'INCOME',
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
        id: `expense-${category.name.toLowerCase()}-${user.id}`,
      },
      update: {},
      create: {
        id: `expense-${category.name.toLowerCase()}-${user.id}`,
        name: category.name,
        color: category.color,
        type: 'EXPENSE',
        icon: category.icon,
        userId: user.id,
      },
    })
  }

  console.log('📂 Categories created')

  // Criar conta padrão
  const account = await prisma.account.upsert({
    where: { id: `default-account-${user.id}` },
    update: {},
    create: {
      id: `default-account-${user.id}`,
      name: 'Conta Corrente',
      type: 'BANK',
      icon: 'bank',
      iconType: 'BANK',
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
      transactionOrder: 'DESCENDING',
      defaultNavigationPeriod: 'MONTHLY',
      showDailyBalance: false,
      viewMode: 'ALL',
      isFinancialSummaryExpanded: false,
    },
  })

  console.log('⚙️ User preferences created')

  console.log('✅ Database seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })