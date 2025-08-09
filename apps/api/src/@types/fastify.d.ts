import 'fastify'

declare module 'fastify' {
  export interface FastifyRequest {
    user: {
      id: string
      email: string
      name: string
      sub: string
    }
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
