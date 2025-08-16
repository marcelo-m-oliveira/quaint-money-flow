import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { AccountType, PrismaClient } from '@prisma/client'

import { AccountRepository } from '@/repositories/account.repository'
import { BadRequestError } from '@/routes/_errors/bad-request-error'
import { AccountService } from '@/services/account.service'

// Mock do PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $transaction: jest.fn(),
  })),
}))

// Mock do AccountRepository
jest.mock('@/repositories/account.repository')

describe('AccountService', () => {
  let accountService: AccountService
  let mockAccountRepository: jest.Mocked<AccountRepository>
  let mockPrisma: jest.Mocked<PrismaClient>

  beforeEach(() => {
    // Limpar todos os mocks
    jest.clearAllMocks()

    // Criar mock do AccountRepository
    mockAccountRepository = {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      upsert: jest.fn(),
      findByUserId: jest.fn(),
      findByUserIdAndType: jest.fn(),
      existsByNameAndUserId: jest.fn(),
      getAccountsWithBalance: jest.fn(),
    } as jest.Mocked<AccountRepository>

    // Criar mock do PrismaClient
    mockPrisma = {
      $transaction: jest.fn(),
    } as jest.Mocked<PrismaClient>

    // Criar instância do service
    accountService = new AccountService(mockAccountRepository, mockPrisma)
  })

  describe('findMany', () => {
    it('should return paginated accounts with balance', async () => {
      // Arrange
      const userId = 'test-user-id'
      const mockAccountsWithEntries = [
        {
          id: '1',
          name: 'Conta Teste',
          type: 'bank' as AccountType,
          balance: 1000,
          includeInGeneralBalance: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          entries: [
            { amount: '1000', type: 'income' },
            { amount: '500', type: 'expense' },
          ],
        },
      ]

      mockAccountRepository.getAccountsWithBalance.mockResolvedValue(
        mockAccountsWithEntries,
      )

      // Act
      const result = await accountService.findMany(userId, {
        page: 1,
        limit: 20,
      })

      // Assert
      expect(mockAccountRepository.getAccountsWithBalance).toHaveBeenCalledWith(
        userId,
      )

      expect(result.accounts).toHaveLength(1)
      expect(result.accounts[0]).toEqual(
        expect.objectContaining({
          id: '1',
          name: 'Conta Teste',
          balance: 500, // 1000 - 500
        }),
      )

      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      })
    })

    it('should filter accounts by type', async () => {
      // Arrange
      const userId = 'test-user-id'
      const mockAccountsWithEntries = [
        {
          id: '1',
          name: 'Conta Bancária',
          type: 'bank' as AccountType,
          balance: 1000,
          includeInGeneralBalance: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          entries: [],
        },
        {
          id: '2',
          name: 'Poupança',
          type: 'savings' as AccountType,
          balance: 2000,
          includeInGeneralBalance: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          entries: [],
        },
      ]

      mockAccountRepository.getAccountsWithBalance.mockResolvedValue(
        mockAccountsWithEntries,
      )

      // Act
      const result = await accountService.findMany(userId, {
        type: 'bank',
        page: 1,
        limit: 20,
      })

      // Assert
      expect(result.accounts).toHaveLength(1)
      expect(result.accounts[0].type).toBe('bank')
    })

    it('should filter accounts by includeInGeneralBalance', async () => {
      // Arrange
      const userId = 'test-user-id'
      const mockAccountsWithEntries = [
        {
          id: '1',
          name: 'Conta Principal',
          type: 'bank' as AccountType,
          balance: 1000,
          includeInGeneralBalance: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          entries: [],
        },
        {
          id: '2',
          name: 'Conta Secundária',
          type: 'bank' as AccountType,
          balance: 2000,
          includeInGeneralBalance: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          entries: [],
        },
      ]

      mockAccountRepository.getAccountsWithBalance.mockResolvedValue(
        mockAccountsWithEntries,
      )

      // Act
      const result = await accountService.findMany(userId, {
        includeInGeneralBalance: false,
        page: 1,
        limit: 20,
      })

      // Assert
      expect(result.accounts).toHaveLength(1)
      expect(result.accounts[0].includeInGeneralBalance).toBe(false)
    })

    it('should handle pagination correctly', async () => {
      // Arrange
      const userId = 'test-user-id'
      const mockAccountsWithEntries = Array.from({ length: 25 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Conta ${i + 1}`,
        type: 'bank' as AccountType,
        balance: 1000,
        includeInGeneralBalance: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        entries: [],
      }))

      mockAccountRepository.getAccountsWithBalance.mockResolvedValue(
        mockAccountsWithEntries,
      )

      // Act
      const result = await accountService.findMany(userId, {
        page: 2,
        limit: 10,
      })

      // Assert
      expect(result.accounts).toHaveLength(10)
      expect(result.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      })
    })
  })

  describe('findById', () => {
    it('should return account by id', async () => {
      // Arrange
      const userId = 'test-user-id'
      const accountId = '1'
      const mockAccount = {
        id: accountId,
        name: 'Conta Teste',
        type: 'bank' as AccountType,
        balance: 1000,
        includeInGeneralBalance: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      mockAccountRepository.findUnique.mockResolvedValue(mockAccount)

      // Act
      const result = await accountService.findById(accountId, userId)

      // Assert
      expect(mockAccountRepository.findUnique).toHaveBeenCalledWith({
        where: { id: accountId, userId },
      })

      expect(result).toEqual(mockAccount)
    })

    it('should throw BadRequestError when account not found', async () => {
      // Arrange
      const userId = 'test-user-id'
      const accountId = '999'

      mockAccountRepository.findUnique.mockResolvedValue(null)

      // Act & Assert
      await expect(accountService.findById(accountId, userId)).rejects.toThrow(
        BadRequestError,
      )

      await expect(accountService.findById(accountId, userId)).rejects.toThrow(
        'Conta não encontrada',
      )
    })
  })

  describe('create', () => {
    it('should create account successfully', async () => {
      // Arrange
      const userId = 'test-user-id'
      const createData = {
        name: 'Nova Conta',
        type: 'bank' as AccountType,
        balance: 1000,
        description: 'Conta bancária',
        icon: 'bank-icon',
        color: '#000000',
        active: true,
        includeInGeneralBalance: true,
      }

      const mockCreatedAccount = {
        id: '1',
        ...createData,
        userId,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      mockPrisma.$transaction.mockResolvedValue([mockCreatedAccount])

      // Act
      const result = await accountService.create(createData, userId)

      // Assert
      expect(mockPrisma.$transaction).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.any(Function), // create account
          expect.any(Function), // create initial entry
        ]),
      )

      expect(result).toEqual(mockCreatedAccount)
    })

    it('should create account with default values', async () => {
      // Arrange
      const userId = 'test-user-id'
      const createData = {
        name: 'Nova Conta',
        type: 'bank' as AccountType,
        balance: 0,
      }

      const mockCreatedAccount = {
        id: '1',
        ...createData,
        userId,
        description: null,
        icon: null,
        color: null,
        active: true,
        includeInGeneralBalance: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      mockPrisma.$transaction.mockResolvedValue([mockCreatedAccount])

      // Act
      const result = await accountService.create(createData, userId)

      // Assert
      expect(result).toEqual(mockCreatedAccount)
    })
  })

  describe('update', () => {
    it('should update account successfully', async () => {
      // Arrange
      const userId = 'test-user-id'
      const accountId = '1'
      const updateData = {
        name: 'Conta Atualizada',
        type: 'bank' as AccountType,
        balance: 2000,
        description: 'Descrição atualizada',
      }

      const mockUpdatedAccount = {
        id: accountId,
        ...updateData,
        userId,
        icon: null,
        color: null,
        active: true,
        includeInGeneralBalance: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      mockAccountRepository.update.mockResolvedValue(mockUpdatedAccount)

      // Act
      const result = await accountService.update(accountId, updateData, userId)

      // Assert
      expect(mockAccountRepository.update).toHaveBeenCalledWith({
        where: { id: accountId, userId },
        data: updateData,
      })

      expect(result).toEqual(mockUpdatedAccount)
    })
  })

  describe('delete', () => {
    it('should delete account successfully', async () => {
      // Arrange
      const userId = 'test-user-id'
      const accountId = '1'

      mockAccountRepository.delete.mockResolvedValue(undefined)

      // Act
      await accountService.delete(accountId, userId)

      // Assert
      expect(mockAccountRepository.delete).toHaveBeenCalledWith({
        where: { id: accountId, userId },
      })
    })
  })

  describe('getBalance', () => {
    it('should return account balance', async () => {
      // Arrange
      const userId = 'test-user-id'
      const accountId = '1'
      const mockAccount = {
        id: accountId,
        name: 'Conta Teste',
        type: 'bank' as AccountType,
        balance: 1000,
        userId,
        includeInGeneralBalance: true,
        active: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      mockAccountRepository.findUnique.mockResolvedValue(mockAccount)
      mockPrisma.entry.findMany.mockResolvedValue([
        { amount: '1000', type: 'income' },
        { amount: '500', type: 'expense' },
      ])

      // Act
      const result = await accountService.getBalance(accountId, userId)

      // Assert
      expect(mockAccountRepository.findUnique).toHaveBeenCalledWith({
        where: { id: accountId, userId },
      })

      expect(result).toEqual({
        balance: 500, // 1000 - 500
        accountId,
        lastUpdated: expect.any(String),
      })
    })
  })

  describe('error handling', () => {
    it('should handle repository errors', async () => {
      // Arrange
      const userId = 'test-user-id'
      const error = new Error('Database error')

      mockAccountRepository.getAccountsWithBalance.mockRejectedValue(error)

      // Act & Assert
      await expect(
        accountService.findMany(userId, { page: 1, limit: 20 }),
      ).rejects.toThrow('Database error')
    })

    it('should handle repository errors in create', async () => {
      // Arrange
      const userId = 'test-user-id'
      const createData = {
        name: 'Nova Conta',
        type: 'bank' as AccountType,
        balance: 1000,
      }

      const error = new Error('Repository error')
      mockAccountRepository.findFirst.mockRejectedValue(error)

      // Act & Assert
      await expect(accountService.create(createData, userId)).rejects.toThrow(
        'Repository error',
      )
    })
  })
})
