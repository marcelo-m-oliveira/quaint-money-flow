'use client'

import React, { createContext, useCallback, useContext, useState } from 'react'

import { useCrudToast } from '../hooks/use-crud-toast'
import { CreditCardFormSchema } from '../schemas'
import { creditCardsService } from '../services/credit-cards'
import { CreditCard } from '../types'

interface CreditCardsContextType {
  creditCards: CreditCard[]
  isLoading: boolean
  isInitialized: boolean
  addCreditCard: (cardData: CreditCardFormSchema) => Promise<CreditCard>
  updateCreditCard: (
    id: string,
    cardData: Partial<CreditCardFormSchema>,
  ) => Promise<void>
  deleteCreditCard: (id: string) => Promise<void>
  getCreditCardById: (id: string) => CreditCard | undefined
  refetch: () => Promise<void>
  initialize: () => Promise<void>
  getAvailableLimit: (id: string) => number
}

const CreditCardsContext = createContext<CreditCardsContextType | undefined>(
  undefined,
)

export function CreditCardsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const { success, error } = useCrudToast()

  // Carregar cartões da API
  const loadCreditCards = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await creditCardsService.getAll()
      const creditCardsWithDates = response.data.map((card) => ({
        ...card,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
      }))
      setCreditCards(creditCardsWithDates)
      setIsInitialized(true)
    } catch (err) {
      console.error('Erro ao carregar cartões de crédito:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Inicializar cartões apenas quando necessário
  const initialize = useCallback(async () => {
    if (!isInitialized && !isLoading) {
      await loadCreditCards()
    }
  }, [isInitialized, isLoading, loadCreditCards])

  // Adicionar novo cartão
  const addCreditCard = async (
    cardData: CreditCardFormSchema,
  ): Promise<CreditCard> => {
    try {
      const newCard = await creditCardsService.create(cardData)
      const cardWithDates = {
        ...newCard,
        createdAt: newCard.createdAt,
        updatedAt: newCard.updatedAt,
      }
      setCreditCards((prev) => [...prev, cardWithDates])
      success.create('Cartão de Crédito')
      return cardWithDates
    } catch (err) {
      console.error('Erro ao criar cartão de crédito:', err)
      error.create('cartão de crédito')
      throw err
    }
  }

  // Atualizar cartão existente
  const updateCreditCard = async (
    id: string,
    cardData: Partial<CreditCardFormSchema>,
  ) => {
    try {
      const updatedCard = await creditCardsService.update(id, cardData)
      const cardWithDates = {
        ...updatedCard,
        createdAt: updatedCard.createdAt,
        updatedAt: updatedCard.updatedAt,
      }
      setCreditCards((prev) =>
        prev.map((card) => (card.id === id ? cardWithDates : card)),
      )
      success.update('Cartão de Crédito')
    } catch (err) {
      error.update('cartão de crédito')
      throw err
    }
  }

  // Remover cartão
  const deleteCreditCard = async (id: string) => {
    try {
      await creditCardsService.delete(id)
      setCreditCards((prev) => prev.filter((card) => card.id !== id))
      success.delete('Cartão de Crédito')
    } catch (err) {
      error.delete('cartão de crédito')
      throw err
    }
  }

  // Obter cartão por ID
  const getCreditCardById = (id: string) => {
    return creditCards.find((card) => card.id === id)
  }

  // Calcular limite disponível
  const getAvailableLimit = (id: string) => {
    const card = getCreditCardById(id)
    if (!card) return 0
    return card.limit - card.usage
  }

  const value: CreditCardsContextType = {
    creditCards,
    isLoading,
    isInitialized,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    getCreditCardById,
    refetch: loadCreditCards,
    initialize,
    getAvailableLimit,
  }

  return (
    <CreditCardsContext.Provider value={value}>
      {children}
    </CreditCardsContext.Provider>
  )
}

export function useCreditCards() {
  const context = useContext(CreditCardsContext)
  if (context === undefined) {
    throw new Error('useCreditCards must be used within a CreditCardsProvider')
  }
  return context
}
