# 🧪 Guia de Testes - Quaint Money Flow

Este guia explica como usar a estrutura de testes aprimorada da aplicação.

## 📁 Estrutura de Testes

```
__tests__/
├── setup/
│   ├── test-utils.tsx      # Utilitários e render customizado
│   └── global-mocks.ts     # Mocks globais organizados
├── components/             # Testes de componentes individuais
│   └── button.test.tsx     # Exemplo de teste de componente
├── integration/            # Testes de integração
│   └── financial-flow.integration.test.tsx
└── financial-dashboard.test.tsx  # Testes principais

e2e/                        # Testes End-to-End (Playwright)
└── financial-dashboard.spec.ts
```

## 🚀 Scripts Disponíveis

### Testes Unitários e de Integração (Jest)

```bash
# Executar todos os testes
pnpm test

# Executar testes em modo watch
pnpm test:watch

# Executar testes com cobertura
pnpm test:coverage

# Executar testes em modo UI (mais verboso)
pnpm test:ui

# Executar testes para CI (sem watch)
pnpm test:ci

# Executar apenas testes de integração
pnpm test:integration

# Executar apenas testes de componentes
pnpm test:components
```

### Testes E2E (Playwright)

```bash
# Instalar Playwright (primeira vez)
pnpm add -D @playwright/test
pnpm exec playwright install

# Executar testes E2E
pnpm test:e2e

# Executar testes E2E com interface visual
pnpm test:e2e:ui

# Executar testes E2E com navegador visível
pnpm test:e2e:headed

# Executar todos os tipos de teste
pnpm test:all
```

## 🛠️ Configuração

### Jest (jest.config.js)

- **Ambiente**: jsdom para simular o DOM
- **Setup**: `jest.setup.js` configura mocks globais
- **Cobertura**: 70% mínimo em todas as métricas
- **Relatórios**: text, lcov, html

### Playwright (playwright.config.ts)

- **Navegadores**: Chrome, Firefox, Safari, Edge
- **Dispositivos**: Desktop e Mobile
- **Servidor**: Inicia automaticamente o dev server
- **Relatórios**: HTML com screenshots e vídeos

## 📝 Como Escrever Testes

### 1. Testes de Componentes

```tsx
import { render, screen, fireEvent } from '../setup/test-utils'
import { MyComponent } from '@/components/my-component'

describe('MyComponent', () => {
  it('deve renderizar corretamente', () => {
    render(<MyComponent />)
    expect(screen.getByText('Texto esperado')).toBeInTheDocument()
  })

  it('deve responder a cliques', () => {
    const handleClick = jest.fn()
    render(<MyComponent onClick={handleClick} />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })
})
```

### 2. Testes de Hooks

```tsx
import { renderHook, act } from '@testing-library/react'
import { useMyHook } from '@/hooks/useMyHook'

describe('useMyHook', () => {
  it('deve retornar valor inicial', () => {
    const { result } = renderHook(() => useMyHook())
    expect(result.current.value).toBe('initial')
  })

  it('deve atualizar valor', () => {
    const { result } = renderHook(() => useMyHook())
    
    act(() => {
      result.current.setValue('new value')
    })
    
    expect(result.current.value).toBe('new value')
  })
})
```

### 3. Testes de Integração

```tsx
import { render, screen, fireEvent, waitFor } from '../setup/test-utils'

describe('Feature Integration', () => {
  it('deve completar fluxo completo', async () => {
    render(<App />)
    
    // Interagir com múltiplos componentes
    fireEvent.click(screen.getByText('Abrir Modal'))
    
    await waitFor(() => {
      expect(screen.getByText('Modal Aberto')).toBeInTheDocument()
    })
    
    // Verificar estado final
    expect(screen.getByText('Sucesso')).toBeInTheDocument()
  })
})
```

### 4. Testes E2E

```typescript
import { test, expect } from '@playwright/test'

test('deve completar fluxo do usuário', async ({ page }) => {
  await page.goto('/')
  
  await page.getByText('Botão').click()
  await expect(page.getByText('Resultado')).toBeVisible()
})
```

## 🎯 Melhores Práticas

### ✅ Faça

- Use `data-testid` para elementos difíceis de selecionar
- Teste comportamentos, não implementação
- Use `waitFor` para operações assíncronas
- Limpe mocks entre testes com `clearAllMocks()`
- Teste casos de erro e edge cases
- Mantenha testes simples e focados

### ❌ Evite

- Testar detalhes de implementação
- Testes muito acoplados à estrutura DOM
- Mocks desnecessários
- Testes que dependem de outros testes
- Timeouts fixos (use `waitFor`)

## 🔧 Utilitários Disponíveis

### test-utils.tsx

- `render()`: Render com providers automáticos
- `mockLocalStorage()`: Mock do localStorage
- `mockMatchMedia()`: Mock do matchMedia
- `mockResizeObserver()`: Mock do ResizeObserver
- `clearAllMocks()`: Limpa todos os mocks

### global-mocks.ts

- Mocks globais configurados automaticamente
- Funções para criar mocks específicos
- Configuração centralizada

## 📊 Cobertura de Testes

A configuração atual exige:

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

Para ver o relatório de cobertura:

```bash
pnpm test:coverage
# Abra coverage/lcov-report/index.html no navegador
```

## 🐛 Debugging

### Jest

```bash
# Debug com Node.js inspector
node --inspect-brk node_modules/.bin/jest --runInBand

# Debug específico
pnpm test -- --testNamePattern="nome do teste"
```

### Playwright

```bash
# Debug com interface visual
pnpm test:e2e:ui

# Debug com navegador visível
pnpm test:e2e:headed

# Debug específico
pnpm exec playwright test --debug financial-dashboard.spec.ts
```

## 📚 Recursos Adicionais

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Dica**: Execute `pnpm test:watch` durante o desenvolvimento para feedback imediato!