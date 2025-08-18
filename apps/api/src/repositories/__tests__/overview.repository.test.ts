import { OverviewRepository } from '../../repositories/overview.repository'

// Declarações para Jest
declare const jest: any
declare const expect: any
declare const describe: any
declare const it: any
declare const beforeEach: any

const mockPrisma: any = {
  entry: {
    groupBy: jest.fn(),
    findMany: jest.fn(),
  },
  category: {
    findMany: jest.fn(),
  },
}

describe('Overview Repository', () => {
  let repo: OverviewRepository

  beforeEach(() => {
    jest.clearAllMocks()
    repo = new OverviewRepository(mockPrisma)
  })

  it('getDateRangeForPeriod should return range for current-month', () => {
    const { startDate, endDate } = repo.getDateRangeForPeriod('current-month')
    expect(startDate).toBeInstanceOf(Date)
    expect(endDate).toBeInstanceOf(Date)
  })
})
