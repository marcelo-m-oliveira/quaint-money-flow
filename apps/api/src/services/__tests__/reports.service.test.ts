import { ReportsService } from '../reports.service'

// Declarações para Jest
declare const jest: any
declare const expect: any
declare const describe: any
declare const it: any
declare const beforeEach: any

const mockReportsRepository = {
  getCategoriesReport: jest.fn(),
  getCategoriesReportTotals: jest.fn(),
  getCashflowReport: jest.fn(),
  getAccountsReport: jest.fn(),
}

describe('Reports Service', () => {
  let service: ReportsService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new ReportsService(mockReportsRepository as any)
  })

  it('getCategoriesReport should return categories with percentage and summary', async () => {
    mockReportsRepository.getCategoriesReport.mockResolvedValue([
      { categoryId: 'c1', categoryName: 'Food', categoryColor: '#f00', categoryIcon: 'i', parentId: null, amount: 60, transactionCount: 2 },
      { categoryId: 'c2', categoryName: 'Bills', categoryColor: '#0f0', categoryIcon: 'i', parentId: null, amount: 40, transactionCount: 1 },
    ])
    mockReportsRepository.getCategoriesReportTotals.mockResolvedValue({ totalIncome: 100, totalExpense: 0 })

    const result = await service.getCategoriesReport('user-1', {})
    expect(result.summary.totalIncome).toBe(100)
    expect(result.categories[0]).toHaveProperty('percentage')
  })

  it('getCashflowReport should compute summary and averages', async () => {
    mockReportsRepository.getCashflowReport.mockResolvedValue([
      { date: '2024-01-01', income: 10, expense: 0, balance: 10, period: '1 jan' },
      { date: '2024-01-02', income: 0, expense: 5, balance: -5, period: '2 jan' },
    ])

    const result = await service.getCashflowReport('user-1', { viewMode: 'daily' })
    expect(result.summary.totalIncome).toBe(10)
    expect(result.summary.totalExpense).toBe(5)
    expect(result.summary.totalBalance).toBe(5)
  })

  it('getAccountsReport should add percentages and summary', async () => {
    mockReportsRepository.getAccountsReport.mockResolvedValue([
      { accountId: 'a1', accountName: 'Bank', accountType: 'bank', totalIncome: 100, totalExpense: 20, balance: 80, transactionCount: 2, icon: 'i', iconType: 'bank' },
      { accountId: 'a2', accountName: 'CC', accountType: 'credit_card', totalIncome: 0, totalExpense: 10, balance: -10, transactionCount: 1, icon: 'i', iconType: 'generic' },
    ])

    const result = await service.getAccountsReport('user-1', { accountFilter: 'all' })
    expect(result.summary.totalIncome).toBe(100)
    expect(result.summary.totalExpense).toBe(30)
    expect(result.accounts[0]).toHaveProperty('incomePercentage')
  })
})


