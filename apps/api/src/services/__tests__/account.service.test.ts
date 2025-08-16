import { BadRequestError } from '@/routes/_errors/bad-request-error'

import { AccountService } from '../account.service'

// Declarações para Jest
declare const jest: any
declare const expect: any
declare const describe: any
declare const it: any
declare const beforeEach: any

// Mock do AccountRepository
const mockAccountRepository = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  upsert: jest.fn(),
  findByUserId: jest.fn(),
  findByUserIdAndType: jest.fn(),
  existsByNameAndUserId: jest.fn(),
  getAccountsWithBalance: jest.fn(),
  getAccountBalance: jest.fn(),
}

// Mock do PrismaClient
const mockPrismaClient = {
  entry: {
    count: jest.fn(),
    findMany: jest.fn(),
  },
}

describe('Account Service', () => {
  let accountService: AccountService

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Criar instância do service
    accountService = new AccountService(
      mockAccountRepository as any,
      mockPrismaClient as any,
    )
  })

  describe('findMany', () => {
    it('should find accounts with pagination and filters', async () => {
      const mockAccountsWithEntries = [
        {
          id: '1',
          name: 'Conta Principal',
          type: 'bank',
          userId: 'user-1',
          includeInGeneralBalance: true,
          entries: [
            { amount: '100', type: 'income' },
            { amount: '50', type: 'expense' },
          ],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: '2',
          name: 'Conta Poupança',
          type: 'bank',
          userId: 'user-1',
          includeInGeneralBalance: true,
          entries: [{ amount: '200', type: 'income' }],
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
      ]

      mockAccountRepository.getAccountsWithBalance.mockResolvedValue(
        mockAccountsWithEntries,
      )

      const result = await accountService.findMany('user-1', {
        page: 1,
        limit: 10,
        type: 'bank',
        includeInGeneralBalance: true,
        search: 'principal',
      })

      expect(mockAccountRepository.getAccountsWithBalance).toHaveBeenCalledWith(
        'user-1',
      )
      expect(result.accounts).toHaveLength(1)
      expect(result.accounts[0].name).toBe('Conta Principal')
      expect(result.accounts[0].balance).toBe(50) // 100 - 50
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      })
    })

    it('should find all accounts without filters', async () => {
      const mockAccountsWithEntries = [
        {
          id: '1',
          name: 'Conta Principal',
          type: 'bank',
          userId: 'user-1',
          includeInGeneralBalance: true,
          entries: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]

      mockAccountRepository.getAccountsWithBalance.mockResolvedValue(
        mockAccountsWithEntries,
      )

      const result = await accountService.findMany('user-1', {
        page: 1,
        limit: 20,
      })

      expect(mockAccountRepository.getAccountsWithBalance).toHaveBeenCalledWith(
        'user-1',
      )
      expect(result.accounts).toHaveLength(1)
      expect(result.accounts[0].balance).toBe(0)
    })

    it('should handle pagination correctly', async () => {
      const mockAccountsWithEntries = Array.from({ length: 25 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Conta ${i + 1}`,
        type: 'bank' as const,
        userId: 'user-1',
        includeInGeneralBalance: true,
        entries: [],
        createdAt: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
        updatedAt: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
      }))

      mockAccountRepository.getAccountsWithBalance.mockResolvedValue(
        mockAccountsWithEntries,
      )

      const result = await accountService.findMany('user-1', {
        page: 2,
        limit: 10,
      })

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

    it('should filter by search term', async () => {
      const mockAccountsWithEntries = [
        {
          id: '1',
          name: 'Conta Principal',
          type: 'bank',
          userId: 'user-1',
          entries: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Conta Poupança',
          type: 'bank',
          userId: 'user-1',
          entries: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockAccountRepository.getAccountsWithBalance.mockResolvedValue(
        mockAccountsWithEntries,
      )

      const result = await accountService.findMany('user-1', {
        page: 1,
        limit: 10,
        search: 'poupança',
      })

      expect(result.accounts).toHaveLength(1)
      expect(result.accounts[0].name).toBe('Conta Poupança')
    })
  })

  describe('findById', () => {
    it('should find account by ID', async () => {
      const mockAccount = {
        id: '1',
        name: 'Conta Principal',
        type: 'bank',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockAccountRepository.findById.mockResolvedValue(mockAccount)

      const result = await accountService.findById('1', 'user-1')

      expect(mockAccountRepository.findUnique).toHaveBeenCalledWith({
        where: { id: '1', userId: 'user-1' },
      })
      expect(result).toEqual(mockAccount)
    })

    it('should throw error when account not found', async () => {
      mockAccountRepository.findUnique.mockResolvedValue(null)

      await expect(accountService.findById('1', 'user-1')).rejects.toThrow(
        new BadRequestError('Conta não encontrada'),
      )
    })
  })

  describe('create', () => {
    it('should create a new account', async () => {
      const accountData = {
        name: 'Nova Conta',
        type: 'bank' as const,
        icon: 'bank-icon',
        iconType: 'bank' as const,
        includeInGeneralBalance: true,
      }

      const createdAccount = {
        id: '1',
        ...accountData,
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockAccountRepository.findFirst.mockResolvedValue(null)
      mockAccountRepository.create.mockResolvedValue(createdAccount)

      const result = await accountService.create(accountData, 'user-1')

      expect(mockAccountRepository.findFirst).toHaveBeenCalledWith({
        where: {
          name: 'Nova Conta',
          userId: 'user-1',
        },
      })
      expect(mockAccountRepository.create).toHaveBeenCalledWith({
        data: {
          ...accountData,
          user: { connect: { id: 'user-1' } },
        },
      })
      expect(result).toEqual(createdAccount)
    })

    it('should throw error when account with same name exists', async () => {
      const accountData = {
        name: 'Conta Existente',
        type: 'bank' as const,
        icon: 'bank-icon',
        iconType: 'bank' as const,
        includeInGeneralBalance: true,
      }

      const existingAccount = {
        id: '1',
        name: 'Conta Existente',
        type: 'bank',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockAccountRepository.findFirst.mockResolvedValue(existingAccount)

      await expect(
        accountService.create(accountData, 'user-1'),
      ).rejects.toThrow(
        new BadRequestError('Já existe uma conta com este nome'),
      )
    })
  })

  describe('update', () => {
    it('should update an existing account', async () => {
      const updateData = {
        name: 'Conta Atualizada',
      }

      const existingAccount = {
        id: '1',
        name: 'Conta Original',
        type: 'bank',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const updatedAccount = {
        id: '1',
        name: 'Conta Atualizada',
        type: 'bank',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockAccountRepository.findUnique.mockResolvedValue(existingAccount)
      mockAccountRepository.findFirst.mockResolvedValue(null)
      mockAccountRepository.update.mockResolvedValue(updatedAccount)

      const result = await accountService.update('1', updateData, 'user-1')

      expect(mockAccountRepository.findUnique).toHaveBeenCalledWith({
        where: { id: '1', userId: 'user-1' },
      })
      expect(mockAccountRepository.findFirst).toHaveBeenCalledWith({
        where: {
          name: 'Conta Atualizada',
          userId: 'user-1',
          NOT: { id: '1' },
        },
      })
      expect(mockAccountRepository.update).toHaveBeenCalledWith({
        where: { id: '1', userId: 'user-1' },
        data: updateData,
      })
      expect(result).toEqual(updatedAccount)
    })

    it('should throw error when account not found', async () => {
      mockAccountRepository.findUnique.mockResolvedValue(null)

      await expect(
        accountService.update('1', { name: 'Test' }, 'user-1'),
      ).rejects.toThrow(new BadRequestError('Conta não encontrada'))
    })

    it('should throw error when new name conflicts with existing account', async () => {
      const existingAccount = {
        id: '1',
        name: 'Conta Original',
        type: 'bank',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const conflictingAccount = {
        id: '2',
        name: 'Conta Conflitante',
        type: 'bank',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockAccountRepository.findUnique.mockResolvedValue(existingAccount)
      mockAccountRepository.findFirst.mockResolvedValue(conflictingAccount)

      await expect(
        accountService.update('1', { name: 'Conta Conflitante' }, 'user-1'),
      ).rejects.toThrow(
        new BadRequestError('Já existe uma conta com este nome'),
      )
    })

    it('should update without name validation when name is not provided', async () => {
      const existingAccount = {
        id: '1',
        name: 'Conta Original',
        type: 'bank',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const updatedAccount = {
        id: '1',
        name: 'Conta Original',
        type: 'investment',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockAccountRepository.findUnique.mockResolvedValue(existingAccount)
      mockAccountRepository.update.mockResolvedValue(updatedAccount)

      const result = await accountService.update(
        '1',
        { type: 'investment' },
        'user-1',
      )

      expect(mockAccountRepository.findFirst).not.toHaveBeenCalled()
      expect(mockAccountRepository.update).toHaveBeenCalledWith({
        where: { id: '1', userId: 'user-1' },
        data: { type: 'investment' },
      })
      expect(result).toEqual(updatedAccount)
    })
  })

  describe('delete', () => {
    it('should delete an account without entries', async () => {
      const existingAccount = {
        id: '1',
        name: 'Conta Principal',
        type: 'bank',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const deletedAccount = {
        id: '1',
        name: 'Conta Principal',
        type: 'bank',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockAccountRepository.findUnique.mockResolvedValue(existingAccount)
      mockPrismaClient.entry.count.mockResolvedValue(0)
      mockAccountRepository.delete.mockResolvedValue(deletedAccount)

      const result = await accountService.delete('1', 'user-1')

      expect(mockAccountRepository.findUnique).toHaveBeenCalledWith({
        where: { id: '1', userId: 'user-1' },
      })
      expect(mockPrismaClient.entry.count).toHaveBeenCalledWith({
        where: { accountId: '1', userId: 'user-1' },
      })
      expect(mockAccountRepository.delete).toHaveBeenCalledWith({
        where: { id: '1', userId: 'user-1' },
      })
      expect(result).toEqual(deletedAccount)
    })

    it('should throw error when account not found', async () => {
      mockAccountRepository.findUnique.mockResolvedValue(null)

      await expect(accountService.delete('1', 'user-1')).rejects.toThrow(
        new BadRequestError('Conta não encontrada'),
      )
    })

    it('should throw error when account has entries', async () => {
      const existingAccount = {
        id: '1',
        name: 'Conta Principal',
        type: 'bank',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockAccountRepository.findUnique.mockResolvedValue(existingAccount)
      mockPrismaClient.entry.count.mockResolvedValue(5)

      await expect(accountService.delete('1', 'user-1')).rejects.toThrow(
        new BadRequestError(
          'Não é possível excluir uma conta que possui transações',
        ),
      )
    })
  })

  describe('getBalance', () => {
    it('should calculate account balance from paid entries', async () => {
      const existingAccount = {
        id: '1',
        name: 'Conta Principal',
        type: 'bank',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockEntries = [
        { amount: '100', type: 'income' },
        { amount: '50', type: 'expense' },
        { amount: '25', type: 'income' },
        { amount: '10', type: 'expense' },
      ]

      mockAccountRepository.findById.mockResolvedValue(existingAccount)
      mockAccountRepository.getAccountBalance.mockResolvedValue(65)

      const result = await accountService.getBalance('1', 'user-1')

      expect(mockAccountRepository.findById).toHaveBeenCalledWith('1')
      expect(mockAccountRepository.getAccountBalance).toHaveBeenCalledWith(
        '1',
        'user-1',
      )
      expect(result.balance).toBe(65) // 100 + 25 - 50 - 10
      expect(result.accountId).toBe('1')
      expect(result.lastUpdated).toBeDefined()
    })

    it('should return zero balance when no entries', async () => {
      const existingAccount = {
        id: '1',
        name: 'Conta Principal',
        type: 'bank',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockAccountRepository.findUnique.mockResolvedValue(existingAccount)
      mockAccountRepository.getAccountBalance.mockResolvedValue(0)

      const result = await accountService.getBalance('1', 'user-1')

      expect(result.balance).toBe(0)
    })

    it('should throw error when account not found', async () => {
      mockAccountRepository.findById.mockResolvedValue(null)

      await expect(accountService.getBalance('1', 'user-1')).rejects.toThrow(
        new BadRequestError('Conta nao encontrada'),
      )
    })

    it('should handle negative balance correctly', async () => {
      const existingAccount = {
        id: '1',
        name: 'Conta Principal',
        type: 'bank',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockEntries = [
        { amount: '50', type: 'expense' },
        { amount: '100', type: 'expense' },
        { amount: '25', type: 'income' },
      ]

      mockAccountRepository.findUnique.mockResolvedValue(existingAccount)
      mockAccountRepository.getAccountBalance.mockResolvedValue(-125)

      const result = await accountService.getBalance('1', 'user-1')

      expect(result.balance).toBe(-125) // 25 - 50 - 100
    })
  })

  describe('error handling', () => {
    it('should handle repository errors gracefully', async () => {
      const error = new Error('Database error')
      mockAccountRepository.findUnique.mockRejectedValue(error)

      await expect(accountService.findById('1', 'user-1')).rejects.toThrow(
        'Database error',
      )
    })

    it('should handle Prisma errors gracefully', async () => {
      const error = new Error('Prisma error')
      mockPrismaClient.entry.count.mockRejectedValue(error)

      const existingAccount = {
        id: '1',
        name: 'Conta Principal',
        type: 'bank',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockAccountRepository.findUnique.mockResolvedValue(existingAccount)

      await expect(accountService.delete('1', 'user-1')).rejects.toThrow(
        'Prisma error',
      )
    })
  })
})
