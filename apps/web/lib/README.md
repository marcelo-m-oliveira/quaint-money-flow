# Estrutura do Diretório `lib`

Este diretório contém toda a lógica de negócio, tipos, serviços e utilitários do frontend.

## 📁 Organização

### `/types.ts` - Tipos Centralizados
Todos os tipos TypeScript estão centralizados neste arquivo, organizados por categoria:

- **Tipos Base**: Entidades principais (`Category`, `Entry`, `Account`, etc.)
- **Tipos de Formulário**: Para entrada de dados (`EntryFormData`, `CategoryFormData`, etc.)
- **Tipos de Serviço**: Para APIs e queries (`ApiResponse`, `PaginatedResponse`, etc.)
- **Tipos de Query**: Para parâmetros de busca (`EntriesQueryParams`, etc.)
- **Tipos de Resposta**: Para respostas específicas de APIs (`EntriesResponse`, etc.)
- **Tipos Específicos**: Para casos de uso específicos (`CategoryUsage`, etc.)
- **Tipos de Utilidade**: Para hooks e componentes (`PeriodType`, `CrudToastType`, etc.)

### `/services/` - Serviços de API
Cada serviço importa os tipos centralizados e não define tipos próprios:

- `categories.ts` - Operações com categorias
- `entries.ts` - Operações com lançamentos
- `accounts.ts` - Operações com contas
- `credit-cards.ts` - Operações com cartões de crédito
- `user-preferences.ts` - Operações com preferências do usuário

### `/hooks/` - Hooks Customizados
Hooks que usam os tipos centralizados:

- `use-preferences.ts` - Gerenciamento de preferências locais
- `use-user-preferences.ts` - Gerenciamento de preferências com auto-inicialização
- `use-infinite-scroll.ts` - Scroll infinito (tipos específicos mantidos)
- `use-crud-toast.ts` - Notificações de CRUD

### `/contexts/` - Contextos React
Contextos para gerenciamento de estado global.

### `/data/` - Dados Estáticos
Dados como ícones de bancos, configurações, etc.

### `/utils/` - Utilitários
Funções utilitárias e helpers.

## 🔄 Padrões de Data

**IMPORTANTE**: Todos os timestamps são padronizados como `number` (segundos desde epoch):

- **Frontend → Backend**: Datas são enviadas como `string` nos formulários e convertidas para `number` antes do envio
- **Backend → Frontend**: Datas são recebidas como `number` (timestamp em segundos)
- **Interno**: Todas as operações internas usam `number`

## 📦 Importações

### Importação Direta (Recomendada)
```typescript
import type { Entry, EntryFormData } from '@/lib/types'
import { entriesService } from '@/lib/services/entries'
```

### Importação Centralizada
```typescript
import type { Entry, EntryFormData } from '@/lib'
import { entriesService } from '@/lib'
```

## 🚫 Regras Importantes

1. **NÃO** defina tipos duplicados em arquivos de serviço
2. **NÃO** use tipos inconsistentes para datas
3. **SEMPRE** importe tipos do arquivo centralizado
4. **MANTENHA** a organização por categorias no `types.ts`

## 🔧 Manutenção

Ao adicionar novos tipos:
1. Adicione no arquivo `types.ts` na seção apropriada
2. Atualize o arquivo `index.ts` se necessário
3. Use `import type` para importações de tipos
4. Mantenha a documentação atualizada
