import { FastifyReply, FastifyRequest } from 'fastify'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'

import { AccountController } from '@/controllers/account.controller'
import { AccountService } from '@/services/account.service'

// Mock do AccountService
jest.mock('@/services/account.service')

describe('AccountController', () => {
  let accountController: AccountController
  let mockAccountService: jest.Mocked<AccountService>
  let mockRequest: Partial<FastifyRequest>
  let mockReply: Partial<FastifyReply>

  beforeEach(() => {
    // Limpar todos os mocks
    jest.clearAllMocks()

    // Criar mock do AccountService
    mockAccountService = {
      findMany: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getBalance: jest.fn(),
    } as jest.Mocked<AccountService>

    // Criar instância do controller
    accountController = new AccountController(mockAccountService)

    // Mock do request
    mockRequest = {
      user: { sub: 'test-user-id' },
      method: 'GET',
      url: '/accounts',
      query: {},
      params: {},
      body: {},
      log: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
      } as any,
    }

    // Mock do reply
    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      header: jest.fn().mockReturnThis(),
    } as any
  })

  describe('index', () => {
    it('should return paginated accounts successfully', async () => {
      // Arrange
      const mockAccounts = [
        {
          id: '1',
          name: 'Conta Teste',
          type: 'bank' as const,
          balance: 1000,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
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

      mockAccountService.findMany.mockResolvedValue({
        accounts: mockAccounts,
        pagination: mockPagination,
      })

      mockRequest.query = { page: 1, limit: 20 }

      // Act
      await accountController.index(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      )

      // Assert
      expect(mockAccountService.findMany).toHaveBeenCalledWith('test-user-id', {
        type: undefined,
        includeInGeneralBalance: undefined,
        page: 1,
        limit: 20,
      })

      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.arrayContaining([
            expect.objectContaining({
              id: '1',
              name: 'Conta Teste',
              balance: 1000,
            }),
          ]),
          pagination: mockPagination,
        }),
      )
    })

    it('should handle filters correctly', async () => {
      // Arrange
      mockRequest.query = {
        type: 'bank',
        includeInGeneralBalance: true,
        page: 2,
        limit: 10,
      }

      mockAccountService.findMany.mockResolvedValue({
        accounts: [],
        pagination: {
          page: 2,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: true,
        },
      })

      // Act
      await accountController.index(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      )

      // Assert
      expect(mockAccountService.findMany).toHaveBeenCalledWith('test-user-id', {
        type: 'bank',
        includeInGeneralBalance: true,
        page: 2,
        limit: 10,
      })
    })
  })

  describe('selectOptions', () => {
    it('should return formatted select options', async () => {
      // Arrange
      const mockAccounts = [
        {
          id: '1',
          name: 'Conta Teste',
          icon: 'bank-icon',
          iconType: 'bank',
          balance: 1000,
        },
      ]

      mockAccountService.findMany.mockResolvedValue({
        accounts: mockAccounts,
        pagination: {
          page: 1,
          limit: 1000,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      })

      // Act
      await accountController.selectOptions(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      )

      // Assert
      expect(mockAccountService.findMany).toHaveBeenCalledWith('test-user-id', {
        page: 1,
        limit: 1000,
      })

      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: [
            {
              value: '1',
              label: 'Conta Teste',
              icon: 'bank-icon',
              iconType: 'bank',
            },
          ],
        }),
      )
    })
  })

  describe('show', () => {
    it('should return account by id', async () => {
      // Arrange
      const mockAccount = {
        id: '1',
        name: 'Conta Teste',
        type: 'bank' as const,
        balance: 1000,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      mockAccountService.findById.mockResolvedValue(mockAccount)
      mockRequest.params = { id: '1' }

      // Act
      await accountController.show(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      )

      // Assert
      expect(mockAccountService.findById).toHaveBeenCalledWith('1', 'test-user-id')

      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: '1',
            name: 'Conta Teste',
          }),
        }),
      )
    })
  })

  describe('store', () => {
    it('should create account successfully', async () => {
      // Arrange
      const createData = {
        name: 'Nova Conta',
        type: 'bank' as const,
        balance: 1000,
        description: 'Conta bancária',
      }

      const mockCreatedAccount = {
        id: '1',
        ...createData,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      mockAccountService.create.mockResolvedValue(mockCreatedAccount)
      mockRequest.body = createData

      // Act
      await accountController.store(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      )

      // Assert
      expect(mockAccountService.create).toHaveBeenCalledWith(
        createData,
        'test-user-id',
      )

      expect(mockReply.status).toHaveBeenCalledWith(201)
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: '1',
            name: 'Nova Conta',
          }),
          message: 'Conta criado com sucesso',
        }),
      )
    })
  })

  describe('update', () => {
    it('should update account successfully', async () => {
      // Arrange
      const updateData = {
        name: 'Conta Atualizada',
        type: 'bank' as const,
        balance: 2000,
      }

      const mockUpdatedAccount = {
        id: '1',
        ...updateData,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      mockAccountService.update.mockResolvedValue(mockUpdatedAccount)
      mockRequest.params = { id: '1' }
      mockRequest.body = updateData

      // Act
      await accountController.update(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      )

      // Assert
      expect(mockAccountService.update).toHaveBeenCalledWith(
        '1',
        updateData,
        'test-user-id',
      )

      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: '1',
            name: 'Conta Atualizada',
          }),
          message: 'Conta atualizado com sucesso',
        }),
      )
    })
  })

  describe('destroy', () => {
    it('should delete account successfully', async () => {
      // Arrange
      mockAccountService.delete.mockResolvedValue(undefined)
      mockRequest.params = { id: '1' }

      // Act
      await accountController.destroy(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      )

      // Assert
      expect(mockAccountService.delete).toHaveBeenCalledWith('1', 'test-user-id')

      expect(mockReply.status).toHaveBeenCalledWith(204)
      expect(mockReply.send).toHaveBeenCalledWith()
    })
  })

  describe('balance', () => {
    it('should return account balance', async () => {
      // Arrange
      const mockBalance = 1500.50
      mockAccountService.getBalance.mockResolvedValue(mockBalance)
      mockRequest.params = { id: '1' }

      // Act
      await accountController.balance(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      )

      // Assert
      expect(mockAccountService.getBalance).toHaveBeenCalledWith('1', 'test-user-id')

      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: {
            balance: 1500.50,
            accountId: '1',
            lastUpdated: expect.any(String),
          },
        }),
      )
    })
  })

  describe('error handling', () => {
    it('should handle service errors properly', async () => {
      // Arrange
      const error = new Error('Service error')
      mockAccountService.findMany.mockRejectedValue(error)

      // Act
      await accountController.index(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      )

      // Assert
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.any(String),
        }),
      )
    })

    it('should handle missing user id', async () => {
      // Arrange
      mockRequest.user = undefined

      // Act
      await accountController.index(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      )

      // Assert
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        }),
      )
    })
  })
})
