import { UserPreferencesRepository } from '@/repositories/user-preferences.repository'
import { BadRequestError } from '@/routes/_errors/bad-request-error'
import { UserPreferencesService } from '@/services/user-preferences.service'

// Mock do repositório
const mockUserPreferencesRepository = {
  findByUserId: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  existsByUserId: jest.fn(),
  createDefault: jest.fn(),
  upsertByUserId: jest.fn(),
  resetToDefault: jest.fn(),
} as jest.Mocked<UserPreferencesRepository>

// Mock do Prisma
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
} as any

describe('UserPreferencesService', () => {
  let userPreferencesService: UserPreferencesService

  beforeEach(() => {
    jest.clearAllMocks()
    userPreferencesService = new UserPreferencesService(
      mockUserPreferencesRepository,
      mockPrisma,
    )
  })

  describe('findByUserId', () => {
    it('should return user preferences when found', async () => {
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
      const mockUser = { id: 'user-1', email: 'test@example.com' }
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
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockUserPreferencesRepository.existsByUserId.mockResolvedValue(false)
      mockUserPreferencesRepository.createDefault.mockResolvedValue(
        mockDefaultPreferences,
      )

      const result = await userPreferencesService.findByUserId('user-1')

      expect(mockUserPreferencesRepository.findByUserId).toHaveBeenCalledWith(
        'user-1',
      )
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      })
      expect(mockUserPreferencesRepository.existsByUserId).toHaveBeenCalledWith(
        'user-1',
      )
      expect(mockUserPreferencesRepository.createDefault).toHaveBeenCalledWith(
        'user-1',
      )
      expect(result).toEqual(mockDefaultPreferences)
    })
  })

  describe('findById', () => {
    it('should return preferences when found and belongs to user', async () => {
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
    it('should create preferences successfully', async () => {
      const createData = {
        entryOrder: 'descending' as const,
        defaultNavigationPeriod: 'monthly' as const,
        showDailyBalance: false,
        viewMode: 'all' as const,
        isFinancialSummaryExpanded: false,
      }

      const mockPreferences = {
        id: '1',
        userId: 'user-1',
        ...createData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockUserPreferencesRepository.existsByUserId.mockResolvedValue(false)
      mockUserPreferencesRepository.create.mockResolvedValue(mockPreferences)

      const result = await userPreferencesService.create(createData, 'user-1')

      expect(mockUserPreferencesRepository.existsByUserId).toHaveBeenCalledWith(
        'user-1',
      )
      expect(mockUserPreferencesRepository.create).toHaveBeenCalledWith({
        ...createData,
        user: { connect: { id: 'user-1' } },
      })
      expect(result).toEqual(mockPreferences)
    })

    it('should throw error when preferences already exist', async () => {
      mockUserPreferencesRepository.existsByUserId.mockResolvedValue(true)

      const createData = {
        entryOrder: 'descending' as const,
        defaultNavigationPeriod: 'monthly' as const,
        showDailyBalance: false,
        viewMode: 'all' as const,
        isFinancialSummaryExpanded: false,
      }

      await expect(
        userPreferencesService.create(createData, 'user-1'),
      ).rejects.toThrow(
        new BadRequestError('Já existem preferências para este usuário'),
      )
    })
  })

  describe('update', () => {
    it('should update preferences successfully', async () => {
      const updateData = { entryOrder: 'ascending' as const }
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
      const updatedPreferences = { ...existingPreferences, ...updateData }

      mockUserPreferencesRepository.findById.mockResolvedValue(
        existingPreferences,
      )
      mockUserPreferencesRepository.update.mockResolvedValue(updatedPreferences)

      const result = await userPreferencesService.update(
        '1',
        updateData,
        'user-1',
      )

      expect(mockUserPreferencesRepository.findById).toHaveBeenCalledWith('1')
      expect(mockUserPreferencesRepository.update).toHaveBeenCalledWith(
        '1',
        updateData,
      )
      expect(result).toEqual(updatedPreferences)
    })

    it('should throw error when preferences not found', async () => {
      mockUserPreferencesRepository.findById.mockResolvedValue(null)

      const updateData = { entryOrder: 'ascending' as const }

      await expect(
        userPreferencesService.update('1', updateData, 'user-1'),
      ).rejects.toThrow(new BadRequestError('Preferências não encontradas'))
    })

    it('should throw error when preferences do not belong to user', async () => {
      const existingPreferences = {
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

      mockUserPreferencesRepository.findById.mockResolvedValue(
        existingPreferences,
      )

      const updateData = { entryOrder: 'ascending' as const }

      await expect(
        userPreferencesService.update('1', updateData, 'user-1'),
      ).rejects.toThrow(
        new BadRequestError('Preferências não pertencem ao usuário'),
      )
    })
  })

  describe('updateByUserId', () => {
    it('should update preferences by user ID successfully', async () => {
      const updateData = { entryOrder: 'ascending' as const }
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
      const updatedPreferences = { ...existingPreferences, ...updateData }

      mockUserPreferencesRepository.findByUserId.mockResolvedValue(
        existingPreferences,
      )
      mockUserPreferencesRepository.update.mockResolvedValue(updatedPreferences)

      const result = await userPreferencesService.updateByUserId(
        'user-1',
        updateData,
      )

      expect(mockUserPreferencesRepository.findByUserId).toHaveBeenCalledWith(
        'user-1',
      )
      expect(mockUserPreferencesRepository.update).toHaveBeenCalledWith(
        '1',
        updateData,
      )
      expect(result).toEqual(updatedPreferences)
    })

    it('should throw error when preferences not found for user', async () => {
      mockUserPreferencesRepository.findByUserId.mockResolvedValue(null)

      const updateData = { entryOrder: 'ascending' as const }

      await expect(
        userPreferencesService.updateByUserId('user-1', updateData),
      ).rejects.toThrow(new BadRequestError('Preferências não encontradas'))
    })
  })

  describe('delete', () => {
    it('should delete preferences successfully', async () => {
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

      mockUserPreferencesRepository.findById.mockResolvedValue(
        existingPreferences,
      )
      mockUserPreferencesRepository.delete.mockResolvedValue(
        existingPreferences,
      )

      const result = await userPreferencesService.delete('1', 'user-1')

      expect(mockUserPreferencesRepository.findById).toHaveBeenCalledWith('1')
      expect(mockUserPreferencesRepository.delete).toHaveBeenCalledWith('1')
      expect(result).toEqual(existingPreferences)
    })

    it('should throw error when preferences not found', async () => {
      mockUserPreferencesRepository.findById.mockResolvedValue(null)

      await expect(
        userPreferencesService.delete('1', 'user-1'),
      ).rejects.toThrow(new BadRequestError('Preferências não encontradas'))
    })

    it('should throw error when preferences do not belong to user', async () => {
      const existingPreferences = {
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

      mockUserPreferencesRepository.findById.mockResolvedValue(
        existingPreferences,
      )

      await expect(
        userPreferencesService.delete('1', 'user-1'),
      ).rejects.toThrow(
        new BadRequestError('Preferências não pertencem ao usuário'),
      )
    })
  })

  describe('upsert', () => {
    it('should upsert preferences successfully', async () => {
      const upsertData = { entryOrder: 'ascending' as const }
      const mockPreferences = {
        id: '1',
        userId: 'user-1',
        entryOrder: 'ascending',
        defaultNavigationPeriod: 'monthly',
        showDailyBalance: false,
        viewMode: 'all',
        isFinancialSummaryExpanded: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockUserPreferencesRepository.upsertByUserId.mockResolvedValue(
        mockPreferences,
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
      expect(result).toEqual(mockPreferences)
    })
  })

  describe('reset', () => {
    it('should reset preferences successfully', async () => {
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

      mockUserPreferencesRepository.resetToDefault.mockResolvedValue(
        mockPreferences,
      )

      const result = await userPreferencesService.reset('user-1')

      expect(mockUserPreferencesRepository.resetToDefault).toHaveBeenCalledWith(
        'user-1',
      )
      expect(result).toEqual(mockPreferences)
    })
  })

  describe('createDefault', () => {
    it('should create default preferences successfully', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' }
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

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockUserPreferencesRepository.existsByUserId.mockResolvedValue(false)
      mockUserPreferencesRepository.createDefault.mockResolvedValue(
        mockPreferences,
      )

      const result = await userPreferencesService.createDefault('user-1')

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      })
      expect(mockUserPreferencesRepository.existsByUserId).toHaveBeenCalledWith(
        'user-1',
      )
      expect(mockUserPreferencesRepository.createDefault).toHaveBeenCalledWith(
        'user-1',
      )
      expect(result).toEqual(mockPreferences)
    })

    it('should throw error when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      await expect(
        userPreferencesService.createDefault('user-1'),
      ).rejects.toThrow(new BadRequestError('Usuário não encontrado'))
    })

    it('should throw error when preferences already exist', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockUserPreferencesRepository.existsByUserId.mockResolvedValue(true)

      await expect(
        userPreferencesService.createDefault('user-1'),
      ).rejects.toThrow(
        new BadRequestError('Já existem preferências para este usuário'),
      )
    })
  })
})
