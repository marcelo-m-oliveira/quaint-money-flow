import { BadRequestError } from '@/routes/_errors/bad-request-error'

import { EntryService } from '../entry.service'

// Declarações para Jest
declare const jest: any
declare const expect: any
declare const describe: any
declare const it: any
declare const beforeEach: any

const mockEntryRepository = {
  findMany: jest.fn(),
  findFirst: jest.fn(),
  count: jest.fn(),
  create: jest.fn(),
}

const mockPrismaClient: any = {
  category: { findUnique: jest.fn() },
  account: { findUnique: jest.fn() },
  creditCard: { findUnique: jest.fn() },
  entry: {
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    deleteMany: jest.fn(),
  },
  user: { findUnique: jest.fn() },
}

describe('Entry Service', () => {
  let service: EntryService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new EntryService(mockEntryRepository as any, mockPrismaClient)
  })

  describe('findById', () => {
    it('should return entry when found', async () => {
      const entry = { id: 'e1' }
      mockEntryRepository.findFirst.mockResolvedValue(entry)

      const result = await service.findById('e1', 'user-1')
      expect(mockEntryRepository.findFirst).toHaveBeenCalled()
      expect(result).toBe(entry)
    })

    it('should throw when not found', async () => {
      mockEntryRepository.findFirst.mockResolvedValue(null)
      await expect(service.findById('e1', 'user-1')).rejects.toThrow(
        new BadRequestError('Lançamento não encontrado'),
      )
    })
  })

  describe('create', () => {
    it('should validate foreign keys and create entry', async () => {
      const now = new Date()
      const data = {
        description: 'desc',
        amount: 10,
        type: 'income' as const,
        date: now,
        categoryId: 'c1',
        accountId: 'a1',
      }
      mockPrismaClient.category.findUnique.mockResolvedValue({ id: 'c1' })
      mockPrismaClient.account.findUnique.mockResolvedValue({ id: 'a1' })
      mockEntryRepository.create.mockResolvedValue({ id: 'e1', ...data })

      const result = await service.create(data as any, 'user-1')
      expect(mockEntryRepository.create).toHaveBeenCalled()
      expect(result.id).toBe('e1')
    })

    it('should throw if category does not exist', async () => {
      const now = new Date()
      mockPrismaClient.category.findUnique.mockResolvedValue(null)
      await expect(
        service.create(
          {
            description: 'x',
            amount: 1,
            type: 'expense',
            date: now,
            categoryId: 'missing',
          } as any,
          'user-1',
        ),
      ).rejects.toThrow(new BadRequestError('Categoria não encontrada'))
    })
  })

  describe('update', () => {
    it('should update with relation toggles', async () => {
      mockEntryRepository.findFirst.mockResolvedValue({ id: 'e1', userId: 'user-1' })
      mockPrismaClient.entry.update.mockResolvedValue({ id: 'e1', description: 'changed' })

      const result = await service.update(
        'e1',
        { description: 'changed', accountId: 'a1' } as any,
        'user-1',
      )
      expect(mockPrismaClient.entry.update).toHaveBeenCalled()
      expect(result.id).toBe('e1')
    })
  })

  describe('delete', () => {
    it('should delete entry', async () => {
      mockEntryRepository.findFirst.mockResolvedValue({ id: 'e1', userId: 'user-1' })
      mockPrismaClient.entry.delete.mockResolvedValue({ id: 'e1' })

      const result = await service.delete('e1', 'user-1')
      expect(mockPrismaClient.entry.delete).toHaveBeenCalledWith({ where: { id: 'e1', userId: 'user-1' } })
      expect(result.id).toBe('e1')
    })
  })

  describe('deleteAllByUserId', () => {
    it('should throw when user not found', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null)
      await expect(service.deleteAllByUserId('user-1')).rejects.toThrow(
        new BadRequestError('Usuário não encontrado'),
      )
    })

    it('should delete when entries exist', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue({ id: 'user-1' })
      mockPrismaClient.entry.count.mockResolvedValue(2)
      mockPrismaClient.entry.deleteMany.mockResolvedValue({ count: 2 })

      const result = await service.deleteAllByUserId('user-1')
      expect(result.deletedCount).toBe(2)
    })
  })
})


