// Mocks globais para todos os testes

// Mock do localStorage
const createLocalStorageMock = () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
})

// Mock do sessionStorage
const createSessionStorageMock = () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
})

// Mock do matchMedia
const createMatchMediaMock = () => {
  return jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }))
}

// Mock do ResizeObserver
const createResizeObserverMock = () => {
  return jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }))
}

// Mock do IntersectionObserver
const createIntersectionObserverMock = () => {
  return jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }))
}

// Mock do window.confirm
const createWindowConfirmMock = () => jest.fn(() => true)

// Mock do window.alert
const createWindowAlertMock = () => jest.fn()

// Mock do console para suprimir logs durante testes
const createConsoleMock = () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
})

// Função para configurar todos os mocks globais
export const setupGlobalMocks = () => {
  // Storage mocks
  Object.defineProperty(window, 'localStorage', {
    value: createLocalStorageMock(),
    writable: true,
  })

  Object.defineProperty(window, 'sessionStorage', {
    value: createSessionStorageMock(),
    writable: true,
  })

  // Media query mock
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: createMatchMediaMock(),
  })

  // Observer mocks
  global.ResizeObserver = createResizeObserverMock()
  global.IntersectionObserver = createIntersectionObserverMock()

  // Window methods mocks
  Object.defineProperty(window, 'confirm', {
    value: createWindowConfirmMock(),
    writable: true,
  })

  Object.defineProperty(window, 'alert', {
    value: createWindowAlertMock(),
    writable: true,
  })

  // Suprimir console logs durante testes (opcional)
  // global.console = createConsoleMock() as any
}

// Função para limpar todos os mocks
export const clearGlobalMocks = () => {
  jest.clearAllMocks()
}

// Exportar mocks individuais para uso específico
export {
  createLocalStorageMock,
  createSessionStorageMock,
  createMatchMediaMock,
  createResizeObserverMock,
  createIntersectionObserverMock,
  createWindowConfirmMock,
  createWindowAlertMock,
  createConsoleMock,
}