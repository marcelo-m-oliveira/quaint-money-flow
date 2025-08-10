import { CategoryRepository } from '../repositories/category.repository'
import {
  CategoryCreateSchema,
  CategoryResponseSchema,
  CategoryUpdateSchema,
  CategoryUsageSchema,
  SelectOptionSchema,
} from '../utils/schemas'

export class CategoryService {
  constructor(private categoryRepository: CategoryRepository) {}

  async findAll(): Promise<CategoryResponseSchema[]> {
    return this.categoryRepository.findAll()
  }

  async findById(id: string): Promise<CategoryResponseSchema | null> {
    return this.categoryRepository.findById(id)
  }

  async create(data: CategoryCreateSchema): Promise<CategoryResponseSchema> {
    return this.categoryRepository.create(data)
  }

  async update(
    id: string,
    data: CategoryUpdateSchema,
  ): Promise<CategoryResponseSchema | null> {
    return this.categoryRepository.update(id, data)
  }

  async delete(id: string): Promise<boolean> {
    return this.categoryRepository.delete(id)
  }

  async findForSelect(
    type?: 'income' | 'expense',
  ): Promise<SelectOptionSchema[]> {
    return this.categoryRepository.findForSelect(type)
  }

  async getUsageStats(): Promise<CategoryUsageSchema[]> {
    return this.categoryRepository.getUsageStats()
  }
}
