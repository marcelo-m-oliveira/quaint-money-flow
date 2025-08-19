import 'fastify'

declare module 'fastify' {
  export interface FastifyRequest {
    user: any
    getCurrentUserId(): Promise<string>
    getUserMembership(slug: string): Promise<{
      account: Account
      creditCard: CreditCard
      category: Category
      entry: Entry
      userPreferences: UserPreferences
      user: User
      userProvider: UserProvider
      refreshToken: RefreshToken
    }>
  }
}
