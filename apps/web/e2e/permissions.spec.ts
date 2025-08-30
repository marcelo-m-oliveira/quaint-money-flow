import { test, expect } from '@playwright/test'

test.describe('Sistema de Permissões', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the signin page
    await page.goto('/signin')
  })

  test.describe('Usuário Free', () => {
    test('deve permitir acesso às funcionalidades básicas', async ({ page }) => {
      // Login como usuário free
      await page.fill('input[type="email"]', 'user@example.com')
      await page.fill('input[type="password"]', '@Password123')
      await page.click('button[type="submit"]')

      // Aguardar redirecionamento para dashboard
      await expect(page).toHaveURL('/')

      // Verificar se pode acessar lançamentos (ilimitados)
      await expect(page.locator('text=Lançamentos')).toBeVisible()

      // Verificar se pode acessar contas (limitado)
      await expect(page.locator('text=Contas')).toBeVisible()

      // Verificar se pode acessar categorias (limitado)
      await expect(page.locator('text=Categorias')).toBeVisible()

      // Verificar se pode acessar cartões de crédito (limitado)
      await expect(page.locator('text=Cartões')).toBeVisible()

      // Verificar se pode acessar relatórios básicos
      await expect(page.locator('text=Relatórios')).toBeVisible()

      // Não deve ver opções de admin
      await expect(page.locator('text=Admin')).not.toBeVisible()
      await expect(page.locator('text=Gerenciar Usuários')).not.toBeVisible()
      await expect(page.locator('text=Gerenciar Planos')).not.toBeVisible()
    })

    test('deve mostrar aviso de limite ao tentar criar muitas contas', async ({ page }) => {
      // Login como usuário free
      await page.fill('input[type="email"]', 'user@example.com')
      await page.fill('input[type="password"]', '@Password123')
      await page.click('button[type="submit"]')

      await expect(page).toHaveURL('/')

      // Navegar para configurações de contas
      await page.goto('/configuracoes')

      // Verificar se há aviso sobre limite de contas (plano free permite 1 conta)
      const limitWarning = page.locator('[data-testid="plan-limit-warning"]')
      
      // Se já há 1 conta, deve mostrar aviso de limite atingido
      if (await limitWarning.isVisible()) {
        await expect(limitWarning).toContainText('Limite')
        await expect(limitWarning).toContainText('conta')
      }

      // Tentar criar nova conta
      const createButton = page.locator('button:has-text("Nova Conta")')
      if (await createButton.isVisible()) {
        await createButton.click()

        // Deve mostrar modal com aviso de limite ou erro
        const modal = page.locator('[role="dialog"]')
        await expect(modal).toBeVisible()
        
        // Preencher dados da conta
        await page.fill('input[name="name"]', 'Conta Teste Limite')
        await page.selectOption('select[name="type"]', 'bank')
        
        // Tentar submeter
        await page.click('button[type="submit"]')
        
        // Deve mostrar erro sobre limite atingido
        await expect(page.locator('text=Limite')).toBeVisible()
      }
    })

    test('não deve ter acesso a relatórios avançados', async ({ page }) => {
      // Login como usuário free
      await page.fill('input[type="email"]', 'user@example.com')
      await page.fill('input[type="password"]', '@Password123')
      await page.click('button[type="submit"]')

      await expect(page).toHaveURL('/')

      // Navegar para relatórios
      await page.goto('/relatorios')

      // Verificar se há indicação de relatórios básicos apenas
      await expect(page.locator('text=Relatórios Básicos')).toBeVisible()
      
      // Não deve ver opções avançadas
      await expect(page.locator('text=Avançado')).not.toBeVisible()
      await expect(page.locator('text=Premium')).not.toBeVisible()

      // Ou deve ver aviso sobre upgrade
      const upgradeWarning = page.locator('text=Faça upgrade')
      if (await upgradeWarning.isVisible()) {
        await expect(upgradeWarning).toContainText('relatórios avançados')
      }
    })
  })

  test.describe('Usuário Admin', () => {
    test('deve ter acesso completo ao sistema', async ({ page }) => {
      // Login como admin
      await page.fill('input[type="email"]', 'admin@example.com')
      await page.fill('input[type="password"]', '@Password123')
      await page.click('button[type="submit"]')

      await expect(page).toHaveURL('/')

      // Verificar acesso a todas as funcionalidades
      await expect(page.locator('text=Lançamentos')).toBeVisible()
      await expect(page.locator('text=Contas')).toBeVisible()
      await expect(page.locator('text=Categorias')).toBeVisible()
      await expect(page.locator('text=Cartões')).toBeVisible()
      await expect(page.locator('text=Relatórios')).toBeVisible()

      // Deve ver opções de admin
      await expect(page.locator('text=Admin')).toBeVisible()
    })

    test('deve conseguir acessar área administrativa', async ({ page }) => {
      // Login como admin
      await page.fill('input[type="email"]', 'admin@example.com')
      await page.fill('input[type="password"]', '@Password123')
      await page.click('button[type="submit"]')

      await expect(page).toHaveURL('/')

      // Navegar para área admin (se existe na UI)
      if (await page.locator('text=Admin').isVisible()) {
        await page.click('text=Admin')
        
        // Verificar funcionalidades administrativas
        await expect(page.locator('text=Usuários')).toBeVisible()
        await expect(page.locator('text=Planos')).toBeVisible()
        await expect(page.locator('text=Cupons')).toBeVisible()
      }
    })

    test('deve ter acesso a relatórios avançados', async ({ page }) => {
      // Login como admin
      await page.fill('input[type="email"]', 'admin@example.com')
      await page.fill('input[type="password"]', '@Password123')
      await page.click('button[type="submit"]')

      await expect(page).toHaveURL('/')

      // Navegar para relatórios
      await page.goto('/relatorios')

      // Não deve ver avisos de limite ou upgrade
      await expect(page.locator('text=Faça upgrade')).not.toBeVisible()
      await expect(page.locator('text=Limite atingido')).not.toBeVisible()

      // Deve ter acesso a todas as funcionalidades de relatório
      const reportButtons = page.locator('button:has-text("Gerar")')
      const buttonCount = await reportButtons.count()
      expect(buttonCount).toBeGreaterThan(0)
    })

    test('não deve ter limites de criação', async ({ page }) => {
      // Login como admin
      await page.fill('input[type="email"]', 'admin@example.com')
      await page.fill('input[type="password"]', '@Password123')
      await page.click('button[type="submit"]')

      await expect(page).toHaveURL('/')

      // Verificar que não há avisos de limite
      await expect(page.locator('[data-testid="plan-limit-warning"]')).not.toBeVisible()

      // Navegar para configurações
      await page.goto('/configuracoes')

      // Não deve ver avisos de limite
      await expect(page.locator('text=Limite atingido')).not.toBeVisible()
      await expect(page.locator('text=Faça upgrade')).not.toBeVisible()
    })
  })

  test.describe('API Endpoints', () => {
    test('deve validar permissões na API - Planos (Admin apenas)', async ({ request }) => {
      // Tentar acessar endpoint de planos sem autenticação
      const unauthorizedResponse = await request.get('/api/v1/plans')
      expect(unauthorizedResponse.status()).toBe(401)

      // Login como usuário normal
      const userLoginResponse = await request.post('/api/v1/auth/signin', {
        data: {
          email: 'user@example.com',
          password: '@Password123'
        }
      })
      
      const userToken = (await userLoginResponse.json()).token

      // Tentar acessar planos como usuário normal
      const userPlanResponse = await request.get('/api/v1/plans', {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      })
      
      // Usuários podem ver planos disponíveis
      expect(userPlanResponse.status()).toBe(200)

      // Tentar criar plano como usuário normal (deve falhar)
      const createPlanResponse = await request.post('/api/v1/plans', {
        headers: {
          'Authorization': `Bearer ${userToken}`
        },
        data: {
          name: 'Plano Teste',
          type: 'monthly',
          price: 29.90,
          features: {}
        }
      })
      
      expect(createPlanResponse.status()).toBe(403)

      // Login como admin
      const adminLoginResponse = await request.post('/api/v1/auth/signin', {
        data: {
          email: 'admin@example.com',
          password: '@Password123'
        }
      })
      
      const adminToken = (await adminLoginResponse.json()).token

      // Admin deve conseguir criar plano
      const adminCreatePlanResponse = await request.post('/api/v1/plans', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        },
        data: {
          name: 'Plano Teste Admin',
          type: 'monthly',
          price: 39.90,
          features: {
            entries: { unlimited: true },
            categories: { unlimited: true },
            accounts: { unlimited: true },
            creditCards: { unlimited: true },
            reports: { advanced: true }
          }
        }
      })
      
      expect(adminCreatePlanResponse.status()).toBe(201)
    })

    test('deve validar limites de plano na criação de recursos', async ({ request }) => {
      // Login como usuário free
      const loginResponse = await request.post('/api/v1/auth/signin', {
        data: {
          email: 'user@example.com',
          password: '@Password123'
        }
      })
      
      const token = (await loginResponse.json()).token

      // Tentar criar múltiplas contas (plano free permite apenas 1)
      const createAccount1 = await request.post('/api/v1/accounts', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        data: {
          name: 'Conta 1',
          type: 'bank',
          icon: 'nubank',
          iconType: 'bank',
          includeInGeneralBalance: true
        }
      })

      // Primeira conta deve ser criada com sucesso (se ainda não existe)
      expect([200, 201, 400]).toContain(createAccount1.status()) // 400 se já existe

      // Tentar criar segunda conta (deve falhar por limite)
      const createAccount2 = await request.post('/api/v1/accounts', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        data: {
          name: 'Conta 2',
          type: 'bank',
          icon: 'inter',
          iconType: 'bank',
          includeInGeneralBalance: true
        }
      })

      // Deve falhar por limite do plano
      expect(createAccount2.status()).toBe(400)
      const errorResponse = await createAccount2.json()
      expect(errorResponse.message).toContain('Limite')
    })
  })
})

