import { env } from '@saas/env'
import { NextRequest, NextResponse } from 'next/server'

// URL da API backend (com porta)
const BACKEND_API_URL = env.NEXT_PUBLIC_BACKEND_API_URL.replace('/api/v1', '')

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  return proxyRequest(request, params.path, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  return proxyRequest(request, params.path, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  return proxyRequest(request, params.path, 'PUT')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  return proxyRequest(request, params.path, 'PATCH')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  return proxyRequest(request, params.path, 'DELETE')
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string,
) {
  try {
    // Construir a URL de destino
    const path = pathSegments.join('/')
    const targetUrl = `${BACKEND_API_URL}/api/v1/${path}`

    // Construir URL com query parameters
    const url = new URL(targetUrl)
    const searchParams = request.nextUrl.searchParams
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value)
    })

    // Preparar headers
    const headers = new Headers()

    // Copiar headers relevantes do request original
    const allowedHeaders = [
      'authorization',
      'content-type',
      'accept',
      'user-agent',
      'x-forwarded-for',
      'x-real-ip',
    ]

    allowedHeaders.forEach((headerName) => {
      const value = request.headers.get(headerName)
      if (value) {
        headers.set(headerName, value)
      }
    })

    // Configurar opções da requisição
    const requestOptions: RequestInit = {
      method,
      headers,
    }

    // Adicionar body para métodos que precisam
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        const body = await request.text()
        if (body) {
          requestOptions.body = body
        }
      } catch (error) {
        console.error('Erro ao ler body da requisição:', error)
      }
    }

    // Fazer a requisição para a API backend
    const response = await fetch(url.toString(), requestOptions)

    // Preparar headers da resposta
    const responseHeaders = new Headers()

    // Copiar headers relevantes da resposta
    const allowedResponseHeaders = [
      'content-type',
      'cache-control',
      'etag',
      'last-modified',
    ]

    allowedResponseHeaders.forEach((headerName) => {
      const value = response.headers.get(headerName)
      if (value) {
        responseHeaders.set(headerName, value)
      }
    })

    // Adicionar headers CORS se necessário
    responseHeaders.set('Access-Control-Allow-Origin', '*')
    responseHeaders.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    )
    responseHeaders.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization',
    )

    // Ler o conteúdo da resposta apenas se houver
    let responseBody: string | null = null

    // Verificar se há conteúdo na resposta (status 204 No Content não tem body)
    if (
      response.status !== 204 &&
      response.headers.get('content-length') !== '0'
    ) {
      try {
        responseBody = await response.text()
      } catch (error) {
        console.error('Erro ao ler body da resposta:', error)
      }
    }

    // Retornar a resposta
    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('Erro no proxy da API:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        message: 'Falha na comunicação com a API',
      },
      { status: 500 },
    )
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}
