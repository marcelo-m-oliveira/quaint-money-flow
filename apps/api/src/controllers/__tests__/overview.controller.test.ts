import { OverviewController } from '../overview.controller'

// Declarações para Jest
declare const jest: any
declare const expect: any
declare const describe: any
declare const it: any
declare const beforeEach: any

const mockOverviewService = {
  getGeneralOverview: jest.fn(),
  getTopExpensesByCategory: jest.fn(),
  getQuickStats: jest.fn(),
}

describe('Overview Controller', () => {
  let controller: OverviewController
  let mockRequest: any
  let mockReply: any

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new OverviewController(mockOverviewService as any)
    mockRequest = {
      user: { sub: 'user-1' },
      query: {},
      log: { info: jest.fn(), error: jest.fn() },
    }
    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    }
  })

  it('getGeneralOverview should return overview', async () => {
    const now = new Date()
    mockOverviewService.getGeneralOverview.mockResolvedValue({
      monthlyIncome: 100,
      monthlyExpenses: 50,
      totalAccountsPayable: 10,
      totalAccountsReceivable: 20,
      accountsPayable: [
        {
          id: '1',
          description: 'x',
          amount: 10,
          date: now,
          type: 'expense',
          categoryId: 'c1',
          categoryName: 'Food',
          icon: 'i',
          color: '#f00',
          isOverdue: false,
        },
      ],
      accountsReceivable: [
        {
          id: '2',
          description: 'y',
          amount: 20,
          date: now,
          type: 'income',
          categoryId: 'c1',
          categoryName: 'Food',
          icon: 'i',
          color: '#f00',
          isOverdue: false,
        },
      ],
      period: { year: 2024, month: 1 },
    })

    await controller.getGeneralOverview(mockRequest, mockReply)
    expect(mockOverviewService.getGeneralOverview).toHaveBeenCalledWith(
      'user-1',
    )
    expect(mockReply.status).toHaveBeenCalledWith(200)
    expect(mockReply.send).toHaveBeenCalled()
  })

  it('getTopExpensesByCategory should return data', async () => {
    mockRequest.query = { period: 'current-month' }
    mockOverviewService.getTopExpensesByCategory.mockResolvedValue({
      expenses: [],
      period: 'current-month',
      dateRange: { startDate: new Date(), endDate: new Date() },
      totalExpenses: 0,
    })

    await controller.getTopExpensesByCategory(mockRequest, mockReply)
    expect(mockOverviewService.getTopExpensesByCategory).toHaveBeenCalledWith(
      'user-1',
      'current-month',
    )
    expect(mockReply.status).toHaveBeenCalledWith(200)
  })

  it('getQuickStats should return stats', async () => {
    mockOverviewService.getQuickStats.mockResolvedValue({
      monthlyBalance: 10,
      overduePayable: 0,
      overdueReceivable: 0,
      totalPendingPayable: 1,
      totalPendingReceivable: 2,
    })

    await controller.getQuickStats(mockRequest, mockReply)
    expect(mockOverviewService.getQuickStats).toHaveBeenCalledWith('user-1')
    expect(mockReply.status).toHaveBeenCalledWith(200)
  })
})
