import { FastifyInstance } from 'fastify'

import { TransactionFactory } from '../../factories/transaction.factory'
import { authMiddleware } from '../middlewares/auth'

export async function transactionRoutes(app: FastifyInstance) {
  const transactionController = TransactionFactory.getController()

  // Aplicar middleware de autenticação em todas as rotas
  app.addHook('onRequest', authMiddleware)

  // GET /transactions - Listar transações do usuário com filtros
  app.get('/', transactionController.index.bind(transactionController))

  // GET /transactions/:id - Buscar transação específica
  app.get('/:id', transactionController.show.bind(transactionController))

  // POST /transactions - Criar nova transação
  app.post('/', transactionController.store.bind(transactionController))

  // PUT /transactions/:id - Atualizar transação
  app.put('/:id', transactionController.update.bind(transactionController))

  // DELETE /transactions/:id - Excluir transação específica
  app.delete('/:id', transactionController.destroy.bind(transactionController))

  // DELETE /transactions - Excluir todas as transações do usuário
  app.delete('/', transactionController.destroyAll.bind(transactionController))

  // DELETE /transactions/user-data - Excluir todos os dados do usuário
  app.delete(
    '/user-data',
    transactionController.destroyAllUserData.bind(transactionController),
  )
}
