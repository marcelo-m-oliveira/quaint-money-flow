import { EntryRepository } from '../entry.repository'

// Declarações para Jest
declare const jest: any
declare const expect: any
declare const describe: any
declare const it: any
declare const beforeEach: any

const mockPrismaClient: any = {
  entry: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
}

describe('Entry Repository', () => {
  let repository: EntryRepository

  beforeEach(() => {
    jest.clearAllMocks()
    repository = new EntryRepository(mockPrismaClient)
  })

  it('findById should call prisma.entry.findUnique with id', async () => {
    const entry = { id: 'e1' }
    mockPrismaClient.entry.findUnique.mockResolvedValue(entry)

    const result = await repository.findById('e1')
    expect(mockPrismaClient.entry.findUnique).toHaveBeenCalledWith({ where: { id: 'e1' } })
    expect(result).toBe(entry)
  })

  it('findMany should pass options through', async () => {
    const entries: any[] = []
    const options = { where: { userId: 'user-1' }, take: 10 }
    mockPrismaClient.entry.findMany.mockResolvedValue(entries)

    const result = await repository.findMany(options as any)
    expect(mockPrismaClient.entry.findMany).toHaveBeenCalledWith(options)
    expect(result).toBe(entries)
  })

  it('findFirst should pass where/include', async () => {
    const entry = { id: 'e1' }
    mockPrismaClient.entry.findFirst.mockResolvedValue(entry)
    const result = await repository.findFirst({ id: 'e1' } as any, { include: { category: true } })
    expect(mockPrismaClient.entry.findFirst).toHaveBeenCalledWith({ where: { id: 'e1' }, include: { category: true } })
    expect(result).toBe(entry)
  })

  it('create should call prisma.entry.create', async () => {
    const created = { id: 'e1' }
    mockPrismaClient.entry.create.mockResolvedValue(created)
    const data = { description: 'x', user: { connect: { id: 'user-1' } } }
    const result = await repository.create(data, { include: { category: true } })
    expect(mockPrismaClient.entry.create).toHaveBeenCalledWith({ data, include: { category: true } })
    expect(result).toBe(created)
  })

  it('update should call prisma.entry.update', async () => {
    const updated = { id: 'e1', description: 'changed' }
    mockPrismaClient.entry.update.mockResolvedValue(updated)
    const result = await repository.update('e1', { description: 'changed' }, { include: { account: true } })
    expect(mockPrismaClient.entry.update).toHaveBeenCalledWith({ where: { id: 'e1' }, data: { description: 'changed' }, include: { account: true } })
    expect(result).toBe(updated)
  })

  it('delete should call prisma.entry.delete', async () => {
    const deleted = { id: 'e1' }
    mockPrismaClient.entry.delete.mockResolvedValue(deleted)
    const result = await repository.delete('e1')
    expect(mockPrismaClient.entry.delete).toHaveBeenCalledWith({ where: { id: 'e1' } })
    expect(result).toBe(deleted)
  })

  it('count should call prisma.entry.count', async () => {
    mockPrismaClient.entry.count.mockResolvedValue(3)
    const result = await repository.count({ userId: 'user-1' } as any)
    expect(mockPrismaClient.entry.count).toHaveBeenCalledWith({ where: { userId: 'user-1' } })
    expect(result).toBe(3)
  })
})


