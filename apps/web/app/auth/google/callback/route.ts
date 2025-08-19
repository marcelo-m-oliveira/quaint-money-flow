import { env } from '@saas/env'
import { NextResponse } from 'next/server'

// This route receives ?code= from Google, forwards it to the backend callback,
// then signs the user in via NextAuth Credentials provider passing tokens.

const API_BASE_URL = env.NEXT_PUBLIC_API_URL

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  // Handle Google OAuth errors
  if (error) {
    console.error('Google OAuth error:', error)
    return NextResponse.redirect(
      new URL(`/error?error=google_oauth_error&message=${error}`, request.url),
    )
  }

  if (!code) {
    console.error('Missing authorization code from Google')
    return NextResponse.redirect(
      new URL('/error?error=missing_code', request.url),
    )
  }

  try {
    const resp = await fetch(
      `${API_BASE_URL}/auth/google/callback?code=${encodeURIComponent(code)}`,
      {
        method: 'GET',
      },
    )

    if (!resp.ok) {
      const errorText = await resp.text()
      console.error('Backend Google callback failed:', resp.status, errorText)
      return NextResponse.redirect(
        new URL(
          `/error?error=google_auth_failed&status=${resp.status}`,
          request.url,
        ),
      )
    }

    const data = (await resp.json()) as any

    if (!data.accessToken || !data.refreshToken || !data.user) {
      console.error('Invalid response from backend:', data)
      return NextResponse.redirect(
        new URL('/error?error=invalid_backend_response', request.url),
      )
    }

    // Redirect to a client bridge page that will call signIn('credentials') on the client
    const params = new URLSearchParams()
    params.set('callbackUrl', '/')
    params.set('accessToken', data.accessToken)
    params.set('refreshToken', data.refreshToken)
    params.set('user', JSON.stringify(data.user))

    return NextResponse.redirect(
      new URL(`/auth/google/complete?${params.toString()}`, request.url),
    )
  } catch (error) {
    console.error('Error in Google callback:', error)
    return NextResponse.redirect(
      new URL('/error?error=callback_error', request.url),
    )
  }
}
