import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const PUBLIC_PATHS = [
  '/signin',
  '/signup',
  '/auth',
  '/api/auth',
  '/_next',
  '/favicon.ico',
  '/icons',
  '/error',
  '/recover',
]

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Verificar se há token de acesso nos cookies
  const accessToken = request.cookies.get('accessToken')?.value

  if (!accessToken) {
    const signInUrl = new URL('/signin', request.url)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/configuracoes/:path*',
    '/lancamentos',
    '/relatorios',
    '/metas',
  ],
}
