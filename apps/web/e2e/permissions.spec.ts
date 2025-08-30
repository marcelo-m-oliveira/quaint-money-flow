import { test, expect } from '@playwright/test'

/**
 * Testes de Permissões - Padrão MCP Context7
 * 
 * Este arquivo testa o sistema de permissões baseado em CASL
 * seguindo o padrão MCP Context7 para estrutura de testes.
 */

// Configuração MCP Context7 - Setup global para os testes
test.describe('Sistema de Permissões', () => {
  
  // Context 1: Preparação e autenticação
  test.beforeEach(async ({ page }) => {
    // Ir para página de login
    await page.goto('/signin')
    
    // Aguardar carregamento da página
    await expect(page).toHaveTitle(/Quaint Money/)
  })

  // Context 2: Testes de Usuário Básico
  test.describe('Usuário Básico (USER)', () => {
    
    test.beforeEach(async ({ page }) => {
      // Login com usuário básico (usar dados do seed)
      await page.fill('[data-testid="email-input"]', 'user@test.com')
      await page.fill('[data-testid="password-input"]', 'password123')
      await page.click('[data-testid="login-button"]')
      
      // Verificar redirecionamento para dashboard
      await expect(page).toHaveURL('/')
    })

    test('deve permitir criar conta dentro do limite', async ({ page }) => {
      // Context 3: Navegação para contas
      await page.click('[data-testid="nav-accounts"]')
      
      // Context 4: Verificar limites
      await expect(page.locator('[data-testid="plan-limits-accounts"]')).toBeVisible()
      
      // Context 5: Criar conta
      await page.click('[data-testid="create-account-button"]')
      await page.fill('[data-testid="account-name-input"]', 'Conta Teste')
      await page.selectOption('[data-testid="account-type-select"]', 'bank')
      
      // Context 6: Verificar botão habilitado
      const submitButton = page.locator('[data-testid="submit-account-button"]')
      await expect(submitButton).toBeEnabled()
      
      // Context 7: Submeter formulário
      await submitButton.click()
      await expect(page.locator('[data-testid="account-item-conta-teste"]')).toBeVisible()
    })

    test('deve bloquear criação de conta se limite atingido', async ({ page }) => {
      // Context 3: Simular limite atingido (criar 5 contas)
      for (let i = 1; i <= 5; i++) {
        await page.goto('/configuracoes/contas')
        await page.click('[data-testid="create-account-button"]')
        await page.fill('[data-testid="account-name-input"]', `Conta ${i}`)
        await page.selectOption('[data-testid="account-type-select"]', 'bank')
        await page.click('[data-testid="submit-account-button"]')
      }
      
      // Context 4-7: Tentar criar sexta conta
      await page.click('[data-testid="create-account-button"]')
      await page.fill('[data-testid="account-name-input"]', 'Conta Limite Excedido')
      
      const submitButton = page.locator('[data-testid="submit-account-button"]')
      await expect(submitButton).toBeDisabled()
      await expect(page.locator('[data-testid="limits-warning"]')).toBeVisible()
    })

    test('não deve acessar página de administração', async ({ page }) => {
      // Context 3-7: Tentar acessar admin
      await page.goto('/configuracoes/admin')
      await expect(page.locator('[data-testid="access-denied"]')).toBeVisible()
      await expect(page.locator('h1')).toContainText('Acesso Negado')
    })
  })

  // Context 2: Testes de Usuário Premium
  test.describe('Usuário Premium (PREMIUM)', () => {
    
    test.beforeEach(async ({ page }) => {
      // Login com usuário premium
      await page.fill('[data-testid="email-input"]', 'premium@test.com')
      await page.fill('[data-testid="password-input"]', 'password123')
      await page.click('[data-testid="login-button"]')
      await expect(page).toHaveURL('/')
    })

    test('deve ter acesso a funcionalidades premium', async ({ page }) => {
      // Context 3: Verificar badge premium
      await expect(page.locator('[data-testid="user-role-badge"]')).toContainText('Premium')
      
      // Context 4: Verificar recursos ilimitados
      await page.goto('/configuracoes/contas')
      const limitsIndicator = page.locator('[data-testid="plan-limits-accounts"]')
      await expect(limitsIndicator).toContainText('Ilimitado')
      
      // Context 5-7: Verificar acesso a relatórios avançados
      await page.goto('/relatorios')
      await expect(page.locator('[data-testid="advanced-reports-section"]')).toBeVisible()
    })

    test('não deve acessar funcionalidades de admin', async ({ page }) => {
      // Context 3-7: Verificar sem acesso a admin
      await page.goto('/configuracoes/admin')
      await expect(page.locator('[data-testid="access-denied"]')).toBeVisible()
    })
  })

  // Context 2: Testes de Administrador
  test.describe('Administrador (ADMIN)', () => {
    
    test.beforeEach(async ({ page }) => {
      // Login com usuário admin
      await page.fill('[data-testid="email-input"]', 'admin@test.com')
      await page.fill('[data-testid="password-input"]', 'password123')
      await page.click('[data-testid="login-button"]')
      await expect(page).toHaveURL('/')
    })

    test('deve ter acesso total ao sistema', async ({ page }) => {
      // Context 3: Verificar badge admin
      await expect(page.locator('[data-testid="user-role-badge"]')).toContainText('Administrador')
      
      // Context 4: Acessar página de admin
      await page.goto('/configuracoes/admin')
      await expect(page.locator('h1')).toContainText('Administração')
      
      // Context 5: Verificar lista de usuários
      await expect(page.locator('[data-testid="users-table"]')).toBeVisible()
      
      // Context 6: Verificar capacidade de alterar roles
      const firstUserRoleSelect = page.locator('[data-testid="user-role-select"]').first()
      await expect(firstUserRoleSelect).toBeVisible()
      
      // Context 7: Teste de alteração de role
      await firstUserRoleSelect.click()
      await expect(page.locator('[data-testid="role-option-premium"]')).toBeVisible()
    })

    test('deve conseguir alterar papel de outros usuários', async ({ page }) => {
      // Context 3-4: Navegar para admin e encontrar usuário
      await page.goto('/configuracoes/admin')
      
      // Context 5: Buscar usuário específico
      await page.fill('[data-testid="user-search-input"]', 'user@test.com')
      await page.click('[data-testid="search-button"]')
      
      // Context 6: Alterar papel
      const userRow = page.locator('[data-testid="user-row-user@test.com"]')
      await expect(userRow).toBeVisible()
      
      const roleSelect = userRow.locator('[data-testid="user-role-select"]')
      await roleSelect.click()
      await page.click('[data-testid="role-option-premium"]')
      
      // Context 7: Verificar mudança
      await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
      await expect(userRow.locator('[data-testid="role-badge"]')).toContainText('Premium')
    })
  })

  // Context 2: Testes de Componentes de Permissão
  test.describe('Componentes de Permissão', () => {
    
    test.beforeEach(async ({ page }) => {
      // Login com usuário básico para testar restrições
      await page.fill('[data-testid="email-input"]', 'user@test.com')
      await page.fill('[data-testid="password-input"]', 'password123')
      await page.click('[data-testid="login-button"]')
      await expect(page).toHaveURL('/')
    })

    test('componente Can deve esconder conteúdo sem permissão', async ({ page }) => {
      // Context 3-4: Navegar para página restrita
      await page.goto('/configuracoes')
      
      // Context 5: Verificar que componentes administrativos estão ocultos
      await expect(page.locator('[data-testid="admin-settings-section"]')).not.toBeVisible()
      
      // Context 6-7: Verificar componentes permitidos visíveis
      await expect(page.locator('[data-testid="user-settings-section"]')).toBeVisible()
    })

    test('indicador de limites deve mostrar progresso correto', async ({ page }) => {
      // Context 3-4: Navegar para contas
      await page.goto('/configuracoes/contas')
      
      // Context 5: Verificar indicador de limites
      const limitsCard = page.locator('[data-testid="plan-limits-accounts"]')
      await expect(limitsCard).toBeVisible()
      
      // Context 6: Verificar informações de limite
      await expect(limitsCard.locator('[data-testid="limit-current"]')).toBeVisible()
      await expect(limitsCard.locator('[data-testid="limit-max"]')).toBeVisible()
      
      // Context 7: Verificar barra de progresso
      await expect(limitsCard.locator('[data-testid="limit-progress"]')).toBeVisible()
    })
  })

  // Context 2: Testes de Integração de API
  test.describe('Integração com API de Permissões', () => {
    
    test.beforeEach(async ({ page }) => {
      await page.fill('[data-testid="email-input"]', 'admin@test.com')
      await page.fill('[data-testid="password-input"]', 'password123')
      await page.click('[data-testid="login-button"]')
      await expect(page).toHaveURL('/')
    })

    test('deve carregar habilidades do usuário corretamente', async ({ page }) => {
      // Context 3: Interceptar chamada de API
      await page.route('/api/v1/permissions/my-abilities', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            role: 'ADMIN',
            planId: null,
            abilities: {
              'create:Account': true,
              'read:Account': true,
              'update:Account': true,
              'delete:Account': true,
              'manage:User': true,
            },
            limits: null,
          }),
        })
      })
      
      // Context 4-7: Verificar carregamento e exibição das permissões
      await page.reload()
      await expect(page.locator('[data-testid="user-role-badge"]')).toContainText('Administrador')
    })

    test('deve lidar com erro de API graciosamente', async ({ page }) => {
      // Context 3: Simular erro de API
      await page.route('/api/v1/permissions/my-abilities', async route => {
        await route.fulfill({ status: 500 })
      })
      
      // Context 4-7: Verificar fallback
      await page.reload()
      await expect(page.locator('[data-testid="permissions-error-fallback"]')).toBeVisible()
    })
  })
})