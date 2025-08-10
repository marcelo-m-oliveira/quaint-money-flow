import { PrismaClient } from '@prisma/client'

import { BaseRepository } from './base.repository'

export class TransactionRepository extends BaseRepository<'transaction'> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'transaction')
  }
}
