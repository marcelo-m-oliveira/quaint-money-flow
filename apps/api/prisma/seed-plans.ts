import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedPlans() {
  console.log('🌱 Criando planos padrão...')

  // Plano Básico (Gratuito)
  const basicPlan = await prisma.plan.upsert({
    where: { name: 'basic' },
    update: {},
    create: {
      name: 'basic',
      displayName: 'Básico',
      description: 'Plano gratuito com funcionalidades essenciais',
      features: {
        accounts: true,
        categories: true,
        entries: true,
        creditCards: true,
        basicReports: true,
        mobileApp: false,
        advancedReports: false,
        exportData: false,
        prioritySupport: false,
      },
      limits: {
        maxAccounts: 5,
        maxCategories: 20,
        maxCreditCards: 3,
        maxEntriesPerMonth: 100,
        advancedReports: false,
        exportData: false,
      },
      price: 0,
      isActive: true,
    },
  })

  // Plano Premium
  const premiumPlan = await prisma.plan.upsert({
    where: { name: 'premium' },
    update: {},
    create: {
      name: 'premium',
      displayName: 'Premium',
      description: 'Plano premium com todas as funcionalidades',
      features: {
        accounts: true,
        categories: true,
        entries: true,
        creditCards: true,
        basicReports: true,
        mobileApp: true,
        advancedReports: true,
        exportData: true,
        prioritySupport: true,
        multiCurrency: true,
        budgetGoals: true,
        investmentTracking: true,
      },
      limits: {
        maxAccounts: -1, // Ilimitado
        maxCategories: -1, // Ilimitado
        maxCreditCards: -1, // Ilimitado
        maxEntriesPerMonth: -1, // Ilimitado
        advancedReports: true,
        exportData: true,
      },
      price: 29.90,
      isActive: true,
    },
  })

  console.log('✅ Planos criados:', { basicPlan: basicPlan.id, premiumPlan: premiumPlan.id })

  return { basicPlan, premiumPlan }
}

// Executar se chamado diretamente
if (require.main === module) {
  seedPlans()
    .then(() => {
      console.log('✅ Seed de planos concluído!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Erro no seed de planos:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}