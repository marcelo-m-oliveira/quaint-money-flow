import 'fastify'

declare module 'fastify' {
  export interface FastifyRequest {
    getCurrentUserId(): Promise<string>
    getUserMembership(slug: string): Promise<{
      account: Account
      creditCard: CreditCard
      category: Category
      transaction: Transaction
      userPreferences: UserPreferences
      user: User
    }>
  }
}
