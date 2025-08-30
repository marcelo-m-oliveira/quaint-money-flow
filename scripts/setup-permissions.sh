#!/bin/bash

# Script para configurar sistema de permissões
# Execute este script após configurar o banco de dados

echo "🚀 Configurando Sistema de Permissões..."

# Verificar se .env existe
if [ ! -f ".env" ]; then
  echo "📋 Criando arquivo .env..."
  cp env.example .env
  echo "✅ Arquivo .env criado. Configure as variáveis necessárias."
fi

# Navegar para API
cd apps/api

echo "📦 Instalando dependências da API..."
pnpm install

echo "🗄️ Aplicando migrações do banco..."
pnpm env:load prisma migrate reset --force

echo "🌱 Executando seed com usuários e planos..."
pnpm env:load prisma db seed

# Navegar para Web
cd ../web

echo "📦 Instalando dependências do frontend..."
pnpm install

echo "🧪 Executando testes para verificar implementação..."
pnpm test --passWithNoTests

# Voltar para raiz
cd ../..

echo "✅ Sistema de permissões configurado com sucesso!"
echo ""
echo "👥 Usuários de teste criados:"
echo "   📧 user@test.com (password123) - Usuário básico"
echo "   👑 premium@test.com (password123) - Usuário premium"  
echo "   🛡️ admin@test.com (password123) - Administrador"
echo ""
echo "🚀 Para executar a aplicação:"
echo "   Terminal 1: cd apps/api && pnpm dev"
echo "   Terminal 2: cd apps/web && pnpm dev"
echo ""
echo "🧪 Para executar testes:"
echo "   Unitários: cd apps/web && pnpm test"
echo "   E2E: cd apps/web && pnpm test:e2e"