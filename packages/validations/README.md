# Schemas de Validação - Estrutura Padronizada

Este pacote fornece uma estrutura padronizada e consistente para validação de dados em toda a aplicação, seguindo as melhores práticas de API design.

## 🏗️ Estrutura dos Schemas

### 1. Schemas Base (`*BaseSchema`)
Contêm apenas os campos essenciais da entidade, sem campos de sistema ou relacionamentos.

```typescript
export const transactionBaseSchema = z.object({
  description: z.string().min(3).max(100),
  amount: z.string(),
  type: z.enum(['income', 'expense']),
  // ... outros campos essenciais
})
```

### 2. Schemas de Request (`*CreateSchema`, `*UpdateSchema`)
- **Create**: Para criação de novas entidades (todos os campos obrigatórios)
- **Update**: Para atualização (todos os campos opcionais usando `.partial()`)

```typescript
export const transactionCreateSchema = transactionBaseSchema
export const transactionUpdateSchema = transactionBaseSchema.partial()
```

### 3. Schemas de Response (`*ResponseSchema`)
Estendem o schema base com campos de sistema e relacionamentos populados.

```typescript
export const transactionResponseSchema = transactionBaseSchema.extend({
  id: z.string(),
  userId: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  category: z.object({ /* dados da categoria */ }).optional(),
  account: z.object({ /* dados da conta */ }).optional(),
})
```

### 4. Schemas Compostos
Para respostas que incluem listas paginadas ou dados agregados.

```typescript
export const transactionListResponseSchema = z.object({
  transactions: z.array(transactionResponseSchema),
  pagination: paginationSchema,
})
```

## 📋 Padrão de Nomenclatura

| Tipo | Prefixo | Exemplo |
|------|---------|---------|
| Base | `*BaseSchema` | `transactionBaseSchema` |
| Criação | `*CreateSchema` | `transactionCreateSchema` |
| Atualização | `*UpdateSchema` | `transactionUpdateSchema` |
| Resposta | `*ResponseSchema` | `transactionResponseSchema` |
| Lista | `*ListResponseSchema` | `transactionListResponseSchema` |
| Filtros | `*FiltersSchema` | `transactionFiltersSchema` |

## 🔄 Fluxo de Dados

```
Frontend → API Request → Schema Validation → Business Logic → Database
   ↑                                                              ↓
   ← API Response ← Schema Validation ← Data Transformation ← Database
```

### Exemplo de Uso nas Rotas

```typescript
// POST /transactions - Criar transação
app.post('/', {
  schema: {
    body: transactionCreateSchema,        // Validação do request
    response: {
      201: transactionResponseSchema,     // Validação da resposta
      401: z.object({ error: z.string() }),
    },
  },
}, transactionController.store)
```

## 🎯 Benefícios da Estrutura

1. **Consistência**: Todos os endpoints seguem o mesmo padrão
2. **Reutilização**: Schemas base são reutilizados em diferentes contextos
3. **Manutenibilidade**: Mudanças em um lugar se propagam automaticamente
4. **Type Safety**: TypeScript infere tipos corretos em toda a aplicação
5. **Documentação**: Schemas servem como documentação da API
6. **Validação**: Validação automática de entrada e saída

## 📝 Exemplos de Implementação

### Schema Base
```typescript
export const accountBaseSchema = z.object({
  name: z.string().min(2).max(50),
  type: z.enum(['bank', 'investment', 'cash', 'other']),
  icon: z.string(),
  includeInGeneralBalance: z.boolean(),
})
```

### Schema de Criação
```typescript
export const accountCreateSchema = accountBaseSchema
```

### Schema de Atualização
```typescript
export const accountUpdateSchema = accountBaseSchema.partial()
```

### Schema de Resposta
```typescript
export const accountResponseSchema = accountBaseSchema.extend({
  id: z.string(),
  userId: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  balance: z.number().optional(),
})
```

### Schema de Lista
```typescript
export const accountListResponseSchema = z.object({
  accounts: z.array(accountResponseSchema),
  pagination: paginationSchema,
})
```

## 🚀 Migração de Schemas Antigos

Para manter compatibilidade durante a transição, os schemas antigos ainda estão disponíveis como aliases:

```typescript
// @deprecated - Use transactionCreateSchema instead
export const transactionSchema = transactionCreateSchema

// @deprecated - Use TransactionCreateSchema instead
export type TransactionFormSchema = TransactionCreateSchema
```

**Recomendação**: Migre gradualmente para os novos schemas e remova os aliases em versões futuras.

## 🔧 Schemas Especiais

### Paginação
```typescript
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})
```

### Filtros
```typescript
export const transactionFiltersSchema = z
  .object({
    type: z.enum(['income', 'expense']).optional(),
    categoryId: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  })
  .merge(paginationSchema)
```

### Parâmetros de ID
```typescript
export const idParamSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
})
```

## 📚 Uso nos Controllers

```typescript
export class TransactionController {
  async store(request: FastifyRequest, reply: FastifyReply) {
    // O tipo é automaticamente inferido do schema
    const data: TransactionCreateSchema = request.body
    
    const transaction = await this.transactionService.create(data)
    
    // A resposta é automaticamente validada
    return reply.status(201).send(transaction)
  }
}
```

## 🧪 Testes

Os schemas podem ser facilmente testados:

```typescript
describe('Transaction Schemas', () => {
  it('should validate valid transaction data', () => {
    const validData = {
      description: 'Test transaction',
      amount: '100.50',
      type: 'expense' as const,
      categoryId: 'cat-123',
      date: '2024-01-01',
      paid: true,
    }
    
    const result = transactionCreateSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })
  
  it('should reject invalid transaction data', () => {
    const invalidData = {
      description: '', // Muito curto
      amount: 'invalid', // Não é número
      type: 'invalid' as any, // Tipo inválido
    }
    
    const result = transactionCreateSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})
```

## 🔮 Próximos Passos

1. **Implementar schemas para novas entidades** seguindo o padrão estabelecido
2. **Adicionar validações customizadas** usando `.refine()` quando necessário
3. **Criar schemas para endpoints especiais** (estatísticas, relatórios, etc.)
4. **Implementar transformações automáticas** de dados usando `.transform()`
5. **Adicionar schemas para uploads** de arquivos e imagens
6. **Criar schemas para webhooks** e integrações externas

---

Esta estrutura garante que sua API seja consistente, tipada e fácil de manter, proporcionando uma excelente experiência para desenvolvedores e usuários. 