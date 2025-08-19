import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import bcrypt from 'bcryptjs'
import { FastifyInstance } from 'fastify'

import { prisma } from '@/lib/prisma'
import { buildTestServer } from '@/lib/test-utils'

describe('User Controller - Account Status', () => {
  let app: FastifyInstance
  let testUser: any
  let accessToken: string

  beforeEach(async () => {
    app = await buildTestServer()

    // Criar usuário de teste
    testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password: await bcrypt.hash('random-long-password-for-google-user', 10),
        avatarUrl: 'https://googleusercontent.com/avatar.jpg',
      },
    })

    // Gerar token de acesso
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'test@example.com',
        password: 'random-long-password-for-google-user',
      },
    })

    const loginData = JSON.parse(loginResponse.body)
    accessToken = loginData.accessToken
  })

  afterEach(async () => {
    await prisma.userProvider.deleteMany()
    await prisma.user.deleteMany()
    await app.close()
  })

  describe('GET /users/account-status', () => {
    it('should return account status for user without Google provider', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/users/account-status',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      expect(response.statusCode).toBe(200)

      const data = JSON.parse(response.body)
      expect(data.hasGoogleProvider).toBe(false)
      expect(data.needsPasswordSetup).toBe(true) // Senha aleatória
      expect(data.hasValidPassword).toBe(false)
      expect(data.providers).toEqual([])
    })

    it('should return account status for user with Google provider', async () => {
      // Adicionar provider Google
      await prisma.userProvider.create({
        data: {
          userId: testUser.id,
          provider: 'google',
          providerUserId: 'google-user-id',
        },
      })

      const response = await app.inject({
        method: 'GET',
        url: '/users/account-status',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      expect(response.statusCode).toBe(200)

      const data = JSON.parse(response.body)
      expect(data.hasGoogleProvider).toBe(true)
      expect(data.needsPasswordSetup).toBe(true) // Senha aleatória
      expect(data.hasValidPassword).toBe(false)
      expect(data.providers).toHaveLength(1)
      expect(data.providers[0].provider).toBe('google')
      expect(data.providers[0].providerUserId).toBe('google-user-id')
    })

    it('should return account status for user with valid password', async () => {
      // Atualizar usuário para ter uma senha válida
      await prisma.user.update({
        where: { id: testUser.id },
        data: {
          password: await bcrypt.hash('ValidPassword123!', 10),
        },
      })

      const response = await app.inject({
        method: 'GET',
        url: '/users/account-status',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      expect(response.statusCode).toBe(200)

      const data = JSON.parse(response.body)
      expect(data.hasGoogleProvider).toBe(false)
      expect(data.needsPasswordSetup).toBe(false)
      expect(data.hasValidPassword).toBe(true)
      expect(data.providers).toEqual([])
    })

    it('should return 404 for non-existent user', async () => {
      // Deletar usuário
      await prisma.user.delete({
        where: { id: testUser.id },
      })

      const response = await app.inject({
        method: 'GET',
        url: '/users/account-status',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      expect(response.statusCode).toBe(404)
    })
  })
})
