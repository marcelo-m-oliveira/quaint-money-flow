'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// Tipos específicos para este hook (diferentes dos tipos gerais)
interface UseInfiniteScrollOptions {
  initialItems?: number
  itemsPerLoad?: number
  loadDelay?: number
  backToTopThreshold?: number
}

interface UseInfiniteScrollReturn {
  visibleItems: number
  isLoadingMore: boolean
  showBackToTop: boolean
  scrollContainerRef: React.RefObject<HTMLDivElement>
  scrollToTop: () => void
  resetItems: () => void
}

/**
 * Hook customizado para implementar scroll infinito com funcionalidades avançadas
 * - Carregamento progressivo de itens
 * - Botão "Voltar ao Topo" inteligente
 * - Otimização de performance com remoção de itens ao rolar para cima
 */
export function useInfiniteScroll(
  totalItems: number,
  options: UseInfiniteScrollOptions = {},
): UseInfiniteScrollReturn {
  const {
    initialItems = 30,
    itemsPerLoad = 30,
    loadDelay = 500,
    backToTopThreshold = 30,
  } = options

  const [visibleItems, setVisibleItems] = useState(initialItems)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const lastScrollTop = useRef(0)

  // Função para voltar ao topo
  const scrollToTop = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    container.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
    setShowBackToTop(false)
  }, [])

  // Reset dos itens visíveis
  const resetItems = useCallback(() => {
    setVisibleItems(initialItems)
    setShowBackToTop(false)
  }, [initialItems])

  // Hook para detectar scroll
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const scrollDirection = scrollTop > lastScrollTop.current ? 'down' : 'up'
    lastScrollTop.current = scrollTop

    // Calcular quantos itens restam para o final
    const itemsFromEnd = totalItems - visibleItems

    // Mostrar botão "Voltar ao Topo" quando estiver próximo do final
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 200
    const hasReachedEnd = visibleItems >= totalItems
    setShowBackToTop(
      isNearBottom && hasReachedEnd && totalItems > backToTopThreshold,
    )

    // Scroll para baixo - carregar mais itens quando restarem cerca de 3 itens
    if (
      scrollDirection === 'down' &&
      (scrollTop + clientHeight >= scrollHeight - 150 || itemsFromEnd <= 3)
    ) {
      if (!isLoadingMore && visibleItems < totalItems) {
        setIsLoadingMore(true)
        setTimeout(() => {
          setVisibleItems((prev) => Math.min(prev + itemsPerLoad, totalItems))
          setIsLoadingMore(false)
        }, loadDelay)
      }
    }

    // Scroll para cima - remover itens se necessário
    if (
      scrollDirection === 'up' &&
      scrollTop < 200 &&
      visibleItems > initialItems
    ) {
      setVisibleItems((prev) => Math.max(prev - itemsPerLoad, initialItems))
      setShowBackToTop(false)
    }
  }, [
    visibleItems,
    isLoadingMore,
    totalItems,
    itemsPerLoad,
    loadDelay,
    initialItems,
    backToTopThreshold,
  ])

  // Adicionar listener de scroll
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return {
    visibleItems,
    isLoadingMore,
    showBackToTop,
    scrollContainerRef,
    scrollToTop,
    resetItems,
  }
}
