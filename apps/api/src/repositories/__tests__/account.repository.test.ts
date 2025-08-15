import { AccountType, IconType, Prisma, PrismaClient } from '@prisma/client'

import { AccountRepository } from '../account.repository'

// Mock do Prisma
const mockPrisma = {
  account: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    upsert: jest.fn(),
  },
  entry: {
    aggregate: jest.fn(),
  },
} as unknown as PrismaClient

describe('AccountRepository', () => {
  let accountRepository: AccountRepository
  const userId = 'user-123'

  beforeEach(() => {
    accountRepository = new AccountRepository(mockPrisma)
    jest.clearAllMocks()
  })

  describe('findMany', () => {
    it('should call prisma.account.findMany with correct parameters', async () => {
      const mockAccounts = [
        {
          id: 'account-1',
          name: 'Conta Corrente',
          type: 'bank',
          userId,
        },
      ]

      ;(mockPrisma.account.findMany as jest.Mock).mockResolvedValue(
        mockAccounts,
      )

      const options = {
        where: { userId },
        skip: 0,
        take: 20,
        orderBy: { createdAt: Prisma.SortOrder.desc },
      }

      const result = await accountRepository.findMany(options)

      expect(mockPrisma.account.findMany).toHaveBeenCalledWith(options)
      expect(result).toEqual(mockAccounts)
    })
  })

  describe('findUnique', () => {
    it('should call prisma.account.findUnique with correct parameters', async () => {
      const mockAccount = {
        id: 'account-1',
        name: 'Conta Corrente',
        userId,
      }

      ;(mockPrisma.account.findUnique as jest.Mock).mockResolvedValue(
        mockAccount,
      )

      const options = { where: { id: 'account-1' } }
      const result = await accountRepository.findUnique(options)

      expect(mockPrisma.account.findUnique).toHaveBeenCalledWith(options)
      expect(result).toEqual(mockAccount)
    })
  })

  describe('findFirst', () => {
    it('should call prisma.account.findFirst with correct parameters', async () => {
      const mockAccount = {
        id: 'account-1',
        name: 'Conta Corrente',
        userId,
      }

      ;(mockPrisma.account.findFirst as jest.Mock).mockResolvedValue(
        mockAccount,
      )

      const options = { where: { name: 'Conta Corrente', userId } }
      const result = await accountRepository.findFirst(options)

      expect(mockPrisma.account.findFirst).toHaveBeenCalledWith(options)
      expect(result).toEqual(mockAccount)
    })
  })

  describe('create', () => {
    it('should call prisma.account.create with correct parameters', async () => {
      const mockCreatedAccount = {
        id: 'account-1',
        name: 'Nova Conta',
        type: 'bank',
        userId,
      }

      ;(mockPrisma.account.create as jest.Mock).mockResolvedValue(
        mockCreatedAccount,
      )

      const options = {
        data: {
          name: 'Nova Conta',
          type: AccountType.cash,
          icon: 'cash-icon',
          iconType: IconType.generic,
          includeInGeneralBalance: true,
          user: { connect: { id: userId } },
        },
      }
      const result = await accountRepository.create(options)

      expect(mockPrisma.account.create).toHaveBeenCalledWith(options)
      expect(result).toEqual(mockCreatedAccount)
    })
  })

  describe('update', () => {
    it('should call prisma.account.update with correct parameters', async () => {
      const updateData = {
        name: 'Conta Atualizada',
        type: AccountType.cash,
      }

      const mockUpdatedAccount = {
        id: 'account-1',
        ...updateData,
        userId,
      }

      ;(mockPrisma.account.update as jest.Mock).mockResolvedValue(
        mockUpdatedAccount,
      )

      const options = {
        where: { id: 'account-1' },
        data: updateData,
      }

      const result = await accountRepository.update(options)

      expect(mockPrisma.account.update).toHaveBeenCalledWith(options)
      expect(result).toEqual(mockUpdatedAccount)
    })
  })

  describe('delete', () => {
    it('should call prisma.account.delete with correct parameters', async () => {
      const mockDeletedAccount = {
        id: 'account-1',
        name: 'Conta Deletada',
        userId,
      }

      ;(mockPrisma.account.delete as jest.Mock).mockResolvedValue(
        mockDeletedAccount,
      )

      const options = { where: { id: 'account-1' } }
      const result = await accountRepository.delete(options)

      expect(mockPrisma.account.delete).toHaveBeenCalledWith(options)
      expect(result).toEqual(mockDeletedAccount)
    })
  })

  describe('count', () => {
    it('should call prisma.account.count with correct parameters', async () => {
      ;(mockPrisma.account.count as jest.Mock).mockResolvedValue(5)

      const options = { where: { userId } }
      const result = await accountRepository.count(options)

      expect(mockPrisma.account.count).toHaveBeenCalledWith(options)
      expect(result).toBe(5)
    })
  })

  describe('upsert', () => {
    it('should call prisma.account.upsert with correct parameters', async () => {
      const mockUpsertedAccount = {
        id: 'account-1',
        name: 'Conta Upsert',
        type: 'bank',
        userId,
      }

      ;(mockPrisma.account.upsert as jest.Mock).mockResolvedValue(
        mockUpsertedAccount,
      )

      const options = {
        where: { id: 'account-1' },
        update: { name: 'Conta Upsert' },
        create: {
          name: 'New Account',
          type: AccountType.cash,
          icon: 'bank-icon',
          iconType: IconType.bank,
          includeInGeneralBalance: true,
          user: { connect: { id: userId } },
        },
      }

      const result = await accountRepository.upsert(options)

      expect(mockPrisma.account.upsert).toHaveBeenCalledWith(options)
      expect(result).toEqual(mockUpsertedAccount)
    })
  })

  describe('findByUserId', () => {
    it('should find accounts by user ID', async () => {
      const mockAccounts = [
        { id: 'account-1', name: 'Conta 1', userId },
        { id: 'account-2', name: 'Conta 2', userId },
      ]

      ;(mockPrisma.account.findMany as jest.Mock).mockResolvedValue(
        mockAccounts,
      )

      const result = await accountRepository.findByUserId(userId)

      expect(mockPrisma.account.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: {
          entries: false,
          _count: {
            select: {
              entries: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
      expect(result).toEqual(mockAccounts)
    })
  })

  describe('findByUserIdAndType', () => {
    it('should find accounts by user ID and type', async () => {
      const mockAccounts = [
        { id: 'account-1', name: 'Conta Banco', type: 'bank', userId },
      ]

      ;(mockPrisma.account.findMany as jest.Mock).mockResolvedValue(
        mockAccounts,
      )

      const result = await accountRepository.findByUserIdAndType(userId, 'bank')

      expect(mockPrisma.account.findMany).toHaveBeenCalledWith({
        where: { userId, type: 'bank' },
        orderBy: { createdAt: 'desc' },
      })
      expect(result).toEqual(mockAccounts)
    })
  })

  describe('existsByNameAndUserId', () => {
    it('should return true when account exists', async () => {
      ;(mockPrisma.account.findFirst as jest.Mock).mockResolvedValue({
        id: 'account-1',
        name: 'Conta Existente',
        userId,
      })

      const result = await accountRepository.existsByNameAndUserId(
        'Conta Existente',
        userId,
      )

      expect(mockPrisma.account.findFirst).toHaveBeenCalledWith({
        where: { name: 'Conta Existente', userId },
      })
      expect(result).toBe(true)
    })

    it('should return false when account does not exist', async () => {
      ;(mockPrisma.account.findFirst as jest.Mock).mockResolvedValue(null)

      const result = await accountRepository.existsByNameAndUserId(
        'Conta Inexistente',
        userId,
      )

      expect(result).toBe(false)
    })

    it('should exclude specific account ID when provided', async () => {
      ;(mockPrisma.account.findFirst as jest.Mock).mockResolvedValue(null)

      await accountRepository.existsByNameAndUserId(
        'Conta Teste',
        userId,
        'account-1',
      )

      expect(mockPrisma.account.findFirst).toHaveBeenCalledWith({
        where: {
          name: 'Conta Teste',
          userId,
          NOT: { id: 'account-1' },
        },
      })
    })
  })

  describe('getAccountsWithBalance', () => {
    it('should return accounts with calculated balance', async () => {
      const mockAccounts = [
        {
          id: 'account-1',
          name: 'Conta 1',
          userId,
          entries: [
            { amount: 1000, type: 'income' },
            { amount: 500, type: 'expense' },
          ],
        },
        {
          id: 'account-2',
          name: 'Conta 2',
          userId,
          entries: [
            { amount: 2000, type: 'income' },
            { amount: 300, type: 'expense' },
          ],
        },
      ]

      ;(mockPrisma.account.findMany as jest.Mock).mockResolvedValue(
        mockAccounts,
      )

      const result = await accountRepository.getAccountsWithBalance(userId)

      expect(mockPrisma.account.findMany).toHaveBeenCalledWith({
        where: { userId },
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

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual(mockAccounts[0])
      expect(result[1]).toEqual(mockAccounts[1])
    })

    it('should handle accounts with no entries', async () => {
      const mockAccounts = [
        {
          id: 'account-1',
          name: 'Conta Vazia',
          userId,
          entries: [],
        },
      ]

      ;(mockPrisma.account.findMany as jest.Mock).mockResolvedValue(
        mockAccounts,
      )

      const result = await accountRepository.getAccountsWithBalance(userId)

      expect(result[0]).toEqual(mockAccounts[0])
    })
  })
})
