// Importar tipos e matchers do jest-dom
import '@testing-library/jest-dom'

// Importar tipos personalizados
import './types/jest.d.ts'

import { setupGlobalMocks } from './__tests__/setup/global-mocks'

// Configurar todos os mocks globais
setupGlobalMocks()
