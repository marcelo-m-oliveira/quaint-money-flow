import { env } from '@saas/env'
import { FastifyInstance } from 'fastify'
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes'

export async function setupSwagger(app: FastifyInstance) {
  if (!env.SWAGGER_ENABLED) {
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  await app.register(require('@fastify/swagger'), {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Quaint Money Flow API',
        description: 'API para gerenciamento financeiro pessoal',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
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
      deepLinking: false,
      filter: true, // Habilita filtro de busca
      tryItOutEnabled: true, // Habilita "Try it out" por padrão
      requestSnippetsEnabled: true, // Habilita snippets de código
      syntaxHighlight: {
        activate: true,
        theme: 'monokai', // Tema de syntax highlighting
      },
    },
    // Tema escuro profissional usando swagger-themes
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
