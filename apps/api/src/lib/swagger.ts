// Import dinâmico para compatibilidade ESM/CJS
import { FastifyInstance } from 'fastify'
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes'

export async function setupSwagger(app: FastifyInstance) {
  const { env } = await import('@saas/env')
  if (!env.SWAGGER_ENABLED) {
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  await app.register(require('@fastify/swagger'), {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Quaint Money Flow API',
        description: `
## 📊 API para Gerenciamento Financeiro Pessoal

### 🔐 Autenticação (JWT + OAuth2 Google)
- Autorização via \`Authorization: Bearer <accessToken>\`.
- Obtenha tokens via:
  - \`POST /auth/login\` (email/senha)
  - \`GET /auth/google/callback?code=...\` (Google OAuth2)
  - \`POST /auth/refresh\` (renova accessToken com refreshToken)
  - \`POST /auth/logout\` (revoga refreshToken)

### 📋 Endpoints Organizados por Funcionalidade

- **📈 Relatórios**: Análises financeiras detalhadas (fluxo de caixa, categorias, contas)
- **💰 Transações**: CRUD completo de entradas e saídas
- **🏦 Contas**: Gerenciamento de contas bancárias
- **💳 Cartões**: Gerenciamento de cartões de crédito
- **📂 Categorias**: Organização de transações por categoria
- **⚙️ Configurações**: Preferências do usuário
- **📊 Visão Geral**: Dashboard e resumos

### 🚀 Como Testar

1. **Obtenha um token**: \`POST /auth/login\` com email/senha de um usuário seed.
2. **Autorize-se**: Clique em "Authorize" e informe o accessToken.
3. **Execute**: Use os endpoints protegidos normalmente.

### 📝 Exemplos de Uso

- **Login**: POST /auth/login
- **Refresh**: POST /auth/refresh
- **Logout**: POST /auth/logout
- **Google OAuth**: GET /auth/google/callback
        `,
        version: '1.0.0',
        contact: {
          name: 'Quaint Money Flow',
          email: 'support@quaintmoneyflow.com',
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT',
        },
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
          description: 'Servidor de Desenvolvimento',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description:
              'Token de autenticação Bearer via JWT (obtenha em /auth/login ou /auth/google/callback).',
          },
        },
        schemas: {
          Error: {
            type: 'object',
            properties: {
              error: {
                type: 'string',
                description: 'Mensagem de erro',
              },
            },
          },
          UnauthorizedError: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: 'Mensagem de erro de autenticação',
                example: 'Token de acesso inválido ou expirado',
              },
            },
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
      tags: [
        {
          name: '📈 Relatórios',
          description:
            'Endpoints para geração de relatórios financeiros detalhados',
        },
        {
          name: '💰 Transações',
          description:
            'Gerenciamento completo de entradas e saídas financeiras',
        },
        {
          name: '🏦 Contas',
          description: 'Operações relacionadas a contas bancárias',
        },
        {
          name: '💳 Cartões',
          description: 'Gerenciamento de cartões de crédito',
        },
        {
          name: '📂 Categorias',
          description:
            'Organização de transações por categorias e subcategorias',
        },
        {
          name: '⚙️ Configurações',
          description: 'Preferências e configurações do usuário',
        },
        {
          name: '📊 Visão Geral',
          description: 'Dashboard e resumos financeiros',
        },
        {
          name: '🔐 Autenticação',
          description: 'Login por email/senha, Google OAuth2, refresh e logout',
        },
      ],
    },
  })

  // Configuração do tema escuro usando swagger-themes
  const theme = new SwaggerTheme()
  const darkThemeContent = theme.getBuffer(SwaggerThemeNameEnum.DARK)

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  await app.register(require('@fastify/swagger-ui'), {
    routePrefix: env.SWAGGER_PATH,
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      filter: true,
      tryItOutEnabled: true,
      requestSnippetsEnabled: true,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai',
      },
      displayRequestDuration: true,
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      displayOperationId: false,
      showExtensions: true,
      showCommonExtensions: true,
      supportedSubmitMethods: ['get', 'post', 'put', 'patch', 'delete'],
    },
    theme: {
      css: [
        {
          filename: 'dark-theme.css',
          content: darkThemeContent,
        },
      ],
    },
    staticCSP: true,
    transformStaticCSP: (header: string) => header,
    exposeRoute: true,
  })

  console.log(
    `📚 Swagger documentation available at: http://localhost:${env.PORT}${env.SWAGGER_PATH}`,
  )
}
