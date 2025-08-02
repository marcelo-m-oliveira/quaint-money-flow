export interface Category {
  id: string
  name: string
  color: string
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
}
