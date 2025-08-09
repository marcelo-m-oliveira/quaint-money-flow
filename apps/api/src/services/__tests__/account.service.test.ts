import { PrismaClient } from '@prisma/client'

import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { AccountRepository } from '@/repositories/account.repository'

import { AccountService } from '../account.service'

// Mock do PrismaClient
const mockPrisma = {
  account: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  transaction: {
    count: jest.fn(),
  },
} as unknown as PrismaClient

// Mock do AccountRepository
const mockAccountRepository = {
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
} as unknown as AccountRepository

describe('AccountService', () => {
  let accountService: AccountService
  const userId = 'user-123'

  beforeEach(() => {
    accountService = new AccountService(mockAccountRepository, mockPrisma)
    jest.clearAllMocks()
  })

  describe('findById', () => {
    it('should return account when found', async () => {
      const mockAccount = {
        id: 'account-1',
        name: 'Conta Teste',
        type: 'bank',
        userId,
      }

      ;(mockAccountRepository.findUnique as jest.Mock).mockResolvedValue(
        mockAccount,
      )

      const result = await accountService.findById('account-1', userId)

      expect(mockAccountRepository.findUnique).toHaveBeenCalledWith({
        where: { id: 'account-1', userId },
      })
      expect(result).toEqual(mockAccount)
    })

    it('should throw BadRequestError when account not found', async () => {
      ;(mockAccountRepository.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(
        accountService.findById('account-1', userId),
      ).rejects.toThrow(new BadRequestError('Conta não encontrada'))
    })
  })

  describe('create', () => {
    const accountData = {
      name: 'Nova Conta',
      type: 'bank' as const,
      icon: 'bank',
      iconType: 'bank' as const,
      includeInGeneralBalance: true,
    }

    it('should create account successfully', async () => {
      const mockCreatedAccount = {
        id: 'account-1',
        ...accountData,
        userId,
      }

      ;(mockAccountRepository.findFirst as jest.Mock).mockResolvedValue(null)
      ;(mockAccountRepository.create as jest.Mock).mockResolvedValue(
        mockCreatedAccount,
      )

      const result = await accountService.create(accountData, userId)

      expect(mockAccountRepository.findFirst).toHaveBeenCalledWith({
        where: { name: accountData.name, userId },
      })
      expect(mockAccountRepository.create).toHaveBeenCalledWith({
        data: {
          ...accountData,
          user: { connect: { id: userId } },
        },
      })
      expect(result).toEqual(mockCreatedAccount)
    })

    it('should throw BadRequestError when account name already exists', async () => {
      ;(mockAccountRepository.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing-account',
        name: accountData.name,
      })

      await expect(accountService.create(accountData, userId)).rejects.toThrow(
        new BadRequestError('Já existe uma conta com este nome'),
      )
    })
  })

  describe('delete', () => {
    it('should delete account successfully', async () => {
      ;(mockAccountRepository.findUnique as jest.Mock).mockResolvedValue({
        id: 'account-1',
        name: 'Conta para Deletar',
      })
      ;(mockPrisma.transaction.count as jest.Mock).mockResolvedValue(0)
      ;(mockAccountRepository.delete as jest.Mock).mockResolvedValue({
        id: 'account-1',
      })

      expect(mockAccountRepository.delete).toHaveBeenCalledWith({
        where: { id: 'account-1', userId },
      })
    })

    it('should throw BadRequestError when account has transactions', async () => {
      ;(mockAccountRepository.findUnique as jest.Mock).mockResolvedValue({
        id: 'account-1',
        name: 'Conta com Transações',
      })
      ;(mockPrisma.transaction.count as jest.Mock).mockResolvedValue(5)

      await expect(accountService.delete('account-1', userId)).rejects.toThrow(
        new BadRequestError(
          'Não é possível excluir uma conta que possui transações',
        ),
      )
    })

    it('should throw BadRequestError when account not found', async () => {
      ;(mockAccountRepository.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(accountService.delete('account-1', userId)).rejects.toThrow(
        new BadRequestError('Conta não encontrada'),
      )
    })
  })
})
