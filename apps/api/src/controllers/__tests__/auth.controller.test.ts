import { beforeEach, describe, expect, it } from '@jest/globals'
import bcrypt from 'bcryptjs'
import { FastifyInstance } from 'fastify'

import { prisma } from '@/lib/prisma'
import { buildTestServer } from '@/lib/test-utils'

describe('Auth Controller - Setup Password', () => {
  let app: FastifyInstance
  let testUser: any
  let accessToken: string

  beforeEach(async () => {
    app = await buildTestServer()

    // Criar usuário de teste com Google provider
    testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password: await bcrypt.hash('random-long-password-for-google-user', 10),
        avatarUrl: 'https://googleusercontent.com/avatar.jpg',
      },
    })

    // Criar provider Google para o usuário
    await prisma.userProvider.create({
      data: {
        userId: testUser.id,
        provider: 'google',
        providerUserId: 'google-user-id',
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

  describe('POST /auth/setup-password', () => {
    it('should setup password for Google user', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/setup-password',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: {
          password: 'NewPassword123!',
          confirmPassword: 'NewPassword123!',
        },
      })

      expect(response.statusCode).toBe(200)

      const data = JSON.parse(response.body)
      expect(data.message).toBe('Senha configurada com sucesso')
      expect(data.user.id).toBe(testUser.id)
      expect(data.user.email).toBe(testUser.email)

      // Verificar se a senha foi atualizada no banco
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id },
      })

      expect(updatedUser).toBeTruthy()
      const passwordValid = await bcrypt.compare(
        'NewPassword123!',
        updatedUser!.password,
      )
      expect(passwordValid).toBe(true)
    })

    it('should reject if passwords do not match', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/setup-password',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: {
          password: 'NewPassword123!',
          confirmPassword: 'DifferentPassword123!',
        },
      })

      expect(response.statusCode).toBe(400)

      const data = JSON.parse(response.body)
      expect(data.message).toBe('Senhas não coincidem')
    })

    it('should reject if password does not meet requirements', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/setup-password',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: {
          password: 'weak',
          confirmPassword: 'weak',
        },
      })

      expect(response.statusCode).toBe(400)
    })

    it('should reject if user does not have Google provider', async () => {
      // Remover provider Google
      await prisma.userProvider.deleteMany({
        where: { userId: testUser.id },
      })

      const response = await app.inject({
        method: 'POST',
        url: '/auth/setup-password',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: {
          password: 'NewPassword123!',
          confirmPassword: 'NewPassword123!',
        },
      })

      expect(response.statusCode).toBe(400)

      const data = JSON.parse(response.body)
      expect(data.message).toBe(
        'Esta funcionalidade é apenas para usuários que se registraram via Google',
      )
    })

    it('should reject if user already has a valid password', async () => {
      // Atualizar usuário para ter uma senha válida
      await prisma.user.update({
        where: { id: testUser.id },
        data: {
          password: await bcrypt.hash('ValidPassword123!', 10),
        },
      })

      const response = await app.inject({
        method: 'POST',
        url: '/auth/setup-password',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: {
          password: 'NewPassword123!',
          confirmPassword: 'NewPassword123!',
        },
      })

      expect(response.statusCode).toBe(400)

      const data = JSON.parse(response.body)
      expect(data.message).toBe('Senha já foi configurada para esta conta')
    })
  })
})
