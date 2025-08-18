import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// We will manage Google OAuth with a custom callback route that calls the backend
// and then signs in via Credentials provider using the issued JWTs.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL as string

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        accessToken: { label: 'accessToken', type: 'text' },
        refreshToken: { label: 'refreshToken', type: 'text' },
        user: { label: 'user', type: 'text' },
      },
      async authorize(credentials: Record<string, string> | undefined) {
        if (!credentials) return null

        // If we already have tokens (coming from Google callback bridge), accept them directly
        if (
          credentials.accessToken &&
          credentials.refreshToken &&
          credentials.user
        ) {
          try {
            const parsedUser = JSON.parse(credentials.user)
            return {
              id: parsedUser.id,
              name: parsedUser.name,
              email: parsedUser.email,
              accessToken: credentials.accessToken,
              refreshToken: credentials.refreshToken,
            }
          } catch {
            return null
          }
        }

        // Otherwise, perform email/password login against backend
        if (credentials.email && credentials.password) {
          const resp = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })
          if (!resp.ok) return null
          const data = (await resp.json()) as any
          return {
            id: data.user?.id,
            name: data.user?.name,
            email: data.user?.email,
            image: data.user?.avatarUrl ?? undefined,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          }
        }

        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      // On sign in, persist tokens
      if (user) {
        const accessToken = (user as any).accessToken as string | undefined
        const refreshToken = (user as any).refreshToken as string | undefined
        if (accessToken) token.accessToken = accessToken
        if (refreshToken) token.refreshToken = refreshToken
        // Compute access token expiry from JWT exp claim
        try {
          const payload = JSON.parse(
            Buffer.from(
              (token.accessToken as string).split('.')[1],
              'base64',
            ).toString('utf-8'),
          )
          token.accessTokenExpires = (payload.exp as number | undefined)
            ? (payload.exp as number) * 1000
            : Date.now() + 15 * 60 * 1000
        } catch {
          // Fallback 15m
          token.accessTokenExpires = Date.now() + 15 * 60 * 1000
        }
      }

      // If access token is still valid, return
      if (
        token.accessToken &&
        token.accessTokenExpires &&
        Date.now() < (token.accessTokenExpires as number) - 60_000
      ) {
        // Even if token is valid, try to update user data if we have a user object
        if (user) {
          token.name = user.name
          token.email = user.email
          token.picture = (user as any).image
        }
        return token
      }

      // Refresh using backend
      try {
        const refreshToken = token.refreshToken as string | undefined
        if (!refreshToken) return token
        const resp = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })
        if (!resp.ok) return token
        const data = (await resp.json()) as any
        token.accessToken = data.accessToken
        token.refreshToken = data.refreshToken
        try {
          const payload = JSON.parse(
            Buffer.from(
              (data.accessToken as string).split('.')[1],
              'base64',
            ).toString('utf-8'),
          )
          token.accessTokenExpires = (payload.exp as number | undefined)
            ? (payload.exp as number) * 1000
            : Date.now() + 15 * 60 * 1000
        } catch {
          token.accessTokenExpires = Date.now() + 15 * 60 * 1000
        }
        return token
      } catch {
        return token
      }
    },
    async session({ session, token }: any) {
      // Expose tokens in session object
      ;(session as any).accessToken = token.accessToken
      ;(session as any).refreshToken = token.refreshToken
      
      // Fetch fresh user data from backend to ensure we have the latest profile info
      try {
        const accessToken = token.accessToken as string | undefined
        if (accessToken) {
          const resp = await fetch(`${API_BASE_URL}/users/me`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'content-type': 'application/json',
            },
          })
          if (resp.ok) {
            const userData = await resp.json()
            session.user = {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              image: userData.avatarUrl || undefined,
            }
            return session
          }
        }
      } catch (error) {
        console.error('Failed to fetch fresh user data:', error)
      }
      
      // Fallback to token data if API call fails
      session.user = session.user || ({} as any)
      if (token?.name) (session.user as any).name = token.name
      if (token?.email) (session.user as any).email = token.email
      if ((token as any)?.picture)
        (session.user as any).image = (token as any).picture
      return session
    },
  },
  events: {
    async signOut({ token }: any) {
      try {
        const refreshToken = (token as any)?.refreshToken as string | undefined
        if (!refreshToken) return
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })
      } catch {}
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
