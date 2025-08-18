import { NextResponse } from 'next/server'

// This route is a small helper that redirects to Google's OAuth consent screen
// and sets the redirect_uri to the backend's /auth/google/callback.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL as string

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.GOOGLE_REDIRECT_URI
  const scope = encodeURIComponent('openid email profile')
  const state = Math.random().toString(36).slice(2)

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri ?? '',
  )}&response_type=code&scope=${scope}&access_type=offline&include_granted_scopes=true&state=${state}`

  return NextResponse.redirect(url)
}
