# 💰 Quaint Money - Controle Financeiro Pessoal

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Radix-UI-161618?style=for-the-badge&logo=radix-ui" alt="Radix UI" />
</div>

<br />

<div align="center">
  <h3>🎯 SaaS minimalista e eficiente para controle de finanças pessoais</h3>
  <p>Ferramenta simples e visualmente agradável para indivíduos e famílias gerenciarem suas finanças diárias, sem a complexidade de softwares contábeis tradicionais.</p>
</div>

---

## ✨ Funcionalidades

### 💸 Controle de Transações
- ✅ **Adicionar receitas e despesas** com formulários intuitivos
- ✅ **Editar e excluir** transações existentes
- ✅ **Visualização organizada** de todas as transações
- ✅ **Cálculo automático** de totais (receitas, despesas e saldo)
- ✅ **Salvar e criar outra** - funcionalidade para entrada rápida de múltiplas transações

### 🏷️ Sistema de Categorização
- ✅ **Criar, editar e excluir** categorias personalizadas
- ✅ **Categorias padrão** incluídas: Alimentação, Moradia, Transporte, Salário, Freelance
- ✅ **Cores personalizáveis** para cada categoria
- ✅ **Filtros por tipo** (receitas/despesas) para melhor organização

### 🎨 Design e UX
- ✅ **Cor primária**: #FF6400 (laranja vibrante)
- ✅ **Dark Mode** como padrão
- ✅ **Alternância de tema** (Dark/Light Mode)
- ✅ **Interface responsiva** para desktop e mobile
- ✅ **Componentes acessíveis** (a11y) com Radix UI
- ✅ **Animações suaves** e feedback visual

---

## 🛠️ Tecnologias

### Frontend
- **Next.js 14** - Framework React com App Router
- **React 18** - Biblioteca para interfaces de usuário
- **TypeScript** - Tipagem estática para JavaScript
- **Tailwind CSS** - Framework CSS utilitário
- **Radix UI** - Componentes acessíveis e sem estilo
- **Lucide React** - Ícones modernos e consistentes

### Ferramentas de Desenvolvimento
- **ESLint** - Linting de código
- **Prettier** - Formatação de código
- **Jest** - Framework de testes
- **Testing Library** - Testes de componentes React
- **Turbo** - Build system monorepo
- **pnpm** - Gerenciador de pacotes eficiente

### Arquitetura
- **Monorepo** com Turbo
- **Configurações compartilhadas** (ESLint, Prettier, TypeScript)
- **Hooks customizados** para lógica de negócio
- **Persistência local** com localStorage
- **Componentes reutilizáveis** com design system

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- pnpm (recomendado) ou npm

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/quaint-money-flow.git
cd quaint-money-flow

# Instale as dependências
pnpm install

# Execute o projeto em modo de desenvolvimento
pnpm dev
```

### Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev          # Inicia o servidor de desenvolvimento
pnpm build        # Build para produção
pnpm start        # Inicia o servidor de produção

# Qualidade de código
pnpm lint         # Executa ESLint
pnpm lint:fix     # Corrige problemas do ESLint automaticamente
pnpm format       # Formata código com Prettier

# Testes
pnpm test         # Executa todos os testes
pnpm test:watch   # Executa testes em modo watch
pnpm test:coverage # Executa testes com cobertura
```

---

## 📁 Estrutura do Projeto

```
quaint-money-flow/
├── apps/
│   └── web/                    # Aplicação Next.js principal
│       ├── app/                # App Router do Next.js
│       │   ├── globals.css     # Estilos globais e variáveis CSS
│       │   ├── layout.tsx      # Layout raiz da aplicação
│       │   └── page.tsx        # Página inicial (dashboard)
│       ├── components/         # Componentes React
│       │   ├── ui/            # Componentes de UI base (shadcn/ui)
│       │   ├── financial-dashboard.tsx # Dashboard principal
│       │   └── entry-form-modal.tsx # Modal de transações
│       ├── lib/               # Utilitários e configurações
│       │   ├── hooks/         # Custom hooks
│       │   ├── types.ts       # Definições de tipos TypeScript
│       │   ├── format.ts      # Utilitários de formatação
│       │   └── utils.ts       # Utilitários gerais
│       └── __tests__/         # Testes da aplicação
├── config/                    # Configurações compartilhadas
│   ├── eslint-config/        # Configuração ESLint
│   ├── prettier/             # Configuração Prettier
│   └── typescript-config/    # Configuração TypeScript
├── packages/                 # Pacotes compartilhados
│   ├── utils/               # Utilitários compartilhados
│   └── validations/         # Validações compartilhadas
└── docker-compose.yml       # Configuração Docker (futuro)
```

---

## 💾 Persistência de Dados

Atualmente, a aplicação utiliza **localStorage** para persistir dados localmente no navegador:

- **Transações**: `quaint-money-transactions`
- **Categorias**: `quaint-money-categories`  
- **Tema**: `quaint-money-theme`

> 📝 **Nota**: Em versões futuras, será implementada sincronização em nuvem para backup e acesso multi-dispositivo.

---

## 🧪 Testes

O projeto inclui testes automatizados para garantir qualidade e confiabilidade:

```bash
# Executar todos os testes
pnpm test

# Testes em modo watch (desenvolvimento)
pnpm test:watch

# Cobertura de testes
pnpm test:coverage
```

### Tipos de Teste
- **Testes unitários** - Componentes e funções isoladas
- **Testes de integração** - Fluxos completos da aplicação
- **Testes de acessibilidade** - Garantia de a11y

---

## 🎯 Roadmap

### 📊 Fase 2 - Analytics e Relatórios
- [ ] Gráficos de gastos por categoria
- [ ] Relatórios mensais/anuais
- [ ] Filtros avançados por período
- [ ] Metas de gastos e economia
- [ ] Exportação de dados (CSV, PDF)

### ☁️ Fase 3 - Cloud e Sincronização
- [ ] Autenticação de usuários
- [ ] Sincronização em nuvem
- [ ] Backup automático
- [ ] Acesso multi-dispositivo
- [ ] Compartilhamento familiar

### 📱 Fase 4 - Mobile e Integrações
- [ ] Progressive Web App (PWA)
- [ ] Aplicativo mobile nativo
- [ ] Integração bancária (Open Banking)
- [ ] Notificações push
- [ ] Múltiplas contas/carteiras

---

## 🤝 Contribuição

Contribuições são bem-vindas! Este projeto segue as melhores práticas de desenvolvimento:

### Padrões de Código
- **TypeScript** obrigatório para type safety
- **ESLint + Prettier** para consistência de código
- **Conventional Commits** para mensagens de commit
- **Testes** obrigatórios para novas funcionalidades

### Como Contribuir
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Marcelo Oliveira**
- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- LinkedIn: [Seu Perfil](https://linkedin.com/in/seu-perfil)

---

<div align="center">
  <p><strong>Desenvolvido com ❤️ usando as melhores práticas de React e Next.js</strong></p>
  <p>⭐ Se este projeto te ajudou, considere dar uma estrela!</p>
</div>