import { CategoryController } from '../controllers/category.controller'
import { CategoryRepository } from '../repositories/category.repository'
import { CategoryService } from '../services/category.service'

export class CategoryFactory {
  private static categoryController: CategoryController

  static getController(): CategoryController {
    if (!CategoryFactory.categoryController) {
      const categoryRepository = new CategoryRepository()
      const categoryService = new CategoryService(categoryRepository)
      CategoryFactory.categoryController = new CategoryController(
        categoryService,
      )
    }

    return CategoryFactory.categoryController
  }
}
