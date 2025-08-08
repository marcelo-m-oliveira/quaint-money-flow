import { env } from '@saas/env'
import { FastifyInstance } from 'fastify'

export async function setupSwagger(app: FastifyInstance) {
  if (!env.SWAGGER_ENABLED) {
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  await app.register(require('@fastify/swagger'), {
    swagger: {
      info: {
        title: 'Quaint Money Flow API',
        description: 'API para gerenciamento financeiro pessoal',
        version: '1.0.0',
        contact: {
          name: 'Quaint Money Team',
          email: 'support@quaintmoney.com',
        },
      },
      host: `localhost:${env.PORT}`,
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [
        { name: 'Auth', description: 'Autenticação e autorização' },
        { name: 'Users', description: 'Gerenciamento de usuários' },
        { name: 'Accounts', description: 'Gerenciamento de contas' },
        {
          name: 'Credit Cards',
          description: 'Gerenciamento de cartões de crédito',
        },
        { name: 'Categories', description: 'Gerenciamento de categorias' },
        { name: 'Transactions', description: 'Gerenciamento de transações' },
        { name: 'Preferences', description: 'Preferências do usuário' },
      ],
      securityDefinitions: {
        Bearer: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
          description: 'JWT token. Formato: Bearer {token}',
        },
      },
      security: [
        {
          Bearer: [],
        },
      ],
    },
  })

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  await app.register(require('@fastify/swagger-ui'), {
    routePrefix: env.SWAGGER_PATH,
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header: string) => header,
  })

  console.log(
    `📚 Swagger documentation available at: http://localhost:${env.PORT}${env.SWAGGER_PATH}`,
  )
}
