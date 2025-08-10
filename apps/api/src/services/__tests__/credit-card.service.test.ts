import { PrismaClient } from '@prisma/client'

import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { CreditCardRepository } from '@/repositories/credit-card.repository'
import { type CreditCardCreateSchema } from '@/utils/schemas'

import { CreditCardService } from '../credit-card.service'

// Mock do PrismaClient
const mockPrisma = {
  creditCard: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  entry: {
    count: jest.fn(),
    findMany: jest.fn(),
  },
  account: {
    findUnique: jest.fn(),
  },
} as unknown as PrismaClient

// Mock do CreditCardRepository
const mockCreditCardRepository = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  upsert: jest.fn(),
  findByUserId: jest.fn(),
  existsByNameAndUserId: jest.fn(),
  getCreditCardsWithUsage: jest.fn(),
} as unknown as CreditCardRepository

describe('CreditCardService', () => {
  let creditCardService: CreditCardService
  const userId = 'user-123'

  beforeEach(() => {
    creditCardService = new CreditCardService(
      mockCreditCardRepository,
      mockPrisma,
    )
    jest.clearAllMocks()
  })

  describe('findById', () => {
    it('should return credit card when found', async () => {
      const mockCreditCard = {
        id: 'credit-card-1',
        name: 'Cartão Teste',
        limit: 5000,
        userId,
        defaultPaymentAccount: null,
      }

      ;(mockCreditCardRepository.findUnique as jest.Mock).mockResolvedValue(
        mockCreditCard,
      )

      const result = await creditCardService.findById('credit-card-1', userId)

      expect(mockCreditCardRepository.findUnique).toHaveBeenCalledWith({
        where: { id: 'credit-card-1', userId },
        include: {
          defaultPaymentAccount: true,
        },
      })
      expect(result).toEqual(mockCreditCard)
    })

    it('should throw BadRequestError when credit card not found', async () => {
      ;(mockCreditCardRepository.findUnique as jest.Mock).mockResolvedValue(
        null,
      )

      await expect(
        creditCardService.findById('credit-card-1', userId),
      ).rejects.toThrow(new BadRequestError('Cartão de crédito não encontrado'))
    })
  })

  describe('create', () => {
    const creditCardData: CreditCardCreateSchema = {
      name: 'Novo Cartão',
      icon: 'credit-card',
      iconType: 'generic' as const,
      limit: '5000',
      closingDay: 15,
      dueDay: 10,
    }

    it('should create credit card successfully', async () => {
      const mockCreatedCreditCard = {
        id: 'credit-card-1',
        ...creditCardData,
        userId,
        defaultPaymentAccount: null,
      }

      ;(mockCreditCardRepository.findFirst as jest.Mock).mockResolvedValue(null)
      ;(mockCreditCardRepository.create as jest.Mock).mockResolvedValue(
        mockCreatedCreditCard,
      )

      const result = await creditCardService.create(creditCardData, userId)

      expect(mockCreditCardRepository.findFirst).toHaveBeenCalledWith({
        where: {
          name: creditCardData.name,
          userId,
        },
      })
      expect(mockCreditCardRepository.create).toHaveBeenCalledWith({
        data: {
          ...creditCardData,
          user: { connect: { id: userId } },
        },
        include: {
          defaultPaymentAccount: true,
        },
      })
      expect(result).toEqual(mockCreatedCreditCard)
    })

    it('should create credit card with default payment account', async () => {
      const creditCardDataWithAccount: CreditCardCreateSchema = {
        ...creditCardData,
        defaultPaymentAccountId: 'account-1',
      }

      const mockAccount = {
        id: 'account-1',
        name: 'Conta Corrente',
        userId,
      }

      const mockCreatedCreditCard = {
        id: 'credit-card-1',
        ...creditCardDataWithAccount,
        userId,
        defaultPaymentAccount: mockAccount,
      }

      ;(mockCreditCardRepository.findFirst as jest.Mock).mockResolvedValue(null)
      ;(mockPrisma.account.findUnique as jest.Mock).mockResolvedValue(
        mockAccount,
      )
      ;(mockCreditCardRepository.create as jest.Mock).mockResolvedValue(
        mockCreatedCreditCard,
      )

      const result = await creditCardService.create(
        creditCardDataWithAccount,
        userId,
      )

      expect(mockPrisma.account.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'account-1',
          userId,
        },
      })
      expect(mockCreditCardRepository.create).toHaveBeenCalledWith({
        data: {
          ...creditCardDataWithAccount,
          user: { connect: { id: userId } },
          defaultPaymentAccount: { connect: { id: 'account-1' } },
        },
        include: {
          defaultPaymentAccount: true,
        },
      })
      expect(result).toEqual(mockCreatedCreditCard)
    })

    it('should throw BadRequestError when credit card name already exists', async () => {
      const existingCreditCard = {
        id: 'existing-credit-card',
        name: creditCardData.name,
        userId,
      }

      ;(mockCreditCardRepository.findFirst as jest.Mock).mockResolvedValue(
        existingCreditCard,
      )

      await expect(
        creditCardService.create(creditCardData, userId),
      ).rejects.toThrow(
        new BadRequestError('Já existe um cartão de crédito com este nome'),
      )
    })

    it('should throw BadRequestError when default payment account not found', async () => {
      const creditCardDataWithAccount = {
        ...creditCardData,
        defaultPaymentAccountId: 'non-existent-account',
      }

      ;(mockCreditCardRepository.findFirst as jest.Mock).mockResolvedValue(null)
      ;(mockPrisma.account.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(
        creditCardService.create(creditCardDataWithAccount, userId),
      ).rejects.toThrow(
        new BadRequestError('Conta de pagamento padrão não encontrada'),
      )
    })
  })

  describe('update', () => {
    const updateData: Partial<CreditCardCreateSchema> = {
      name: 'Cartão Atualizado',
      limit: '7000',
    }

    it('should update credit card successfully', async () => {
      const existingCreditCard = {
        id: 'credit-card-1',
        name: 'Cartão Original',
        limit: 5000,
        userId,
        defaultPaymentAccount: null,
      }

      const updatedCreditCard = {
        ...existingCreditCard,
        ...updateData,
      }

      ;(mockCreditCardRepository.findUnique as jest.Mock).mockResolvedValue(
        existingCreditCard,
      )
      ;(mockCreditCardRepository.findFirst as jest.Mock).mockResolvedValue(null)
      ;(mockCreditCardRepository.update as jest.Mock).mockResolvedValue(
        updatedCreditCard,
      )

      const result = await creditCardService.update(
        'credit-card-1',
        updateData,
        userId,
      )

      expect(mockCreditCardRepository.update).toHaveBeenCalledWith({
        where: { id: 'credit-card-1', userId },
        data: updateData,
        include: {
          defaultPaymentAccount: true,
        },
      })
      expect(result).toEqual(updatedCreditCard)
    })

    it('should throw BadRequestError when trying to update to existing name', async () => {
      const existingCreditCard = {
        id: 'credit-card-1',
        name: 'Cartão Original',
        userId,
        defaultPaymentAccount: null,
      }

      const anotherCreditCard = {
        id: 'credit-card-2',
        name: updateData.name,
        userId,
      }

      ;(mockCreditCardRepository.findUnique as jest.Mock).mockResolvedValue(
        existingCreditCard,
      )
      ;(mockCreditCardRepository.findFirst as jest.Mock).mockResolvedValue(
        anotherCreditCard,
      )

      await expect(
        creditCardService.update('credit-card-1', updateData, userId),
      ).rejects.toThrow(
        new BadRequestError('Já existe um cartão de crédito com este nome'),
      )
    })
  })

  describe('delete', () => {
    it('should delete credit card successfully', async () => {
      const existingCreditCard = {
        id: 'credit-card-1',
        name: 'Cartão para Deletar',
        userId,
        defaultPaymentAccount: null,
      }

      ;(mockCreditCardRepository.findUnique as jest.Mock).mockResolvedValue(
        existingCreditCard,
      )
      ;(mockPrisma.entry.count as jest.Mock).mockResolvedValue(0)
      ;(mockCreditCardRepository.delete as jest.Mock).mockResolvedValue(
        existingCreditCard,
      )

      const result = await creditCardService.delete('credit-card-1', userId)

      expect(mockPrisma.entry.count).toHaveBeenCalledWith({
        where: { creditCardId: 'credit-card-1', userId },
      })
      expect(mockCreditCardRepository.delete).toHaveBeenCalledWith({
        where: { id: 'credit-card-1', userId },
      })
      expect(result).toEqual(existingCreditCard)
    })

    it('should throw BadRequestError when credit card has entries', async () => {
      const existingCreditCard = {
        id: 'credit-card-1',
        name: 'Cartão com Transações',
        userId,
        defaultPaymentAccount: null,
      }

      ;(mockCreditCardRepository.findUnique as jest.Mock).mockResolvedValue(
        existingCreditCard,
      )
      ;(mockPrisma.entry.count as jest.Mock).mockResolvedValue(5)

      await expect(
        creditCardService.delete('credit-card-1', userId),
      ).rejects.toThrow(
        new BadRequestError(
          'Não é possível excluir um cartão de crédito que possui transações',
        ),
      )
    })
  })

  describe('getUsage', () => {
    it('should return credit card usage', async () => {
      const existingCreditCard = {
        id: 'credit-card-1',
        name: 'Cartão Teste',
        limit: 5000,
        userId,
        defaultPaymentAccount: null,
      }

      const mockEntries = [{ amount: 100 }, { amount: 200 }, { amount: 150 }]

      ;(mockCreditCardRepository.findUnique as jest.Mock).mockResolvedValue(
        existingCreditCard,
      )
      ;(mockPrisma.entry.findMany as jest.Mock).mockResolvedValue(mockEntries)

      const result = await creditCardService.getUsage('credit-card-1', userId)

      expect(mockPrisma.entry.findMany).toHaveBeenCalledWith({
        where: {
          creditCardId: 'credit-card-1',
          userId,
          type: 'expense',
        },
        select: {
          amount: true,
        },
      })

      expect(result).toEqual({
        usage: 450,
        limit: 5000,
        availableLimit: 4550,
        creditCardId: 'credit-card-1',
        lastUpdated: expect.any(String),
      })
    })

    it('should return zero usage when no entries', async () => {
      const existingCreditCard = {
        id: 'credit-card-1',
        name: 'Cartão Sem Uso',
        limit: 5000,
        userId,
        defaultPaymentAccount: null,
      }

      ;(mockCreditCardRepository.findUnique as jest.Mock).mockResolvedValue(
        existingCreditCard,
      )
      ;(mockPrisma.entry.findMany as jest.Mock).mockResolvedValue([])

      const result = await creditCardService.getUsage('credit-card-1', userId)

      expect(result).toEqual({
        usage: 0,
        limit: 5000,
        availableLimit: 5000,
        creditCardId: 'credit-card-1',
        lastUpdated: expect.any(String),
      })
    })
  })

  describe('findMany', () => {
    it('should return paginated credit cards with usage', async () => {
      const mockCreditCardsWithUsage = [
        {
          id: 'credit-card-1',
          name: 'Cartão 1',
          limit: 5000,
          userId,
          createdAt: new Date('2023-01-01'),
          entries: [
            { amount: 100, type: 'expense' },
            { amount: 200, type: 'expense' },
          ],
          defaultPaymentAccount: null,
        },
        {
          id: 'credit-card-2',
          name: 'Cartão 2',
          limit: 3000,
          userId,
          createdAt: new Date('2023-01-02'),
          entries: [{ amount: 150, type: 'expense' }],
          defaultPaymentAccount: null,
        },
      ]

      ;(
        mockCreditCardRepository.getCreditCardsWithUsage as jest.Mock
      ).mockResolvedValue(mockCreditCardsWithUsage)

      const result = await creditCardService.findMany(userId, {
        page: 1,
        limit: 20,
      })

      expect(result.creditCards).toHaveLength(2)
      expect(result.creditCards).toContainEqual({
        id: 'credit-card-1',
        name: 'Cartão 1',
        limit: 5000,
        userId,
        createdAt: new Date('2023-01-01'),
        usage: 300,
        availableLimit: 4700,
        defaultPaymentAccount: null,
      })
      expect(result.creditCards).toContainEqual({
        id: 'credit-card-2',
        name: 'Cartão 2',
        limit: 3000,
        userId,
        createdAt: new Date('2023-01-02'),
        usage: 150,
        availableLimit: 2850,
        defaultPaymentAccount: null,
      })
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      })
    })
  })
})
