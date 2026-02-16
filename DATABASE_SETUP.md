# Setup de Database Remoto

## Opções de Database PostgreSQL (Gratuitas)

### Opção 1: Neon (Recomendado)

**Vantagens:**
- ✅ 512 MB grátis
- ✅ Serverless (escala automaticamente)
- ✅ Branching (criar cópias para teste)
- ✅ Muito rápido
- ✅ Dashboard limpo

**Passos:**

1. **Criar conta:** [neon.tech](https://neon.tech/)
2. **Create Project:**
   - Name: `photorestorenow`
   - Region: `US East (Ohio)` ou `US East (Virginia)`
   - Database: `photorestore`
3. **Copiar connection string:**
   ```
   postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/photorestore?sslmode=require
   ```
4. **Adicionar ao .env.local:**
   ```env
   DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/photorestore?sslmode=require"
   ```
5. **Aplicar migrations:**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

---

### Opção 2: Supabase

**Vantagens:**
- ✅ 500 MB grátis
- ✅ Inclui Auth, Storage, Realtime
- ✅ Dashboard completo
- ✅ Pausa automática após inatividade (economiza recursos)

**Passos:**

1. **Criar conta:** [supabase.com](https://supabase.com/)
2. **New project:**
   - Name: `photorestorenow`
   - Database Password: (gerar forte)
   - Region: `East US (North Virginia)`
3. **Copiar connection string:**
   - Settings → Database → Connection string → URI
   ```
   postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
4. **Adicionar ao .env.local:**
   ```env
   DATABASE_URL="postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
   ```
5. **Aplicar migrations:**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

---

### Opção 3: Railway (Pago, mas barato)

**Vantagens:**
- ✅ $5 crédito grátis/mês
- ✅ PostgreSQL completo (não limitado)
- ✅ Pode hospedar o app também

**Custo:** ~$5-10/mês após créditos

**Passos:**

1. **Criar conta:** [railway.app](https://railway.app/)
2. **New Project** → **Provision PostgreSQL**
3. **Copiar connection string** (aba Connect)
4. **Adicionar ao .env.local**
5. **Aplicar migrations**

---

## Comparação

| Feature | Neon | Supabase | Railway |
|---------|------|----------|---------|
| **Storage Grátis** | 512 MB | 500 MB | $5 crédito |
| **Conexões** | Ilimitadas | 60 simultâneas | Ilimitadas |
| **Pausa automática** | ❌ Sempre ativo | ✅ Pausa | ❌ Sempre ativo |
| **Branching** | ✅ Sim | ❌ Não | ❌ Não |
| **Performance** | ⚡ Muito rápida | ⚡ Rápida | ⚡ Muito rápida |
| **Dashboard** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Custo após free** | $19/mês | $25/mês | $5/mês |

**Recomendação:** Use **Neon** para começar. É o mais simples e performático.

---

## Migrar de Local para Remoto

### 1. Backup Database Local (Opcional)

```bash
# Dump local database
docker exec postgres pg_dump -U photorestore photorestore > backup.sql

# Restore para remoto (se necessário)
psql "postgresql://user:password@host/photorestore?sslmode=require" < backup.sql
```

### 2. Atualizar .env.local

Substituir:
```env
DATABASE_URL=postgresql://photorestore:photorestore_dev@localhost:5432/photorestore
```

Por (exemplo Neon):
```env
DATABASE_URL=postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/photorestore?sslmode=require
```

### 3. Aplicar Migrations

```bash
# Aplicar migrations
npx prisma migrate deploy

# Regenerar Prisma Client
npx prisma generate

# Verificar conexão
npx prisma studio
```

### 4. Testar Aplicação

```bash
# Reiniciar dev server
npm run dev

# Testar:
# 1. Login Google
# 2. Guest checkout
# 3. Criar pedido
# 4. Verificar no Prisma Studio (apontando para remoto)
```

---

## Configurar para Vercel

### Environment Variables (Produção)

Na Vercel, adicionar:

```env
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/photorestore?sslmode=require
```

**Importante:** Usar connection string com `sslmode=require` em produção.

### Build Command

Vercel automaticamente executa:
```bash
prisma generate && next build
```

Definido em `package.json`:
```json
"scripts": {
  "build": "prisma generate && next build"
}
```

---

## Monitoramento

### Neon Dashboard
- **Queries:** Dashboard → Metrics
- **Storage:** Dashboard → Storage
- **Conexões:** Dashboard → Operations

### Supabase Dashboard
- **Queries:** Database → Query Performance
- **Storage:** Settings → Database
- **Logs:** Logs → PostgreSQL

### Prisma Studio (Remoto)

```bash
# Apontar para database remoto
export DATABASE_URL="postgresql://..."
npx prisma studio
```

Abre em `http://localhost:5555` com dados de produção.

---

## Troubleshooting

### Erro: "Can't reach database"
- Verificar firewall/IP whitelist (Neon e Supabase permitem todos IPs por padrão)
- Verificar connection string (copiar novamente)
- Testar com `psql` ou TablePlus

### Erro: "SSL required"
- Adicionar `?sslmode=require` no final da connection string
- Ou configurar no Prisma schema:
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
    shadowDatabaseUrl = env("SHADOW_DATABASE_URL") // Para migrations
  }
  ```

### Migrations não aplicam
- Usar `npx prisma migrate deploy` (não `dev`)
- Verificar se schema.prisma está atualizado
- Reset (CUIDADO - apaga dados): `npx prisma migrate reset`

### Performance lenta
- Neon/Supabase podem ter cold start (primeira query lenta)
- Considerar connection pooling: [Prisma Accelerate](https://www.prisma.io/accelerate)
- Ou usar PgBouncer (incluído no Supabase)

---

## Próximos Passos

1. ✅ Escolher provider (Neon recomendado)
2. ✅ Criar database remoto
3. ✅ Atualizar DATABASE_URL
4. ✅ Aplicar migrations
5. ✅ Testar localmente
6. ⏳ Configurar na Vercel
7. ⏳ Deploy e testar em produção
