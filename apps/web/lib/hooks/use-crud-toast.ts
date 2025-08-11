'use client'

import { toast } from 'sonner'

// Tipos para facilitar o uso

/**
 * Hook personalizado para exibir toasts padronizados para operações CRUD
 * Utiliza o Sonner para notificações mais modernas e performáticas
 */
export function useCrudToast() {
  const showSuccess = (message: string, description?: string) => {
    toast.success(message, {
      description,
    })
  }

  const showError = (message: string, description?: string) => {
    toast.error(message, {
      description,
    })
  }

  const showWarning = (message: string, description?: string) => {
    toast.warning(message, {
      description,
    })
  }

  const showInfo = (message: string, description?: string) => {
    toast.info(message, {
      description,
    })
  }

  // Métodos específicos para operações CRUD
  const success = {
    create: (entity: string) =>
      showSuccess('Sucesso', `${entity} criado(a) com sucesso.`),
    update: (entity: string) =>
      showSuccess('Sucesso', `${entity} atualizado(a) com sucesso.`),
    delete: (entity: string) =>
      showSuccess('Sucesso', `${entity} excluído(a) com sucesso.`),
    save: (entity: string) =>
      showSuccess('Sucesso', `${entity} salvo(a) com sucesso.`),
  }

  const error = {
    create: (entity: string, details?: string) =>
      showError(
        'Erro ao criar',
        details ||
          `Não foi possível criar ${entity.toLowerCase()}. Tente novamente.`,
      ),
    update: (entity: string, details?: string) =>
      showError(
        'Erro ao atualizar',
        details ||
          `Não foi possível atualizar ${entity.toLowerCase()}. Tente novamente.`,
      ),
    delete: (entity: string, details?: string) =>
      showError(
        'Erro ao excluir',
        details ||
          `Não foi possível excluir ${entity.toLowerCase()}. Tente novamente.`,
      ),
    save: (entity: string, details?: string) =>
      showError(
        'Erro ao salvar',
        details ||
          `Não foi possível salvar ${entity.toLowerCase()}. Tente novamente.`,
      ),
    general: (details?: string) =>
      showError(
        'Erro',
        details ||
          'Ops! Algo deu errado. Por favor, tente novamente mais tarde.',
      ),
  }

  const warning = {
    validation: (message: string) =>
      showWarning(
        'Atenção',
        message ||
          'Campos marcados com * são obrigatórios. Por favor, preencha esses campos e tente novamente.',
      ),
    constraint: (message: string) => showWarning('Ação não permitida', message),
  }

  return {
    toast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    success,
    error,
    warning,
  }
}
