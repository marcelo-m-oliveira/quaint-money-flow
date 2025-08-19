import { EntryController } from '../entry.controller'

// Declarações para Jest
declare const jest: any
declare const expect: any
declare const describe: any
declare const it: any
declare const beforeEach: any

const mockEntryService = {
  findMany: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  deleteAllByUserId: jest.fn(),
}

describe('Entry Controller', () => {
  let controller: EntryController
  let mockRequest: any
  let mockReply: any

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new EntryController(mockEntryService as any)

    mockRequest = {
      user: { sub: 'user-1' },
      query: {},
      params: {},
      body: {},
      log: { info: jest.fn(), error: jest.fn() },
    }

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    }
  })

  it('index should list entries', async () => {
    const now = new Date()
    mockEntryService.findMany.mockResolvedValue({
      entries: [
        {
          id: 'e1',
          description: 'desc',
          amount: 10,
          type: 'income',
          date: now,
          createdAt: now,
          updatedAt: now,
        },
      ],
      summary: { all: { income: 10, expense: 0, balance: 10 } },
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    })

    await controller.index(mockRequest, mockReply)

    expect(mockEntryService.findMany).toHaveBeenCalled()
    expect(mockReply.status).toHaveBeenCalledWith(200)
    expect(mockReply.send).toHaveBeenCalled()
  })

  it('show should return an entry', async () => {
    const now = new Date()
    mockRequest.params = { id: 'e1' }
    mockEntryService.findById.mockResolvedValue({
      id: 'e1',
      description: 'desc',
      amount: 10,
      type: 'income',
      date: now,
      createdAt: now,
      updatedAt: now,
    })

    await controller.show(mockRequest, mockReply)
    expect(mockEntryService.findById).toHaveBeenCalledWith('e1', 'user-1')
    expect(mockReply.status).toHaveBeenCalledWith(200)
  })

  it('store should create an entry', async () => {
    const now = new Date()
    mockRequest.body = {
      description: 'desc',
      amount: '10',
      type: 'income',
      date: Math.floor(now.getTime() / 1000),
      categoryId: 'c1',
    }
    mockEntryService.create.mockResolvedValue({
      id: 'e1',
      description: 'desc',
      amount: 10,
      date: now,
      createdAt: now,
    })

    await controller.store(mockRequest, mockReply)
    expect(mockEntryService.create).toHaveBeenCalled()
    expect(mockReply.status).toHaveBeenCalledWith(201)
  })

  it('update should update an entry', async () => {
    const now = new Date()
    mockRequest.params = { id: 'e1' }
    mockRequest.body = { description: 'changed' }
    mockEntryService.update.mockResolvedValue({
      id: 'e1',
      description: 'changed',
      amount: 10,
      date: now,
      createdAt: now,
      updatedAt: now,
    })

    await controller.update(mockRequest, mockReply)
    expect(mockEntryService.update).toHaveBeenCalledWith(
      'e1',
      expect.any(Object),
      'user-1',
    )
    expect(mockReply.status).toHaveBeenCalledWith(200)
  })

  it('patch should partially update an entry', async () => {
    const now = new Date()
    mockRequest.params = { id: 'e1' }
    mockRequest.body = { description: 'patched' }
    mockEntryService.update.mockResolvedValue({
      id: 'e1',
      description: 'patched',
      amount: 10,
      date: now,
      createdAt: now,
      updatedAt: now,
    })

    await controller.patch(mockRequest, mockReply)
    expect(mockEntryService.update).toHaveBeenCalledWith(
      'e1',
      expect.any(Object),
      'user-1',
    )
    expect(mockReply.status).toHaveBeenCalledWith(200)
  })

  it('destroy should delete an entry', async () => {
    mockRequest.params = { id: 'e1' }
    mockEntryService.delete.mockResolvedValue(undefined)

    await controller.destroy(mockRequest, mockReply)
    expect(mockEntryService.delete).toHaveBeenCalledWith('e1', 'user-1')
    expect(mockReply.status).toHaveBeenCalledWith(204)
  })

  it('deleteAll should delete all entries', async () => {
    mockEntryService.deleteAllByUserId.mockResolvedValue({
      deletedCount: 2,
      message: 'OK',
    })

    await controller.deleteAll(mockRequest, mockReply)
    expect(mockEntryService.deleteAllByUserId).toHaveBeenCalledWith('user-1')
    expect(mockReply.status).toHaveBeenCalledWith(200)
  })
})
