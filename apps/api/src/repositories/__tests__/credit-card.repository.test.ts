import { CreditCardRepository } from '../credit-card.repository'
import { PrismaClient } from '@prisma/client'

// Declarações para Jest
declare const jest: any
declare const expect: any
declare const describe: any
declare const it: any
declare const beforeEach: any
declare const afterEach: any

// Mock do PrismaClient
const mockPrismaClient = {
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
}

describe('Credit Card Repository', () => {
  let creditCardRepository: CreditCardRepository

  beforeEach(() => {
    jest.clearAllMocks()
    creditCardRepository = new CreditCardRepository(mockPrismaClient as any)
  })

  describe('findMany', () => {
    it('should find many credit cards with filters', async () => {
      const mockCreditCards = [
        {
          id: '1',
          name: 'Cartão Principal',
          limit: 5000,
          userId: 'user-1',
        },
        {
          id: '2',
          name: 'Cartão Secundário',
          limit: 3000,
          userId: 'user-1',
        },
      ]

      mockPrismaClient.creditCard.findMany.mockResolvedValue(mockCreditCards)

      const result = await creditCardRepository.findMany({
        where: { userId: 'user-1' },
        skip: 0,
        take: 10,
      })

      expect(mockPrismaClient.creditCard.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        skip: 0,
        take: 10,
      })
      expect(result).toEqual(mockCreditCards)
    })

    it('should find many credit cards with include', async () => {
      const mockCreditCards = [
        {
          id: '1',
          name: 'Cartão Principal',
          entries: [],
          defaultPaymentAccount: { id: 'account-1', name: 'Conta Principal' },
        },
      ]

      mockPrismaClient.creditCard.findMany.mockResolvedValue(mockCreditCards)

      const result = await creditCardRepository.findMany({
        include: { entries: true, defaultPaymentAccount: true },
      })

      expect(mockPrismaClient.creditCard.findMany).toHaveBeenCalledWith({
        include: { entries: true, defaultPaymentAccount: true },
      })
      expect(result).toEqual(mockCreditCards)
    })
  })

  describe('findUnique', () => {
    it('should find unique credit card by ID', async () => {
      const mockCreditCard = {
        id: '1',
        name: 'Cartão Principal',
        limit: 5000,
        userId: 'user-1',
      }

      mockPrismaClient.creditCard.findUnique.mockResolvedValue(mockCreditCard)

      const result = await creditCardRepository.findById('1')

      expect(mockPrismaClient.creditCard.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      })
      expect(result).toEqual(mockCreditCard)
    })

    it('should find unique credit card with include', async () => {
      const mockCreditCard = {
        id: '1',
        name: 'Cartão Principal',
        defaultPaymentAccount: { id: 'account-1', name: 'Conta Principal' },
      }

      mockPrismaClient.creditCard.findUnique.mockResolvedValue(mockCreditCard)

      const result = await creditCardRepository.findById('1', { include: { defaultPaymentAccount: true } })

      expect(mockPrismaClient.creditCard.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { defaultPaymentAccount: true },
      })
      expect(result).toEqual(mockCreditCard)
    })
  })

  describe('findFirst', () => {
    it('should find first credit card with filters', async () => {
      const mockCreditCard = {
        id: '1',
        name: 'Cartão Principal',
        limit: 5000,
        userId: 'user-1',
      }

      mockPrismaClient.creditCard.findFirst.mockResolvedValue(mockCreditCard)

      const result = await creditCardRepository.findFirst({ name: 'Cartão Principal', userId: 'user-1' })

      expect(mockPrismaClient.creditCard.findFirst).toHaveBeenCalledWith({
        where: { name: 'Cartão Principal', userId: 'user-1' },
      })
      expect(result).toEqual(mockCreditCard)
    })
  })

  describe('create', () => {
    it('should create a new credit card', async () => {
      const creditCardData = {
        name: 'Novo Cartão',
        limit: 3000,
        icon: 'visa-icon',
        iconType: 'visa',
        closingDay: 15,
        dueDay: 20,
        user: { connect: { id: 'user-1' } },
      }

      const createdCreditCard = {
        id: '1',
        ...creditCardData,
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrismaClient.creditCard.create.mockResolvedValue(createdCreditCard)

      const result = await creditCardRepository.create(creditCardData)

      expect(mockPrismaClient.creditCard.create).toHaveBeenCalledWith({
        data: creditCardData,
      })
      expect(result).toEqual(createdCreditCard)
    })

    it('should create credit card with include', async () => {
      const creditCardData = {
        name: 'Novo Cartão',
        limit: 3000,
        user: { connect: { id: 'user-1' } },
      }

      const createdCreditCard = {
        id: '1',
        ...creditCardData,
        defaultPaymentAccount: { id: 'account-1', name: 'Conta Principal' },
      }

      mockPrismaClient.creditCard.create.mockResolvedValue(createdCreditCard)

      const result = await creditCardRepository.create(creditCardData, {
        include: { defaultPaymentAccount: true },
      })

      expect(mockPrismaClient.creditCard.create).toHaveBeenCalledWith({
        data: creditCardData,
        include: { defaultPaymentAccount: true },
      })
      expect(result).toEqual(createdCreditCard)
    })
  })

  describe('update', () => {
    it('should update an existing credit card', async () => {
      const updateData = {
        name: 'Cartão Atualizado',
        limit: 6000,
      }

      const updatedCreditCard = {
        id: '1',
        name: 'Cartão Atualizado',
        limit: 6000,
        userId: 'user-1',
        updatedAt: new Date(),
      }

      mockPrismaClient.creditCard.update.mockResolvedValue(updatedCreditCard)

      const result = await creditCardRepository.update('1', updateData)

      expect(mockPrismaClient.creditCard.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
      })
      expect(result).toEqual(updatedCreditCard)
    })
  })

  describe('delete', () => {
    it('should delete a credit card', async () => {
      const deletedCreditCard = {
        id: '1',
        name: 'Cartão Deletado',
        userId: 'user-1',
      }

      mockPrismaClient.creditCard.delete.mockResolvedValue(deletedCreditCard)

      const result = await creditCardRepository.delete('1')

      expect(mockPrismaClient.creditCard.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      })
      expect(result).toEqual(deletedCreditCard)
    })
  })

  describe('count', () => {
    it('should count credit cards with filters', async () => {
      mockPrismaClient.creditCard.count.mockResolvedValue(5)

      const result = await creditCardRepository.count({ userId: 'user-1' })

      expect(mockPrismaClient.creditCard.count).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      })
      expect(result).toBe(5)
    })
  })

  describe('upsert', () => {
    it('should upsert a credit card', async () => {
      const upsertData = {
        where: { id: '1' },
        create: {
          name: 'Novo Cartão',
          limit: 3000,
          user: { connect: { id: 'user-1' } },
        },
        update: {
          name: 'Cartão Atualizado',
          limit: 6000,
        },
      }

      const upsertedCreditCard = {
        id: '1',
        name: 'Cartão Atualizado',
        limit: 6000,
        userId: 'user-1',
      }

      mockPrismaClient.creditCard.upsert.mockResolvedValue(upsertedCreditCard)

      const result = await creditCardRepository.upsert(
        { id: '1' },
        upsertData.create,
        upsertData.update,
      )

      expect(mockPrismaClient.creditCard.upsert).toHaveBeenCalledWith({
        where: { id: '1' },
        create: upsertData.create,
        update: upsertData.update,
      })
      expect(result).toEqual(upsertedCreditCard)
    })
  })

  describe('findByUserId', () => {
    it('should find credit cards by user ID without entries', async () => {
      const mockCreditCards = [
        {
          id: '1',
          name: 'Cartão Principal',
          userId: 'user-1',
          entries: [],
          defaultPaymentAccount: { id: 'account-1', name: 'Conta Principal' },
          _count: { entries: 0 },
        },
      ]

      mockPrismaClient.creditCard.findMany.mockResolvedValue(mockCreditCards)

      const result = await creditCardRepository.findByUserId('user-1', false)

      expect(mockPrismaClient.creditCard.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
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

    it('should find credit cards by user ID with entries', async () => {
      const mockCreditCards = [
        {
          id: '1',
          name: 'Cartão Principal',
          userId: 'user-1',
          entries: [
            { id: 'entry-1', amount: '100', type: 'expense' },
          ],
          defaultPaymentAccount: { id: 'account-1', name: 'Conta Principal' },
          _count: { entries: 1 },
        },
      ]

      mockPrismaClient.creditCard.findMany.mockResolvedValue(mockCreditCards)

      const result = await creditCardRepository.findByUserId('user-1', true)

      expect(mockPrismaClient.creditCard.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
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
    it('should check if credit card exists by name and user ID', async () => {
      const existingCreditCard = {
        id: '1',
        name: 'Cartão Principal',
        userId: 'user-1',
      }

      mockPrismaClient.creditCard.findFirst.mockResolvedValue(existingCreditCard)

      const result = await creditCardRepository.existsByNameAndUserId(
        'Cartão Principal',
        'user-1',
      )

      expect(mockPrismaClient.creditCard.findFirst).toHaveBeenCalledWith({
        where: { name: 'Cartão Principal', userId: 'user-1' },
      })
      expect(result).toBe(true)
    })

    it('should return false when credit card does not exist', async () => {
      mockPrismaClient.creditCard.findFirst.mockResolvedValue(null)

      const result = await creditCardRepository.existsByNameAndUserId(
        'Cartão Inexistente',
        'user-1',
      )

      expect(mockPrismaClient.creditCard.findFirst).toHaveBeenCalledWith({
        where: { name: 'Cartão Inexistente', userId: 'user-1' },
      })
      expect(result).toBe(false)
    })

    it('should exclude specific ID when checking existence', async () => {
      mockPrismaClient.creditCard.findFirst.mockResolvedValue(null)

      const result = await creditCardRepository.existsByNameAndUserId(
        'Cartão Principal',
        'user-1',
        'exclude-id',
      )

      expect(mockPrismaClient.creditCard.findFirst).toHaveBeenCalledWith({
        where: {
          name: 'Cartão Principal',
          userId: 'user-1',
          NOT: { id: 'exclude-id' },
        },
      })
      expect(result).toBe(false)
    })
  })

  describe('getCreditCardsWithUsage', () => {
    it('should get credit cards with usage data', async () => {
      const mockCreditCards = [
        {
          id: '1',
          name: 'Cartão Principal',
          limit: 5000,
          userId: 'user-1',
          entries: [
            { amount: '100', type: 'expense' },
            { amount: '200', type: 'expense' },
          ],
          defaultPaymentAccount: { id: 'account-1', name: 'Conta Principal' },
        },
      ]

      mockPrismaClient.creditCard.findMany.mockResolvedValue(mockCreditCards)

      const result = await creditCardRepository.getCreditCardsWithUsage('user-1')

      expect(mockPrismaClient.creditCard.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
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
        orderBy: { createdAt: 'desc' },
      })
      expect(result).toEqual(mockCreditCards)
    })
  })

  describe('error handling', () => {
    it('should handle Prisma errors gracefully', async () => {
      const prismaError = new Error('Database connection failed')
      mockPrismaClient.creditCard.findMany.mockRejectedValue(prismaError)

      await expect(
        creditCardRepository.findMany({ where: { userId: 'user-1' } }),
      ).rejects.toThrow('Database connection failed')
    })

    it('should handle unique constraint violations', async () => {
      const uniqueConstraintError = new Error('Unique constraint failed')
      mockPrismaClient.creditCard.create.mockRejectedValue(uniqueConstraintError)

      await expect(
        creditCardRepository.create({
          data: { name: 'Cartão Duplicado', user: { connect: { id: 'user-1' } } },
        }),
      ).rejects.toThrow('Unique constraint failed')
    })
  })
})
