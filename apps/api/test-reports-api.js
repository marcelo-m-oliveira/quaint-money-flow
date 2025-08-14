// Usar fetch nativo do Node.js 18+ ou axios
let fetch
try {
  // Tentar usar fetch nativo (Node.js 18+)
  fetch = globalThis.fetch
  if (!fetch) {
    throw new Error('Fetch não disponível')
  }
} catch (error) {
  // Fallback para axios se disponível
  try {
    const axios = require('axios')
    fetch = async (url, options = {}) => {
      const response = await axios({
        url,
        method: options.method || 'GET',
        headers: options.headers,
        data: options.body,
      })
      return {
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        json: async () => response.data,
      }
    }
  } catch (axiosError) {
    console.error('❌ Nem fetch nativo nem axios estão disponíveis')
    console.error('💡 Execute: npm install node-fetch ou use Node.js 18+')
    process.exit(1)
  }
}

// Configuração da API
const API_BASE_URL = 'http://localhost:3333'
const API_VERSION = '/api/v1'

// Token de exemplo (qualquer valor funciona pois o middleware usa o primeiro usuário do banco)
const AUTH_TOKEN = 'Bearer test-token-123'

// Função para fazer requisições com autenticação
async function makeRequest(endpoint, params = {}) {
  const url = new URL(`${API_BASE_URL}${API_VERSION}${endpoint}`)

  // Adicionar parâmetros de query se fornecidos
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key])
    }
  })

  console.log(`\n🔍 Testando: ${url.toString()}`)

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: AUTH_TOKEN,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })

    const data = await response.json()

    if (response.ok) {
      console.log(`✅ Status: ${response.status}`)
      console.log('📊 Resposta:', JSON.stringify(data, null, 2))
    } else {
      console.log(`❌ Status: ${response.status}`)
      console.log('⚠️ Erro:', JSON.stringify(data, null, 2))
    }

    return { success: response.ok, status: response.status, data }
  } catch (error) {
    console.log(`💥 Erro na requisição: ${error.message}`)
    return { success: false, error: error.message }
  }
}

// Função principal para testar todos os endpoints
async function testReportsAPI() {
  console.log('🚀 Iniciando testes dos endpoints de relatórios...')
  console.log('👤 Usando usuário do seed: user@example.com')

  const results = []

  // 1. Testar endpoint de relatórios de categorias
  console.log('\n📂 === TESTANDO RELATÓRIOS DE CATEGORIAS ===')

  // Teste básico
  let result = await makeRequest('/reports/categories')
  results.push({ endpoint: 'categories (básico)', ...result })

  // Teste com filtros
  result = await makeRequest('/reports/categories', {
    period: 'monthly',
    year: '2024',
    month: '1',
  })
  results.push({ endpoint: 'categories (com filtros)', ...result })

  // Teste com tipo específico
  result = await makeRequest('/reports/categories', {
    type: 'expense',
    period: 'yearly',
    year: '2024',
  })
  results.push({ endpoint: 'categories (despesas)', ...result })

  // 2. Testar endpoint de relatórios de fluxo de caixa
  console.log('\n💰 === TESTANDO RELATÓRIOS DE FLUXO DE CAIXA ===')

  // Teste básico
  result = await makeRequest('/reports/cashflow')
  results.push({ endpoint: 'cashflow (básico)', ...result })

  // Teste com período mensal
  result = await makeRequest('/reports/cashflow', {
    period: 'monthly',
    year: '2024',
    month: '1',
  })
  results.push({ endpoint: 'cashflow (mensal)', ...result })

  // Teste com período semanal
  result = await makeRequest('/reports/cashflow', {
    period: 'weekly',
    year: '2024',
    month: '1',
    week: '1',
  })
  results.push({ endpoint: 'cashflow (semanal)', ...result })

  // 3. Testar endpoint de relatórios de contas
  console.log('\n🏦 === TESTANDO RELATÓRIOS DE CONTAS ===')

  // Teste básico
  result = await makeRequest('/reports/accounts')
  results.push({ endpoint: 'accounts (básico)', ...result })

  // Teste com filtros
  result = await makeRequest('/reports/accounts', {
    period: 'monthly',
    year: '2024',
    month: '1',
  })
  results.push({ endpoint: 'accounts (com filtros)', ...result })

  // Teste com tipo específico
  result = await makeRequest('/reports/accounts', {
    type: 'bank',
    period: 'yearly',
    year: '2024',
  })
  results.push({ endpoint: 'accounts (banco)', ...result })

  // Resumo dos resultados
  console.log('\n📋 === RESUMO DOS TESTES ===')

  const successful = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length

  console.log(`✅ Sucessos: ${successful}`)
  console.log(`❌ Falhas: ${failed}`)
  console.log(`📊 Total: ${results.length}`)

  if (failed > 0) {
    console.log('\n⚠️ Endpoints com falha:')
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`  - ${r.endpoint}: Status ${r.status || 'N/A'}`)
      })
  }

  console.log('\n🏁 Testes concluídos!')
}

// Verificar se o servidor está rodando testando um endpoint simples
async function checkServerHealth() {
  try {
    // Testar endpoint de documentação Swagger que sabemos que existe
    const response = await fetch(`${API_BASE_URL}/docs`, {
      method: 'GET',
      headers: { Accept: 'text/html' },
    })

    if (response.ok || response.status === 200) {
      console.log('✅ Servidor está rodando!')
      return true
    } else {
      console.log('⚠️ Servidor respondeu mas com erro:', response.status)
      return false
    }
  } catch (error) {
    console.log('❌ Servidor não está acessível:', error.message)
    console.log(
      '💡 Certifique-se de que o servidor está rodando em http://localhost:3333',
    )
    console.log('💡 Execute: cd apps/api && pnpm dev')
    return false
  }
}

// Executar os testes
async function main() {
  console.log('🧪 Script de Teste - API de Relatórios')
  console.log('=====================================')

  // Verificar se o servidor está rodando
  const serverRunning = await checkServerHealth()

  if (!serverRunning) {
    process.exit(1)
  }

  // Executar os testes
  await testReportsAPI()
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  })
}

module.exports = { testReportsAPI, makeRequest }
