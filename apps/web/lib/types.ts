export interface Category {
  id: string
  name: string
  color: string
  type: 'income' | 'expense'
  parentId?: string // Para subcategorias
  createdAt: Date
}

export interface Transaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  categoryId: string
  category?: Category
  date: Date
  createdAt: Date
  updatedAt: Date
}

export interface TransactionFormData {
  description: string
  amount: string
  type: 'income' | 'expense'
  categoryId: string
  date: string
}

export interface CategoryFormData {
  name: string
  color: string
  type: 'income' | 'expense'
  parentId?: string // Para subcategorias
}

export interface Account {
  id: string
  name: string
  type: 'bank' | 'credit_card' | 'investment' | 'cash' | 'other'
  icon: string
  iconType: 'bank' | 'generic'
  balance: number
  includeInGeneralBalance: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AccountFormData {
  name: string
  type: 'bank' | 'credit_card' | 'investment' | 'cash' | 'other'
  icon: string
  iconType: 'bank' | 'generic'
  includeInGeneralBalance: boolean
}

export interface BankIcon {
  id: string
  name: string
  logo: string
  searchTerms: string[]
}
