import { ReportsRepository } from '../reports.repository'

// Declarações para Jest
declare const jest: any
declare const expect: any
declare const describe: any
declare const it: any
declare const beforeEach: any

const mockPrisma: any = {
  entry: {
    groupBy: jest.fn(),
    aggregate: jest.fn(),
    findMany: jest.fn(),
  },
  category: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  account: {
    findMany: jest.fn(),
  },
  creditCard: {
    findMany: jest.fn(),
  },
}

describe('Reports Repository', () => {
  let repo: ReportsRepository

  beforeEach(() => {
    jest.clearAllMocks()
    repo = new ReportsRepository(mockPrisma)
  })

  it('getCategoriesReportTotals should aggregate income/expense', async () => {
    mockPrisma.entry.aggregate
      .mockResolvedValueOnce({ _sum: { amount: 100 } })
      .mockResolvedValueOnce({ _sum: { amount: 40 } })

    const totals = await repo.getCategoriesReportTotals({
      userId: 'user-1',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
    })
    expect(totals).toEqual({ totalIncome: 100, totalExpense: 40 })
  })
})


