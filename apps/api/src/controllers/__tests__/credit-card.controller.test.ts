import { CreditCardController } from '../credit-card.controller'

// Declarações para Jest
declare const jest: any
declare const expect: any
declare const describe: any
declare const it: any
declare const beforeEach: any

// Mock do CreditCardService
const mockCreditCardService = {
  findMany: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getUsage: jest.fn(),
}

describe('Credit Card Controller', () => {
  let creditCardController: CreditCardController
  let mockRequest: any
  let mockReply: any

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Criar instância do controller
    creditCardController = new CreditCardController(mockCreditCardService as any)

    // Mock de request
    mockRequest = {
      user: { sub: 'test-user-id' },
      query: {},
      params: {},
      body: {},
      log: {
        info: jest.fn(),
        error: jest.fn(),
      },
    }

    // Mock de reply
    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    }

    // Mock dos métodos do BaseController
    jest
      .spyOn(creditCardController as any, 'handlePaginatedRequest')
      .mockImplementation(async (request: any, reply: any, operation: any) => {
        const result = await operation()
        return mockReply.status(200).send({ success: true, data: result })
      })

    jest
      .spyOn(creditCardController as any, 'handleRequest')
      .mockImplementation(async (request: any, reply: any, operation: any) => {
        const result = await operation()
        return mockReply.status(200).send({ success: true, data: result })
      })

    jest
      .spyOn(creditCardController as any, 'handleCreateRequest')
      .mockImplementation(async (request: any, reply: any, operation: any) => {
        const result = await operation()
        return mockReply.status(201).send({ success: true, data: result })
      })

    jest
      .spyOn(creditCardController as any, 'handleUpdateRequest')
      .mockImplementation(async (request: any, reply: any, operation: any) => {
        const result = await operation()
        return mockReply.status(200).send({ success: true, data: result })
      })

    jest
      .spyOn(creditCardController as any, 'handleDeleteRequest')
      .mockImplementation(async (request: any, reply: any, operation: any) => {
        await operation()
        return mockReply.status(204).send()
      })

    // Mock dos métodos de obtenção de dados
    jest
      .spyOn(creditCardController as any, 'getUserId')
      .mockReturnValue('test-user-id')
    jest.spyOn(creditCardController as any, 'getQueryParams').mockReturnValue({})
    jest.spyOn(creditCardController as any, 'getBodyParams').mockReturnValue({})
    jest.spyOn(creditCardController as any, 'getPathParams').mockReturnValue({})
  })

  describe('index', () => {
    it('should list credit cards with pagination', async () => {
      const mockCreditCards = [
        {
          id: '1',
          name: 'Cartão Principal',
          limit: '5000',
          usage: '1500',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const mockPagination = {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      }

      mockCreditCardService.findMany.mockResolvedValue({
        creditCards: mockCreditCards,
        pagination: mockPagination,
      })

      const result = await creditCardController.index(mockRequest, mockReply)

      expect(mockCreditCardService.findMany).toHaveBeenCalledWith('test-user-id', {
        search: undefined,
        page: 1,
        limit: 20,
      })

      expect(result).toBeDefined()
    })

    it('should apply filters correctly', async () => {
      const filters = {
        search: 'principal',
        page: 2,
        limit: 10,
      }

      jest
        .spyOn(creditCardController as any, 'getQueryParams')
        .mockReturnValue(filters)

      mockCreditCardService.findMany.mockResolvedValue({
        creditCards: [],
        pagination: {
          page: 2,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: true,
        },
      })

      await creditCardController.index(mockRequest, mockReply)

      expect(mockCreditCardService.findMany).toHaveBeenCalledWith('test-user-id', {
        search: 'principal',
        page: 2,
        limit: 10,
      })
    })
  })

  describe('selectOptions', () => {
    it('should return credit card options for select', async () => {
      const mockCreditCards = [
        {
          id: '1',
          name: 'Cartão Principal',
          icon: 'visa-icon',
          iconType: 'visa',
        },
        {
          id: '2',
          name: 'Cartão Secundário',
          icon: 'mastercard-icon',
          iconType: 'mastercard',
        },
      ]

      mockCreditCardService.findMany.mockResolvedValue({
        creditCards: mockCreditCards,
        pagination: {
          page: 1,
          limit: 1000,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      })

      const result = await creditCardController.selectOptions(mockRequest, mockReply)

      expect(mockCreditCardService.findMany).toHaveBeenCalledWith('test-user-id', {
        search: undefined,
        page: 1,
        limit: 1000,
      })

      expect(result).toBeDefined()
    })
  })

  describe('show', () => {
    it('should return a specific credit card', async () => {
      const mockCreditCard = {
        id: '1',
        name: 'Cartão Principal',
        limit: '5000',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest
        .spyOn(creditCardController as any, 'getPathParams')
        .mockReturnValue({ id: '1' })
      mockCreditCardService.findById.mockResolvedValue(mockCreditCard)

      const result = await creditCardController.show(mockRequest, mockReply)

      expect(mockCreditCardService.findById).toHaveBeenCalledWith('1', 'test-user-id')
      expect(result).toBeDefined()
    })
  })

  describe('store', () => {
    it('should create a new credit card', async () => {
      const creditCardData = {
        name: 'Novo Cartão',
        limit: '3000',
        icon: 'visa-icon',
        iconType: 'visa',
      }

      const createdCreditCard = {
        id: '1',
        ...creditCardData,
        userId: 'test-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest
        .spyOn(creditCardController as any, 'getBodyParams')
        .mockReturnValue(creditCardData)
      mockCreditCardService.create.mockResolvedValue(createdCreditCard)

      const result = await creditCardController.store(mockRequest, mockReply)

      expect(mockCreditCardService.create).toHaveBeenCalledWith(
        creditCardData,
        'test-user-id',
      )
      expect(result).toBeDefined()
    })
  })

  describe('update', () => {
    it('should update an existing credit card', async () => {
      const updateData = {
        name: 'Cartão Atualizado',
      }

      const updatedCreditCard = {
        id: '1',
        name: 'Cartão Atualizado',
        limit: '5000',
        icon: 'visa-icon',
        iconType: 'visa',
        userId: 'test-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest
        .spyOn(creditCardController as any, 'getPathParams')
        .mockReturnValue({ id: '1' })
      jest
        .spyOn(creditCardController as any, 'getBodyParams')
        .mockReturnValue(updateData)
      mockCreditCardService.update.mockResolvedValue(updatedCreditCard)

      const result = await creditCardController.update(mockRequest, mockReply)

      expect(mockCreditCardService.update).toHaveBeenCalledWith(
        '1',
        updateData,
        'test-user-id',
      )
      expect(result).toBeDefined()
    })
  })

  describe('destroy', () => {
    it('should delete a credit card', async () => {
      jest
        .spyOn(creditCardController as any, 'getPathParams')
        .mockReturnValue({ id: '1' })
      mockCreditCardService.delete.mockResolvedValue(undefined)

      const result = await creditCardController.destroy(mockRequest, mockReply)

      expect(mockCreditCardService.delete).toHaveBeenCalledWith('1', 'test-user-id')
      expect(result).toBeDefined()
    })
  })

  describe('usage', () => {
    it('should return credit card usage', async () => {
      const usageData = {
        usage: 1500.50,
        limit: 5000,
        availableLimit: 3499.50,
        creditCardId: '1',
        lastUpdated: new Date().toISOString(),
      }

      jest
        .spyOn(creditCardController as any, 'getPathParams')
        .mockReturnValue({ id: '1' })
      mockCreditCardService.getUsage.mockResolvedValue(usageData)

      await creditCardController.usage(mockRequest, mockReply)

      expect(mockCreditCardService.getUsage).toHaveBeenCalledWith('1', 'test-user-id')
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        data: { usage: '1500.5' },
      })
    })
  })

  describe('error handling', () => {
    it('should handle service errors gracefully', async () => {
      const error = new Error('Service error')
      mockCreditCardService.findMany.mockRejectedValue(error)

      await expect(creditCardController.index(mockRequest, mockReply)).rejects.toThrow(
        'Service error',
      )
    })

    it('should handle invalid user ID', async () => {
      jest
        .spyOn(creditCardController as any, 'getUserId')
        .mockImplementation(() => {
          throw new Error('Usuário não autenticado')
        })

      await expect(creditCardController.index(mockRequest, mockReply)).rejects.toThrow(
        'Usuário não autenticado',
      )
    })
  })
})
