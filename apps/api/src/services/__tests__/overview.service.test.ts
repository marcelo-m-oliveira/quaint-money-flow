import { PrismaClient } from '@prisma/client'

import { OverviewRepository } from '@/repositories/overview.repository'

import { OverviewService } from '../overview.service'

// Mock do PrismaClient
const mockPrisma = {} as unknown as PrismaClient

// Mock do OverviewRepository
const mockOverviewRepository = {
  getMonthlyOverview: jest.fn(),
  getTopExpensesByCategory: jest.fn(),
  getDateRangeForPeriod: jest.fn(),
} as unknown as OverviewRepository

describe('OverviewService', () => {
  let overviewService: OverviewService
  const userId = 'user-123'

  beforeEach(() => {
    overviewService = new OverviewService(mockOverviewRepository, mockPrisma)
    jest.clearAllMocks()
  })

  describe('getGeneralOverview', () => {
    it('should return general overview with processed data', async () => {
      const mockMonthlyData = {
        monthlyEntries: [
          { type: 'income', _sum: { amount: 5000 } },
          { type: 'expense', _sum: { amount: 3000 } },
        ],
        accountsPayable: [
          {
            id: 'entry-1',
            description: 'Conta de luz',
            amount: 150,
            dueDate: new Date('2024-01-15'),
            category: { name: 'Utilidades' },
          },
        ],
        accountsReceivable: [
          {
            id: 'entry-2',
            description: 'Freelance',
            amount: 1000,
            dueDate: new Date('2024-01-20'),
            category: { name: 'Trabalho' },
          },
        ],
      }

      ;(
        mockOverviewRepository.getMonthlyOverview as jest.Mock
      ).mockResolvedValue(mockMonthlyData)

      const result = await overviewService.getGeneralOverview(userId)

      expect(mockOverviewRepository.getMonthlyOverview).toHaveBeenCalledWith(
        userId,
        expect.any(Number), // year
        expect.any(Number), // month
      )

      expect(result).toEqual({
        monthlyIncome: 5000,
        monthlyExpenses: 3000,
        totalAccountsPayable: 150,
        totalAccountsReceivable: 1000,
        accountsPayable: [
          {
            id: 'entry-1',
            description: 'Conta de luz',
            amount: 150,
            dueDate: new Date('2024-01-15'),
            categoryName: 'Utilidades',
            isOverdue: expect.any(Boolean),
          },
        ],
        accountsReceivable: [
          {
            id: 'entry-2',
            description: 'Freelance',
            amount: 1000,
            dueDate: new Date('2024-01-20'),
            categoryName: 'Trabalho',
            isOverdue: expect.any(Boolean),
          },
        ],
        period: {
          year: expect.any(Number),
          month: expect.any(Number),
        },
      })
    })

    it('should handle empty monthly entries', async () => {
      const mockMonthlyData = {
        monthlyEntries: [],
        accountsPayable: [],
        accountsReceivable: [],
      }

      ;(
        mockOverviewRepository.getMonthlyOverview as jest.Mock
      ).mockResolvedValue(mockMonthlyData)

      const result = await overviewService.getGeneralOverview(userId)

      expect(result.monthlyIncome).toBe(0)
      expect(result.monthlyExpenses).toBe(0)
      expect(result.totalAccountsPayable).toBe(0)
      expect(result.totalAccountsReceivable).toBe(0)
    })
  })

  describe('getTopExpensesByCategory', () => {
    it('should return top expenses for valid period', async () => {
      const mockDateRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      }

      const mockTopExpenses = [
        { categoryName: 'Alimentação', totalAmount: 1500 },
        { categoryName: 'Transporte', totalAmount: 800 },
      ]

      ;(
        mockOverviewRepository.getDateRangeForPeriod as jest.Mock
      ).mockReturnValue(mockDateRange)
      ;(
        mockOverviewRepository.getTopExpensesByCategory as jest.Mock
      ).mockResolvedValue(mockTopExpenses)

      const result = await overviewService.getTopExpensesByCategory(
        userId,
        'mes-atual',
      )

      expect(mockOverviewRepository.getDateRangeForPeriod).toHaveBeenCalledWith(
        'mes-atual',
      )
      expect(
        mockOverviewRepository.getTopExpensesByCategory,
      ).toHaveBeenCalledWith(
        userId,
        mockDateRange.startDate,
        mockDateRange.endDate,
      )

      expect(result).toEqual({
        expenses: mockTopExpenses,
        period: 'mes-atual',
        dateRange: mockDateRange,
        totalExpenses: 2300,
      })
    })

    it('should throw error for invalid period', async () => {
      await expect(
        overviewService.getTopExpensesByCategory(userId, 'periodo-invalido'),
      ).rejects.toThrow(
        'Período inválido. Períodos válidos: mes-atual, ultimos-15-dias, ultimos-30-dias, ultimos-3-meses, ultimos-6-meses',
      )
    })

    it('should use default period when none provided', async () => {
      const mockDateRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      }

      ;(
        mockOverviewRepository.getDateRangeForPeriod as jest.Mock
      ).mockReturnValue(mockDateRange)
      ;(
        mockOverviewRepository.getTopExpensesByCategory as jest.Mock
      ).mockResolvedValue([])

      await overviewService.getTopExpensesByCategory(userId)

      expect(mockOverviewRepository.getDateRangeForPeriod).toHaveBeenCalledWith(
        'mes-atual',
      )
    })
  })

  describe('getQuickStats', () => {
    it('should return quick statistics', async () => {
      const mockMonthlyData = {
        monthlyEntries: [
          { type: 'income', _sum: { amount: 5000 } },
          { type: 'expense', _sum: { amount: 3000 } },
        ],
        accountsPayable: [
          { dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // vencida
          { dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) }, // futura
        ],
        accountsReceivable: [
          { dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // vencida
        ],
      }

      ;(
        mockOverviewRepository.getMonthlyOverview as jest.Mock
      ).mockResolvedValue(mockMonthlyData)

      const result = await overviewService.getQuickStats(userId)

      expect(result).toEqual({
        monthlyBalance: 2000, // 5000 - 3000
        overduePayable: 1,
        overdueReceivable: 1,
        totalPendingPayable: 2,
        totalPendingReceivable: 1,
      })
    })
  })
})
