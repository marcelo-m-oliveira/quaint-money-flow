import { Prisma, PrismaClient } from '@prisma/client'

import { BaseRepository } from './base.repository'

export class EntryRepository extends BaseRepository<'entry'> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'entry')
  }

  async findUnique(params: {
    where: Prisma.EntryWhereUniqueInput
    include?: Prisma.EntryInclude
  }) {
    return this.prisma.entry.findUnique(params)
  }

  async create(params: {
    data: Prisma.EntryCreateInput
    include?: Prisma.EntryInclude
  }) {
    return this.prisma.entry.create(params)
  }
}
