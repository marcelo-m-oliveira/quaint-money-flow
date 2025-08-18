import { CategoryRepository } from '../category.repository'

// Declarações para Jest
declare const jest: any
declare const expect: any
declare const describe: any
declare const it: any
declare const beforeEach: any

// Mock do PrismaClient
const mockPrismaClient = {
  category: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    upsert: jest.fn(),
    updateMany: jest.fn(),
  },
}

describe('Category Repository', () => {
  let categoryRepository: CategoryRepository

  beforeEach(() => {
    jest.clearAllMocks()
    categoryRepository = new CategoryRepository(mockPrismaClient as any)
  })

  describe('findMany', () => {
    it('should find many categories with params', async () => {
      const mockCategories = [
        { id: '1', name: 'Alimentação', type: 'expense', userId: 'user-1' },
      ]
      const params = {
        where: { userId: 'user-1' },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      }

      mockPrismaClient.category.findMany.mockResolvedValue(mockCategories)

      const result = await categoryRepository.findMany(params)

      expect(mockPrismaClient.category.findMany).toHaveBeenCalledWith(params)
      expect(result).toEqual(mockCategories)
    })
  })

  describe('findById', () => {
    it('should find category by id', async () => {
      const category = { id: '1', name: 'Alimentação' }
      mockPrismaClient.category.findUnique.mockResolvedValue(category)

      const result = await categoryRepository.findById('1')

      expect(mockPrismaClient.category.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      })
      expect(result).toEqual(category)
    })
  })

  describe('findFirst', () => {
    it('should find first category matching where', async () => {
      const category = { id: '1', name: 'Alimentação' }
      const where = { name: 'Alimentação' }
      const include = { parent: true }

      mockPrismaClient.category.findFirst.mockResolvedValue(category)

      const result = await categoryRepository.findFirst(where, { include })

      expect(mockPrismaClient.category.findFirst).toHaveBeenCalledWith({
        where,
        include,
      })
      expect(result).toEqual(category)
    })
  })

  describe('create', () => {
    it('should create a category', async () => {
      const data = { name: 'Mercado', user: { connect: { id: 'user-1' } } }
      const created = { id: '1', name: 'Mercado' }
      mockPrismaClient.category.create.mockResolvedValue(created)

      const result = await categoryRepository.create(data, {
        include: { parent: true },
      })

      expect(mockPrismaClient.category.create).toHaveBeenCalledWith({
        data,
        include: { parent: true },
      })
      expect(result).toEqual(created)
    })
  })

  describe('update', () => {
    it('should update a category', async () => {
      const updated = { id: '1', name: 'Mercado' }
      mockPrismaClient.category.update.mockResolvedValue(updated)

      const result = await categoryRepository.update(
        '1',
        { name: 'Mercado' },
        {
          include: { children: true },
        },
      )

      expect(mockPrismaClient.category.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'Mercado' },
        include: { children: true },
      })
      expect(result).toEqual(updated)
    })
  })

  describe('delete', () => {
    it('should delete a category', async () => {
      const deleted = { id: '1' }
      mockPrismaClient.category.delete.mockResolvedValue(deleted)

      const result = await categoryRepository.delete('1')

      expect(mockPrismaClient.category.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      })
      expect(result).toEqual(deleted)
    })
  })

  describe('count', () => {
    it('should count categories', async () => {
      mockPrismaClient.category.count.mockResolvedValue(3)

      const result = await categoryRepository.count({ userId: 'user-1' } as any)

      expect(mockPrismaClient.category.count).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      })
      expect(result).toBe(3)
    })
  })

  describe('existsByNameAndUserId', () => {
    it('should return true when exists', async () => {
      mockPrismaClient.category.findFirst.mockResolvedValue({ id: '1' })

      const result = await categoryRepository.existsByNameAndUserId(
        'Alimentação',
        'user-1',
      )

      expect(mockPrismaClient.category.findFirst).toHaveBeenCalledWith({
        where: { name: 'Alimentação', userId: 'user-1' },
      })
      expect(result).toBe(true)
    })

    it('should apply NOT when excludeId provided', async () => {
      mockPrismaClient.category.findFirst.mockResolvedValue(null)

      await categoryRepository.existsByNameAndUserId(
        'Alimentação',
        'user-1',
        '1',
      )

      expect(mockPrismaClient.category.findFirst).toHaveBeenCalledWith({
        where: { name: 'Alimentação', userId: 'user-1', NOT: { id: '1' } },
      })
    })
  })

  describe('findForSelect', () => {
    it('should map select options', async () => {
      mockPrismaClient.category.findMany.mockResolvedValue([
        {
          id: '1',
          name: 'Alimentação',
          color: '#ff0000',
          icon: 'food',
          type: 'expense',
        },
      ])

      const result = await categoryRepository.findForSelect('user-1', 'expense')

      expect(result[0]).toEqual({
        value: '1',
        label: 'Alimentação',
        icon: 'food',
        iconType: 'generic',
        color: '#ff0000',
      })
    })
  })

  describe('getUsageStats', () => {
    it('should map usage stats', async () => {
      mockPrismaClient.category.findMany.mockResolvedValue([
        {
          id: '1',
          name: 'Alimentação',
          icon: 'food',
          type: 'expense',
          _count: { entries: 2, children: 0 },
        },
      ])

      const result = await categoryRepository.getUsageStats('user-1')

      expect(result[0]).toEqual({
        id: '1',
        name: 'Alimentação',
        icon: 'food',
        type: 'expense',
        entryCount: 2,
        totalAmount: 0,
      })
    })
  })
})
