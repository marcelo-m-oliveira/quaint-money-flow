import { prisma } from './prisma'

// Declarações mínimas para resolver erros de tipo
declare const beforeAll: any
declare const afterAll: any
declare const jest: any

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
