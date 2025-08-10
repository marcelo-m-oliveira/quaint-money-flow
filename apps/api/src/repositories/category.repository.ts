import {
  CategoryCreateSchema,
  CategoryResponseSchema,
  CategoryUpdateSchema,
  CategoryUsageSchema,
  SelectOptionSchema,
} from '../utils/schemas'
import { BaseRepository } from './base.repository'

export class CategoryRepository extends BaseRepository {
  async findAll(): Promise<CategoryResponseSchema[]> {
    // Implementação mock para demonstração
    // Em produção, isso seria uma query real no banco de dados
    return []
  }

  async findById(_id: string): Promise<CategoryResponseSchema | null> {
    // Implementação mock para demonstração
    return null
  }

  async create(_data: CategoryCreateSchema): Promise<CategoryResponseSchema> {
    // Implementação mock para demonstração
    return {
      ..._data,
      id: 'mock-id',
      userId: 'mock-user-id',
      createdAt: Date.now() / 1000,
      updatedAt: Date.now() / 1000,
    } as CategoryResponseSchema
  }

  async update(
    _id: string,
    _data: CategoryUpdateSchema,
  ): Promise<CategoryResponseSchema | null> {
    // Implementação mock para demonstração
    return null
  }

  async delete(_id: string): Promise<boolean> {
    // Implementação mock para demonstração
    return false
  }

  async findForSelect(
    _type?: 'income' | 'expense',
  ): Promise<SelectOptionSchema[]> {
    // Implementação mock para demonstração
    return []
  }

  async getUsageStats(): Promise<CategoryUsageSchema[]> {
    // Implementação mock para demonstração
    return []
  }
}
