import { Account, AccountType, PrismaClient } from '@prisma/client'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'

import { AccountRepository } from '@/repositories/account.repository'

// Mock do PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    account: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    entry: {
      findMany: jest.fn(),
      aggregate: jest.fn(),
    },
  })),
}))

describe('AccountRepository', () => {
  let accountRepository: AccountRepository
  let mockPrisma: jest.Mocked<PrismaClient>

  beforeEach(() => {
    // Limpar todos os mocks
    jest.clearAllMocks()

    // Criar mock do PrismaClient
    mockPrisma = {
      account: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      entry: {
        findMany: jest.fn(),
        aggregate: jest.fn(),
      },
    } as jest.Mocked<PrismaClient>

    // Criar instância do repository
    accountRepository = new AccountRepository(mockPrisma)
  })

  describe('findMany', () => {
    it('should return accounts with pagination', async () => {
      // Arrange
      const mockAccounts = [
        {
          id: '1',
          name: 'Conta Teste',
          type: 'bank' as AccountType,
          balance: 1000,
          userId: 'test-user-id',
          includeInGeneralBalance: true,
          active: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]

      mockPrisma.account.findMany.mockResolvedValue(mockAccounts)
      mockPrisma.account.count.mockResolvedValue(1)

      // Act
      const result = await accountRepository.findMany({
        where: { userId: 'test-user-id' },
        skip: 0,
        take: 20,
      })

      // Assert
      expect(mockPrisma.account.findMany).toHaveBeenCalledWith({
        where: { userId: 'test-user-id' },
        skip: 0,
        take: 20,
      })

      expect(result).toEqual(mockAccounts)
    })

    it('should handle empty results', async () => {
      // Arrange
      mockPrisma.account.findMany.mockResolvedValue([])
      mockPrisma.account.count.mockResolvedValue(0)

      // Act
      const result = await accountRepository.findMany({
        where: { userId: 'test-user-id' },
        skip: 0,
        take: 20,
      })

      // Assert
      expect(result).toEqual([])
    })
  })

  describe('findUnique', () => {
    it('should return account by id and userId', async () => {
      // Arrange
      const mockAccount = {
        id: '1',
        name: 'Conta Teste',
        type: 'bank' as AccountType,
        balance: 1000,
        userId: 'test-user-id',
        includeInGeneralBalance: true,
        active: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      mockPrisma.account.findUnique.mockResolvedValue(mockAccount)

      // Act
      const result = await accountRepository.findUnique({
        where: { id: '1', userId: 'test-user-id' },
      })

      // Assert
      expect(mockPrisma.account.findUnique).toHaveBeenCalledWith({
        where: { id: '1', userId: 'test-user-id' },
      })

      expect(result).toEqual(mockAccount)
    })

    it('should return null when account not found', async () => {
      // Arrange
      mockPrisma.account.findUnique.mockResolvedValue(null)

      // Act
      const result = await accountRepository.findUnique({
        where: { id: '999', userId: 'test-user-id' },
      })

      // Assert
      expect(result).toBeNull()
    })
  })

  describe('create', () => {
    it('should create account successfully', async () => {
      // Arrange
      const createData = {
        name: 'Nova Conta',
        type: 'bank' as AccountType,
        balance: 1000,
        userId: 'test-user-id',
        includeInGeneralBalance: true,
        active: true,
      }

      const mockCreatedAccount = {
        id: '1',
        ...createData,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      mockPrisma.account.create.mockResolvedValue(mockCreatedAccount)

      // Act
      const result = await accountRepository.create({
        data: createData,
      })

      // Assert
      expect(mockPrisma.account.create).toHaveBeenCalledWith({
        data: createData,
      })

      expect(result).toEqual(mockCreatedAccount)
    })
  })

  describe('update', () => {
    it('should update account successfully', async () => {
      // Arrange
      const updateData = {
        name: 'Conta Atualizada',
        balance: 2000,
      }

      const mockUpdatedAccount = {
        id: '1',
        name: 'Conta Atualizada',
        type: 'bank' as AccountType,
        balance: 2000,
        userId: 'test-user-id',
        includeInGeneralBalance: true,
        active: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      mockPrisma.account.update.mockResolvedValue(mockUpdatedAccount)

      // Act
      const result = await accountRepository.update({
        where: { id: '1', userId: 'test-user-id' },
        data: updateData,
      })

      // Assert
      expect(mockPrisma.account.update).toHaveBeenCalledWith({
        where: { id: '1', userId: 'test-user-id' },
        data: updateData,
      })

      expect(result).toEqual(mockUpdatedAccount)
    })
  })

  describe('delete', () => {
    it('should delete account successfully', async () => {
      // Arrange
      const mockDeletedAccount = {
        id: '1',
        name: 'Conta Deletada',
        type: 'bank' as AccountType,
        balance: 1000,
        userId: 'test-user-id',
        includeInGeneralBalance: true,
        active: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      mockPrisma.account.delete.mockResolvedValue(mockDeletedAccount)

      // Act
      const result = await accountRepository.delete({
        where: { id: '1', userId: 'test-user-id' },
      })

      // Assert
      expect(mockPrisma.account.delete).toHaveBeenCalledWith({
        where: { id: '1', userId: 'test-user-id' },
      })

      expect(result).toEqual(mockDeletedAccount)
    })
  })

  describe('getAccountsWithBalance', () => {
    it('should return accounts with entries for balance calculation', async () => {
      // Arrange
      const mockAccountsWithEntries = [
        {
          id: '1',
          name: 'Conta Teste',
          type: 'bank' as AccountType,
          balance: 1000,
          userId: 'test-user-id',
          includeInGeneralBalance: true,
          active: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          entries: [
            {
              id: 'entry-1',
              amount: '1000',
              type: 'income',
              date: new Date('2024-01-01'),
            },
            {
              id: 'entry-2',
              amount: '500',
              type: 'expense',
              date: new Date('2024-01-01'),
            },
          ],
        },
      ]

      mockPrisma.account.findMany.mockResolvedValue(mockAccountsWithEntries)

      // Act
      const result = await accountRepository.getAccountsWithBalance('test-user-id')

      // Assert
      expect(mockPrisma.account.findMany).toHaveBeenCalledWith({
        where: { userId: 'test-user-id' },
        include: {
          entries: {
            select: {
              amount: true,
              type: true,
            },
          },
        },
      })

      expect(result).toEqual(mockAccountsWithEntries)
    })
  })

  describe('getAccountsWithBalance', () => {
    it('should return accounts with entries for balance calculation', async () => {
      // Arrange
      const mockAccountsWithEntries = [
        {
          id: '1',
          name: 'Conta Teste',
          type: 'bank' as AccountType,
          balance: 1000,
          userId: 'test-user-id',
          includeInGeneralBalance: true,
          active: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          entries: [
            {
              id: 'entry-1',
              amount: '1000',
              type: 'income',
              date: new Date('2024-01-01'),
            },
            {
              id: 'entry-2',
              amount: '500',
              type: 'expense',
              date: new Date('2024-01-01'),
            },
          ],
        },
      ]

      mockPrisma.account.findMany.mockResolvedValue(mockAccountsWithEntries)

      // Act
      const result = await accountRepository.getAccountsWithBalance('test-user-id')

      // Assert
      expect(mockPrisma.account.findMany).toHaveBeenCalledWith({
        where: { userId: 'test-user-id' },
        include: {
          entries: {
            where: { paid: true },
            select: {
              amount: true,
              type: true,
            },
          },
        },
      })

      expect(result).toEqual(mockAccountsWithEntries)
    })
  })

  describe('count', () => {
    it('should return count of accounts', async () => {
      // Arrange
      mockPrisma.account.count.mockResolvedValue(5)

      // Act
      const result = await accountRepository.count({
        where: { userId: 'test-user-id' },
      })

      // Assert
      expect(mockPrisma.account.count).toHaveBeenCalledWith({
        where: { userId: 'test-user-id' },
      })

      expect(result).toBe(5)
    })
  })

  describe('error handling', () => {
    it('should handle database errors', async () => {
      // Arrange
      const error = new Error('Database connection failed')
      mockPrisma.account.findMany.mockRejectedValue(error)

      // Act & Assert
      await expect(
        accountRepository.findMany({
          where: { userId: 'test-user-id' },
        }),
      ).rejects.toThrow('Database connection failed')
    })

    it('should handle validation errors', async () => {
      // Arrange
      const error = new Error('Validation failed')
      mockPrisma.account.create.mockRejectedValue(error)

      // Act & Assert
      await expect(
        accountRepository.create({
          data: {
            name: '',
            type: 'bank' as AccountType,
            balance: 1000,
            userId: 'test-user-id',
          },
        }),
      ).rejects.toThrow('Validation failed')
    })
  })

  describe('complex queries', () => {
    it('should handle complex where conditions', async () => {
      // Arrange
      const mockAccounts = [
        {
          id: '1',
          name: 'Conta Bancária',
          type: 'bank' as AccountType,
          balance: 1000,
          userId: 'test-user-id',
          includeInGeneralBalance: true,
          active: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]

      mockPrisma.account.findMany.mockResolvedValue(mockAccounts)

      // Act
      const result = await accountRepository.findMany({
        where: {
          userId: 'test-user-id',
          type: 'bank',
          includeInGeneralBalance: true,
          active: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          name: true,
          type: true,
          balance: true,
        },
      })

      // Assert
      expect(mockPrisma.account.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'test-user-id',
          type: 'bank',
          includeInGeneralBalance: true,
          active: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          name: true,
          type: true,
          balance: true,
        },
      })

      expect(result).toEqual(mockAccounts)
    })


  })
})
