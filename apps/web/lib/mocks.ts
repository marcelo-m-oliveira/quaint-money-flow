import { faker } from '@faker-js/faker'

import { Category, CreditCard, Entry } from './types'

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

// Categorias de despesas predefinidas com ícones
const EXPENSE_CATEGORIES = [
  { name: 'Alimentação', icon: 'Utensils' },
  { name: 'Transporte', icon: 'Car' },
  { name: 'Moradia', icon: 'Home' },
  { name: 'Saúde', icon: 'Heart' },
  { name: 'Educação', icon: 'GraduationCap' },
  { name: 'Lazer', icon: 'Gamepad2' },
  { name: 'Roupas', icon: 'Shirt' },
  { name: 'Tecnologia', icon: 'Monitor' },
  { name: 'Viagem', icon: 'Plane' },
  { name: 'Pets', icon: 'Heart' },
  { name: 'Presentes', icon: 'Gift' },
  { name: 'Serviços', icon: 'Wrench' },
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

// Categorias de receitas predefinidas com ícones
const INCOME_CATEGORIES = [
  { name: 'Salário', icon: 'Briefcase' },
  { name: 'Freelance', icon: 'User' },
  { name: 'Investimentos', icon: 'TrendingUp' },
  { name: 'Vendas', icon: 'ShoppingCart' },
  { name: 'Prêmios', icon: 'Star' },
  { name: 'Outros', icon: 'DollarSign' },
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
  parentCategory?: Category,
): Category {
  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  let name: string
  let icon: string

  if (parentId && parentCategory) {
    // Para subcategorias, usar nomes das subcategorias e herdar ícone da categoria pai real
    const parentCategoryNames = Object.keys(EXPENSE_SUBCATEGORIES)
    const matchingParentName = parentCategoryNames.find(
      (parentName) =>
        parentCategory.name.toLowerCase().includes(parentName.toLowerCase()) ||
        parentName.toLowerCase().includes(parentCategory.name.toLowerCase()),
    )

    if (matchingParentName && EXPENSE_SUBCATEGORIES[matchingParentName]) {
      name = faker.helpers.arrayElement(
        EXPENSE_SUBCATEGORIES[matchingParentName],
      )
    } else {
      // Fallback: gerar nome genérico de subcategoria
      const subcategoryPrefixes = ['Categoria', 'Sub', 'Item']
      const subcategorySuffixes = ['A', 'B', 'C', '1', '2', '3']
      name = `${faker.helpers.arrayElement(subcategoryPrefixes)} ${faker.helpers.arrayElement(subcategorySuffixes)}`
    }

    // Herdar ícone da categoria pai real
    icon = parentCategory.icon
  } else if (parentId) {
    // Fallback para quando não temos a categoria pai disponível
    name = `Subcategoria ${faker.number.int({ min: 1, max: 100 })}`
    icon = 'FileText'
  } else {
    // Para categorias principais
    const selectedCategory = faker.helpers.arrayElement(categories)
    name = selectedCategory.name
    icon = selectedCategory.icon
  }

  return {
    id: faker.string.uuid(),
    name,
    color: faker.helpers.arrayElement(CATEGORY_COLORS),
    type,
    icon,
    parentId,
    createdAt: faker.date.past({ years: 1 }).getTime(),
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
        categories.push(
          generateMockCategory('expense', parentCategory.id, parentCategory),
        )
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
  creditCards?: CreditCard[],
): Entry {
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

  const createdAt = faker.date.past({ years: 1 }).getTime()

  // Vincular com cartão (70% das transações terão vínculo)
  let creditCardId: string | undefined

  if (faker.number.float() < 0.7) {
    // 70% chance de ter vínculo
    const hasCreditCards = creditCards && creditCards.length > 0

    if (hasCreditCards) {
      // Só tem cartões
      creditCardId = faker.helpers.arrayElement(creditCards).id
    }
  }

  // Gerar data da transação
  const transactionDate = faker.date.past({ years: 1 }).getTime()

  // Determinar se a transação está paga
  // Transações não pagas só podem ser do mês atual
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const transactionDateObj = new Date(transactionDate)
  const isCurrentMonth =
    transactionDateObj.getMonth() === currentMonth &&
    transactionDateObj.getFullYear() === currentYear

  let paid: boolean
  if (isCurrentMonth) {
    // No mês atual, pode estar pago ou não pago
    paid = faker.helpers.arrayElement([true, false])
  } else {
    // Em meses anteriores, sempre está pago
    paid = true
  }

  return {
    id: faker.string.uuid(),
    description,
    amount,
    type: transactionType,
    categoryId: category.id || '',
    category,
    creditCardId,
    date: transactionDate,
    createdAt,
    paid,
    updatedAt: createdAt,
  }
}

/**
 * Gera múltiplas transações mock
 */
export function generateMockTransactions(
  categories: Category[],
  count: number = 50,
  creditCards?: CreditCard[],
): Entry[] {
  const transactions: Entry[] = []

  for (let i = 0; i < count; i++) {
    // 70% despesas, 30% receitas para simular comportamento real
    const type = faker.number.float() < 0.7 ? 'expense' : 'income'
    transactions.push(generateMockTransaction(categories, type, creditCards))
  }

  // Ordenar por data (mais recentes primeiro)
  return transactions.sort((a, b) => b.date - a.date)
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

  // Key mapping para limites de cartão por tipo
  const CARD_TYPE_LIMITS = {
    Infinite: { min: 10000, max: 50000 },
    Black: { min: 10000, max: 50000 },
    Platinum: { min: 5000, max: 20000 },
    Gold: { min: 2000, max: 10000 },
  } as const

  // Limites realistas baseados no tipo do cartão
  const limitRange = CARD_TYPE_LIMITS[
    cardType as keyof typeof CARD_TYPE_LIMITS
  ] || { min: 500, max: 5000 }

  const limit = faker.number.int(limitRange)
  // Saldo atual usado (0 a 80% do limite)
  const usage = faker.number.float({
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

  const createdAt = faker.date.past({ years: 2 }).getTime()

  return {
    id: faker.string.uuid(),
    name,
    icon,
    iconType,
    limit,
    usage,
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
  const creditCards = generateMockCreditCards(4)
  const transactions = generateMockTransactions(categories, 100, creditCards)

  return {
    categories,
    transactions,
    creditCards,
  }
}

/**
 * Popula o localStorage com dados mock
 */
export function populateWithMockData() {
  const { categories, transactions, creditCards } = generateMockDataset()

  // Salvar no localStorage
  localStorage.setItem('quaint-money-categories', JSON.stringify(categories))
  localStorage.setItem(
    'quaint-money-transactions',
    JSON.stringify(transactions),
  )
  localStorage.setItem('quaint-money-credit-cards', JSON.stringify(creditCards))

  console.log('✅ Dados mock carregados com sucesso!')
  console.log(`📊 ${categories.length} categorias criadas`)
  console.log(`💰 ${transactions.length} transações criadas`)
  console.log(`💳 ${creditCards.length} cartões de crédito criados`)

  return { categories, transactions, creditCards }
}
