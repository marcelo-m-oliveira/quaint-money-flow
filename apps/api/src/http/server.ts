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
import { setupSwagger } from '@/lib/swagger'
import { errorHandler } from '@/utils/errors'

export async function createApp() {
  const app = fastify().withTypeProvider<ZodTypeProvider>()

  app.setSerializerCompiler(serializerCompiler)
  app.setValidatorCompiler(validatorCompiler)

  app.setErrorHandler(errorHandler)

  await setupSwagger(app)

  app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
  })

  app.register(fastifyCors)

  app.register(accountRoutes)

  return app
}

if (require.main === module) {
  createApp().then((app) => {
    app.listen({ port: env.PORT, host: '0.0.0.0' }).then(() => {
      console.log(`🚀 HTTP server running on http://localhost:${env.PORT}`)
    })
  })
}
