# Quaint Money Flow API

API backend para o sistema de gerenciamento financeiro pessoal Quaint Money Flow.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **TypeScript** - Linguagem de programação
- **Fastify** - Framework web rápido e eficiente
- **Prisma** - ORM moderno para TypeScript
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação via tokens
- **Zod** - Validação de schemas
- **Jest** - Framework de testes
- **Swagger** - Documentação da API
- **ESLint + Prettier** - Linting e formatação de código

## 📁 Estrutura do Projeto

```
api/
├── prisma/                 # Configuração do Prisma
│   ├── schema.prisma       # Schema do banco de dados
│   └── seed.ts            # Script de seed
├── src/
│   ├── @types/            # Definições de tipos TypeScript
│   ├── http/              # Rotas e middlewares HTTP
│   │   └── middlewares/   # Middlewares da aplicação
│   ├── lib/               # Configurações e utilitários principais
│   ├── utils/             # Utilitários gerais
│   ├── __tests__/         # Testes da aplicação
│   └── index.ts           # Ponto de entrada da aplicação
├── .env.example           # Exemplo de variáveis de ambiente
├── package.json           # Dependências e scripts
├── tsconfig.json          # Configuração do TypeScript
├── tsup.config.ts         # Configuração do build
├── jest.config.js         # Configuração dos testes
└── README.md              # Documentação
```

## 🛠️ Configuração do Ambiente

1. **Instalar dependências:**
   ```bash
   pnpm install
   ```

2. **Configurar variáveis de ambiente:**
   ```bash
   cp .env.example .env
   ```
   Edite o arquivo `.env` com suas configurações.

3. **Configurar banco de dados:**
   ```bash
   # Gerar cliente Prisma
   pnpm db:generate
   
   # Executar migrações
   pnpm db:migrate
   
   # Popular banco com dados iniciais
   pnpm db:seed
   ```

## 🚀 Scripts Disponíveis

- `pnpm dev` - Inicia o servidor em modo de desenvolvimento
- `pnpm build` - Gera build de produção
- `pnpm start` - Inicia o servidor de produção
- `pnpm test` - Executa os testes
- `pnpm test:watch` - Executa os testes em modo watch
- `pnpm test:coverage` - Executa os testes com cobertura
- `pnpm lint` - Executa o linting do código
- `pnpm check-types` - Verifica os tipos TypeScript
- `pnpm db:generate` - Gera o cliente Prisma
- `pnpm db:push` - Sincroniza o schema com o banco
- `pnpm db:migrate` - Executa migrações
- `pnpm db:studio` - Abre o Prisma Studio
- `pnpm db:seed` - Popula o banco com dados iniciais

## 📚 Documentação da API

Quando o servidor estiver rodando, a documentação Swagger estará disponível em:
- **Desenvolvimento:** http://localhost:3333/docs
- **Produção:** Configurável via variável `SWAGGER_PATH`

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Para acessar rotas protegidas:

1. Faça login para obter um token
2. Inclua o token no header `Authorization: Bearer <token>`

## 🧪 Testes

O projeto utiliza Jest para testes unitários e de integração:

```bash
# Executar todos os testes
pnpm test

# Executar testes em modo watch
pnpm test:watch

# Executar testes com cobertura
pnpm test:coverage
```

## 📊 Cobertura de Testes

O projeto mantém uma cobertura mínima de 80% em:
- Branches
- Functions
- Lines
- Statements

## 🔧 Desenvolvimento

### Adicionando Novas Rotas

1. Crie o arquivo de rota em `src/http/routes/`
2. Implemente os handlers com validação Zod
3. Registre a rota no `src/index.ts`
4. Adicione testes correspondentes

### Padrões de Código

- Use TypeScript com tipagem rigorosa
- Siga os padrões do ESLint e Prettier
- Implemente validação com Zod
- Adicione documentação Swagger para todas as rotas
- Escreva testes para novas funcionalidades

## 🌍 Variáveis de Ambiente

Veja o arquivo `.env.example` para todas as variáveis disponíveis.

### Principais Variáveis:

- `DATABASE_URL` - URL de conexão com PostgreSQL
- `JWT_SECRET` - Chave secreta para JWT (mínimo 32 caracteres)
- `PORT` - Porta do servidor (padrão: 3333)
- `NODE_ENV` - Ambiente de execução
- `CORS_ORIGIN` - Origens permitidas para CORS

## 🚀 Deploy

1. **Build da aplicação:**
   ```bash
   pnpm build
   ```

2. **Executar migrações em produção:**
   ```bash
   npx prisma migrate deploy
   ```

3. **Iniciar servidor:**
   ```bash
   pnpm start
   ```

## 📝 Licença

MIT License - veja o arquivo LICENSE para detalhes.