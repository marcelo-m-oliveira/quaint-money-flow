import { execSync } from 'node:child_process'

import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import { env } from '@saas/env'
import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { accountRoutes } from '@/http/routes/accounts'
import { categoryRoutes } from '@/http/routes/categories'
import { creditCardRoutes } from '@/http/routes/credit-cards'
import { entryRoutes } from '@/http/routes/entries'
import { userPreferencesRoutes } from '@/http/routes/user-preferences'
import { setupSwagger } from '@/lib/swagger'
import { errorHandler } from '@/utils/errors'

// Configuração do logger e encoding UTF-8 no Windows
const isWindows = process.platform === 'win32'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Força UTF-8 no console do Windows para exibir acentuação corretamente
if (isWindows) {
  try {
    execSync('chcp 65001 > nul', { stdio: 'ignore' })
  } catch {
    // ignore
  }
}

const loggerConfig = isDevelopment
  ? {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
          messageFormat: '[API] {msg}',
          levelFirst: true,
          singleLine: false,
          sync: true,
          crlf: isWindows,
        },
      },
    }
  : {
      level: 'info',
    }

export async function createApp() {
  const app = fastify({
    logger: loggerConfig,
  }).withTypeProvider<ZodTypeProvider>()

  app.setSerializerCompiler(serializerCompiler)
  app.setValidatorCompiler(validatorCompiler)

  app.setErrorHandler(errorHandler)

  await setupSwagger(app)

  app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
  })

  app.register(fastifyCors)

  // Registrar rotas com prefixo
  app.register(accountRoutes, {
    prefix: `${env.API_PREFIX}/${env.API_VERSION}`,
  })

  app.register(categoryRoutes, {
    prefix: `${env.API_PREFIX}/${env.API_VERSION}`,
  })

  app.register(creditCardRoutes, {
    prefix: `${env.API_PREFIX}/${env.API_VERSION}`,
  })

  app.register(entryRoutes, {
    prefix: `${env.API_PREFIX}/${env.API_VERSION}`,
  })

  app.register(userPreferencesRoutes, {
    prefix: `${env.API_PREFIX}/${env.API_VERSION}`,
  })

  return app
}

if (require.main === module) {
  createApp().then((app) => {
    app.listen({ port: env.PORT, host: '0.0.0.0' }).then(() => {
      app.log.info(
        {
          port: env.PORT,
          host: '0.0.0.0',
          environment: process.env.NODE_ENV || 'development',
          apiVersion: env.API_VERSION,
          apiPrefix: env.API_PREFIX,
          swaggerEnabled: env.SWAGGER_ENABLED,
          swaggerPath: env.SWAGGER_PATH,
        },
        'Servidor HTTP iniciado com sucesso',
      )

      if (env.SWAGGER_ENABLED) {
        app.log.info(
          `Documentacao da API disponivel em: http://localhost:${env.PORT}${env.SWAGGER_PATH}`,
        )
      }
    })
  })
}
