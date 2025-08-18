import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { env } from '@saas/env'

import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const API_BASE_URL = env.NEXT_PUBLIC_API_URL

async function forward(
  request: Request,
  context: { params: { path?: string[] } },
) {
  const session = await getServerSession(authOptions)
  const accessToken = (session as any)?.accessToken as string | undefined

  // Debug log para verificar se o token está sendo obtido
  console.log('🔍 Debug - Session:', !!session)
  console.log('🔍 Debug - Session keys:', session ? Object.keys(session) : 'No session')
  console.log('🔍 Debug - Access Token:', !!accessToken)
  console.log('🔍 Debug - Access Token (first 20 chars):', accessToken?.substring(0, 20))
  console.log('🔍 Debug - Path:', context.params.path)
  console.log('🔍 Debug - Method:', request.method)

  const { search } = new URL(request.url)
  const path = (context.params.path || []).join('/')
  const targetUrl = `${API_BASE_URL}/${path}${search}`

  const headers = new Headers(request.headers)
  headers.set('x-forwarded-host', request.headers.get('host') || '')
  if (accessToken) headers.set('authorization', `Bearer ${accessToken}`)

  const body =
    request.method === 'GET' || request.method === 'HEAD'
      ? undefined
      : await request.text()
  const init: RequestInit = {
    method: request.method,
    headers,
    body,
    redirect: 'manual',
  }

  const resp = await fetch(targetUrl, init)
  const responseHeaders = new Headers(resp.headers)
  // Avoid setting hop-by-hop headers
  responseHeaders.delete('transfer-encoding')

  if (resp.status === 204)
    return new NextResponse(null, { status: 204, headers: responseHeaders })

  const contentType = responseHeaders.get('content-type') || ''
  if (contentType.includes('application/json')) {
    const data = await resp.json()
    return NextResponse.json(data, {
      status: resp.status,
      headers: responseHeaders,
    })
  }

  const blob = await resp.arrayBuffer()
  return new NextResponse(blob, {
    status: resp.status,
    headers: responseHeaders,
  })
}

export async function GET(
  request: Request,
  context: { params: { path?: string[] } },
) {
  return forward(request, context)
}
export async function POST(
  request: Request,
  context: { params: { path?: string[] } },
) {
  return forward(request, context)
}
export async function PUT(
  request: Request,
  context: { params: { path?: string[] } },
) {
  return forward(request, context)
}
export async function PATCH(
  request: Request,
  context: { params: { path?: string[] } },
) {
  return forward(request, context)
}
export async function DELETE(
  request: Request,
  context: { params: { path?: string[] } },
) {
  return forward(request, context)
}
