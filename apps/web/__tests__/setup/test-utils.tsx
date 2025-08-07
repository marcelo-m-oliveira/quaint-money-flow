import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { ThemeProvider } from 'next-themes'

// Wrapper personalizado para testes que precisam de providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {children}
    </ThemeProvider>
  )
}

// Função customizada de render que inclui providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-exporta tudo do testing-library
export * from '@testing-library/react'

// Sobrescreve o render com nossa versão customizada
export { customRender as render }

// Utilitário para contornar problemas de tipos do jest-dom
export const expectToBeInTheDocument = (element: HTMLElement | null) => {
  return (expect(element) as any).toBeInTheDocument()
}

export const expectToHaveClass = (element: HTMLElement | null, className: string) => {
  return (expect(element) as any).toHaveClass(className)
}

export const expectToHaveTextContent = (element: HTMLElement | null, text: string | RegExp) => {
  return (expect(element) as any).toHaveTextContent(text)
}

// Utilitários de teste comuns
export const mockLocalStorage = () => {
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  }

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  })

  return localStorageMock
}

export const mockMatchMedia = () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

export const mockResizeObserver = () => {
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }))
}

// Mock para window.confirm
export const mockWindowConfirm = (returnValue = true) => {
  Object.defineProperty(window, 'confirm', {
    value: jest.fn(() => returnValue),
    writable: true,
  })
}

// Função para limpar todos os mocks
export const clearAllMocks = () => {
  jest.clearAllMocks()
}