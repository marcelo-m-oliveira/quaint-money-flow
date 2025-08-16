import { AccountRepository } from '../account.repository'

// Declarações para Jest
declare const jest: any
declare const expect: any
declare const describe: any
declare const it: any
declare const beforeEach: any
declare const afterEach: any

// Mock do PrismaClient
const mockPrismaClient = {
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
}

describe('Account Repository', () => {
  let accountRepository: AccountRepository

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Criar instância do repository
    accountRepository = new AccountRepository(mockPrismaClient as any)
  })

  describe('findMany', () => {
    it('should find many accounts with params', async () => {
      const mockAccounts = [
        {
          id: '1',
          name: 'Conta Principal',
          type: 'bank',
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const params = {
        where: { userId: 'user-1' },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      }

      mockPrismaClient.account.findMany.mockResolvedValue(mockAccounts)

      const result = await accountRepository.findMany(params)

      expect(mockPrismaClient.account.findMany).toHaveBeenCalledWith(params)
      expect(result).toEqual(mockAccounts)
    })

    it('should find many accounts without params', async () => {
      const mockAccounts = []
      mockPrismaClient.account.findMany.mockResolvedValue(mockAccounts)

      const result = await accountRepository.findMany({})

      expect(mockPrismaClient.account.findMany).toHaveBeenCalledWith({})
      expect(result).toEqual(mockAccounts)
    })
  })

  describe('findUnique', () => {
    it('should find unique account by ID', async () => {
      const mockAccount = {
        id: '1',
        name: 'Conta Principal',
        type: 'bank',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const params = {
        where: { id: '1' },
        include: { entries: true },
      }

      mockPrismaClient.account.findUnique.mockResolvedValue(mockAccount)

      const result = await accountRepository.findById('1')

      expect(mockPrismaClient.account.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      })
      expect(result).toEqual(mockAccount)
    })
  })

  describe('findFirst', () => {
    it('should find first account with where clause', async () => {
      const mockAccount = {
        id: '1',
        name: 'Conta Principal',
        type: 'bank',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const where = { name: 'Conta Principal' }
      const include = { entries: true }

      mockPrismaClient.account.findFirst.mockResolvedValue(mockAccount)

      const result = await accountRepository.findFirst(where, { include })

      expect(mockPrismaClient.account.findFirst).toHaveBeenCalledWith({
        where,
        include,
      })
      expect(result).toEqual(mockAccount)
    })
  })

  describe('create', () => {
    it('should create a new account', async () => {
      const accountData = {
        name: 'Nova Conta',
        type: 'bank',
        icon: 'bank-icon',
        iconType: 'bank',
        includeInGeneralBalance: true,
        user: { connect: { id: 'user-1' } },
      }

      const createdAccount = {
        id: '1',
        ...accountData,
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrismaClient.account.create.mockResolvedValue(createdAccount)

      const result = await accountRepository.create(accountData, {
        include: { entries: true },
      })

      expect(mockPrismaClient.account.create).toHaveBeenCalledWith({
        data: accountData,
        include: { entries: true },
      })
      expect(result).toEqual(createdAccount)
    })
  })

  describe('update', () => {
    it('should update an existing account', async () => {
      const updateData = {
        name: 'Conta Atualizada',
      }

      const updatedAccount = {
        id: '1',
        name: 'Conta Atualizada',
        type: 'bank',
        icon: 'bank-icon',
        iconType: 'bank',
        includeInGeneralBalance: true,
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrismaClient.account.update.mockResolvedValue(updatedAccount)

      const result = await accountRepository.update('1', updateData, {
        include: { entries: true },
      })

      expect(mockPrismaClient.account.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
        include: { entries: true },
      })
      expect(result).toEqual(updatedAccount)
    })
  })

  describe('delete', () => {
    it('should delete an account', async () => {
      const deletedAccount = {
        id: '1',
        name: 'Conta Principal',
        type: 'bank',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrismaClient.account.delete.mockResolvedValue(deletedAccount)

      const result = await accountRepository.delete('1')

      expect(mockPrismaClient.account.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      })
      expect(result).toEqual(deletedAccount)
    })
  })

  describe('count', () => {
    it('should count accounts with where clause', async () => {
      const where = { userId: 'user-1' }

      mockPrismaClient.account.count.mockResolvedValue(5)

      const result = await accountRepository.count(where)

      expect(mockPrismaClient.account.count).toHaveBeenCalledWith({
        where,
      })
      expect(result).toBe(5)
    })

    it('should count all accounts without where clause', async () => {
      mockPrismaClient.account.count.mockResolvedValue(10)

      const result = await accountRepository.count()

      expect(mockPrismaClient.account.count).toHaveBeenCalledWith({})
      expect(result).toBe(10)
    })
  })

  describe('upsert', () => {
    it('should upsert an account', async () => {
      const upsertData = {
        where: { id: '1' },
        create: {
          name: 'Nova Conta',
          type: 'bank',
          icon: 'bank-icon',
          iconType: 'bank',
          includeInGeneralBalance: true,
          user: { connect: { id: 'user-1' } },
        },
        update: {
          name: 'Conta Atualizada',
        },
        include: { entries: true },
      }

      const upsertedAccount = {
        id: '1',
        name: 'Conta Atualizada',
        type: 'bank',
        icon: 'bank-icon',
        iconType: 'bank',
        includeInGeneralBalance: true,
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrismaClient.account.upsert.mockResolvedValue(upsertedAccount)

      const result = await accountRepository.upsert(
        { id: '1' },
        upsertData.create,
        upsertData.update,
      )

      expect(mockPrismaClient.account.upsert).toHaveBeenCalledWith({
        where: { id: '1' },
        create: upsertData.create,
        update: upsertData.update,
      })
      expect(result).toEqual(upsertedAccount)
    })
  })

  describe('findByUserId', () => {
    it('should find accounts by user ID without entries', async () => {
      const mockAccounts = [
        {
          id: '1',
          name: 'Conta Principal',
          type: 'bank',
          userId: 'user-1',
          entries: [],
          _count: { entries: 0 },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrismaClient.account.findMany.mockResolvedValue(mockAccounts)

      const result = await accountRepository.findByUserId('user-1', false)

      expect(mockPrismaClient.account.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
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

    it('should find accounts by user ID with entries', async () => {
      const mockAccounts = [
        {
          id: '1',
          name: 'Conta Principal',
          type: 'bank',
          userId: 'user-1',
          entries: [
            { id: '1', amount: '100', type: 'income' },
            { id: '2', amount: '50', type: 'expense' },
          ],
          _count: { entries: 2 },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrismaClient.account.findMany.mockResolvedValue(mockAccounts)

      const result = await accountRepository.findByUserId('user-1', true)

      expect(mockPrismaClient.account.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: {
          entries: true,
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
        {
          id: '1',
          name: 'Conta Bancária',
          type: 'bank',
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrismaClient.account.findMany.mockResolvedValue(mockAccounts)

      const result = await accountRepository.findByUserIdAndType(
        'user-1',
        'bank',
      )

      expect(mockPrismaClient.account.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          type: 'bank',
        },
        orderBy: { createdAt: 'desc' },
      })
      expect(result).toEqual(mockAccounts)
    })

    it('should find accounts by user ID, type and includeInGeneralBalance', async () => {
      const mockAccounts = [
        {
          id: '1',
          name: 'Conta Bancária',
          type: 'bank',
          userId: 'user-1',
          includeInGeneralBalance: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrismaClient.account.findMany.mockResolvedValue(mockAccounts)

      const result = await accountRepository.findByUserIdAndType(
        'user-1',
        'bank',
        true,
      )

      expect(mockPrismaClient.account.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          type: 'bank',
          includeInGeneralBalance: true,
        },
        orderBy: { createdAt: 'desc' },
      })
      expect(result).toEqual(mockAccounts)
    })
  })

  describe('existsByNameAndUserId', () => {
    it('should return true when account exists', async () => {
      const mockAccount = {
        id: '1',
        name: 'Conta Principal',
        type: 'bank',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrismaClient.account.findFirst.mockResolvedValue(mockAccount)

      const result = await accountRepository.existsByNameAndUserId(
        'Conta Principal',
        'user-1',
      )

      expect(mockPrismaClient.account.findFirst).toHaveBeenCalledWith({
        where: {
          name: 'Conta Principal',
          userId: 'user-1',
        },
      })
      expect(result).toBe(true)
    })

    it('should return false when account does not exist', async () => {
      mockPrismaClient.account.findFirst.mockResolvedValue(null)

      const result = await accountRepository.existsByNameAndUserId(
        'Conta Inexistente',
        'user-1',
      )

      expect(mockPrismaClient.account.findFirst).toHaveBeenCalledWith({
        where: {
          name: 'Conta Inexistente',
          userId: 'user-1',
        },
      })
      expect(result).toBe(false)
    })

    it('should exclude account by ID when provided', async () => {
      mockPrismaClient.account.findFirst.mockResolvedValue(null)

      const result = await accountRepository.existsByNameAndUserId(
        'Conta Principal',
        'user-1',
        '1',
      )

      expect(mockPrismaClient.account.findFirst).toHaveBeenCalledWith({
        where: {
          name: 'Conta Principal',
          userId: 'user-1',
          NOT: { id: '1' },
        },
      })
      expect(result).toBe(false)
    })
  })

  describe('getAccountsWithBalance', () => {
    it('should get accounts with paid entries for balance calculation', async () => {
      const mockAccounts = [
        {
          id: '1',
          name: 'Conta Principal',
          type: 'bank',
          userId: 'user-1',
          entries: [
            { amount: '100', type: 'income' },
            { amount: '50', type: 'expense' },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrismaClient.account.findMany.mockResolvedValue(mockAccounts)

      const result = await accountRepository.getAccountsWithBalance('user-1')

      expect(mockPrismaClient.account.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: {
          entries: {
            where: { paid: true },
            select: {
              amount: true,
              type: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
      expect(result).toEqual(mockAccounts)
    })
  })

  describe('error handling', () => {
    it('should handle Prisma errors gracefully', async () => {
      const error = new Error('Database connection error')
      mockPrismaClient.account.findMany.mockRejectedValue(error)

      await expect(accountRepository.findMany({})).rejects.toThrow(
        'Database connection error',
      )
    })

    it('should handle unique constraint violations', async () => {
      const error = new Error('Unique constraint failed')
      mockPrismaClient.account.create.mockRejectedValue(error)

      await expect(
        accountRepository.create({
          data: {
            name: 'Conta Duplicada',
            type: 'bank',
            icon: 'bank-icon',
            iconType: 'bank',
            includeInGeneralBalance: true,
            user: { connect: { id: 'user-1' } },
          },
        }),
      ).rejects.toThrow('Unique constraint failed')
    })
  })
})
