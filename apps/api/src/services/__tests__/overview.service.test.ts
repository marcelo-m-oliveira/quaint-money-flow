import { OverviewService } from '../../services/overview.service'

// Declarações para Jest
declare const jest: any
declare const expect: any
declare const describe: any
declare const it: any
declare const beforeEach: any

const mockOverviewRepository = {
  getMonthlyOverview: jest.fn(),
  getTopExpensesByCategory: jest.fn(),
  getDateRangeForPeriod: jest.fn(),
}

const mockPrisma = {} as any

describe('Overview Service', () => {
  let service: OverviewService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new OverviewService(mockOverviewRepository as any, mockPrisma)
  })

  it('getGeneralOverview should compute totals', async () => {
    const now = new Date()
    mockOverviewRepository.getMonthlyOverview.mockResolvedValue({
      monthlyEntries: [
        { type: 'income', _sum: { amount: 100 } },
        { type: 'expense', _sum: { amount: 30 } },
      ],
      accountsPayable: [
        { id: '1', description: 'x', amount: '10', date: now, type: 'expense', accountId: null, creditCardId: null, category: { id: 'c1', name: 'Cat', color: '#f00', icon: 'i' } },
      ],
      accountsReceivable: [
        { id: '2', description: 'y', amount: '20', date: now, type: 'income', accountId: null, creditCardId: null, category: { id: 'c1', name: 'Cat', color: '#f00', icon: 'i' } },
      ],
    })

    const result = await service.getGeneralOverview('user-1')
    expect(result.monthlyIncome).toBe(100)
    expect(result.monthlyExpenses).toBe(30)
    expect(result.totalAccountsPayable).toBe(10)
    expect(result.totalAccountsReceivable).toBe(20)
  })

  it('getTopExpensesByCategory should return totals and dateRange', async () => {
    const startDate = new Date('2024-01-01')
    const endDate = new Date('2024-01-31')
    mockOverviewRepository.getDateRangeForPeriod.mockReturnValue({ startDate, endDate })
    mockOverviewRepository.getTopExpensesByCategory.mockResolvedValue([
      { id: 'c1', categoryName: 'Food', totalAmount: 50, icon: 'i', color: '#f00' },
    ])

    const result = await service.getTopExpensesByCategory('user-1', 'current-month')
    expect(result.dateRange.startDate).toEqual(startDate)
    expect(result.totalExpenses).toBe(50)
    expect(result.expenses).toHaveLength(1)
  })

  it('getQuickStats should compute summary', async () => {
    const now = new Date()
    mockOverviewRepository.getMonthlyOverview.mockResolvedValue({
      monthlyEntries: [
        { type: 'income', _sum: { amount: 100 } },
        { type: 'expense', _sum: { amount: 30 } },
      ],
      accountsPayable: [{ date: new Date(now.getTime() - 86400000) }],
      accountsReceivable: [{ date: new Date(now.getTime() - 86400000) }],
    })

    const stats = await service.getQuickStats('user-1')
    expect(stats.monthlyBalance).toBe(70)
    expect(stats.overduePayable).toBeGreaterThanOrEqual(0)
    expect(stats.totalPendingPayable).toBe(1)
  })
})


