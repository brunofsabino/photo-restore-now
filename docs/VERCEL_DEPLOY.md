# Guia de Deploy na Vercel

## Pré-requisitos

1. **Conta no GitHub** (já tem - projeto em `brunofsabino/photo-restore-now`)
2. **Conta na Vercel** (criar em [vercel.com](https://vercel.com))
3. **Cloudflare R2** configurado (storage de imagens)
4. **Neon ou Supabase** configurado (database PostgreSQL)

---

## Passo 1: Configurar Cloudflare R2

### 1.1 Criar Bucket R2

1. Acesse [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Sidebar → **R2 Object Storage**
3. **Create bucket** → Nome: `photo-restore-now`
4. Região: **Automatic** (mais barato)

### 1.2 Gerar Credenciais API

1. R2 → **Manage R2 API Tokens**
2. **Create API Token**
   - Token name: `photorestorenow-production`
   - Permissions: **Object Read & Write**
   - Bucket: `photo-restore-now`
3. **Copiar e salvar:**
   - `Access Key ID` → será `R2_ACCESS_KEY_ID`
   - `Secret Access Key` → será `R2_SECRET_ACCESS_KEY`
   - `Account ID` (no topo da página) → será `R2_ACCOUNT_ID`

### 1.3 Configurar Domínio Público (Opcional)

1. Bucket settings → **Public Access**
2. **Enable Public Access**
3. Copiar URL público: `https://pub-xxxxxxxxxxxx.r2.dev`
4. Guardar como `R2_PUBLIC_URL`

---

## Passo 2: Configurar Database (Neon - Recomendado)

### 2.1 Criar Database no Neon

1. Acesse [neon.tech](https://neon.tech/)
2. **Sign up** (grátis - 512 MB)
3. **Create Project**
   - Name: `photorestorenow`
   - Region: **US East (Ohio)** (mais próximo do público US)
   - Database: `photorestore`

### 2.2 Obter Connection String

1. Dashboard → **Connection Details**
2. Copiar **Connection string**:
   ```
   postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/photorestore?sslmode=require
   ```
3. Guardar como `DATABASE_URL`

---

## Passo 3: Deploy na Vercel

### 3.1 Conectar GitHub à Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. **Import Git Repository**
3. Selecione: `brunofsabino/photo-restore-now`
4. **Import**

### 3.2 Configurar Environment Variables

Na página de configuração do projeto, adicione:

```env
# General
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://photorestorenow.com

# NextAuth
NEXTAUTH_URL=https://photorestorenow.com
NEXTAUTH_SECRET=<gerar_com_openssl_rand_base64_32>

# Database (Neon)
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/photorestore?sslmode=require

# Cloudflare R2
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=photo-restore-now
R2_PUBLIC_URL=https://pub-xxxxxxxxxxxx.r2.dev

# Stripe (usar chaves de produção quando pronto)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (configurar depois)

# Email (Resend)
RESEND_API_KEY=re_7D7hfPoW_2kpvxs2H6sMa8n1QPvFPn2kM
RESEND_FROM_EMAIL=support@photorestorenow.com

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI Provider (manter fake até configurar VanceAI)
AI_PROVIDER=fake

# Test Mode (desabilitar em produção)
TEST_MODE=false
```

### 3.3 Deploy

1. **Deploy** (Vercel vai buildar automaticamente)
2. Aguardar build (~2-3 minutos)
3. URL temporária: `https://photo-restore-now-xxxxx.vercel.app`

---

## Passo 4: Configurar Custom Domain

### 4.1 Adicionar Domínio na Vercel

1. Vercel Dashboard → **Settings** → **Domains**
2. **Add Domain**: `photorestorenow.com`
3. Vercel vai mostrar DNS records para adicionar

### 4.2 Atualizar DNS no Namecheap

1. Acesse [Namecheap](https://ap.www.namecheap.com/)
2. Manage domain `photorestorenow.com`
3. **Advanced DNS** → Add Records:

**A Record:**
```
Type: A
Host: @
Value: 76.76.21.21 (IP da Vercel)
TTL: Automatic
```

**CNAME Record:**
```
Type: CNAME
Host: www
Value: cname.vercel-dns.com
TTL: Automatic
```

4. **Save**
5. Aguardar propagação (5-30 minutos)

### 4.3 Verificar SSL

1. Vercel automaticamente provisiona SSL (Let's Encrypt)
2. Aguardar "Valid Configuration" no dashboard
3. Testar: `https://photorestorenow.com`

---

## Passo 5: Configurar Stripe Webhook (Produção)

### 5.1 Criar Webhook Endpoint

1. [Stripe Dashboard](https://dashboard.stripe.com/) → **Developers** → **Webhooks**
2. **Add endpoint**
   - URL: `https://photorestorenow.com/api/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
3. **Add endpoint**
4. Copiar **Signing secret** (começa com `whsec_`)

### 5.2 Atualizar Environment Variable

1. Vercel → **Settings** → **Environment Variables**
2. Editar `STRIPE_WEBHOOK_SECRET`
3. Colar novo webhook secret de produção
4. **Save** → **Redeploy**

---

## Passo 6: Migrar Database

### 6.1 Aplicar Migrations no Neon

Execute localmente:

```bash
# Apontar para database de produção
export DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/photorestore?sslmode=require"

# Aplicar migrations
npx prisma migrate deploy

# Gerar Prisma Client
npx prisma generate
```

### 6.2 Verificar Tabelas

```bash
# Abrir Prisma Studio apontando para produção
npx prisma studio
```

Verificar se tabelas foram criadas: `User`, `Account`, `Session`, `Order`, `OrderImage`

---

## Passo 7: Testar Aplicação

### 7.1 Smoke Test

1. **Homepage:** `https://photorestorenow.com` → Deve carregar
2. **Login Google:** Testar OAuth → Deve redirecionar
3. **Guest Checkout:** Inserir email → Deve funcionar
4. **Upload:** Selecionar foto → Deve aceitar (R2)
5. **Payment:** Usar cartão teste Stripe:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`
6. **Webhook:** Verificar se pedido foi criado no database
7. **Email:** Confirmar recebimento de email de confirmação

### 7.2 Verificar Logs

Vercel Dashboard → **Deployments** → **Logs**

Procurar por erros ou warnings.

---

## Resumo de Custos

**Plano FREE (início):**
- ✅ Vercel Hobby: **$0/mês**
- ✅ Neon Free Tier: **$0/mês** (512 MB)
- ✅ Cloudflare R2: **$0/mês** (primeiros 10 GB)
- ✅ Resend: **$0/mês** (100 emails/dia)
- ✅ Stripe: **2.9% + $0.30** por transação

**Total mensal estimado: $0-2/mês** (custos mínimos de R2 se ultrapassar 10 GB)

---

## Próximos Passos

1. ✅ Deploy concluído
2. ⏳ Testar fluxo completo
3. ⏳ Configurar VanceAI (AI real)
4. ⏳ Monitorar métricas (Vercel Analytics)
5. ⏳ Upgrade para Vercel Pro quando tiver vendas ($20/mês)

---

## Troubleshooting

### Build Error: "Module not found"
- Verificar se `package.json` está atualizado
- Commit e push novamente

### Database Connection Error
- Verificar `DATABASE_URL` nas env vars
- Testar conexão localmente: `npx prisma db push`

### Webhook não chega
- Verificar URL no Stripe Dashboard
- Testar manualmente: `stripe trigger payment_intent.succeeded`

### R2 Upload Error
- Verificar credenciais R2
- Testar permissões do bucket (Read & Write)

### Email não enviado
- Verificar `RESEND_API_KEY`
- Confirmar domínio verificado no Resend

---

## Suporte

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Neon Docs:** [neon.tech/docs](https://neon.tech/docs)
- **R2 Docs:** [developers.cloudflare.com/r2](https://developers.cloudflare.com/r2)
- **Stripe Webhooks:** [stripe.com/docs/webhooks](https://stripe.com/docs/webhooks)
