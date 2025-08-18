import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/middleware/auth.middleware'
import { performanceMiddleware } from '@/middleware/performance.middleware'
import { rateLimitMiddlewares } from '@/middleware/rate-limit.middleware'
import { validateBody } from '@/middleware/validation.middleware'
import { ResponseFormatter } from '@/utils/response'

const uploadResponseSchema = z.object({
  url: z.string().url(),
  filename: z.string(),
})

const uploadAvatarSchema = z.object({
  imageData: z.string().min(1, 'Dados da imagem são obrigatórios'),
})

export async function uploadRoutes(app: FastifyInstance) {
  // POST /upload/avatar - Upload de foto de perfil
  app.post(
    '/upload/avatar',
    {
      schema: {
        tags: ['📤 Upload'],
        summary: 'Upload de foto de perfil',
        security: [{ bearerAuth: [] }],
        body: uploadAvatarSchema,
        response: {
          200: uploadResponseSchema,
        },
      },
      preHandler: [authMiddleware, performanceMiddleware(), validateBody(uploadAvatarSchema), rateLimitMiddlewares.authenticated()],
    },
    async (request, reply) => {
      try {
        console.log('🔍 Debug - Upload route hit')
        console.log('🔍 Debug - User:', request.user)
        console.log('🔍 Debug - Headers:', request.headers)
        console.log('🔍 Debug - Authorization header:', request.headers.authorization)
        
        const { imageData } = request.body as any

        // Validar se é um data URL válido
        if (!imageData.startsWith('data:image/')) {
          return ResponseFormatter.error(
            reply,
            'Formato de imagem inválido',
            undefined,
            400
          )
        }

        // Validar tamanho (5MB)
        const base64Data = imageData.split(',')[1]
        const sizeInBytes = Math.ceil((base64Data.length * 3) / 4)
        const maxSize = 5 * 1024 * 1024 // 5MB
        
        if (sizeInBytes > maxSize) {
          return ResponseFormatter.error(
            reply,
            'Arquivo muito grande. Tamanho máximo: 5MB',
            undefined,
            400
          )
        }

        // Atualizar o avatar do usuário
        const decoded = request.user as any
        const userId = decoded?.sub as string
        
        await prisma.user.update({
          where: { id: userId },
          data: { avatarUrl: imageData },
        })

        return reply.send({
          url: imageData,
          filename: 'avatar.jpg',
        })
      } catch (error) {
        console.error('Erro no upload:', error)
        return ResponseFormatter.error(
          reply,
          'Erro interno do servidor',
          undefined,
          500
        )
      }
    },
  )
}
