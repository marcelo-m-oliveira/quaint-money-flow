import { faker } from '@faker-js/faker'

import { Account, Category, CreditCard, Transaction } from './types'

// Cores predefinidas para categorias
const CATEGORY_COLORS = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#22c55e', // green-500
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#6366f1', // indigo-500
  '#84cc16', // lime-500
]

// Categorias de despesas predefinidas
const EXPENSE_CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Educação',
  'Lazer',
  'Roupas',
  'Tecnologia',
  'Viagem',
  'Pets',
  'Presentes',
  'Serviços',
]

// Subcategorias de despesas
const EXPENSE_SUBCATEGORIES: Record<string, string[]> = {
  Alimentação: ['Supermercado', 'Restaurante', 'Delivery', 'Padaria'],
  Transporte: ['Combustível', 'Uber/Taxi', 'Transporte Público', 'Manutenção'],
  Moradia: ['Aluguel', 'Condomínio', 'Energia', 'Água', 'Internet'],
  Saúde: ['Médico', 'Farmácia', 'Plano de Saúde', 'Academia'],
  Educação: ['Curso', 'Livros', 'Material Escolar'],
  Lazer: ['Cinema', 'Streaming', 'Jogos', 'Eventos'],
}

// Categorias de receitas predefinidas
const INCOME_CATEGORIES = [
  'Salário',
  'Freelance',
  'Investimentos',
  'Vendas',
  'Prêmios',
  'Outros',
]

// Tipos de conta
const ACCOUNT_TYPES: Array<Account['type']> = [
  'bank',
  'credit_card',
  'investment',
  'cash',
  'other',
]

// Bancos brasileiros para contas - mapeamento para IDs existentes
const BRAZILIAN_BANKS = [
  'Nubank',
  'Santander',
  'Itaú',
  'Bradesco',
  'Banco do Brasil',
  'Caixa Econômica',
  'Inter',
  'C6 Bank',
  'PicPay',
  'Mercado Pago',
]

// Mapeamento dos nomes dos bancos para IDs válidos no sistema
const BANK_NAME_TO_ID: Record<string, string> = {
  Nubank: 'nubank',
  Santander: 'santander',
  Itaú: 'itau',
  Bradesco: 'bradesco',
  'Banco do Brasil': 'bb',
  'Caixa Econômica': 'caixa',
  Inter: 'intermedium',
  'C6 Bank': 'c6bank',
  PicPay: 'picpay',
  'Mercado Pago': 'mercadopago',
}

/**
 * Gera uma categoria mock
 */
export function generateMockCategory(
  type: 'income' | 'expense' = 'expense',
  parentId?: string,
): Category {
  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
  const name = parentId
    ? faker.helpers.arrayElement(
        EXPENSE_SUBCATEGORIES[
          faker.helpers.arrayElement(EXPENSE_CATEGORIES)
        ] || ['Subcategoria'],
      )
    : faker.helpers.arrayElement(categories)

  return {
    id: faker.string.uuid(),
    name,
    color: faker.helpers.arrayElement(CATEGORY_COLORS),
    type,
    parentId,
    createdAt: faker.date.past({ years: 1 }),
  }
}

/**
 * Gera múltiplas categorias mock
 */
export function generateMockCategories(
  count: number = 10,
  includeSubcategories: boolean = true,
): Category[] {
  const categories: Category[] = []

  // Gerar categorias principais de despesas
  const expenseCount = Math.floor(count * 0.7)
  for (let i = 0; i < expenseCount; i++) {
    categories.push(generateMockCategory('expense'))
  }

  // Gerar categorias de receitas
  const incomeCount = count - expenseCount
  for (let i = 0; i < incomeCount; i++) {
    categories.push(generateMockCategory('income'))
  }

  // Gerar subcategorias se solicitado
  if (includeSubcategories) {
    const expenseCategories = categories.filter((cat) => cat.type === 'expense')
    expenseCategories.forEach((parentCategory) => {
      const subcategoryCount = faker.number.int({ min: 1, max: 3 })
      for (let i = 0; i < subcategoryCount; i++) {
        categories.push(generateMockCategory('expense', parentCategory.id))
      }
    })
  }

  return categories
}

/**
 * Gera uma transação mock
 */
export function generateMockTransaction(
  categories: Category[],
  type?: 'income' | 'expense',
): Transaction {
  const transactionType =
    type || faker.helpers.arrayElement(['income', 'expense'])
  const availableCategories = categories.filter(
    (cat) => cat.type === transactionType,
  )
  const category = faker.helpers.arrayElement(availableCategories)

  // Gerar descrições mais realistas baseadas no tipo
  let description: string
  if (transactionType === 'expense') {
    const expenseDescriptions = [
      'Compra no supermercado',
      'Almoço no restaurante',
      'Combustível posto',
      'Conta de luz',
      'Farmácia',
      'Uber para casa',
      'Cinema com amigos',
      'Compra online',
      'Manutenção do carro',
      'Assinatura streaming',
    ]
    description = faker.helpers.arrayElement(expenseDescriptions)
  } else {
    const incomeDescriptions = [
      'Salário mensal',
      'Freelance projeto',
      'Venda produto',
      'Rendimento investimento',
      'Bonificação',
      'Trabalho extra',
    ]
    description = faker.helpers.arrayElement(incomeDescriptions)
  }

  // Gerar valores mais realistas
  const amount =
    transactionType === 'expense'
      ? faker.number.float({ min: 10, max: 500, fractionDigits: 2 })
      : faker.number.float({ min: 100, max: 5000, fractionDigits: 2 })

  const createdAt = faker.date.past({ years: 1 })

  return {
    id: faker.string.uuid(),
    description,
    amount,
    type: transactionType,
    categoryId: category.id,
    category,
    date: faker.date.past({ years: 1 }),
    createdAt,
    paid: faker.helpers.arrayElement([true, false]),
    updatedAt: createdAt,
  }
}

/**
 * Gera múltiplas transações mock
 */
export function generateMockTransactions(
  categories: Category[],
  count: number = 50,
): Transaction[] {
  const transactions: Transaction[] = []

  for (let i = 0; i < count; i++) {
    // 70% despesas, 30% receitas para simular comportamento real
    const type = faker.number.float() < 0.7 ? 'expense' : 'income'
    transactions.push(generateMockTransaction(categories, type))
  }

  // Ordenar por data (mais recentes primeiro)
  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime())
}

/**
 * Gera uma conta mock
 */
export function generateMockAccount(): Account {
  const type = faker.helpers.arrayElement(ACCOUNT_TYPES)
  let name: string
  let icon: string
  let iconType: 'bank' | 'generic' = 'generic'

  switch (type) {
    case 'bank': {
      const bankName = faker.helpers.arrayElement(BRAZILIAN_BANKS)
      name = `${bankName} - Conta Corrente`
      icon = '/icons/banks/c6bank.png'
      iconType = 'bank'
      break
    }
    case 'credit_card':
      name = `Cartão ${faker.helpers.arrayElement(BRAZILIAN_BANKS)}`
      icon = '/icons/banks/c6bank.png'
      break
    case 'investment':
      name = 'Conta Investimento'
      icon = '/icons/banks/c6bank.png'
      break
    case 'cash':
      name = 'Dinheiro'
      icon = '/icons/banks/c6bank.png'
      break
    default:
      name = 'Conta Outros'
      icon = '/icons/banks/c6bank.png'
  }

  const createdAt = faker.date.past({ years: 2 })
  const balance =
    type === 'credit_card'
      ? faker.number.float({ min: -2000, max: 0, fractionDigits: 2 })
      : faker.number.float({ min: 0, max: 10000, fractionDigits: 2 })

  return {
    id: faker.string.uuid(),
    name,
    type,
    icon,
    iconType,
    balance,
    includeInGeneralBalance: faker.datatype.boolean(),
    createdAt,
    updatedAt: createdAt,
  }
}

/**
 * Gera múltiplas contas mock
 */
export function generateMockAccounts(count: number = 5): Account[] {
  const accounts: Account[] = []

  for (let i = 0; i < count; i++) {
    accounts.push(generateMockAccount())
  }

  return accounts
}

/**
 * Gera um cartão de crédito mock
 */
export function generateMockCreditCard(): CreditCard {
  const bank = faker.helpers.arrayElement(BRAZILIAN_BANKS)
  const cardTypes = ['Platinum', 'Gold', 'Black', 'Infinite', 'Standard']
  const cardType = faker.helpers.arrayElement(cardTypes)

  const name = `${bank} ${cardType}`
  const icon = BANK_NAME_TO_ID[bank]
  const iconType: 'bank' | 'generic' = 'bank'

  // Limites realistas baseados no tipo do cartão
  let limitRange: { min: number; max: number }
  switch (cardType) {
    case 'Infinite':
    case 'Black':
      limitRange = { min: 10000, max: 50000 }
      break
    case 'Platinum':
      limitRange = { min: 5000, max: 20000 }
      break
    case 'Gold':
      limitRange = { min: 2000, max: 10000 }
      break
    default:
      limitRange = { min: 500, max: 5000 }
  }

  const limit = faker.number.int(limitRange)
  // Saldo atual usado (0 a 80% do limite)
  const currentBalance = faker.number.float({
    min: 0,
    max: limit * 0.8,
    fractionDigits: 2,
  })

  // Dias de fechamento e vencimento realistas
  const closingDay = faker.number.int({ min: 1, max: 31 })
  // Vencimento geralmente 7-10 dias após o fechamento
  let dueDay = closingDay + faker.number.int({ min: 7, max: 10 })
  if (dueDay > 31) {
    dueDay = dueDay - 31
  }

  const createdAt = faker.date.past({ years: 2 })

  return {
    id: faker.string.uuid(),
    name,
    icon,
    iconType,
    limit,
    currentBalance,
    closingDay,
    dueDay,
    defaultPaymentAccountId: undefined, // Será definido posteriormente se necessário
    createdAt,
    updatedAt: createdAt,
  }
}

/**
 * Gera múltiplos cartões de crédito mock
 */
export function generateMockCreditCards(count: number = 3): CreditCard[] {
  const creditCards: CreditCard[] = []

  for (let i = 0; i < count; i++) {
    creditCards.push(generateMockCreditCard())
  }

  return creditCards
}

/**
 * Gera um dataset completo de dados mock
 */
export function generateMockDataset() {
  const categories = generateMockCategories(12, true)
  const transactions = generateMockTransactions(categories, 100)
  const accounts = generateMockAccounts(6)
  const creditCards = generateMockCreditCards(4)

  return {
    categories,
    transactions,
    accounts,
    creditCards,
  }
}

/**
 * Gera preferências mock
 */
export function generateMockPreferences() {
  return {
    transactionOrder: faker.helpers.arrayElement(['crescente', 'decrescente']),
    defaultNavigationPeriod: faker.helpers.arrayElement([
      'diario',
      'semanal',
      'mensal',
    ]),
    showDailyBalance: faker.datatype.boolean(),
    viewMode: faker.helpers.arrayElement(['all', 'cashflow']),
    isFinancialSummaryExpanded: faker.datatype.boolean(),
  }
}

/**
 * Popula o localStorage com dados mock
 */
export function populateWithMockData() {
  const { categories, transactions, accounts, creditCards } =
    generateMockDataset()
  const preferences = generateMockPreferences()

  // Salvar no localStorage
  localStorage.setItem('quaint-money-categories', JSON.stringify(categories))
  localStorage.setItem(
    'quaint-money-transactions',
    JSON.stringify(transactions),
  )
  localStorage.setItem('quaint-money-accounts', JSON.stringify(accounts))
  localStorage.setItem('quaint-money-credit-cards', JSON.stringify(creditCards))
  localStorage.setItem('quaint-money-preferences', JSON.stringify(preferences))

  console.log('✅ Dados mock carregados com sucesso!')
  console.log(`📊 ${categories.length} categorias criadas`)
  console.log(`💰 ${transactions.length} transações criadas`)
  console.log(`🏦 ${accounts.length} contas criadas`)
  console.log(`💳 ${creditCards.length} cartões de crédito criados`)
  console.log(`⚙️ Preferências configuradas`)

  return { categories, transactions, accounts, creditCards, preferences }
}
