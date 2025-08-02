# Quaint Money - SaaS de Organização Financeira

Um SaaS minimalista e eficiente para controle de finanças pessoais, desenvolvido com Next.js 14, React 18 e TypeScript.

## 🎯 Objetivo

Ferramenta simples e visualmente agradável para indivíduos e famílias gerenciarem suas finanças diárias, sem a complexidade de softwares contábeis tradicionais.

## ✨ Funcionalidades (Fase 1)

### 💰 Controle de Transações
- ✅ Criação de formulários para adicionar novas receitas e despesas
- ✅ Funcionalidade de editar e excluir transações existentes
- ✅ Exibição clara e organizada de todas as transações em uma lista
- ✅ Cálculo automático de totais (receitas, despesas e saldo)

### 🏷️ Categorização
- ✅ Sistema para criar, editar e excluir categorias personalizadas
- ✅ Categorias padrão: "Alimentação", "Moradia", "Transporte", "Salário", "Freelance"
- ✅ Atribuir uma categoria a cada transação
- ✅ Visualização de gastos por categoria
- ✅ Cores personalizáveis para cada categoria

### 🎨 Design e Estilo
- ✅ **Cor Primária**: #FF6400 (laranja vibrante)
- ✅ **Modo Padrão**: Dark Mode (modo escuro)
- ✅ **Alternância de Tema**: Opção para alternar entre Dark e Light Mode
- ✅ Interface responsiva e moderna
- ✅ Componentes acessíveis (a11y)

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 14** - Framework React com App Router
- **React 18** - Biblioteca para interfaces de usuário
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **Radix UI** - Componentes primitivos acessíveis
- **Lucide React** - Ícones SVG
- **Class Variance Authority** - Utilitário para variantes de componentes

### Gerenciamento de Estado
- **React Hooks** - useState, useEffect
- **Custom Hooks** - useFinancialData, useTheme
- **LocalStorage** - Persistência de dados no navegador

### Ferramentas de Desenvolvimento
- **Turbo** - Monorepo e build system
- **pnpm** - Gerenciador de pacotes
- **ESLint** - Linting de código
- **Prettier** - Formatação de código

## 🚀 Como Executar

### Pré-requisitos
- Node.js >= 18
- pnpm >= 8.9.0

### Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd quaint-money-flow
```

2. Instale as dependências:
```bash
pnpm install
```

3. Execute o projeto em modo de desenvolvimento:
```bash
pnpm dev
```

4. Acesse a aplicação:
```
http://localhost:3000
```

### Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Iniciar em produção
pnpm start

# Linting
pnpm lint
```

## 📁 Estrutura do Projeto

```
quaint-money-flow/
├── apps/
│   └── web/                    # Aplicação Next.js
│       ├── app/                # App Router do Next.js
│       │   ├── globals.css     # Estilos globais e variáveis CSS
│       │   ├── layout.tsx      # Layout raiz
│       │   └── page.tsx        # Página inicial
│       ├── components/         # Componentes React
│       │   ├── ui/            # Componentes de UI reutilizáveis
│       │   └── financial-dashboard.tsx # Dashboard principal
│       └── lib/               # Utilitários e hooks
│           ├── hooks/         # Custom hooks
│           ├── types.ts       # Definições de tipos TypeScript
│           ├── format.ts      # Utilitários de formatação
│           └── utils.ts       # Utilitários gerais
├── config/                    # Configurações compartilhadas
│   ├── eslint-config/        # Configuração ESLint
│   ├── prettier/             # Configuração Prettier
│   └── typescript-config/    # Configuração TypeScript
└── packages/                 # Pacotes compartilhados (futuro)
```

## 🎨 Sistema de Design

### Cores
- **Primária**: #FF6400 (laranja)
- **Tema Escuro**: Padrão
- **Tema Claro**: Opcional

### Componentes UI
- Button - Botões com variantes
- Input - Campos de entrada
- Select - Seleção de opções
- Dialog - Modais
- Switch - Alternador de tema
- Label - Rótulos de formulário

## 💾 Persistência de Dados

Os dados são armazenados localmente no navegador usando `localStorage`:
- **Transações**: `quaint-money-transactions`
- **Categorias**: `quaint-money-categories`
- **Tema**: `quaint-money-theme`

## 🔮 Próximas Funcionalidades (Roadmap)

### Fase 2
- [ ] Relatórios e gráficos
- [ ] Filtros avançados
- [ ] Exportação de dados
- [ ] Metas de gastos
- [ ] Notificações

### Fase 3
- [ ] Sincronização em nuvem
- [ ] Aplicativo mobile
- [ ] Integração bancária
- [ ] Múltiplas contas
- [ ] Compartilhamento familiar

## 🤝 Contribuição

Este projeto segue as melhores práticas de desenvolvimento:

1. **Código Limpo**: TypeScript, ESLint, Prettier
2. **Componentização**: Componentes reutilizáveis e bem documentados
3. **Acessibilidade**: Componentes acessíveis com Radix UI
4. **Performance**: Otimizações do Next.js (SSR, SSG, etc.)
5. **Responsividade**: Design mobile-first

## 📄 Licença

Este projeto está sob a licença MIT.

---

**Desenvolvido com ❤️ usando as melhores práticas de React e Next.js**