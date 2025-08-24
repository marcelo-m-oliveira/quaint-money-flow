import { env } from '@saas/env'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const clientId = env.GOOGLE_CLIENT_ID
    const redirectUri = env.GOOGLE_REDIRECT_URI
    const scope = 'openid email profile'

    if (!clientId || !redirectUri) {
      return NextResponse.json(
        { error: 'Google OAuth configuration not found' },
        { status: 500 },
      )
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope,
      access_type: 'offline',
      prompt: 'consent',
    })

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('Error generating Google OAuth URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate Google OAuth URL' },
      { status: 500 },
    )
  }
}
