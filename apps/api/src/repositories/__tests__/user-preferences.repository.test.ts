import { UserPreferencesRepository } from '../user-preferences.repository'

// Declarações para Jest
declare const jest: any
declare const expect: any
declare const describe: any
declare const it: any
declare const beforeEach: any
declare const afterEach: any

// Mock do PrismaClient
const mockPrismaClient = {
  userPreferences: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    upsert: jest.fn(),
  },
}

describe('User Preferences Repository', () => {
  let userPreferencesRepository: UserPreferencesRepository

  beforeEach(() => {
    jest.clearAllMocks()
    userPreferencesRepository = new UserPreferencesRepository(
      mockPrismaClient as any,
    )
  })

  describe('findMany', () => {
    it('should find many preferences with filters', async () => {
      const mockPreferences = [
        {
          id: '1',
          userId: 'user-1',
          entryOrder: 'descending',
          defaultNavigationPeriod: 'monthly',
          showDailyBalance: false,
          viewMode: 'all',
          isFinancialSummaryExpanded: false,
        },
        {
          id: '2',
          userId: 'user-2',
          entryOrder: 'ascending',
          defaultNavigationPeriod: 'weekly',
          showDailyBalance: true,
          viewMode: 'cashflow',
          isFinancialSummaryExpanded: true,
        },
      ]

      mockPrismaClient.userPreferences.findMany.mockResolvedValue(
        mockPreferences,
      )

      const result = await userPreferencesRepository.findMany({
        where: { userId: 'user-1' },
        skip: 0,
        take: 10,
      })

      expect(mockPrismaClient.userPreferences.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        skip: 0,
        take: 10,
      })
      expect(result).toEqual(mockPreferences)
    })

    it('should find many preferences with include', async () => {
      const mockPreferences = [
        {
          id: '1',
          userId: 'user-1',
          entryOrder: 'descending',
          defaultNavigationPeriod: 'monthly',
          showDailyBalance: false,
          viewMode: 'all',
          isFinancialSummaryExpanded: false,
          user: { id: 'user-1', name: 'User 1' },
        },
      ]

      mockPrismaClient.userPreferences.findMany.mockResolvedValue(
        mockPreferences,
      )

      const result = await userPreferencesRepository.findMany({
        include: { user: true },
      })

      expect(mockPrismaClient.userPreferences.findMany).toHaveBeenCalledWith({
        include: { user: true },
      })
      expect(result).toEqual(mockPreferences)
    })
  })

  describe('findUnique', () => {
    it('should find unique preferences by ID', async () => {
      const mockPreferences = {
        id: '1',
        userId: 'user-1',
        entryOrder: 'descending',
        defaultNavigationPeriod: 'monthly',
        showDailyBalance: false,
        viewMode: 'all',
        isFinancialSummaryExpanded: false,
      }

      mockPrismaClient.userPreferences.findUnique.mockResolvedValue(
        mockPreferences,
      )

      const result = await userPreferencesRepository.findById('1')

      expect(mockPrismaClient.userPreferences.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      })
      expect(result).toEqual(mockPreferences)
    })

    it('should find unique preferences with include', async () => {
      const mockPreferences = {
        id: '1',
        userId: 'user-1',
        entryOrder: 'descending',
        defaultNavigationPeriod: 'monthly',
        showDailyBalance: false,
        viewMode: 'all',
        isFinancialSummaryExpanded: false,
        user: { id: 'user-1', name: 'User 1' },
      }

      mockPrismaClient.userPreferences.findUnique.mockResolvedValue(
        mockPreferences,
      )

      const result = await userPreferencesRepository.findById('1', {
        include: { user: true },
      })

      expect(mockPrismaClient.userPreferences.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { user: true },
      })
      expect(result).toEqual(mockPreferences)
    })
  })

  describe('findFirst', () => {
    it('should find first preferences with filters', async () => {
      const mockPreferences = {
        id: '1',
        userId: 'user-1',
        entryOrder: 'descending',
        defaultNavigationPeriod: 'monthly',
        showDailyBalance: false,
        viewMode: 'all',
        isFinancialSummaryExpanded: false,
      }

      mockPrismaClient.userPreferences.findFirst.mockResolvedValue(
        mockPreferences,
      )

      const result = await userPreferencesRepository.findFirst({
        userId: 'user-1',
      })

      expect(mockPrismaClient.userPreferences.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      })
      expect(result).toEqual(mockPreferences)
    })
  })

  describe('create', () => {
    it('should create new preferences', async () => {
      const preferencesData = {
        entryOrder: 'descending' as const,
        defaultNavigationPeriod: 'monthly' as const,
        showDailyBalance: false,
        viewMode: 'all' as const,
        isFinancialSummaryExpanded: false,
        user: { connect: { id: 'user-1' } },
      }

      const createdPreferences = {
        id: '1',
        userId: 'user-1',
        entryOrder: 'descending',
        defaultNavigationPeriod: 'monthly',
        showDailyBalance: false,
        viewMode: 'all',
        isFinancialSummaryExpanded: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrismaClient.userPreferences.create.mockResolvedValue(
        createdPreferences,
      )

      const result = await userPreferencesRepository.create(preferencesData)

      expect(mockPrismaClient.userPreferences.create).toHaveBeenCalledWith({
        data: preferencesData,
      })
      expect(result).toEqual(createdPreferences)
    })

    it('should create preferences with include', async () => {
      const preferencesData = {
        entryOrder: 'descending' as const,
        defaultNavigationPeriod: 'monthly' as const,
        showDailyBalance: false,
        viewMode: 'all' as const,
        isFinancialSummaryExpanded: false,
        user: { connect: { id: 'user-1' } },
      }

      const createdPreferences = {
        id: '1',
        userId: 'user-1',
        entryOrder: 'descending',
        defaultNavigationPeriod: 'monthly',
        showDailyBalance: false,
        viewMode: 'all',
        isFinancialSummaryExpanded: false,
        user: { id: 'user-1', name: 'User 1' },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrismaClient.userPreferences.create.mockResolvedValue(
        createdPreferences,
      )

      const result = await userPreferencesRepository.create(preferencesData, {
        include: { user: true },
      })

      expect(mockPrismaClient.userPreferences.create).toHaveBeenCalledWith({
        data: preferencesData,
        include: { user: true },
      })
      expect(result).toEqual(createdPreferences)
    })
  })

  describe('update', () => {
    it('should update existing preferences', async () => {
      const updateData = {
        entryOrder: 'ascending' as const,
        showDailyBalance: true,
      }

      const updatedPreferences = {
        id: '1',
        userId: 'user-1',
        entryOrder: 'ascending',
        defaultNavigationPeriod: 'monthly',
        showDailyBalance: true,
        viewMode: 'all',
        isFinancialSummaryExpanded: false,
        updatedAt: new Date(),
      }

      mockPrismaClient.userPreferences.update.mockResolvedValue(
        updatedPreferences,
      )

      const result = await userPreferencesRepository.update('1', updateData)

      expect(mockPrismaClient.userPreferences.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
      })
      expect(result).toEqual(updatedPreferences)
    })
  })

  describe('delete', () => {
    it('should delete preferences', async () => {
      const deletedPreferences = {
        id: '1',
        userId: 'user-1',
        entryOrder: 'descending',
        defaultNavigationPeriod: 'monthly',
        showDailyBalance: false,
        viewMode: 'all',
        isFinancialSummaryExpanded: false,
      }

      mockPrismaClient.userPreferences.delete.mockResolvedValue(
        deletedPreferences,
      )

      const result = await userPreferencesRepository.delete('1')

      expect(mockPrismaClient.userPreferences.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      })
      expect(result).toEqual(deletedPreferences)
    })
  })

  describe('count', () => {
    it('should count preferences with filters', async () => {
      mockPrismaClient.userPreferences.count.mockResolvedValue(5)

      const result = await userPreferencesRepository.count({ userId: 'user-1' })

      expect(mockPrismaClient.userPreferences.count).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      })
      expect(result).toBe(5)
    })
  })

  describe('upsert', () => {
    it('should upsert preferences', async () => {
      const upsertData = {
        where: { userId: 'user-1' },
        create: {
          entryOrder: 'descending' as const,
          defaultNavigationPeriod: 'monthly' as const,
          showDailyBalance: false,
          viewMode: 'all' as const,
          isFinancialSummaryExpanded: false,
          user: { connect: { id: 'user-1' } },
        },
        update: {
          entryOrder: 'ascending' as const,
          showDailyBalance: true,
        },
      }

      const upsertedPreferences = {
        id: '1',
        userId: 'user-1',
        entryOrder: 'ascending',
        defaultNavigationPeriod: 'monthly',
        showDailyBalance: true,
        viewMode: 'all',
        isFinancialSummaryExpanded: false,
      }

      mockPrismaClient.userPreferences.upsert.mockResolvedValue(
        upsertedPreferences,
      )

      const result = await userPreferencesRepository.upsert(
        { userId: 'user-1' },
        upsertData.create,
        upsertData.update,
      )

      expect(mockPrismaClient.userPreferences.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        create: upsertData.create,
        update: upsertData.update,
      })
      expect(result).toEqual(upsertedPreferences)
    })
  })

  describe('findByUserId', () => {
    it('should find preferences by user ID', async () => {
      const mockPreferences = {
        id: '1',
        userId: 'user-1',
        entryOrder: 'descending',
        defaultNavigationPeriod: 'monthly',
        showDailyBalance: false,
        viewMode: 'all',
        isFinancialSummaryExpanded: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrismaClient.userPreferences.findUnique.mockResolvedValue(
        mockPreferences,
      )

      const result = await userPreferencesRepository.findByUserId('user-1')

      expect(mockPrismaClient.userPreferences.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      })
      expect(result).toEqual(mockPreferences)
    })
  })

  describe('existsByUserId', () => {
    it('should return true when preferences exist', async () => {
      const existingPreferences = {
        id: '1',
        userId: 'user-1',
        entryOrder: 'descending',
        defaultNavigationPeriod: 'monthly',
        showDailyBalance: false,
        viewMode: 'all',
        isFinancialSummaryExpanded: false,
      }

      mockPrismaClient.userPreferences.findUnique.mockResolvedValue(
        existingPreferences,
      )

      const result = await userPreferencesRepository.existsByUserId('user-1')

      expect(mockPrismaClient.userPreferences.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      })
      expect(result).toBe(true)
    })

    it('should return false when preferences do not exist', async () => {
      mockPrismaClient.userPreferences.findUnique.mockResolvedValue(null)

      const result = await userPreferencesRepository.existsByUserId('user-1')

      expect(mockPrismaClient.userPreferences.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      })
      expect(result).toBe(false)
    })
  })

  describe('createDefault', () => {
    it('should create default preferences', async () => {
      const defaultPreferences = {
        entryOrder: 'descending' as const,
        defaultNavigationPeriod: 'monthly' as const,
        showDailyBalance: false,
        viewMode: 'all' as const,
        isFinancialSummaryExpanded: false,
      }

      const createdPreferences = {
        id: '1',
        userId: 'user-1',
        ...defaultPreferences,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrismaClient.userPreferences.create.mockResolvedValue(
        createdPreferences,
      )

      const result = await userPreferencesRepository.createDefault('user-1')

      expect(mockPrismaClient.userPreferences.create).toHaveBeenCalledWith({
        data: {
          ...defaultPreferences,
          user: { connect: { id: 'user-1' } },
        },
      })
      expect(result).toEqual(createdPreferences)
    })
  })

  describe('upsertByUserId', () => {
    it('should upsert preferences by user ID', async () => {
      const createData = {
        entryOrder: 'descending' as const,
        defaultNavigationPeriod: 'monthly' as const,
        showDailyBalance: false,
        viewMode: 'all' as const,
        isFinancialSummaryExpanded: false,
      }

      const updateData = {
        entryOrder: 'ascending' as const,
        showDailyBalance: true,
      }

      const upsertedPreferences = {
        id: '1',
        userId: 'user-1',
        entryOrder: 'ascending',
        defaultNavigationPeriod: 'monthly',
        showDailyBalance: true,
        viewMode: 'all',
        isFinancialSummaryExpanded: false,
      }

      mockPrismaClient.userPreferences.upsert.mockResolvedValue(
        upsertedPreferences,
      )

      const result = await userPreferencesRepository.upsertByUserId(
        'user-1',
        createData,
        updateData,
      )

      expect(mockPrismaClient.userPreferences.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        create: {
          ...createData,
          user: { connect: { id: 'user-1' } },
        },
        update: updateData,
      })
      expect(result).toEqual(upsertedPreferences)
    })
  })

  describe('resetToDefault', () => {
    it('should reset preferences to default', async () => {
      const defaultPreferences = {
        entryOrder: 'descending' as const,
        defaultNavigationPeriod: 'monthly' as const,
        showDailyBalance: false,
        viewMode: 'all' as const,
        isFinancialSummaryExpanded: false,
      }

      const resetPreferences = {
        id: '1',
        userId: 'user-1',
        ...defaultPreferences,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrismaClient.userPreferences.upsert.mockResolvedValue(
        resetPreferences,
      )

      const result = await userPreferencesRepository.resetToDefault('user-1')

      expect(mockPrismaClient.userPreferences.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        create: {
          ...defaultPreferences,
          user: { connect: { id: 'user-1' } },
        },
        update: defaultPreferences,
      })
      expect(result).toEqual(resetPreferences)
    })
  })

  describe('error handling', () => {
    it('should handle Prisma errors gracefully', async () => {
      const prismaError = new Error('Database connection failed')
      mockPrismaClient.userPreferences.findMany.mockRejectedValue(prismaError)

      await expect(
        userPreferencesRepository.findMany({ where: { userId: 'user-1' } }),
      ).rejects.toThrow('Database connection failed')
    })

    it('should handle unique constraint violations', async () => {
      const uniqueConstraintError = new Error('Unique constraint failed')
      mockPrismaClient.userPreferences.create.mockRejectedValue(
        uniqueConstraintError,
      )

      await expect(
        userPreferencesRepository.create({
          entryOrder: 'descending',
          defaultNavigationPeriod: 'monthly',
          showDailyBalance: false,
          viewMode: 'all',
          isFinancialSummaryExpanded: false,
          user: { connect: { id: 'user-1' } },
        }),
      ).rejects.toThrow('Unique constraint failed')
    })
  })
})
