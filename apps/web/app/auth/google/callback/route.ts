import { NextResponse } from 'next/server'

// This route receives ?code= from Google, forwards it to the backend callback,
// then signs the user in via NextAuth Credentials provider passing tokens.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL as string

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  if (!code) {
    return NextResponse.redirect(new URL('/?error=missing_code', request.url))
  }

  const resp = await fetch(
    `${API_BASE_URL}/auth/google/callback?code=${encodeURIComponent(code)}`,
    {
      method: 'GET',
    },
  )
  if (!resp.ok) {
    return NextResponse.redirect(
      new URL('/?error=google_auth_failed', request.url),
    )
  }
  const data = (await resp.json()) as any

  // Build a URL to NextAuth credentials sign-in with tokens embedded in callbackUrl
  const params = new URLSearchParams()
  params.set('callbackUrl', '/')
  params.set('accessToken', data.accessToken)
  params.set('refreshToken', data.refreshToken)
  params.set('user', JSON.stringify(data.user))

  return NextResponse.redirect(
    new URL(`/api/auth/callback/credentials?${params.toString()}`, request.url),
  )
}
