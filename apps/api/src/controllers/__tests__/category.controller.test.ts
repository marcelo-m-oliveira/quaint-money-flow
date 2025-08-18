import { CategoryController } from '../category.controller'

// Declarações para Jest
declare const jest: any
declare const expect: any
declare const describe: any
declare const it: any
declare const beforeEach: any

// Mock do CategoryService
const mockCategoryService = {
  findMany: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findForSelect: jest.fn(),
  getUsageStats: jest.fn(),
}

describe('Category Controller', () => {
  let categoryController: CategoryController
  let mockRequest: any
  let mockReply: any

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Criar instância do controller
    categoryController = new CategoryController(mockCategoryService as any)

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

    // Mock dos métodos do BaseController usados em store/update/destroy
    jest
      .spyOn(categoryController as any, 'handleCreateRequest')
      .mockImplementation(
        async (_request: any, _reply: any, operation: any) => {
          const result = await operation()
          return mockReply.status(201).send(result)
        },
      )

    jest
      .spyOn(categoryController as any, 'handleUpdateRequest')
      .mockImplementation(
        async (_request: any, _reply: any, operation: any) => {
          const result = await operation()
          return mockReply.status(200).send(result)
        },
      )

    jest
      .spyOn(categoryController as any, 'handleDeleteRequest')
      .mockImplementation(
        async (_request: any, _reply: any, operation: any) => {
          await operation()
          return mockReply.status(204).send()
        },
      )

    // Mock helpers de extração
    jest
      .spyOn(categoryController as any, 'getUserId')
      .mockReturnValue('test-user-id')
    jest.spyOn(categoryController as any, 'getQueryParams').mockReturnValue({})
    jest.spyOn(categoryController as any, 'getBodyParams').mockReturnValue({})
    jest.spyOn(categoryController as any, 'getPathParams').mockReturnValue({})
  })

  describe('index', () => {
    it('should list categories with pagination and convert dates', async () => {
      const mockCategories = [
        {
          id: '1',
          name: 'Alimentação',
          color: '#ff0000',
          icon: 'food',
          type: 'expense' as const,
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

      mockCategoryService.findMany.mockResolvedValue({
        categories: mockCategories,
        pagination: mockPagination,
      })

      await categoryController.index(mockRequest, mockReply)

      expect(mockCategoryService.findMany).toHaveBeenCalledWith(
        'test-user-id',
        {
          page: 1,
          limit: 20,
          type: undefined,
        },
      )

      expect(mockReply.status).toHaveBeenCalledWith(200)
      const sent = (mockReply.send as any).mock.calls[0][0]
      expect(Array.isArray(sent.data)).toBe(true)
      expect(sent.pagination).toEqual(mockPagination)
    })
  })

  describe('select', () => {
    it('should return select options', async () => {
      const options = [
        { value: '1', label: 'Alimentação', icon: 'food', color: '#ff0000' },
      ]
      mockRequest.query = { type: 'expense' }
      mockCategoryService.findForSelect.mockResolvedValue(options)

      await categoryController.select(mockRequest, mockReply)

      expect(mockCategoryService.findForSelect).toHaveBeenCalledWith(
        'test-user-id',
        'expense',
      )
      expect(mockReply.status).toHaveBeenCalledWith(200)
      expect(mockReply.send).toHaveBeenCalledWith(options)
    })
  })

  describe('usage', () => {
    it('should return usage stats', async () => {
      const usage = [
        {
          id: '1',
          name: 'Alimentação',
          icon: 'food',
          type: 'expense',
          entryCount: 5,
          totalAmount: 0,
        },
      ]
      mockCategoryService.getUsageStats.mockResolvedValue(usage)

      await categoryController.usage(mockRequest, mockReply)

      expect(mockCategoryService.getUsageStats).toHaveBeenCalledWith(
        'test-user-id',
      )
      expect(mockReply.status).toHaveBeenCalledWith(200)
      expect(mockReply.send).toHaveBeenCalledWith(usage)
    })
  })

  describe('show', () => {
    it('should return a specific category and convert dates', async () => {
      const now = new Date()
      const mockCategory = {
        id: '1',
        name: 'Alimentação',
        color: '#ff0000',
        icon: 'food',
        type: 'expense' as const,
        createdAt: now,
        updatedAt: now,
      }

      jest
        .spyOn(categoryController as any, 'getPathParams')
        .mockReturnValue({ id: '1' })
      mockCategoryService.findById.mockResolvedValue(mockCategory)

      await categoryController.show(mockRequest, mockReply)

      expect(mockCategoryService.findById).toHaveBeenCalledWith(
        '1',
        'test-user-id',
      )
      expect(mockReply.status).toHaveBeenCalledWith(200)
      const sent = (mockReply.send as any).mock.calls[0][0]
      expect(sent.id).toBe('1')
      expect(typeof sent.createdAt).toBe('number')
      expect(typeof sent.updatedAt).toBe('number')
    })
  })

  describe('store', () => {
    it('should create a new category', async () => {
      const data = {
        name: 'Transporte',
        color: '#00ff00',
        icon: 'car',
        type: 'expense' as const,
      }
      const created = {
        id: '2',
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest
        .spyOn(categoryController as any, 'getBodyParams')
        .mockReturnValue(data)
      mockCategoryService.create.mockResolvedValue(created)

      await categoryController.store(mockRequest, mockReply)

      expect(mockCategoryService.create).toHaveBeenCalledWith(
        data,
        'test-user-id',
      )
      expect(mockReply.status).toHaveBeenCalledWith(201)
    })
  })

  describe('update', () => {
    it('should update an existing category', async () => {
      const updateData = { name: 'Mercado' }
      const updated = {
        id: '1',
        name: 'Mercado',
        color: '#ff0000',
        icon: 'food',
        type: 'expense' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest
        .spyOn(categoryController as any, 'getPathParams')
        .mockReturnValue({ id: '1' })
      jest
        .spyOn(categoryController as any, 'getBodyParams')
        .mockReturnValue(updateData)
      mockCategoryService.update.mockResolvedValue(updated)

      await categoryController.update(mockRequest, mockReply)

      expect(mockCategoryService.update).toHaveBeenCalledWith(
        '1',
        updateData,
        'test-user-id',
      )
      expect(mockReply.status).toHaveBeenCalledWith(200)
    })
  })

  describe('destroy', () => {
    it('should delete a category', async () => {
      jest
        .spyOn(categoryController as any, 'getPathParams')
        .mockReturnValue({ id: '1' })
      mockCategoryService.delete.mockResolvedValue(undefined)

      await categoryController.destroy(mockRequest, mockReply)

      expect(mockCategoryService.delete).toHaveBeenCalledWith(
        '1',
        'test-user-id',
      )
      expect(mockReply.status).toHaveBeenCalledWith(204)
    })
  })
})
