import { BadRequestError } from '@/routes/_errors/bad-request-error'

import { UserPreferencesController } from '../user-preferences.controller'

// Declarações para Jest
declare const jest: any
declare const expect: any
declare const describe: any
declare const it: any
declare const beforeEach: any

// Mock do UserPreferencesService
const mockUserPreferencesService = {
  findByUserId: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  upsert: jest.fn(),
  delete: jest.fn(),
  reset: jest.fn(),
  createDefault: jest.fn(),
}

// Mock do FastifyRequest
const createMockRequest = (
  params = {},
  body = {},
  user = { sub: 'user-1' },
) => ({
  params,
  body,
  user,
  log: {
    info: jest.fn(),
    error: jest.fn(),
  },
})

// Mock do FastifyReply
const createMockReply = () => ({
  status: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
})

describe('User Preferences Controller', () => {
  let userPreferencesController: UserPreferencesController
  let mockRequest: any
  let mockReply: any

  beforeEach(() => {
    jest.clearAllMocks()
    userPreferencesController = new UserPreferencesController(
      mockUserPreferencesService as any,
    )
    mockRequest = createMockRequest()
    mockReply = createMockReply()
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

      expect(mockUserPreferencesService.findByUserId).toHaveBeenCalledWith(
        'user-1',
      )
      expect(mockRequest.log.info).toHaveBeenCalledWith(
        { userId: 'user-1', operation: 'Busca de preferência do usuário' },
        'Iniciando Busca de preferência do usuário',
      )
      expect(mockRequest.log.info).toHaveBeenCalledWith(
        { userId: 'user-1', operation: 'Busca de preferência do usuário' },
        'Busca de preferência do usuário concluído com sucesso',
      )
      expect(mockReply.status).toHaveBeenCalledWith(200)
      expect(mockReply.send).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: '1',
          userId: 'user-1',
          entryOrder: 'descending',
          defaultNavigationPeriod: 'monthly',
          showDailyBalance: false,
          viewMode: 'all',
          isFinancialSummaryExpanded: false,
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        }),
      })
    })

    it('should handle service errors', async () => {
      const error = new BadRequestError('Preferências não encontradas')
      mockUserPreferencesService.findByUserId.mockRejectedValue(error)

      await userPreferencesController.index(mockRequest, mockReply)

      expect(mockRequest.log.error).toHaveBeenCalledWith(
        {
          error: 'Preferências não encontradas',
          operation: 'Busca de preferência do usuário',
        },
        'Erro em Busca de preferência do usuário',
      )
      expect(mockReply.status).toHaveBeenCalledWith(400)
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Preferências não encontradas',
      })
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

      expect(mockUserPreferencesService.findById).toHaveBeenCalledWith(
        '1',
        'user-1',
      )
      expect(request.log.info).toHaveBeenCalledWith(
        { userId: 'user-1', operation: 'Busca de preferência específica' },
        'Iniciando Busca de preferência específica',
      )
      expect(request.log.info).toHaveBeenCalledWith(
        { userId: 'user-1', operation: 'Busca de preferência específica' },
        'Busca de preferência específica concluído com sucesso',
      )
      expect(mockReply.status).toHaveBeenCalledWith(200)
      expect(mockReply.send).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: '1',
          userId: 'user-1',
          entryOrder: 'descending',
          defaultNavigationPeriod: 'monthly',
          showDailyBalance: false,
          viewMode: 'all',
          isFinancialSummaryExpanded: false,
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        }),
      })
    })

    it('should handle service errors', async () => {
      const error = new BadRequestError('Preferências não encontradas')
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
      expect(mockReply.status).toHaveBeenCalledWith(400)
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Preferências não encontradas',
      })
    })
  })

  describe('store', () => {
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

      mockUserPreferencesService.create.mockResolvedValue(createdPreferences)

      const request = createMockRequest({}, preferencesData)

      await userPreferencesController.store(request as any, mockReply)

      expect(mockUserPreferencesService.create).toHaveBeenCalledWith(
        preferencesData,
        'user-1',
      )
      expect(request.log.info).toHaveBeenCalledWith(
        { userId: 'user-1', operation: 'Criação de preferência' },
        'Iniciando Criação de preferência',
      )
      expect(request.log.info).toHaveBeenCalledWith(
        { userId: 'user-1', operation: 'Criação de preferência' },
        'Criação de preferência concluído com sucesso',
      )
      expect(mockReply.status).toHaveBeenCalledWith(201)
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          userId: 'user-1',
          ...preferencesData,
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        }),
      )
    })

    it('should handle service errors', async () => {
      const error = new BadRequestError(
        'Já existem preferências para este usuário',
      )
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
      expect(mockReply.status).toHaveBeenCalledWith(400)
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Já existem preferências para este usuário',
      })
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
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockUserPreferencesService.update.mockResolvedValue(updatedPreferences)

      const request = createMockRequest({ id: '1' }, updateData)

      await userPreferencesController.update(request as any, mockReply)

      expect(mockUserPreferencesService.update).toHaveBeenCalledWith(
        '1',
        updateData,
        'user-1',
      )
      expect(request.log.info).toHaveBeenCalledWith(
        { userId: 'user-1', operation: 'Atualização de preferência' },
        'Iniciando Atualização de preferência',
      )
      expect(request.log.info).toHaveBeenCalledWith(
        { userId: 'user-1', operation: 'Atualização de preferência' },
        'Atualização de preferência concluído com sucesso',
      )
      expect(mockReply.status).toHaveBeenCalledWith(200)
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          userId: 'user-1',
          entryOrder: 'ascending',
          defaultNavigationPeriod: 'monthly',
          showDailyBalance: true,
          viewMode: 'all',
          isFinancialSummaryExpanded: false,
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        }),
      )
    })

    it('should handle service errors', async () => {
      const error = new BadRequestError('Preferências não encontradas')
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
      expect(mockReply.status).toHaveBeenCalledWith(400)
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Preferências não encontradas',
      })
    })
  })

  describe('destroy', () => {
    it('should delete preferences', async () => {
      mockUserPreferencesService.delete.mockResolvedValue(undefined)

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
      expect(request.log.info).toHaveBeenCalledWith(
        { userId: 'user-1', operation: 'Exclusão de preferência' },
        'Exclusão de preferência concluído com sucesso',
      )
      expect(mockReply.status).toHaveBeenCalledWith(204)
      expect(mockReply.send).toHaveBeenCalledWith()
    })

    it('should handle service errors', async () => {
      const error = new BadRequestError('Preferências não encontradas')
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
      expect(mockReply.status).toHaveBeenCalledWith(400)
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Preferências não encontradas',
      })
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

      mockUserPreferencesService.upsert.mockResolvedValue(upsertedPreferences)

      const request = createMockRequest({}, upsertData)

      await userPreferencesController.upsert(request as any, mockReply)

      expect(mockUserPreferencesService.upsert).toHaveBeenCalledWith(
        'user-1',
        upsertData,
      )
      expect(request.log.info).toHaveBeenCalledWith(
        { userId: 'user-1', operation: 'Upsert de preferência' },
        'Iniciando Upsert de preferência',
      )
      expect(request.log.info).toHaveBeenCalledWith(
        { userId: 'user-1', operation: 'Upsert de preferência' },
        'Upsert de preferência concluído com sucesso',
      )
      expect(mockReply.status).toHaveBeenCalledWith(200)
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          userId: 'user-1',
          ...upsertData,
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        }),
      )
    })

    it('should handle service errors', async () => {
      const error = new BadRequestError('Erro ao salvar preferências')
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
      expect(mockReply.status).toHaveBeenCalledWith(400)
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Erro ao salvar preferências',
      })
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

      mockUserPreferencesService.reset.mockResolvedValue(resetPreferences)

      await userPreferencesController.reset(mockRequest, mockReply)

      expect(mockUserPreferencesService.reset).toHaveBeenCalledWith('user-1')
      expect(mockRequest.log.info).toHaveBeenCalledWith(
        { userId: 'user-1', operation: 'Reset de preferência para padrão' },
        'Iniciando Reset de preferência para padrão',
      )
      expect(mockRequest.log.info).toHaveBeenCalledWith(
        { userId: 'user-1', operation: 'Reset de preferência para padrão' },
        'Reset de preferência para padrão concluído com sucesso',
      )
      expect(mockReply.status).toHaveBeenCalledWith(200)
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          userId: 'user-1',
          entryOrder: 'descending',
          defaultNavigationPeriod: 'monthly',
          showDailyBalance: false,
          viewMode: 'all',
          isFinancialSummaryExpanded: false,
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        }),
      )
    })

    it('should handle service errors', async () => {
      const error = new BadRequestError('Erro ao resetar preferências')
      mockUserPreferencesService.reset.mockRejectedValue(error)

      await userPreferencesController.reset(mockRequest, mockReply)

      expect(mockRequest.log.error).toHaveBeenCalledWith(
        {
          error: 'Erro ao resetar preferências',
          operation: 'Reset de preferência para padrão',
        },
        'Erro em Reset de preferência para padrão',
      )
      expect(mockReply.status).toHaveBeenCalledWith(400)
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Erro ao resetar preferências',
      })
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
      expect(mockRequest.log.info).toHaveBeenCalledWith(
        { userId: 'user-1', operation: 'Criação de preferência padrão' },
        'Criação de preferência padrão concluído com sucesso',
      )
      expect(mockReply.status).toHaveBeenCalledWith(201)
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          userId: 'user-1',
          entryOrder: 'descending',
          defaultNavigationPeriod: 'monthly',
          showDailyBalance: false,
          viewMode: 'all',
          isFinancialSummaryExpanded: false,
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        }),
      )
    })

    it('should handle service errors', async () => {
      const error = new BadRequestError('Usuário não encontrado')
      mockUserPreferencesService.createDefault.mockRejectedValue(error)

      await userPreferencesController.createDefault(mockRequest, mockReply)

      expect(mockRequest.log.error).toHaveBeenCalledWith(
        {
          error: 'Usuário não encontrado',
          operation: 'Criação de preferência padrão',
        },
        'Erro em Criação de preferência padrão',
      )
      expect(mockReply.status).toHaveBeenCalledWith(400)
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Usuário não encontrado',
      })
    })
  })
})
