import { BadRequestError } from '../../routes/_errors/bad-request-error'
import { CreditCardService } from '../credit-card.service'

// Declarações para Jest
declare const jest: any
declare const expect: any
declare const describe: any
declare const it: any
declare const beforeEach: any

// Mock do CreditCardRepository
const mockCreditCardRepository = {
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
  existsByNameAndUserId: jest.fn(),
  getCreditCardsWithUsage: jest.fn(),
  getCreditCardUsage: jest.fn(),
}

// Mock do PrismaClient
const mockPrismaClient = {
  account: {
    findUnique: jest.fn(),
  },
  entry: {
    count: jest.fn(),
    findMany: jest.fn(),
  },
}

describe('Credit Card Service', () => {
  let creditCardService: CreditCardService

  beforeEach(() => {
    jest.clearAllMocks()
    creditCardService = new CreditCardService(
      mockCreditCardRepository as any,
      mockPrismaClient as any,
    )
  })

  describe('findMany', () => {
    it('should find many credit cards with filters and pagination', async () => {
      const mockCreditCardsWithUsage = [
        {
          id: '1',
          name: 'Cartão Principal',
          limit: 5000,
          userId: 'user-1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          entries: [
            { amount: '100', type: 'expense' },
            { amount: '200', type: 'expense' },
          ],
        },
        {
          id: '2',
          name: 'Cartão Secundário',
          limit: 3000,
          userId: 'user-1',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
          entries: [{ amount: '150', type: 'expense' }],
        },
      ]

      mockCreditCardRepository.getCreditCardsWithUsage.mockResolvedValue(
        mockCreditCardsWithUsage,
      )

      const result = await creditCardService.findMany('user-1', {
        search: 'principal',
        page: 1,
        limit: 10,
      })

      expect(
        mockCreditCardRepository.getCreditCardsWithUsage,
      ).toHaveBeenCalledWith('user-1')
      expect(result.creditCards).toHaveLength(1)
      expect(result.creditCards[0].name).toBe('Cartão Principal')
      expect(result.creditCards[0].usage).toBe(300)
      expect(result.creditCards[0].availableLimit).toBe(4700)
      expect(result.pagination.page).toBe(1)
      expect(result.pagination.limit).toBe(10)
      expect(result.pagination.total).toBe(1)
    })

    it('should return empty result when no credit cards match search', async () => {
      const mockCreditCardsWithUsage = [
        {
          id: '1',
          name: 'Cartão Principal',
          limit: 5000,
          userId: 'user-1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          entries: [],
        },
      ]

      mockCreditCardRepository.getCreditCardsWithUsage.mockResolvedValue(
        mockCreditCardsWithUsage,
      )

      const result = await creditCardService.findMany('user-1', {
        search: 'inexistente',
        page: 1,
        limit: 10,
      })

      expect(result.creditCards).toHaveLength(0)
      expect(result.pagination.total).toBe(0)
    })

    it('should calculate usage correctly for expense entries only', async () => {
      const mockCreditCardsWithUsage = [
        {
          id: '1',
          name: 'Cartão Principal',
          limit: 5000,
          userId: 'user-1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          entries: [
            { amount: '100', type: 'expense' },
            { amount: '200', type: 'income' }, // Should be ignored
            { amount: '300', type: 'expense' },
          ],
        },
      ]

      mockCreditCardRepository.getCreditCardsWithUsage.mockResolvedValue(
        mockCreditCardsWithUsage,
      )

      const result = await creditCardService.findMany('user-1', {
        page: 1,
        limit: 10,
      })

      expect(result.creditCards[0].usage).toBe(400) // Only 100 + 300 (expenses)
      expect(result.creditCards[0].availableLimit).toBe(4600)
    })

    it('should handle pagination correctly', async () => {
      const mockCreditCardsWithUsage = Array.from({ length: 25 }, (_, i) => ({
        id: `card-${i + 1}`,
        name: `Cartão ${i + 1}`,
        limit: 5000,
        userId: 'user-1',
        createdAt: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
        updatedAt: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
        entries: [],
      }))

      mockCreditCardRepository.getCreditCardsWithUsage.mockResolvedValue(
        mockCreditCardsWithUsage,
      )

      const result = await creditCardService.findMany('user-1', {
        page: 2,
        limit: 10,
      })

      expect(result.creditCards).toHaveLength(10)
      expect(result.pagination.page).toBe(2)
      expect(result.pagination.total).toBe(25)
      expect(result.pagination.totalPages).toBe(3)
      expect(result.pagination.hasNext).toBe(true)
      expect(result.pagination.hasPrev).toBe(true)
    })
  })

  describe('findById', () => {
    it('should find credit card by ID successfully', async () => {
      const mockCreditCard = {
        id: '1',
        name: 'Cartão Principal',
        limit: 5000,
        userId: 'user-1',
        defaultPaymentAccount: { id: 'account-1', name: 'Conta Principal' },
      }

      mockCreditCardRepository.findById.mockResolvedValue(mockCreditCard)

      const result = await creditCardService.findById('1', 'user-1')

      expect(mockCreditCardRepository.findById).toHaveBeenCalledWith('1')
      expect(result).toEqual(mockCreditCard)
    })

    it('should throw error when credit card not found', async () => {
      mockCreditCardRepository.findById.mockResolvedValue(null)

      await expect(creditCardService.findById('999', 'user-1')).rejects.toThrow(
        BadRequestError,
      )
      await expect(creditCardService.findById('999', 'user-1')).rejects.toThrow(
        'Cartao de credito nao encontrado',
      )
    })
  })

  describe('create', () => {
    it('should create credit card successfully', async () => {
      const creditCardData = {
        name: 'Novo Cartão',
        limit: '3000',
        icon: 'visa-icon',
        iconType: 'visa',
        closingDay: 15,
        dueDay: 20,
        defaultPaymentAccountId: 'account-1',
      }

      const createdCreditCard = {
        id: '1',
        name: 'Novo Cartão',
        limit: 3000,
        userId: 'user-1',
        defaultPaymentAccount: { id: 'account-1', name: 'Conta Principal' },
      }

      mockCreditCardRepository.findFirst.mockResolvedValue(null)
      mockPrismaClient.account.findUnique.mockResolvedValue({
        id: 'account-1',
        name: 'Conta Principal',
      })
      mockCreditCardRepository.create.mockResolvedValue(createdCreditCard)

      const result = await creditCardService.create(creditCardData, 'user-1')

      expect(mockCreditCardRepository.findFirst).toHaveBeenCalledWith({
        name: 'Novo Cartão',
        userId: 'user-1',
      })
      expect(mockPrismaClient.account.findUnique).toHaveBeenCalledWith({
        where: { id: 'account-1', userId: 'user-1' },
      })
      expect(mockCreditCardRepository.create).toHaveBeenCalledWith({
        name: 'Novo Cartão',
        limit: 3000,
        icon: 'visa-icon',
        iconType: 'visa',
        closingDay: 15,
        dueDay: 20,
        user: { connect: { id: 'user-1' } },
        defaultPaymentAccount: { connect: { id: 'account-1' } },
      })
      expect(result).toEqual(createdCreditCard)
    })

    it('should throw error when credit card with same name exists', async () => {
      const creditCardData = {
        name: 'Cartão Existente',
        limit: '3000',
        icon: 'visa-icon',
        iconType: 'visa',
        closingDay: 15,
        dueDay: 20,
      }

      mockCreditCardRepository.findFirst.mockResolvedValue({
        id: '1',
        name: 'Cartão Existente',
      })

      await expect(
        creditCardService.create(creditCardData, 'user-1'),
      ).rejects.toThrow(BadRequestError)
      await expect(
        creditCardService.create(creditCardData, 'user-1'),
      ).rejects.toThrow('Já existe um cartão de crédito com este nome')
    })

    it('should throw error when default payment account not found', async () => {
      const creditCardData = {
        name: 'Novo Cartão',
        limit: '3000',
        defaultPaymentAccountId: 'account-inexistente',
      }

      mockCreditCardRepository.findFirst.mockResolvedValue(null)
      mockPrismaClient.account.findUnique.mockResolvedValue(null)

      await expect(
        creditCardService.create(creditCardData, 'user-1'),
      ).rejects.toThrow(BadRequestError)
      await expect(
        creditCardService.create(creditCardData, 'user-1'),
      ).rejects.toThrow('Conta de pagamento padrão não encontrada')
    })

    it('should create credit card without default payment account', async () => {
      const creditCardData = {
        name: 'Novo Cartão',
        limit: '3000',
        icon: 'visa-icon',
        iconType: 'visa',
        closingDay: 15,
        dueDay: 20,
      }

      const createdCreditCard = {
        id: '1',
        name: 'Novo Cartão',
        limit: 3000,
        userId: 'user-1',
      }

      mockCreditCardRepository.findFirst.mockResolvedValue(null)
      mockCreditCardRepository.create.mockResolvedValue(createdCreditCard)

      const result = await creditCardService.create(creditCardData, 'user-1')

      expect(mockCreditCardRepository.create).toHaveBeenCalledWith({
        name: 'Novo Cartão',
        limit: 3000,
        icon: 'visa-icon',
        iconType: 'visa',
        closingDay: 15,
        dueDay: 20,
        user: { connect: { id: 'user-1' } },
      })
      expect(result).toEqual(createdCreditCard)
    })
  })

  describe('update', () => {
    it('should update credit card successfully', async () => {
      const updateData = {
        name: 'Cartão Atualizado',
        limit: '6000',
      }

      const existingCreditCard = {
        id: '1',
        name: 'Cartão Original',
        limit: 5000,
        userId: 'user-1',
      }

      const updatedCreditCard = {
        id: '1',
        name: 'Cartão Atualizado',
        limit: 6000,
        userId: 'user-1',
        defaultPaymentAccount: { id: 'account-1', name: 'Conta Principal' },
      }

      mockCreditCardRepository.findById.mockResolvedValue(existingCreditCard)
      mockCreditCardRepository.findFirst.mockResolvedValue(null)
      mockCreditCardRepository.update.mockResolvedValue(updatedCreditCard)

      const result = await creditCardService.update('1', updateData, 'user-1')

      expect(mockCreditCardRepository.findById).toHaveBeenCalledWith('1')
      expect(mockCreditCardRepository.findFirst).toHaveBeenCalledWith({
        name: 'Cartão Atualizado',
        userId: 'user-1',
        id: { not: '1' },
      })
      expect(mockCreditCardRepository.update).toHaveBeenCalledWith('1', {
        name: 'Cartão Atualizado',
        limit: 6000,
      })
      expect(result).toEqual(updatedCreditCard)
    })

    it('should throw error when credit card not found', async () => {
      const updateData = { name: 'Cartão Atualizado' }

      mockCreditCardRepository.findById.mockResolvedValue(null)

      await expect(
        creditCardService.update('999', updateData, 'user-1'),
      ).rejects.toThrow(BadRequestError)
      await expect(
        creditCardService.update('999', updateData, 'user-1'),
      ).rejects.toThrow('Cartao de credito nao encontrado')
    })

    it('should throw error when name conflicts with existing credit card', async () => {
      const updateData = { name: 'Cartão Conflitante' }

      const existingCreditCard = {
        id: '1',
        name: 'Cartão Original',
        limit: 5000,
        userId: 'user-1',
      }

      mockCreditCardRepository.findById.mockResolvedValue(existingCreditCard)
      mockCreditCardRepository.findFirst.mockResolvedValue({
        id: '2',
        name: 'Cartão Conflitante',
      })

      await expect(
        creditCardService.update('1', updateData, 'user-1'),
      ).rejects.toThrow(BadRequestError)
      await expect(
        creditCardService.update('1', updateData, 'user-1'),
      ).rejects.toThrow('Já existe um cartão de crédito com este nome')
    })

    it('should update without name conflict check when name not provided', async () => {
      const updateData = { limit: '6000' }

      const existingCreditCard = {
        id: '1',
        name: 'Cartão Original',
        limit: 5000,
        userId: 'user-1',
      }

      const updatedCreditCard = {
        id: '1',
        name: 'Cartão Original',
        limit: 6000,
        userId: 'user-1',
      }

      mockCreditCardRepository.findById.mockResolvedValue(existingCreditCard)
      mockCreditCardRepository.update.mockResolvedValue(updatedCreditCard)

      const result = await creditCardService.update('1', updateData, 'user-1')

      expect(mockCreditCardRepository.findFirst).not.toHaveBeenCalled()
      expect(mockCreditCardRepository.update).toHaveBeenCalledWith('1', {
        limit: 6000,
      })
      expect(result).toEqual(updatedCreditCard)
    })

    it('should validate default payment account when provided', async () => {
      const updateData = {
        name: 'Cartão Atualizado',
        defaultPaymentAccountId: 'account-1',
      }

      const existingCreditCard = {
        id: '1',
        name: 'Cartão Original',
        limit: 5000,
        userId: 'user-1',
      }

      const updatedCreditCard = {
        id: '1',
        name: 'Cartão Atualizado',
        limit: 5000,
        userId: 'user-1',
        defaultPaymentAccount: { id: 'account-1', name: 'Conta Principal' },
      }

      mockCreditCardRepository.findById.mockResolvedValue(existingCreditCard)
      mockCreditCardRepository.findFirst.mockResolvedValue(null)
      mockPrismaClient.account.findUnique.mockResolvedValue({
        id: 'account-1',
        name: 'Conta Principal',
      })
      mockCreditCardRepository.update.mockResolvedValue(updatedCreditCard)

      const result = await creditCardService.update('1', updateData, 'user-1')

      expect(mockPrismaClient.account.findUnique).toHaveBeenCalledWith({
        where: { id: 'account-1', userId: 'user-1' },
      })
      expect(mockCreditCardRepository.update).toHaveBeenCalledWith('1', {
        name: 'Cartão Atualizado',
        defaultPaymentAccount: { connect: { id: 'account-1' } },
      })
      expect(result).toEqual(updatedCreditCard)
    })
  })

  describe('delete', () => {
    it('should delete credit card successfully', async () => {
      const existingCreditCard = {
        id: '1',
        name: 'Cartão para Deletar',
        limit: 5000,
        userId: 'user-1',
      }

      mockCreditCardRepository.findById.mockResolvedValue(existingCreditCard)
      mockPrismaClient.entry.count.mockResolvedValue(0)
      mockCreditCardRepository.delete.mockResolvedValue(existingCreditCard)

      const result = await creditCardService.delete('1', 'user-1')

      expect(mockCreditCardRepository.findById).toHaveBeenCalledWith('1')
      expect(mockPrismaClient.entry.count).toHaveBeenCalledWith({
        where: { creditCardId: '1', userId: 'user-1' },
      })
      expect(mockCreditCardRepository.delete).toHaveBeenCalledWith('1')
      expect(result).toEqual(existingCreditCard)
    })

    it('should throw error when credit card not found', async () => {
      mockCreditCardRepository.findById.mockResolvedValue(null)

      await expect(creditCardService.delete('999', 'user-1')).rejects.toThrow(
        BadRequestError,
      )
      await expect(creditCardService.delete('999', 'user-1')).rejects.toThrow(
        'Cartao de credito nao encontrado',
      )
    })

    it('should throw error when credit card has associated entries', async () => {
      const existingCreditCard = {
        id: '1',
        name: 'Cartão com Entries',
        limit: 5000,
        userId: 'user-1',
      }

      mockCreditCardRepository.findById.mockResolvedValue(existingCreditCard)
      mockPrismaClient.entry.count.mockResolvedValue(5)

      await expect(creditCardService.delete('1', 'user-1')).rejects.toThrow(
        BadRequestError,
      )
      await expect(creditCardService.delete('1', 'user-1')).rejects.toThrow(
        'Não é possível excluir um cartão de crédito que possui transações',
      )
    })
  })

  describe('getUsage', () => {
    it('should get credit card usage successfully', async () => {
      const existingCreditCard = {
        id: '1',
        name: 'Cartão Principal',
        limit: 5000,
        userId: 'user-1',
      }

      const mockEntries = [
        { amount: '100' },
        { amount: '200' },
        { amount: '300' },
      ]

      mockCreditCardRepository.findById.mockResolvedValue(existingCreditCard)
      mockCreditCardRepository.getCreditCardUsage.mockResolvedValue(600)

      const result = await creditCardService.getUsage('1', 'user-1')

      expect(mockCreditCardRepository.findById).toHaveBeenCalledWith('1')
      expect(mockCreditCardRepository.getCreditCardUsage).toHaveBeenCalledWith(
        '1',
        'user-1',
      )
      expect(result.usage).toBe(600)
      expect(result.limit).toBe(5000)
      expect(result.availableLimit).toBe(4400)
      expect(result.creditCardId).toBe('1')
      expect(result.lastUpdated).toBeDefined()
    })

    it('should return zero usage when no expense entries exist', async () => {
      const existingCreditCard = {
        id: '1',
        name: 'Cartão Principal',
        limit: 5000,
        userId: 'user-1',
      }

      mockCreditCardRepository.findById.mockResolvedValue(existingCreditCard)
      mockCreditCardRepository.getCreditCardUsage.mockResolvedValue(0)

      const result = await creditCardService.getUsage('1', 'user-1')

      expect(result.usage).toBe(0)
      expect(result.availableLimit).toBe(5000)
    })

    it('should handle negative balance correctly', async () => {
      const existingCreditCard = {
        id: '1',
        name: 'Cartão Principal',
        limit: 1000,
        userId: 'user-1',
      }

      const mockEntries = [{ amount: '1500' }]

      mockCreditCardRepository.findById.mockResolvedValue(existingCreditCard)
      mockCreditCardRepository.getCreditCardUsage.mockResolvedValue(1500)

      const result = await creditCardService.getUsage('1', 'user-1')

      expect(result.usage).toBe(1500)
      expect(result.availableLimit).toBe(-500)
    })

    it('should throw error when credit card not found', async () => {
      mockCreditCardRepository.findById.mockResolvedValue(null)

      await expect(creditCardService.getUsage('999', 'user-1')).rejects.toThrow(
        BadRequestError,
      )
      await expect(creditCardService.getUsage('999', 'user-1')).rejects.toThrow(
        'Cartao de credito nao encontrado',
      )
    })
  })

  describe('error handling', () => {
    it('should handle repository errors gracefully', async () => {
      const repositoryError = new Error('Repository error')
      mockCreditCardRepository.getCreditCardsWithUsage.mockRejectedValue(
        repositoryError,
      )

      await expect(
        creditCardService.findMany('user-1', { page: 1, limit: 10 }),
      ).rejects.toThrow('Repository error')
    })

    it('should handle Prisma errors gracefully', async () => {
      const prismaError = new Error('Prisma error')
      mockPrismaClient.entry.count.mockRejectedValue(prismaError)

      const existingCreditCard = {
        id: '1',
        name: 'Cartão Principal',
        limit: 5000,
        userId: 'user-1',
      }

      mockCreditCardRepository.findById.mockResolvedValue(existingCreditCard)

      await expect(creditCardService.delete('1', 'user-1')).rejects.toThrow(
        'Prisma error',
      )
    })
  })
})
