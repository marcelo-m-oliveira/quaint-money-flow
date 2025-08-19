import { env } from '@saas/env'
import { NextResponse } from 'next/server'

// This route is a small helper that redirects to Google's OAuth consent screen
// and sets the redirect_uri to the frontend callback, which then forwards to backend.

const API_BASE_URL = env.NEXT_PUBLIC_API_URL

export async function GET() {
  const clientId = env.GOOGLE_CLIENT_ID
  // Redirect to frontend callback first, not directly to backend
  const redirectUri = 'http://localhost:3000/auth/google/callback'
  const scope = encodeURIComponent('openid email profile')
  const state = Math.random().toString(36).slice(2)

  if (!clientId) {
    return NextResponse.redirect(
      new URL(
        `/error?error=google_oauth_error&message=missing_google_env`,
        process.env.NEXTAUTH_URL || 'http://localhost:3000',
      ),
    )
  }

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri,
  )}&response_type=code&scope=${scope}&access_type=offline&include_granted_scopes=true&state=${state}`

  return NextResponse.redirect(url)
}
