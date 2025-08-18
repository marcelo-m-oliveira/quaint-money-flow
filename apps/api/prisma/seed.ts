import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Criar usuário de exemplo
  const passwordHash = await bcrypt.hash('password123', 10)

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Usuário Exemplo',
      password: passwordHash,
      avatarUrl: this.faker.image.avatar(),
    },
  })

  console.log('👤 User created:', user.email)

  // Criar categorias variadas de receita usando ícones do ICON_MAP
  const incomeCategories = [
    { name: 'Salário', color: '#10B981', icon: 'Trabalho' },
    { name: 'Freelance', color: '#3B82F6', icon: 'Dinheiro' },
    { name: 'Investimentos', color: '#8B5CF6', icon: 'Investimentos' },
    { name: 'Poupança', color: '#059669', icon: 'Poupança' },
    { name: 'Vendas', color: '#DC2626', icon: 'Favorito' },
    { name: 'Aluguel', color: '#7C3AED', icon: 'Casa' },
    { name: 'Dividendos', color: '#0891B2', icon: 'TrendingUp' },
    { name: 'Outros', color: '#6B7280', icon: 'Adicionar' },
  ]

  // Criar categorias de receita
  const createdIncomeCategories: any[] = []
  for (const category of incomeCategories) {
    const createdCategory = await prisma.category.create({
      data: {
        name: category.name,
        color: category.color,
        type: 'income',
        icon: category.icon,
        userId: user.id,
      },
    })
    createdIncomeCategories.push(createdCategory)
  }

  // Criar categorias variadas de despesa usando ícones do ICON_MAP
  const expenseCategories = [
    { name: 'Alimentação', color: '#EF4444', icon: 'Alimentação' },
    { name: 'Supermercado', color: '#F59E0B', icon: 'Compras' },
    { name: 'Restaurantes', color: '#84CC16', icon: 'Café' },
    { name: 'Transporte', color: '#06B6D4', icon: 'Transporte' },
    { name: 'Combustível', color: '#DC2626', icon: 'Combustível' },
    { name: 'Moradia', color: '#7C3AED', icon: 'Casa' },
    { name: 'Saúde', color: '#059669', icon: 'Saúde' },
    { name: 'Farmácia', color: '#0891B2', icon: 'Médico' },
    { name: 'Educação', color: '#8B5CF6', icon: 'Educação' },
    { name: 'Tecnologia', color: '#4F46E5', icon: 'Tecnologia' },
    { name: 'Lazer', color: '#EC4899', icon: 'Jogos' },
    { name: 'Viagem', color: '#F97316', icon: 'Viagem' },
    { name: 'Roupas', color: '#BE185D', icon: 'Roupas' },
    { name: 'Beleza', color: '#C2410C', icon: 'Beleza' },
    { name: 'Academia', color: '#16A34A', icon: 'Academia' },
    { name: 'Outros', color: '#6B7280', icon: 'Adicionar' },
  ]

  // Criar categorias de despesa
  const createdExpenseCategories: any[] = []
  for (const category of expenseCategories) {
    const createdCategory = await prisma.category.create({
      data: {
        name: category.name,
        color: category.color,
        type: 'expense',
        icon: category.icon,
        userId: user.id,
      },
    })
    createdExpenseCategories.push(createdCategory)
  }

  console.log('📂 Categories created')

  // Criar contas bancárias realistas usando bancos brasileiros
  const bankAccounts = [
    {
      name: 'Nubank - Conta Corrente',
      type: 'bank',
      icon: 'nubank',
      iconType: 'bank',
      includeInGeneralBalance: true,
    },
    {
      name: 'Inter - Conta Digital',
      type: 'bank',
      icon: 'intermedium',
      iconType: 'bank',
      includeInGeneralBalance: true,
    },
    {
      name: 'C6 Bank - Conta Corrente',
      type: 'bank',
      icon: 'c6bank',
      iconType: 'bank',
      includeInGeneralBalance: true,
    },
    {
      name: 'Bradesco - Poupança',
      type: 'bank',
      icon: 'bradesco',
      iconType: 'bank',
      includeInGeneralBalance: false,
    },
    {
      name: 'Carteira Digital',
      type: 'bank',
      icon: 'wallet',
      iconType: 'generic',
      includeInGeneralBalance: true,
    },
  ]

  const createdAccounts: any[] = []
  for (const accountData of bankAccounts) {
    const account = await prisma.account.create({
      data: {
        name: accountData.name,
        type: accountData.type as any,
        icon: accountData.icon,
        iconType: accountData.iconType as any,
        includeInGeneralBalance: accountData.includeInGeneralBalance,
        userId: user.id,
      },
    })
    createdAccounts.push(account)
  }

  console.log('🏦 Bank accounts created:', createdAccounts.length)

  // Criar cartões de crédito de diferentes bandeiras
  const creditCards = [
    {
      name: 'Nubank Roxinho',
      icon: 'nubank',
      iconType: 'bank',
      limit: 5000.0,
      closingDay: 15,
      dueDay: 10,
    },
    {
      name: 'Inter Gold',
      icon: 'intermedium',
      iconType: 'bank',
      limit: 3000.0,
      closingDay: 20,
      dueDay: 15,
    },
    {
      name: 'C6 Bank Mastercard',
      icon: 'c6bank',
      iconType: 'bank',
      limit: 8000.0,
      closingDay: 25,
      dueDay: 20,
    },
  ]

  const createdCreditCards: any[] = []
  for (const cardData of creditCards) {
    const creditCard = await prisma.creditCard.create({
      data: {
        name: cardData.name,
        icon: cardData.icon,
        iconType: cardData.iconType as any,
        limit: cardData.limit,
        closingDay: cardData.closingDay,
        dueDay: cardData.dueDay,
        userId: user.id,
      },
    })
    createdCreditCards.push(creditCard)
  }

  console.log('💳 Credit cards created:', createdCreditCards.length)

  // Combinar todas as categorias para uso nas transações
  const allCategories = [
    ...createdIncomeCategories,
    ...createdExpenseCategories,
  ]

  // Gerar transações realistas dos últimos 6 meses
  const allAccounts = [...createdAccounts, ...createdCreditCards]
  const transactions: any[] = []

  // Definir descrições realistas por categoria
  const categoryDescriptions = {
    Trabalho: [
      'Salário mensal',
      'Pagamento freelance',
      'Bônus performance',
      'Horas extras',
    ],
    Investimentos: [
      'Dividendos ações',
      'Rendimento CDB',
      'Lucro day trade',
      'Resgate investimento',
    ],
    Dinheiro: [
      'Presente recebido',
      'Venda item usado',
      'Cashback cartão',
      'Reembolso',
    ],
    Alimentação: [
      'Restaurante japonês',
      'Pizza delivery',
      'Hambúrguer',
      'Comida italiana',
      'Lanchonete',
    ],
    Supermercado: [
      'Compras mensais',
      'Feira livre',
      'Açougue',
      'Padaria',
      'Produtos limpeza',
    ],
    Transporte: [
      'Uber',
      'Gasolina',
      'Estacionamento',
      'Pedágio',
      'Manutenção carro',
    ],
    Saúde: [
      'Consulta médica',
      'Farmácia',
      'Exames laboratoriais',
      'Dentista',
      'Plano saúde',
    ],
    Casa: [
      'Conta luz',
      'Conta água',
      'Internet',
      'Gás',
      'Condomínio',
      'Material construção',
    ],
    Educação: [
      'Curso online',
      'Livros',
      'Mensalidade faculdade',
      'Material escolar',
    ],
    Lazer: [
      'Cinema',
      'Show',
      'Viagem',
      'Streaming',
      'Jogo',
      'Parque diversões',
    ],
    Roupas: [
      'Camisa',
      'Calça jeans',
      'Tênis',
      'Vestido',
      'Casaco',
      'Acessórios',
    ],
    Beleza: [
      'Corte cabelo',
      'Produtos beleza',
      'Manicure',
      'Perfume',
      'Maquiagem',
    ],
    Tecnologia: [
      'Celular novo',
      'Fone bluetooth',
      'Carregador',
      'App premium',
      'Gadget',
    ],
    Pets: ['Ração cachorro', 'Veterinário', 'Brinquedo pet', 'Banho e tosa'],
    Presentes: [
      'Aniversário amigo',
      'Dia das mães',
      'Natal',
      'Presente namorada',
    ],
    Outros: [
      'Taxa bancária',
      'Multa trânsito',
      'Doação',
      'Imposto',
      'Serviço diversos',
    ],
  }

  // Gerar 80 transações distribuídas nos últimos 6 meses
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  for (let i = 0; i < 200; i++) {
    const category = faker.helpers.arrayElement(allCategories)
    const account = faker.helpers.arrayElement(allAccounts)
    const isIncome = createdIncomeCategories.some(
      (cat) => cat.id === category.id,
    )

    // Verificar se a categoria foi criada corretamente
    if (!category || !category.id) {
      console.warn('Categoria inválida encontrada, pulando transação')
      continue
    }

    // Gerar valor baseado no tipo de transação
    let amount
    if (isIncome) {
      // Receitas: valores maiores (R$ 500 - R$ 8000)
      amount = faker.number.float({ min: 500, max: 8000, fractionDigits: 2 })
    } else {
      // Despesas: valores variados (R$ 10 - R$ 2000)
      amount = faker.number.float({ min: 10, max: 2000, fractionDigits: 2 })
    }

    // Gerar data aleatória nos últimos 6 meses
    const transactionDate = faker.date.between({
      from: sixMonthsAgo,
      to: new Date(),
    })

    // Selecionar descrição baseada na categoria
    const descriptions = categoryDescriptions[category.name] || [
      'Transação diversa',
    ]
    const description = faker.helpers.arrayElement(descriptions)

    // Determinar se usar conta ou cartão de crédito
    const useAccount = faker.datatype.boolean(0.7) // 70% chance de usar conta
    const selectedAccount = useAccount
      ? faker.helpers.arrayElement(createdAccounts)
      : null
    const selectedCreditCard = !useAccount
      ? faker.helpers.arrayElement(createdCreditCards)
      : null

    // Determinar status de pagamento (70% pagas, 30% pendentes)
    const paid = faker.datatype.boolean(0.7)

    transactions.push({
      description,
      amount,
      date: transactionDate,
      type: isIncome ? 'income' : ('expense' as any),
      categoryId: category.id,
      accountId: selectedAccount?.id || null,
      creditCardId: selectedCreditCard?.id || null,
      userId: user.id,
      paid,
    })
  }

  // Criar todas as transações no banco
  await prisma.entry.createMany({
    data: transactions,
  })

  console.log('💰 Transactions created:', transactions.length)

  // Criar lançamentos específicos para Janeiro 2025
  const currentMonthTransactions: any[] = [
    // RECEITAS
    {
      description: 'Salário mensal',
      amount: 5500.0,
      date: new Date('2025-01-05'),
      type: 'income' as any,
      categoryId: createdIncomeCategories.find((cat) => cat.name === 'Salário')
        ?.id,
      accountId: createdAccounts.find((acc) => acc.name.includes('Nubank'))?.id,
      creditCardId: null,
      userId: user.id,
      paid: true,
    },
    {
      description: 'Projeto freelance desenvolvimento',
      amount: 1200.0,
      date: new Date('2025-01-15'),
      type: 'income' as any,
      categoryId: createdIncomeCategories.find(
        (cat) => cat.name === 'Freelance',
      )?.id,
      accountId: createdAccounts.find((acc) => acc.name.includes('Inter'))?.id,
      creditCardId: null,
      userId: user.id,
      paid: true,
    },
    {
      description: 'Dividendos ações',
      amount: 85.5,
      date: new Date('2025-01-20'),
      type: 'income' as any,
      categoryId: createdIncomeCategories.find(
        (cat) => cat.name === 'Dividendos',
      )?.id,
      accountId: createdAccounts.find((acc) => acc.name.includes('C6'))?.id,
      creditCardId: null,
      userId: user.id,
      paid: false, // A receber
    },
    // DESPESAS
    {
      description: 'Conta de luz - Janeiro',
      amount: 180.45,
      date: new Date('2025-01-10'),
      type: 'expense' as any,
      categoryId: createdExpenseCategories.find((cat) => cat.name === 'Moradia')
        ?.id,
      accountId: createdAccounts.find((acc) => acc.name.includes('Nubank'))?.id,
      creditCardId: null,
      userId: user.id,
      paid: true,
    },
    {
      description: 'Compras supermercado',
      amount: 320.8,
      date: new Date('2025-01-12'),
      type: 'expense' as any,
      categoryId: createdExpenseCategories.find(
        (cat) => cat.name === 'Supermercado',
      )?.id,
      accountId: null,
      creditCardId: createdCreditCards.find((card) =>
        card.name.includes('Nubank'),
      )?.id,
      userId: user.id,
      paid: false, // Cartão - pendente
    },
    {
      description: 'Gasolina posto',
      amount: 95.6,
      date: new Date('2025-01-08'),
      type: 'expense' as any,
      categoryId: createdExpenseCategories.find(
        (cat) => cat.name === 'Combustível',
      )?.id,
      accountId: createdAccounts.find((acc) => acc.name.includes('Inter'))?.id,
      creditCardId: null,
      userId: user.id,
      paid: true,
    },
    {
      description: 'Netflix - Assinatura mensal',
      amount: 45.9,
      date: new Date('2025-01-18'),
      type: 'expense' as any,
      categoryId: createdExpenseCategories.find((cat) => cat.name === 'Lazer')
        ?.id,
      accountId: null,
      creditCardId: createdCreditCards.find((card) =>
        card.name.includes('Inter'),
      )?.id,
      userId: user.id,
      paid: false, // Cartão - pendente
    },
    {
      description: 'Consulta médica cardiologista',
      amount: 250.0,
      date: new Date('2025-01-22'),
      type: 'expense' as any,
      categoryId: createdExpenseCategories.find((cat) => cat.name === 'Saúde')
        ?.id,
      accountId: createdAccounts.find((acc) => acc.name.includes('C6'))?.id,
      creditCardId: null,
      userId: user.id,
      paid: true,
    },
    {
      description: 'Jantar restaurante italiano',
      amount: 65.5,
      date: new Date('2025-01-25'),
      type: 'expense' as any,
      categoryId: createdExpenseCategories.find(
        (cat) => cat.name === 'Restaurantes',
      )?.id,
      accountId: null,
      creditCardId: createdCreditCards.find((card) => card.name.includes('C6'))
        ?.id,
      userId: user.id,
      paid: false, // Cartão - pendente
    },
    {
      description: 'Academia - Mensalidade',
      amount: 89.9,
      date: new Date('2025-01-28'),
      type: 'expense' as any,
      categoryId: createdExpenseCategories.find(
        (cat) => cat.name === 'Academia',
      )?.id,
      accountId: createdAccounts.find((acc) => acc.name.includes('Nubank'))?.id,
      creditCardId: null,
      userId: user.id,
      paid: false, // A pagar
    },
  ]

  // Filtrar transações válidas (com categoria encontrada)
  const validCurrentMonthTransactions = currentMonthTransactions.filter(
    (transaction) => transaction.categoryId,
  )

  // Criar transações do mês atual
  await prisma.entry.createMany({
    data: validCurrentMonthTransactions,
  })

  console.log(
    '📅 Current month transactions created:',
    validCurrentMonthTransactions.length,
  )

  // Criar preferências padrão do usuário
  await prisma.userPreferences.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      entryOrder: 'descending',
      defaultNavigationPeriod: 'monthly',
      showDailyBalance: false,
      viewMode: 'all',
      isFinancialSummaryExpanded: false,
    },
  })

  console.log('⚙️ User preferences created')
  console.log('✅ Seed completed successfully!')
  console.log(
    `📊 Summary: ${createdAccounts.length} accounts, ${createdCreditCards.length} credit cards, ${allCategories.length} categories, ${transactions.length + validCurrentMonthTransactions.length} transactions (${transactions.length} historical + ${validCurrentMonthTransactions.length} current month)`,
  )
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
