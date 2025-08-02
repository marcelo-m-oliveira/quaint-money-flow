export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  createdAt: string;
}

export const CATEGORIES = {
  income: [
    'Salário',
    'Freelance',
    'Investimentos',
    'Vendas',
    'Outros'
  ],
  expense: [
    'Alimentação',
    'Moradia',
    'Transporte',
    'Saúde',
    'Educação',
    'Lazer',
    'Roupas',
    'Outros'
  ]
} as const;