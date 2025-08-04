import { generateMockDataset } from './mocks'

/**
 * Exemplo de como usar os mocks criados para testes
 */

// Gerar dados mock individuais
const mockData = generateMockDataset()
const mockCategories = mockData.categories.slice(0, 5)
const mockTransactions = mockData.transactions.slice(0, 10)
const mockAccounts = mockData.accounts.slice(0, 3)

console.log('Mock Categories:', mockCategories)
console.log('Mock Transactions:', mockTransactions)
console.log('Mock Accounts:', mockAccounts)

// Popular localStorage com dados mock (útil para desenvolvimento e testes)
// populateLocalStorageWithMocks({
//   categoriesCount: 8,
//   transactionsCount: 20,
//   accountsCount: 4
// })

export { mockCategories, mockTransactions, mockAccounts }
