import { prisma } from '@/lib/prisma'

import { EntryController } from '../controllers/entry.controller'
import { EntryRepository } from '../repositories/entry.repository'
import { EntryService } from '../services/entry.service'

// Factory para criar instâncias das dependências de Entry
export class EntryFactory {
  private static entryRepository: EntryRepository
  private static entryService: EntryService
  private static entryController: EntryController

  static getRepository(): EntryRepository {
    if (!this.entryRepository) {
      this.entryRepository = new EntryRepository(prisma)
    }
    return this.entryRepository
  }

  static getService(): EntryService {
    if (!this.entryService) {
      const repository = this.getRepository()
      this.entryService = new EntryService(repository, prisma)
    }
    return this.entryService
  }

  static getController(): EntryController {
    if (!this.entryController) {
      const service = this.getService()
      this.entryController = new EntryController(service)
    }
    return this.entryController
  }
}
