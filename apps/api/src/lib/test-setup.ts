import { beforeAll, afterAll, jest } from '@jest/globals'
import { prisma } from './prisma'

// Configuração global para testes
beforeAll(async () => {
  // Conectar ao banco de dados de teste
  await prisma.$connect()
})

afterAll(async () => {
  // Desconectar do banco de dados após todos os testes
  await prisma.$disconnect()
})

// Configurar timeout para testes que podem demorar mais
jest.setTimeout(30000)
