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

  describe('show', () => {
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

      await userPreferencesController.show(mockRequest, mockReply)

      expect(mockUserPreferencesService.findByUserId).toHaveBeenCalledWith(
        'user-1',
      )
      expect(mockRequest.log.info).toHaveBeenCalledWith(
        { userId: 'user-1' },
        'Buscando preferências do usuário',
      )
      expect(mockRequest.log.info).toHaveBeenCalledWith(
        { userId: 'user-1', preferences: '1' },
        'Preferências encontradas com sucesso',
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
      const error = new BadRequestError('Usuário não encontrado')
      mockUserPreferencesService.findByUserId.mockRejectedValue(error)

      await userPreferencesController.show(mockRequest, mockReply)

      expect(mockRequest.log.error).toHaveBeenCalledWith(
        { error: 'Usuário não encontrado' },
        'Erro ao buscar preferências do usuário',
      )
      expect(mockReply.status).toHaveBeenCalledWith(400)
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Usuário não encontrado',
      })
    })
  })

  describe('showById', () => {
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

      await userPreferencesController.showById(request, mockReply)

      expect(mockUserPreferencesService.findById).toHaveBeenCalledWith(
        '1',
        'user-1',
      )
      expect(request.log.info).toHaveBeenCalledWith(
        { userId: 'user-1', preferencesId: '1' },
        'Buscando preferências por ID',
      )
      expect(request.log.info).toHaveBeenCalledWith(
        { userId: 'user-1', preferences: '1' },
        'Preferências encontradas com sucesso',
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
      const error = new BadRequestError('Preferências não encontradas')
      mockUserPreferencesService.findById.mockRejectedValue(error)

      const request = createMockRequest({ id: '1' })

      await userPreferencesController.showById(request, mockReply)

      expect(request.log.error).toHaveBeenCalledWith(
        { error: 'Preferências não encontradas' },
        'Erro ao buscar preferências por ID',
      )
      expect(mockReply.status).toHaveBeenCalledWith(400)
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Preferências não encontradas',
      })
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

      mockUserPreferencesService.create.mockResolvedValue(createdPreferences)

      const request = createMockRequest({}, preferencesData)

      await userPreferencesController.create(request, mockReply)

      expect(mockUserPreferencesService.create).toHaveBeenCalledWith(
        preferencesData,
        'user-1',
      )
      expect(request.log.info).toHaveBeenCalledWith(
        { userId: 'user-1', data: preferencesData },
        'Criando preferências do usuário',
      )
      expect(request.log.info).toHaveBeenCalledWith(
        { userId: 'user-1', preferences: '1' },
        'Preferências criadas com sucesso',
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

      await userPreferencesController.create(request, mockReply)

      expect(request.log.error).toHaveBeenCalledWith(
        { error: 'Já existem preferências para este usuário' },
        'Erro ao criar preferências do usuário',
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

      const request = createMockRequest({}, updateData)

      await userPreferencesController.update(request, mockReply)

      expect(mockUserPreferencesService.update).toHaveBeenCalledWith(
        'user-1',
        updateData,
      )
      expect(request.log.info).toHaveBeenCalledWith(
        { userId: 'user-1', data: updateData },
        'Atualizando preferências do usuário',
      )
      expect(request.log.info).toHaveBeenCalledWith(
        { userId: 'user-1', preferences: '1' },
        'Preferências atualizadas com sucesso',
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

      const request = createMockRequest({}, { entryOrder: 'ascending' })

      await userPreferencesController.update(request, mockReply)

      expect(request.log.error).toHaveBeenCalledWith(
        { error: 'Preferências não encontradas' },
        'Erro ao atualizar preferências do usuário',
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

      await userPreferencesController.upsert(request, mockReply)

      expect(mockUserPreferencesService.upsert).toHaveBeenCalledWith(
        'user-1',
        upsertData,
      )
      expect(request.log.info).toHaveBeenCalledWith(
        { userId: 'user-1', data: upsertData },
        'Criando/atualizando preferências do usuário',
      )
      expect(request.log.info).toHaveBeenCalledWith(
        { userId: 'user-1', preferences: '1' },
        'Preferências criadas/atualizadas com sucesso',
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

      await userPreferencesController.upsert(request, mockReply)

      expect(request.log.error).toHaveBeenCalledWith(
        { error: 'Erro ao salvar preferências' },
        'Erro ao criar/atualizar preferências do usuário',
      )
      expect(mockReply.status).toHaveBeenCalledWith(400)
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Erro ao salvar preferências',
      })
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
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockUserPreferencesService.delete.mockResolvedValue(deletedPreferences)

      await userPreferencesController.delete(mockRequest, mockReply)

      expect(mockUserPreferencesService.delete).toHaveBeenCalledWith('user-1')
      expect(mockRequest.log.info).toHaveBeenCalledWith(
        { userId: 'user-1' },
        'Excluindo preferências do usuário',
      )
      expect(mockRequest.log.info).toHaveBeenCalledWith(
        { userId: 'user-1', preferences: '1' },
        'Preferências excluídas com sucesso',
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
      const error = new BadRequestError('Preferências não encontradas')
      mockUserPreferencesService.delete.mockRejectedValue(error)

      await userPreferencesController.delete(mockRequest, mockReply)

      expect(mockRequest.log.error).toHaveBeenCalledWith(
        { error: 'Preferências não encontradas' },
        'Erro ao excluir preferências do usuário',
      )
      expect(mockReply.status).toHaveBeenCalledWith(400)
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Preferências não encontradas',
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
        { userId: 'user-1' },
        'Resetando preferências do usuário',
      )
      expect(mockRequest.log.info).toHaveBeenCalledWith(
        { userId: 'user-1', preferences: '1' },
        'Preferências resetadas com sucesso',
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
        { error: 'Erro ao resetar preferências' },
        'Erro ao resetar preferências do usuário',
      )
      expect(mockReply.status).toHaveBeenCalledWith(400)
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Erro ao resetar preferências',
      })
    })
  })

  describe('error handling', () => {
    it('should handle generic errors', async () => {
      const error = new Error('Unexpected error')
      mockUserPreferencesService.findByUserId.mockRejectedValue(error)

      await userPreferencesController.show(mockRequest, mockReply)

      expect(mockRequest.log.error).toHaveBeenCalledWith(
        { error: 'Unexpected error' },
        'Erro ao buscar preferências do usuário',
      )
      expect(mockReply.status).toHaveBeenCalledWith(500)
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Internal server error',
      })
    })

    it('should handle validation errors', async () => {
      const error = new Error('Validation failed')
      error.name = 'ValidationError'
      mockUserPreferencesService.create.mockRejectedValue(error)

      const request = createMockRequest({}, { invalidField: 'value' })

      await userPreferencesController.create(request, mockReply)

      expect(request.log.error).toHaveBeenCalledWith(
        { error: 'Validation failed' },
        'Erro ao criar preferências do usuário',
      )
      expect(mockReply.status).toHaveBeenCalledWith(500)
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Internal server error',
      })
    })
  })
})
