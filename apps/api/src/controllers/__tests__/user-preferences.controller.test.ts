import { FastifyReply, FastifyRequest } from 'fastify'

import { UserPreferencesController } from '@/controllers/user-preferences.controller'
import { UserPreferencesService } from '@/services/user-preferences.service'

// Mock do UserPreferencesService
const mockUserPreferencesService = {
  findByUserId: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  updateByUserId: jest.fn(),
  delete: jest.fn(),
  upsert: jest.fn(),
  reset: jest.fn(),
  createDefault: jest.fn(),
} as jest.Mocked<UserPreferencesService>

// Mock do FastifyReply
const mockReply = {
  status: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
} as jest.Mocked<FastifyReply>

// Mock do FastifyRequest
const mockRequest = {
  user: { sub: 'user-1' },
  log: {
    info: jest.fn(),
    error: jest.fn(),
  },
} as jest.Mocked<FastifyRequest>

// Helper para criar mock request com parâmetros
const createMockRequest = (params: any = {}, body: any = {}) => ({
  user: { sub: 'user-1' },
  params,
  body,
  log: {
    info: jest.fn(),
    error: jest.fn(),
  },
}) as any

describe('UserPreferencesController', () => {
  let userPreferencesController: UserPreferencesController

  beforeEach(() => {
    jest.clearAllMocks()
    userPreferencesController = new UserPreferencesController(mockUserPreferencesService)
  })

  describe('index', () => {
    it('should return user preferences', async () => {
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
      mockUserPreferencesService.findByUserId.mockResolvedValue(mockPreferences)

      await userPreferencesController.index(mockRequest, mockReply)

      expect(mockUserPreferencesService.findByUserId).toHaveBeenCalledWith('user-1')
      expect(mockRequest.log.info).toHaveBeenCalledWith(
        { userId: 'user-1', operation: 'Busca de preferência do usuário' },
        'Iniciando Busca de preferência do usuário',
      )
      expect(mockReply.status).toHaveBeenCalledWith(200)
      expect(mockReply.send).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: '1',
          userId: 'user-1',
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        }),
      })
    })

    it('should handle error when preferences not found', async () => {
      const error = new Error('Preferências não encontradas')
      mockUserPreferencesService.findByUserId.mockRejectedValue(error)

      await userPreferencesController.index(mockRequest, mockReply)

      expect(mockRequest.log.error).toHaveBeenCalledWith(
        {
          error: 'Preferências não encontradas',
          operation: 'Busca de preferência do usuário',
        },
        'Erro em Busca de preferência do usuário',
      )
    })
  })

  describe('show', () => {
    it('should return preferences by ID', async () => {
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
      mockUserPreferencesService.findById.mockResolvedValue(mockPreferences)

      const request = createMockRequest({ id: '1' })

      await userPreferencesController.show(request as any, mockReply)

      expect(mockUserPreferencesService.findById).toHaveBeenCalledWith('1', 'user-1')
      expect(mockReply.status).toHaveBeenCalledWith(200)
      expect(mockReply.send).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: '1',
          userId: 'user-1',
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        }),
      })
    })

    it('should handle error when preferences not found', async () => {
      const error = new Error('Preferências não encontradas')
      mockUserPreferencesService.findById.mockRejectedValue(error)

      const request = createMockRequest({ id: '1' })

      await userPreferencesController.show(request as any, mockReply)

      expect(request.log.error).toHaveBeenCalledWith(
        {
          error: 'Preferências não encontradas',
          operation: 'Busca de preferência específica',
        },
        'Erro em Busca de preferência específica',
      )
    })
  })

  describe('store', () => {
    it('should create preferences successfully', async () => {
      const preferencesData = {
        entryOrder: 'descending' as const,
        defaultNavigationPeriod: 'monthly' as const,
        showDailyBalance: false,
        viewMode: 'all' as const,
        isFinancialSummaryExpanded: false,
      }
      const mockPreferences = {
        id: '1',
        userId: 'user-1',
        ...preferencesData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockUserPreferencesService.create.mockResolvedValue(mockPreferences)

      const request = createMockRequest({}, preferencesData)

      await userPreferencesController.store(request as any, mockReply)

      expect(mockUserPreferencesService.create).toHaveBeenCalledWith(
        preferencesData,
        'user-1',
      )
      expect(mockReply.status).toHaveBeenCalledWith(201)
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          userId: 'user-1',
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        }),
      )
    })

    it('should handle error when preferences already exist', async () => {
      const error = new Error('Já existem preferências para este usuário')
      mockUserPreferencesService.create.mockRejectedValue(error)

      const request = createMockRequest({}, { entryOrder: 'ascending' })

      await userPreferencesController.store(request as any, mockReply)

      expect(request.log.error).toHaveBeenCalledWith(
        {
          error: 'Já existem preferências para este usuário',
          operation: 'Criação de preferência',
        },
        'Erro em Criação de preferência',
      )
    })
  })

  describe('update', () => {
    it('should update preferences by ID successfully', async () => {
      const updateData = { entryOrder: 'ascending' as const }
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
      mockUserPreferencesService.update.mockResolvedValue(mockPreferences)

      const request = createMockRequest({ id: '1' }, updateData)

      await userPreferencesController.update(request as any, mockReply)

      expect(mockUserPreferencesService.update).toHaveBeenCalledWith(
        '1',
        updateData,
        'user-1',
      )
      expect(mockReply.status).toHaveBeenCalledWith(200)
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          userId: 'user-1',
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        }),
      )
    })

    it('should handle error when preferences not found', async () => {
      const error = new Error('Preferências não encontradas')
      mockUserPreferencesService.update.mockRejectedValue(error)

      const request = createMockRequest(
        { id: '1' },
        { entryOrder: 'ascending' },
      )

      await userPreferencesController.update(request as any, mockReply)

      expect(request.log.error).toHaveBeenCalledWith(
        {
          error: 'Preferências não encontradas',
          operation: 'Atualização de preferência',
        },
        'Erro em Atualização de preferência',
      )
    })
  })

  describe('updateByUserId', () => {
    it('should update preferences by user ID successfully', async () => {
      const updateData = { entryOrder: 'ascending' as const }
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
      mockUserPreferencesService.updateByUserId.mockResolvedValue(mockPreferences)

      const request = createMockRequest({}, updateData)

      await userPreferencesController.updateByUserId(request as any, mockReply)

      expect(mockUserPreferencesService.updateByUserId).toHaveBeenCalledWith(
        'user-1',
        updateData,
      )
      expect(mockReply.status).toHaveBeenCalledWith(200)
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          userId: 'user-1',
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        }),
      )
    })

    it('should handle error when preferences not found', async () => {
      const error = new Error('Preferências não encontradas')
      mockUserPreferencesService.updateByUserId.mockRejectedValue(error)

      const request = createMockRequest({}, { entryOrder: 'ascending' })

      await userPreferencesController.updateByUserId(request as any, mockReply)

      expect(request.log.error).toHaveBeenCalledWith(
        {
          error: 'Preferências não encontradas',
          operation: 'Atualização de preferência do usuário',
        },
        'Erro em Atualização de preferência do usuário',
      )
    })
  })

  describe('destroy', () => {
    it('should delete preferences successfully', async () => {
      const request = createMockRequest({ id: '1' })

      await userPreferencesController.destroy(request as any, mockReply)

      expect(mockUserPreferencesService.delete).toHaveBeenCalledWith(
        '1',
        'user-1',
      )
      expect(request.log.info).toHaveBeenCalledWith(
        { userId: 'user-1', operation: 'Exclusão de preferência' },
        'Iniciando Exclusão de preferência',
      )
      expect(mockReply.status).toHaveBeenCalledWith(204)
      expect(mockReply.send).toHaveBeenCalledWith()
    })

    it('should handle error when preferences not found', async () => {
      const error = new Error('Preferências não encontradas')
      mockUserPreferencesService.delete.mockRejectedValue(error)

      const request = createMockRequest({ id: '1' })

      await userPreferencesController.destroy(request as any, mockReply)

      expect(request.log.error).toHaveBeenCalledWith(
        {
          error: 'Preferências não encontradas',
          operation: 'Exclusão de preferência',
        },
        'Erro em Exclusão de preferência',
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
      mockUserPreferencesService.upsert.mockResolvedValue(mockPreferences)

      const request = createMockRequest({}, upsertData)

      await userPreferencesController.upsert(request as any, mockReply)

      expect(mockUserPreferencesService.upsert).toHaveBeenCalledWith(
        'user-1',
        upsertData,
      )
      expect(mockReply.status).toHaveBeenCalledWith(200)
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          userId: 'user-1',
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        }),
      )
    })

    it('should handle error when upsert fails', async () => {
      const error = new Error('Erro ao salvar preferências')
      mockUserPreferencesService.upsert.mockRejectedValue(error)

      const request = createMockRequest({}, { entryOrder: 'ascending' })

      await userPreferencesController.upsert(request as any, mockReply)

      expect(request.log.error).toHaveBeenCalledWith(
        {
          error: 'Erro ao salvar preferências',
          operation: 'Upsert de preferência',
        },
        'Erro em Upsert de preferência',
      )
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
      mockUserPreferencesService.reset.mockResolvedValue(mockPreferences)

      await userPreferencesController.reset(mockRequest, mockReply)

      expect(mockUserPreferencesService.reset).toHaveBeenCalledWith('user-1')
      expect(mockReply.status).toHaveBeenCalledWith(200)
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          userId: 'user-1',
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        }),
      )
    })

    it('should handle error when reset fails', async () => {
      const error = new Error('Erro ao resetar preferências')
      mockUserPreferencesService.reset.mockRejectedValue(error)

      await userPreferencesController.reset(mockRequest, mockReply)

      expect(mockRequest.log.error).toHaveBeenCalledWith(
        {
          error: 'Erro ao resetar preferências',
          operation: 'Reset de preferência para padrão',
        },
        'Erro em Reset de preferência para padrão',
      )
    })
  })

  describe('createDefault', () => {
    it('should create default preferences successfully', async () => {
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

      mockUserPreferencesService.createDefault.mockResolvedValue(
        defaultPreferences,
      )

      await userPreferencesController.createDefault(mockRequest, mockReply)

      expect(mockUserPreferencesService.createDefault).toHaveBeenCalledWith(
        'user-1',
      )
      expect(mockRequest.log.info).toHaveBeenCalledWith(
        { userId: 'user-1', operation: 'Criação de preferência padrão' },
        'Iniciando Criação de preferência padrão',
      )
      expect(mockReply.status).toHaveBeenCalledWith(201)
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          userId: 'user-1',
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        }),
      )
    })

    it('should handle error when user not found', async () => {
      const error = new Error('Usuário não encontrado')
      mockUserPreferencesService.createDefault.mockRejectedValue(error)

      await userPreferencesController.createDefault(mockRequest, mockReply)

      expect(mockRequest.log.error).toHaveBeenCalledWith(
        {
          error: 'Usuário não encontrado',
          operation: 'Criação de preferência padrão',
        },
        'Erro em Criação de preferência padrão',
      )
    })
  })
})
