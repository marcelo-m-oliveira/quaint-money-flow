import { PrismaClient } from '@prisma/client'

import { BaseRepository } from './base.repository'

export class EntryRepository extends BaseRepository<'entry'> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'entry')
  }
}
