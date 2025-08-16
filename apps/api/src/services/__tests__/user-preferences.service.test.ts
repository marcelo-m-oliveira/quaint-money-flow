import { BadRequestError } from '@/routes/_errors/bad-request-error'

import { UserPreferencesService } from '../user-preferences.service'

// Declarações para Jest
declare const jest: any
declare const expect: any
declare const describe: any
declare const it: any
declare const beforeEach: any

// Mock do UserPreferencesRepository
const mockUserPreferencesRepository = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  upsert: jest.fn(),
  findByUserId: jest.fn(),
  existsByUserId: jest.fn(),
  createDefault: jest.fn(),
  upsertByUserId: jest.fn(),
  resetToDefault: jest.fn(),
}

// Mock do PrismaClient
const mockPrismaClient = {
  user: {
    findUnique: jest.fn(),
  },
}

describe('User Preferences Service', () => {
  let userPreferencesService: UserPreferencesService

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Criar instância do service
    userPreferencesService = new UserPreferencesService(
      mockUserPreferencesRepository as any,
      mockPrismaClient as any,
    )
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

      mockUserPreferencesRepository.findByUserId.mockResolvedValue(
        mockPreferences,
      )

      const result = await userPreferencesService.findByUserId('user-1')

      expect(mockUserPreferencesRepository.findByUserId).toHaveBeenCalledWith(
        'user-1',
      )
      expect(result).toEqual(mockPreferences)
    })

    it('should create default preferences when not found', async () => {
      const mockDefaultPreferences = {
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

      mockUserPreferencesRepository.findByUserId.mockResolvedValue(null)
      mockPrismaClient.user.findUnique.mockResolvedValue({ id: 'user-1' })
      mockUserPreferencesRepository.createDefault.mockResolvedValue(
        mockDefaultPreferences,
      )

      const result = await userPreferencesService.findByUserId('user-1')

      expect(mockUserPreferencesRepository.findByUserId).toHaveBeenCalledWith(
        'user-1',
      )
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      })
      expect(mockUserPreferencesRepository.createDefault).toHaveBeenCalledWith(
        'user-1',
      )
      expect(result).toEqual(mockDefaultPreferences)
    })

    it('should throw error when user not found', async () => {
      mockUserPreferencesRepository.findByUserId.mockResolvedValue(null)
      mockPrismaClient.user.findUnique.mockResolvedValue(null)

      await expect(
        userPreferencesService.findByUserId('user-1'),
      ).rejects.toThrow(new BadRequestError('Usuário não encontrado'))
    })
  })

  describe('findById', () => {
    it('should find preferences by ID', async () => {
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

      mockUserPreferencesRepository.findById.mockResolvedValue(mockPreferences)

      const result = await userPreferencesService.findById('1', 'user-1')

      expect(mockUserPreferencesRepository.findById).toHaveBeenCalledWith('1')
      expect(result).toEqual(mockPreferences)
    })

    it('should throw error when preferences not found', async () => {
      mockUserPreferencesRepository.findById.mockResolvedValue(null)

      await expect(
        userPreferencesService.findById('1', 'user-1'),
      ).rejects.toThrow(new BadRequestError('Preferências não encontradas'))
    })

    it('should throw error when preferences do not belong to user', async () => {
      const mockPreferences = {
        id: '1',
        userId: 'user-2', // Different user
        entryOrder: 'descending',
        defaultNavigationPeriod: 'monthly',
        showDailyBalance: false,
        viewMode: 'all',
        isFinancialSummaryExpanded: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockUserPreferencesRepository.findById.mockResolvedValue(mockPreferences)

      await expect(
        userPreferencesService.findById('1', 'user-1'),
      ).rejects.toThrow(
        new BadRequestError('Preferências não pertencem ao usuário'),
      )
    })
  })

  describe('create', () => {
    it('should create new preferences', async () => {
      const preferencesData = {
        entryOrder: 'ascending' as const,
        defaultNavigationPeriod: 'weekly' as const,
        showDailyBalance: true,
        viewMode: 'cashflow' as const,
        isFinancialSummaryExpanded: true,
      }

      const createdPreferences = {
        id: '1',
        userId: 'user-1',
        ...preferencesData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockUserPreferencesRepository.existsByUserId.mockResolvedValue(false)
      mockUserPreferencesRepository.create.mockResolvedValue(createdPreferences)

      const result = await userPreferencesService.create(
        preferencesData,
        'user-1',
      )

      expect(mockUserPreferencesRepository.existsByUserId).toHaveBeenCalledWith(
        'user-1',
      )
      expect(mockUserPreferencesRepository.create).toHaveBeenCalledWith({
        ...preferencesData,
        user: { connect: { id: 'user-1' } },
      })
      expect(result).toEqual(createdPreferences)
    })

    it('should throw error when preferences already exist', async () => {
      const preferencesData = {
        entryOrder: 'ascending' as const,
        defaultNavigationPeriod: 'weekly' as const,
        showDailyBalance: true,
        viewMode: 'cashflow' as const,
        isFinancialSummaryExpanded: true,
      }

      mockUserPreferencesRepository.existsByUserId.mockResolvedValue(true)

      await expect(
        userPreferencesService.create(preferencesData, 'user-1'),
      ).rejects.toThrow(
        new BadRequestError('Já existem preferências para este usuário'),
      )
    })
  })

  describe('update', () => {
    it('should update existing preferences', async () => {
      const updateData = {
        entryOrder: 'ascending' as const,
        showDailyBalance: true,
      }

      const existingPreferences = {
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

      const updatedPreferences = {
        ...existingPreferences,
        ...updateData,
        updatedAt: new Date(),
      }

      mockUserPreferencesRepository.findByUserId.mockResolvedValue(
        existingPreferences,
      )
      mockUserPreferencesRepository.update.mockResolvedValue(updatedPreferences)

      const result = await userPreferencesService.update('user-1', updateData)

      expect(mockUserPreferencesRepository.findByUserId).toHaveBeenCalledWith(
        'user-1',
      )
      expect(mockUserPreferencesRepository.update).toHaveBeenCalledWith(
        '1',
        updateData,
      )
      expect(result).toEqual(updatedPreferences)
    })

    it('should create preferences with defaults when not found', async () => {
      const updateData = {
        entryOrder: 'ascending' as const,
        showDailyBalance: true,
      }

      const createdPreferences = {
        id: '1',
        userId: 'user-1',
        entryOrder: 'ascending',
        defaultNavigationPeriod: 'monthly',
        showDailyBalance: true,
        viewMode: 'all',
        isFinancialSummaryExpanded: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockUserPreferencesRepository.findByUserId.mockResolvedValue(null)
      mockUserPreferencesRepository.create.mockResolvedValue(createdPreferences)

      const result = await userPreferencesService.update('user-1', updateData)

      expect(mockUserPreferencesRepository.findByUserId).toHaveBeenCalledWith(
        'user-1',
      )
      expect(mockUserPreferencesRepository.create).toHaveBeenCalledWith({
        entryOrder: 'descending',
        defaultNavigationPeriod: 'monthly',
        showDailyBalance: false,
        viewMode: 'all',
        isFinancialSummaryExpanded: false,
        ...updateData,
        user: { connect: { id: 'user-1' } },
      })
      expect(result).toEqual(createdPreferences)
    })
  })

  describe('upsert', () => {
    it('should upsert preferences', async () => {
      const upsertData = {
        entryOrder: 'ascending' as const,
        defaultNavigationPeriod: 'weekly' as const,
        showDailyBalance: true,
        viewMode: 'cashflow' as const,
        isFinancialSummaryExpanded: true,
      }

      const upsertedPreferences = {
        id: '1',
        userId: 'user-1',
        ...upsertData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockUserPreferencesRepository.upsertByUserId.mockResolvedValue(
        upsertedPreferences,
      )

      const result = await userPreferencesService.upsert('user-1', upsertData)

      expect(mockUserPreferencesRepository.upsertByUserId).toHaveBeenCalledWith(
        'user-1',
        {
          entryOrder: 'descending',
          defaultNavigationPeriod: 'monthly',
          showDailyBalance: false,
          viewMode: 'all',
          isFinancialSummaryExpanded: false,
          ...upsertData,
        },
        upsertData,
      )
      expect(result).toEqual(upsertedPreferences)
    })
  })

  describe('delete', () => {
    it('should delete preferences', async () => {
      const existingPreferences = {
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

      mockUserPreferencesRepository.findByUserId.mockResolvedValue(
        existingPreferences,
      )
      mockUserPreferencesRepository.delete.mockResolvedValue(
        existingPreferences,
      )

      const result = await userPreferencesService.delete('user-1')

      expect(mockUserPreferencesRepository.findByUserId).toHaveBeenCalledWith(
        'user-1',
      )
      expect(mockUserPreferencesRepository.delete).toHaveBeenCalledWith('1')
      expect(result).toEqual(existingPreferences)
    })

    it('should throw error when preferences not found', async () => {
      mockUserPreferencesRepository.findByUserId.mockResolvedValue(null)

      await expect(userPreferencesService.delete('user-1')).rejects.toThrow(
        new BadRequestError('Preferências não encontradas'),
      )
    })
  })

  describe('reset', () => {
    it('should reset preferences to default', async () => {
      const resetPreferences = {
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

      mockUserPreferencesRepository.resetToDefault.mockResolvedValue(
        resetPreferences,
      )

      const result = await userPreferencesService.reset('user-1')

      expect(mockUserPreferencesRepository.resetToDefault).toHaveBeenCalledWith(
        'user-1',
      )
      expect(result).toEqual(resetPreferences)
    })
  })

  describe('createDefault', () => {
    it('should create default preferences', async () => {
      const defaultPreferences = {
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

      mockPrismaClient.user.findUnique.mockResolvedValue({ id: 'user-1' })
      mockUserPreferencesRepository.createDefault.mockResolvedValue(
        defaultPreferences,
      )

      const result = await userPreferencesService.createDefault('user-1')

      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      })
      expect(mockUserPreferencesRepository.createDefault).toHaveBeenCalledWith(
        'user-1',
      )
      expect(result).toEqual(defaultPreferences)
    })

    it('should throw error when user not found', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null)

      await expect(
        userPreferencesService.createDefault('user-1'),
      ).rejects.toThrow(new BadRequestError('Usuário não encontrado'))
    })
  })

  describe('error handling', () => {
    it('should handle repository errors gracefully', async () => {
      const error = new Error('Database error')
      mockUserPreferencesRepository.findByUserId.mockRejectedValue(error)

      await expect(
        userPreferencesService.findByUserId('user-1'),
      ).rejects.toThrow('Database error')
    })

    it('should handle Prisma errors gracefully', async () => {
      const error = new Error('Prisma error')
      mockPrismaClient.user.findUnique.mockRejectedValue(error)

      mockUserPreferencesRepository.findByUserId.mockResolvedValue(null)

      await expect(
        userPreferencesService.findByUserId('user-1'),
      ).rejects.toThrow('Prisma error')
    })
  })
})
