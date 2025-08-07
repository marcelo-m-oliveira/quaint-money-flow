import { test, expect } from '@playwright/test'

/**
 * Testes E2E para o Dashboard Financeiro
 * 
 * Para executar estes testes:
 * 1. Instale o Playwright: pnpm add -D @playwright/test
 * 2. Instale os navegadores: pnpm exec playwright install
 * 3. Execute os testes: pnpm exec playwright test
 * 
 * Para executar em modo interativo: pnpm exec playwright test --ui
 */

test.describe('Financial Dashboard E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para a página do dashboard
    await page.goto('/')
    
    // Aguardar o carregamento da página
    await page.waitForLoadState('networkidle')
  })

  test('deve carregar o dashboard corretamente', async ({ page }) => {
    // Verificar se os elementos principais estão visíveis
    await expect(page.getByText('Marcelo Oliveira!')).toBeVisible()
    await expect(page.getByText('Receitas no mês atual')).toBeVisible()
    await expect(page.getByText('Despesas no mês atual')).toBeVisible()
    await expect(page.getByText('Acesso rápido')).toBeVisible()
    
    // Verificar se os botões de ação estão presentes
    await expect(page.getByText('NOVA DESPESA')).toBeVisible()
    await expect(page.getByText('NOVA RECEITA')).toBeVisible()
  })

  test('deve abrir modal de nova despesa', async ({ page }) => {
    // Clicar no botão de nova despesa
    await page.getByText('NOVA DESPESA').click()
    
    // Verificar se o modal foi aberto
    await expect(page.getByText('Nova despesa')).toBeVisible()
    
    // Verificar se é possível fechar o modal (assumindo que há um botão X ou ESC)
    await page.keyboard.press('Escape')
    await expect(page.getByText('Nova despesa')).not.toBeVisible()
  })

  test('deve abrir modal de nova receita', async ({ page }) => {
    // Clicar no botão de nova receita
    await page.getByText('NOVA RECEITA').click()
    
    // Verificar se o modal foi aberto
    await expect(page.getByText('Nova receita')).toBeVisible()
    
    // Verificar se é possível fechar o modal
    await page.keyboard.press('Escape')
    await expect(page.getByText('Nova receita')).not.toBeVisible()
  })

  test('deve ser responsivo em dispositivos móveis', async ({ page }) => {
    // Simular viewport mobile
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Verificar se os elementos principais ainda estão visíveis
    await expect(page.getByText('Marcelo Oliveira!')).toBeVisible()
    await expect(page.getByText('NOVA DESPESA')).toBeVisible()
    await expect(page.getByText('NOVA RECEITA')).toBeVisible()
    
    // Verificar se o layout se adapta ao mobile
    const container = page.locator('[data-testid="dashboard-container"]')
    if (await container.isVisible()) {
      await expect(container).toHaveCSS('flex-direction', 'column')
    }
  })

  test('deve alternar tema corretamente', async ({ page }) => {
    // Assumindo que existe um botão de alternância de tema
    const themeToggle = page.getByRole('button', { name: /tema|theme/i })
    
    if (await themeToggle.isVisible()) {
      // Verificar tema inicial (assumindo dark)
      await expect(page.locator('html')).toHaveClass(/dark/)
      
      // Alternar tema
      await themeToggle.click()
      
      // Verificar se mudou para light
      await expect(page.locator('html')).toHaveClass(/light/)
      
      // Alternar de volta
      await themeToggle.click()
      
      // Verificar se voltou para dark
      await expect(page.locator('html')).toHaveClass(/dark/)
    }
  })

  test('deve persistir dados entre recarregamentos', async ({ page }) => {
    // Este teste seria implementado quando houver funcionalidade de adicionar transações
    /*
    // Adicionar uma transação
    await page.getByText('NOVA DESPESA').click()
    await page.fill('[data-testid="description-input"]', 'Teste E2E')
    await page.fill('[data-testid="amount-input"]', '50.00')
    await page.selectOption('[data-testid="category-select"]', 'food')
    await page.getByText('Salvar').click()
    
    // Verificar se a transação foi adicionada
    await expect(page.getByText('Teste E2E')).toBeVisible()
    
    // Recarregar a página
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Verificar se a transação ainda está lá
    await expect(page.getByText('Teste E2E')).toBeVisible()
    */
  })

  test('deve ter boa performance', async ({ page }) => {
    // Medir métricas de performance
    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // Verificar se carregou em menos de 3 segundos
    expect(loadTime).toBeLessThan(3000)
    
    // Verificar se não há erros no console
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    // Interagir com a página
    await page.getByText('NOVA DESPESA').click()
    await page.keyboard.press('Escape')
    
    // Verificar se não houve erros
    expect(consoleErrors).toHaveLength(0)
  })

  test('deve ser acessível', async ({ page }) => {
    // Verificar se elementos importantes têm labels apropriados
    const newExpenseButton = page.getByText('NOVA DESPESA')
    await expect(newExpenseButton).toBeVisible()
    
    // Verificar navegação por teclado
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Verificar se o foco está visível
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
    
    // Verificar contraste de cores (seria necessário uma biblioteca específica)
    // Verificar se textos têm contraste adequado
    const mainHeading = page.getByText('Marcelo Oliveira!')
    await expect(mainHeading).toBeVisible()
  })
})