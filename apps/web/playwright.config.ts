import { defineConfig, devices } from '@playwright/test'
import { env } from '@saas/env'

/**
 * Configuração do Playwright para testes E2E
 * Para usar, instale: pnpm add -D @playwright/test
 * Execute: pnpm exec playwright install
 */
export default defineConfig({
  testDir: './e2e',
  /* Executar testes em paralelo */
  fullyParallel: true,
  /* Falhar o build se você deixar test.only no código */
  forbidOnly: !!env.CI,
  /* Retry nos testes apenas no CI */
  retries: env.CI ? 2 : 0,
  /* Opt out do paralelismo no CI */
  workers: env.CI ? 1 : undefined,
  /* Reporter para usar */
  reporter: 'html',
  /* Configurações compartilhadas para todos os projetos */
  use: {
    /* URL base para usar em ações como `await page.goto('/')` */
    baseURL: 'http://localhost:3000',

    /* Coletar trace quando retry de um teste falha */
    trace: 'on-first-retry',

    /* Screenshot apenas quando falha */
    screenshot: 'only-on-failure',

    /* Vídeo apenas quando falha */
    video: 'retain-on-failure',
  },

  /* Configurar projetos para principais navegadores */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Testes em dispositivos móveis */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Testes em navegadores com marca Microsoft Edge */
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],

  /* Executar servidor de desenvolvimento local antes de iniciar os testes */
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !env.CI,
    timeout: 120 * 1000,
  },
})
