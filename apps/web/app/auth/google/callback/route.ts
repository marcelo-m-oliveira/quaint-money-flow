import { NextResponse } from 'next/server'

// Esta rota recebe o código do Google e redireciona para a página de completar autenticação
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const state = searchParams.get('state')

  // Tratar erros do Google OAuth
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

  // Verificar se é uma vinculação de conta baseado no state
  const isLinking = state && state.includes('_link')
  const callbackUrl = isLinking ? '/configuracoes?google_connected=true' : '/'

  // Redirecionar para a página de completar autenticação com o código
  const params = new URLSearchParams()
  params.set('code', code)
  params.set('callbackUrl', callbackUrl)

  return NextResponse.redirect(
    new URL(`/auth/google/complete?${params.toString()}`, request.url),
  )
}
