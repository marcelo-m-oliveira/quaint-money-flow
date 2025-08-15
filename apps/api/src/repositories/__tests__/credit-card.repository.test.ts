import { IconType, Prisma, PrismaClient } from '@prisma/client'

import { CreditCardRepository } from '../credit-card.repository'

// Mock do Prisma
const mockPrisma = {
  creditCard: {
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

describe('CreditCardRepository', () => {
  let creditCardRepository: CreditCardRepository
  const userId = 'user-123'

  beforeEach(() => {
    creditCardRepository = new CreditCardRepository(mockPrisma)
    jest.clearAllMocks()
  })

  describe('findMany', () => {
    it('should call prisma.creditCard.findMany with correct parameters', async () => {
      const mockCreditCards = [
        {
          id: 'credit-card-1',
          name: 'Cartão Visa',
          limit: 5000,
          userId,
        },
      ]

      ;(mockPrisma.creditCard.findMany as jest.Mock).mockResolvedValue(
        mockCreditCards,
      )

      const options = {
        where: { userId },
        skip: 0,
        take: 20,
        orderBy: { createdAt: Prisma.SortOrder.desc },
      }

      const result = await creditCardRepository.findMany(options)

      expect(mockPrisma.creditCard.findMany).toHaveBeenCalledWith(options)
      expect(result).toEqual(mockCreditCards)
    })
  })

  describe('findUnique', () => {
    it('should call prisma.creditCard.findUnique with correct parameters', async () => {
      const mockCreditCard = {
        id: 'credit-card-1',
        name: 'Cartão Visa',
        userId,
      }

      ;(mockPrisma.creditCard.findUnique as jest.Mock).mockResolvedValue(
        mockCreditCard,
      )

      const options = { where: { id: 'credit-card-1' } }
      const result = await creditCardRepository.findUnique(options)

      expect(mockPrisma.creditCard.findUnique).toHaveBeenCalledWith(options)
      expect(result).toEqual(mockCreditCard)
    })
  })

  describe('findFirst', () => {
    it('should call prisma.creditCard.findFirst with correct parameters', async () => {
      const mockCreditCard = {
        id: 'credit-card-1',
        name: 'Cartão Visa',
        userId,
      }

      ;(mockPrisma.creditCard.findFirst as jest.Mock).mockResolvedValue(
        mockCreditCard,
      )

      const options = { where: { name: 'Cartão Visa', userId } }
      const result = await creditCardRepository.findFirst(options)

      expect(mockPrisma.creditCard.findFirst).toHaveBeenCalledWith(options)
      expect(result).toEqual(mockCreditCard)
    })
  })

  describe('create', () => {
    it('should call prisma.creditCard.create with correct parameters', async () => {
      const mockCreditCard = {
        id: 'credit-card-1',
        name: 'Novo Cartão',
        icon: 'credit-card',
        iconType: 'generic' as IconType,
        limit: 3000,
        closingDay: 15,
        dueDay: 10,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        defaultPaymentAccountId: null,
      }

      ;(mockPrisma.creditCard.create as jest.Mock).mockResolvedValue(
        mockCreditCard,
      )

      const createData = {
        data: {
          name: 'Novo Cartão',
          icon: 'credit-card',
          iconType: 'generic' as IconType,
          limit: 3000,
          closingDay: 15,
          dueDay: 10,
          user: { connect: { id: userId } },
        },
      }

      const result = await creditCardRepository.create(createData)

      expect(mockPrisma.creditCard.create).toHaveBeenCalledWith(createData)
      expect(result).toEqual(mockCreditCard)
    })
  })

  describe('update', () => {
    it('should call prisma.creditCard.update with correct parameters', async () => {
      const mockUpdatedCreditCard = {
        id: 'credit-card-1',
        name: 'Cartão Atualizado',
        limit: 7000,
        userId,
      }

      ;(mockPrisma.creditCard.update as jest.Mock).mockResolvedValue(
        mockUpdatedCreditCard,
      )

      const updateOptions = {
        where: { id: 'credit-card-1', userId },
        data: { name: 'Cartão Atualizado', limit: 7000 },
      }

      const result = await creditCardRepository.update(updateOptions)

      expect(mockPrisma.creditCard.update).toHaveBeenCalledWith(updateOptions)
      expect(result).toEqual(mockUpdatedCreditCard)
    })
  })

  describe('delete', () => {
    it('should call prisma.creditCard.delete with correct parameters', async () => {
      const mockDeletedCreditCard = {
        id: 'credit-card-1',
        name: 'Cartão Deletado',
        userId,
      }

      ;(mockPrisma.creditCard.delete as jest.Mock).mockResolvedValue(
        mockDeletedCreditCard,
      )

      const deleteOptions = { where: { id: 'credit-card-1', userId } }
      const result = await creditCardRepository.delete(deleteOptions)

      expect(mockPrisma.creditCard.delete).toHaveBeenCalledWith(deleteOptions)
      expect(result).toEqual(mockDeletedCreditCard)
    })
  })

  describe('count', () => {
    it('should call prisma.creditCard.count with correct parameters', async () => {
      ;(mockPrisma.creditCard.count as jest.Mock).mockResolvedValue(5)

      const countOptions = { where: { userId } }
      const result = await creditCardRepository.count(countOptions)

      expect(mockPrisma.creditCard.count).toHaveBeenCalledWith(countOptions)
      expect(result).toBe(5)
    })
  })

  describe('upsert', () => {
    it('should call prisma.creditCard.upsert with correct parameters', async () => {
      const mockUpsertedCreditCard = {
        id: 'credit-card-1',
        name: 'Cartão Upsert',
        userId,
      }

      ;(mockPrisma.creditCard.upsert as jest.Mock).mockResolvedValue(
        mockUpsertedCreditCard,
      )

      const upsertOptions = {
        where: { id: 'credit-card-1' },
        create: {
          name: 'Cartão Upsert',
          icon: 'credit-card',
          iconType: 'generic' as IconType,
          limit: 5000,
          closingDay: 15,
          dueDay: 10,
          user: { connect: { id: userId } },
        },
        update: { name: 'Cartão Upsert Atualizado' },
      }

      const result = await creditCardRepository.upsert(upsertOptions)

      expect(mockPrisma.creditCard.upsert).toHaveBeenCalledWith(upsertOptions)
      expect(result).toEqual(mockUpsertedCreditCard)
    })
  })

  describe('findByUserId', () => {
    it('should find credit cards by user ID with default parameters', async () => {
      const mockCreditCards = [
        {
          id: 'credit-card-1',
          name: 'Cartão 1',
          userId,
          entries: [],
          defaultPaymentAccount: null,
          _count: { entries: 0 },
        },
      ]

      ;(mockPrisma.creditCard.findMany as jest.Mock).mockResolvedValue(
        mockCreditCards,
      )

      const result = await creditCardRepository.findByUserId(userId)

      expect(mockPrisma.creditCard.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: {
          entries: false,
          defaultPaymentAccount: true,
          _count: {
            select: {
              entries: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
      expect(result).toEqual(mockCreditCards)
    })

    it('should find credit cards by user ID with entries included', async () => {
      const mockCreditCards = [
        {
          id: 'credit-card-1',
          name: 'Cartão 1',
          userId,
          entries: [{ id: 'entry-1', amount: 100 }],
          defaultPaymentAccount: null,
          _count: { entries: 1 },
        },
      ]

      ;(mockPrisma.creditCard.findMany as jest.Mock).mockResolvedValue(
        mockCreditCards,
      )

      const result = await creditCardRepository.findByUserId(userId, true)

      expect(mockPrisma.creditCard.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: {
          entries: true,
          defaultPaymentAccount: true,
          _count: {
            select: {
              entries: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
      expect(result).toEqual(mockCreditCards)
    })
  })

  describe('existsByNameAndUserId', () => {
    it('should return true when credit card exists', async () => {
      const mockCreditCard = {
        id: 'credit-card-1',
        name: 'Cartão Existente',
        userId,
      }

      ;(mockPrisma.creditCard.findFirst as jest.Mock).mockResolvedValue(
        mockCreditCard,
      )

      const result = await creditCardRepository.existsByNameAndUserId(
        'Cartão Existente',
        userId,
      )

      expect(mockPrisma.creditCard.findFirst).toHaveBeenCalledWith({
        where: {
          name: 'Cartão Existente',
          userId,
        },
      })
      expect(result).toBe(true)
    })

    it('should return false when credit card does not exist', async () => {
      ;(mockPrisma.creditCard.findFirst as jest.Mock).mockResolvedValue(null)

      const result = await creditCardRepository.existsByNameAndUserId(
        'Cartão Inexistente',
        userId,
      )

      expect(result).toBe(false)
    })

    it('should exclude specific ID when checking existence', async () => {
      ;(mockPrisma.creditCard.findFirst as jest.Mock).mockResolvedValue(null)

      const result = await creditCardRepository.existsByNameAndUserId(
        'Cartão Teste',
        userId,
        'credit-card-to-exclude',
      )

      expect(mockPrisma.creditCard.findFirst).toHaveBeenCalledWith({
        where: {
          name: 'Cartão Teste',
          userId,
          NOT: { id: 'credit-card-to-exclude' },
        },
      })
      expect(result).toBe(false)
    })
  })

  describe('getCreditCardsWithUsage', () => {
    it('should get credit cards with usage information', async () => {
      const mockCreditCards = [
        {
          id: 'credit-card-1',
          name: 'Cartão 1',
          userId,
          entries: [
            { amount: 100, type: 'expense' },
            { amount: 200, type: 'expense' },
          ],
          defaultPaymentAccount: {
            id: 'account-1',
            name: 'Conta Corrente',
          },
        },
      ]

      ;(mockPrisma.creditCard.findMany as jest.Mock).mockResolvedValue(
        mockCreditCards,
      )

      const result = await creditCardRepository.getCreditCardsWithUsage(userId)

      expect(mockPrisma.creditCard.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: {
          entries: {
            select: {
              amount: true,
              type: true,
            },
          },
          defaultPaymentAccount: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
      expect(result).toEqual(mockCreditCards)
    })
  })
})
