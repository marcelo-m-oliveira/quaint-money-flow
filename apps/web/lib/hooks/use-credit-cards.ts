'use client'

import { useEffect, useState } from 'react'

import { CreditCard, CreditCardFormData } from '../types'

const STORAGE_KEY = 'quaint-money-credit-cards'

export function useCreditCards() {
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Carregar cartões do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedCards = JSON.parse(stored)
        setCreditCards(
          parsedCards.map(
            (
              card: Omit<CreditCard, 'createdAt' | 'updatedAt'> & {
                createdAt: string
                updatedAt: string
              },
            ) => ({
              ...card,
              createdAt: new Date(card.createdAt),
              updatedAt: new Date(card.updatedAt),
            }),
          ),
        )
      }
    } catch (error) {
      console.error('Erro ao carregar cartões:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Salvar cartões no localStorage
  const saveCreditCards = (cards: CreditCard[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
      setCreditCards(cards)
    } catch (error) {
      console.error('Erro ao salvar cartões:', error)
    }
  }

  // Adicionar novo cartão
  const addCreditCard = (cardData: CreditCardFormData) => {
    const newCard: CreditCard = {
      id: crypto.randomUUID(),
      name: cardData.name,
      icon: cardData.icon,
      iconType: cardData.iconType,
      limit: parseFloat(
        cardData.limit.replace(/[^\d,.-]/g, '').replace(',', '.'),
      ),
      currentBalance: 0, // Saldo inicial sempre 0
      closingDay: cardData.closingDay,
      dueDay: cardData.dueDay,
      defaultPaymentAccountId: cardData.defaultPaymentAccountId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const updatedCards = [...creditCards, newCard]
    saveCreditCards(updatedCards)
  }

  // Atualizar cartão existente
  const updateCreditCard = (
    id: string,
    cardData: Partial<CreditCardFormData>,
  ) => {
    const updatedCards = creditCards.map((card) =>
      card.id === id
        ? {
            ...card,
            ...cardData,
            limit: cardData.limit
              ? parseFloat(
                  cardData.limit.replace(/[^\d,.-]/g, '').replace(',', '.'),
                )
              : card.limit,
            updatedAt: new Date(),
          }
        : card,
    )
    saveCreditCards(updatedCards)
  }

  // Remover cartão
  const deleteCreditCard = (id: string) => {
    const updatedCards = creditCards.filter((card) => card.id !== id)
    saveCreditCards(updatedCards)
  }

  // Obter cartão por ID
  const getCreditCardById = (id: string) => {
    return creditCards.find((card) => card.id === id)
  }

  // Atualizar saldo do cartão (para transações futuras)
  const updateCreditCardBalance = (id: string, newBalance: number) => {
    const updatedCards = creditCards.map((card) =>
      card.id === id
        ? {
            ...card,
            currentBalance: newBalance,
            updatedAt: new Date(),
          }
        : card,
    )
    saveCreditCards(updatedCards)
  }

  // Calcular limite disponível
  const getAvailableLimit = (id: string) => {
    const card = getCreditCardById(id)
    if (!card) return 0
    return card.limit - card.currentBalance
  }

  return {
    creditCards,
    isLoading,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    getCreditCardById,
    updateCreditCardBalance,
    getAvailableLimit,
  }
}
