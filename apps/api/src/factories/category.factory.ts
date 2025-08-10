import { CategoryController } from '../controllers/category.controller'
import { prisma } from '@/lib/prisma'
import { CategoryRepository } from '../repositories/category.repository'
import { CategoryService } from '../services/category.service'

// Factory para criar instâncias das dependências de Category
export class CategoryFactory {
  private static categoryRepository: CategoryRepository
  private static categoryService: CategoryService
  private static categoryController: CategoryController

  static getRepository(): CategoryRepository {
    if (!this.categoryRepository) {
      this.categoryRepository = new CategoryRepository(prisma)
    }
    return this.categoryRepository
  }

  static getService(): CategoryService {
    if (!this.categoryService) {
      const repository = this.getRepository()
      this.categoryService = new CategoryService(repository, prisma)
    }
    return this.categoryService
  }

  static getController(): CategoryController {
    if (!this.categoryController) {
      const service = this.getService()
      this.categoryController = new CategoryController(service)
    }
    return this.categoryController
  }
}
