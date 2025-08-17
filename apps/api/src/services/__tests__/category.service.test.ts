import { BadRequestError } from '@/routes/_errors/bad-request-error'

import { CategoryService } from '../category.service'

// Declarações para Jest
declare const jest: any
declare const expect: any
declare const describe: any
declare const it: any
declare const beforeEach: any

// Mock do CategoryRepository
const mockCategoryRepository = {
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
  findForSelect: jest.fn(),
  getUsageStats: jest.fn(),
}

// Mock do PrismaClient
const mockPrismaClient = {
  category: {
    findUnique: jest.fn(),
    updateMany: jest.fn(),
    count: jest.fn(),
  },
  entry: {
    count: jest.fn(),
  },
}

describe('Category Service', () => {
  let categoryService: CategoryService

  beforeEach(() => {
    jest.clearAllMocks()
    categoryService = new CategoryService(
      mockCategoryRepository as any,
      mockPrismaClient as any,
    )
  })

  describe('findMany', () => {
    it('should list categories with pagination and filters', async () => {
      const categories = [
        {
          id: '1',
          name: 'Alimentação',
          color: '#ff0000',
          icon: 'food',
          type: 'expense' as const,
        },
      ]

      mockCategoryRepository.findMany.mockResolvedValue(categories)
      mockCategoryRepository.count.mockResolvedValue(1)

      const result = await categoryService.findMany('user-1', {
        page: 1,
        limit: 20,
        type: 'expense',
      })

      expect(mockCategoryRepository.findMany).toHaveBeenCalled()
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      })
      expect(result.categories).toHaveLength(1)
    })
  })

  describe('findById', () => {
    it('should return category with relations', async () => {
      const category = {
        id: '1',
        name: 'Alimentação',
        userId: 'user-1',
      }

      mockCategoryRepository.findFirst.mockResolvedValue(category)

      const result = await categoryService.findById('1', 'user-1')

      expect(mockCategoryRepository.findFirst).toHaveBeenCalled()
      expect(result).toEqual(category)
    })

    it('should throw error when not found', async () => {
      mockCategoryRepository.findFirst.mockResolvedValue(null)

      await expect(categoryService.findById('1', 'user-1')).rejects.toThrow(
        new BadRequestError('Categoria nao encontrada'),
      )
    })
  })

  describe('create', () => {
    it('should create category and inherit parent props when provided', async () => {
      const data = {
        name: 'Mercado',
        color: '#ff0000',
        icon: 'food',
        type: 'expense' as const,
        parentId: 'parent-1',
      }

      const parent = { id: 'parent-1', color: '#123456', icon: 'basket' }
      mockCategoryRepository.findFirst.mockResolvedValue(null)
      mockPrismaClient.category.findUnique.mockResolvedValue(parent)
      mockCategoryRepository.create.mockResolvedValue({ id: '1', ...data })

      const result = await categoryService.create(data as any, 'user-1')

      expect(mockCategoryRepository.findFirst).toHaveBeenCalled()
      expect(mockPrismaClient.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'parent-1', userId: 'user-1' },
      })
      expect(mockCategoryRepository.create).toHaveBeenCalled()
      expect(result.id).toBe('1')
    })

    it('should throw if duplicate name exists', async () => {
      const data = {
        name: 'Mercado',
        color: '#ff0000',
        icon: 'food',
        type: 'expense' as const,
      }

      mockCategoryRepository.findFirst.mockResolvedValue({ id: 'dup' })

      await expect(categoryService.create(data as any, 'user-1')).rejects.toThrow(
        new BadRequestError('Ja existe uma categoria com este nome'),
      )
    })
  })

  describe('update', () => {
    it('should update category and propagate color/icon to children', async () => {
      const updateData = { color: '#00ff00', icon: 'cart' }
      const existing = { id: '1', userId: 'user-1' }

      mockCategoryRepository.findFirst.mockResolvedValue(existing)
      mockPrismaClient.category.updateMany.mockResolvedValue({ count: 1 })
      mockCategoryRepository.findFirst.mockResolvedValue({ id: '1', ...updateData })

      await categoryService.update('1', updateData as any, 'user-1')

      expect(mockPrismaClient.category.updateMany).toHaveBeenCalledWith({
        where: { parentId: '1', userId: 'user-1' },
        data: { color: '#00ff00', icon: 'cart' },
      })
    })

    it('should validate duplicate name on update', async () => {
      const existing = { id: '1', userId: 'user-1' }
      mockCategoryRepository.findFirst
        .mockResolvedValueOnce(existing) // findById
        .mockResolvedValueOnce({ id: '2' }) // duplicate name check

      await expect(
        categoryService.update('1', { name: 'Duplicada' } as any, 'user-1'),
      ).rejects.toThrow(new BadRequestError('Ja existe uma categoria com este nome'))
    })
  })

  describe('delete', () => {
    it('should delete when no entries or children', async () => {
      mockCategoryRepository.findFirst.mockResolvedValue({ id: '1', userId: 'user-1' })
      mockPrismaClient.entry.count.mockResolvedValue(0)
      mockPrismaClient.category.count.mockResolvedValue(0)
      mockCategoryRepository.delete.mockResolvedValue({ id: '1' })

      const result = await categoryService.delete('1', 'user-1')

      expect(mockCategoryRepository.delete).toHaveBeenCalledWith('1')
      expect(result).toEqual({ id: '1' })
    })

    it('should prevent delete when has entries', async () => {
      mockCategoryRepository.findFirst.mockResolvedValue({ id: '1', userId: 'user-1' })
      mockPrismaClient.entry.count.mockResolvedValue(3)

      await expect(categoryService.delete('1', 'user-1')).rejects.toThrow(
        new BadRequestError('Nao e possivel excluir uma categoria que possui entries'),
      )
    })

    it('should prevent delete when has children', async () => {
      mockCategoryRepository.findFirst.mockResolvedValue({ id: '1', userId: 'user-1' })
      mockPrismaClient.entry.count.mockResolvedValue(0)
      mockPrismaClient.category.count.mockResolvedValue(2)

      await expect(categoryService.delete('1', 'user-1')).rejects.toThrow(
        new BadRequestError('Nao e possivel excluir uma categoria que possui subcategorias'),
      )
    })
  })

  describe('findForSelect', () => {
    it('should return select options', async () => {
      const options = [{ value: '1', label: 'Alimentação' }]
      mockCategoryRepository.findForSelect.mockResolvedValue(options)

      const result = await categoryService.findForSelect('user-1', 'expense')

      expect(mockCategoryRepository.findForSelect).toHaveBeenCalledWith('user-1', 'expense')
      expect(result).toEqual(options)
    })
  })

  describe('getUsageStats', () => {
    it('should return usage data', async () => {
      const usage = [{ id: '1', name: 'Alimentação', icon: 'food', type: 'expense', entryCount: 5, totalAmount: 0 }]
      mockCategoryRepository.getUsageStats.mockResolvedValue(usage)

      const result = await categoryService.getUsageStats('user-1')

      expect(mockCategoryRepository.getUsageStats).toHaveBeenCalledWith('user-1')
      expect(result).toEqual(usage)
    })
  })
})


