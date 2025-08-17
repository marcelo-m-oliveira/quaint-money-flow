import { ReportsController } from '../reports.controller'

// Declarações para Jest
declare const jest: any
declare const expect: any
declare const describe: any
declare const it: any
declare const beforeEach: any

const mockReportsService = {
  getCategoriesReport: jest.fn(),
  getCashflowReport: jest.fn(),
  getAccountsReport: jest.fn(),
}

describe('Reports Controller', () => {
  let controller: ReportsController
  let mockRequest: any
  let mockReply: any

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new ReportsController(mockReportsService as any)
    mockRequest = {
      user: { sub: 'user-1' },
      query: {},
      log: { info: jest.fn(), error: jest.fn() },
    }
    mockReply = { type: jest.fn().mockReturnThis(), status: jest.fn().mockReturnThis(), send: jest.fn().mockReturnThis() }
  })

  it('categories should return report json string', async () => {
    mockRequest.query = { startDate: 1704067200, endDate: 1706745600, type: 'expense' }
    mockReportsService.getCategoriesReport.mockResolvedValue({ categories: [], summary: { totalIncome: 0, totalExpense: 0, totalBalance: 0 } })

    await controller.categories(mockRequest, mockReply)
    expect(mockReportsService.getCategoriesReport).toHaveBeenCalled()
    expect(mockReply.send).toHaveBeenCalledWith(expect.any(String))
  })

  it('cashflow should return report json string', async () => {
    mockRequest.query = { startDate: 1704067200, endDate: 1706745600, viewMode: 'daily' }
    mockReportsService.getCashflowReport.mockResolvedValue({ data: [], summary: { totalIncome: 0, totalExpense: 0, totalBalance: 0, averageIncome: 0, averageExpense: 0, averageBalance: 0 } })

    await controller.cashflow(mockRequest, mockReply)
    expect(mockReportsService.getCashflowReport).toHaveBeenCalled()
    expect(mockReply.send).toHaveBeenCalledWith(expect.any(String))
  })

  it('accounts should return report json string', async () => {
    mockRequest.query = { startDate: 1704067200, endDate: 1706745600, accountFilter: 'all' }
    mockReportsService.getAccountsReport.mockResolvedValue({ accounts: [], summary: { totalIncome: 0, totalExpense: 0, totalBalance: 0, bankAccountsBalance: 0, creditCardsBalance: 0 } })

    await controller.accounts(mockRequest, mockReply)
    expect(mockReportsService.getAccountsReport).toHaveBeenCalled()
    expect(mockReply.send).toHaveBeenCalledWith(expect.any(String))
  })
})


