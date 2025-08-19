import { env } from '@saas/env'
import { NextResponse } from 'next/server'

// This route is a small helper that redirects to Google's OAuth consent screen
// and sets the redirect_uri to the frontend callback, which then forwards to backend.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const linkAccount = searchParams.get('link_account')

  const clientId = env.GOOGLE_CLIENT_ID
  // Redirect to frontend callback first, not directly to backend
  const redirectUri = 'http://localhost:3000/auth/google/callback'
  const scope = encodeURIComponent('openid email profile')

  // Incluir informação de vinculação no state
  const baseState = Math.random().toString(36).slice(2)
  const state = linkAccount === 'true' ? `${baseState}_link` : baseState

  if (!clientId) {
    return NextResponse.redirect(
      new URL(
        `/error?error=google_oauth_error&message=missing_google_env`,
        env.NEXTAUTH_URL,
      ),
    )
  }

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri,
  )}&response_type=code&scope=${scope}&access_type=offline&include_granted_scopes=true&state=${state}`

  return NextResponse.redirect(url)
}
