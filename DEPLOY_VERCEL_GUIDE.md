# 🚀 Guia de Deploy - PhotoRestoreNow no Vercel

## ⏰ Quando fazer o deploy?

**DEPOIS** de testar o VanceAI real (conforme combinado).

---

## 📋 Pré-requisitos (Checklist)

Antes de fazer deploy, certifique-se:

- [x] ✅ Build passando (`npm run build`)
- [x] ✅ Animações da home funcionando
- [ ] ⚠️ Testar VanceAI real (2-3 créditos)
- [ ] ⚠️ Configurar variáveis de ambiente de produção
- [ ] ⚠️ Mudar `AI_PROVIDER=vanceai` e `TEST_MODE=false`

---

## 🎯 Passo a Passo - Deploy no Vercel

### FASE 1: Preparar o Repositório GitHub

#### 1. Verificar .gitignore
Certifique-se que estes arquivos **NÃO** vão para o GitHub:
```bash
# Verifique se está no .gitignore:
.env
.env.local
.env.production
node_modules/
.next/
```

#### 2. Commit e Push
```bash
# Se ainda não está no GitHub:
git init
git add .
git commit -m "feat: PhotoRestoreNow completo - pronto para produção"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/photo-restore-now.git
git push -u origin main

# Se já está no GitHub:
git add .
git commit -m "fix: Corrigir animações e preparar para deploy"
git push
```

---

### FASE 2: Criar Conta Vercel

1. Acesse: https://vercel.com
2. Clique em **"Sign Up"**
3. Escolha **"Continue with GitHub"** (recomendado)
4. Autorize a Vercel a acessar seus repositórios

---

### FASE 3: Importar Projeto

1. No dashboard da Vercel, clique em **"Add New..."** → **"Project"**
2. Encontre o repositório `photo-restore-now`
3. Clique em **"Import"**

---

### FASE 4: Configurar Variáveis de Ambiente

**IMPORTANTE:** Configure TODAS estas variáveis no Vercel antes de fazer deploy:

#### Database
```bash
DATABASE_URL=postgresql://user:password@host:5432/database
```
**Onde obter:** Seu provedor de PostgreSQL (Neon, Supabase, Railway, etc.)

#### NextAuth
```bash
NEXTAUTH_URL=https://photorestorenow.com
NEXTAUTH_SECRET=<gerar_novo_secret_seguro>
```
**Como gerar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

#### Google OAuth
```bash
GOOGLE_CLIENT_ID=seu_client_id
GOOGLE_CLIENT_SECRET=seu_client_secret
```
**Onde obter:** https://console.cloud.google.com/apis/credentials

#### Stripe (PRODUCTION - LIVE KEYS!)
```bash
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
**Onde obter:** https://dashboard.stripe.com/apikeys

⚠️ **ATENÇÃO:** Use `sk_live_` e `pk_live_`, NÃO `sk_test_`!

#### Cloudflare R2
```bash
R2_ACCOUNT_ID=3049f44f0995da8502838ffd9d1684d9
R2_ACCESS_KEY_ID=4033c00938267b111b24be1133e6756d
R2_SECRET_ACCESS_KEY=deaa005a9bd763446d758f130b488ba3d8d4b21d93c3a4b1888be20b18564c84
R2_BUCKET_NAME=photo-restore-now
R2_PUBLIC_URL=https://pub-8527f95b897942739888ddf9861f2e8a.r2.dev
USE_R2=true
```

#### VanceAI (MODO REAL!)
```bash
VANCEAI_API_KEY=sua_chave_vanceai
AI_PROVIDER=vanceai
TEST_MODE=false
```
⚠️ **IMPORTANTE:** Mudar de `fake` para `vanceai` e desabilitar TEST_MODE!

#### Resend (Email)
```bash
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@photorestorenow.com
```
**Onde obter:** https://resend.com/api-keys

#### Inngest (Production)
```bash
INNGEST_EVENT_KEY=<production_event_key>
INNGEST_SIGNING_KEY=<production_signing_key>
```
**Onde obter:** https://app.inngest.com → Seu app → Settings → Keys

#### Mixpanel
```bash
MIXPANEL_TOKEN=seu_token_mixpanel
NEXT_PUBLIC_MIXPANEL_TOKEN=seu_token_mixpanel
```
**Onde obter:** https://mixpanel.com/project → Settings → Project Token

#### Admin
```bash
ADMIN_EMAILS=seu_email@dominio.com,outro_admin@dominio.com
```

#### Crisp (Opcional - Chat de suporte)
```bash
NEXT_PUBLIC_CRISP_WEBSITE_ID=seu_website_id
```
**Onde obter:** https://app.crisp.chat/website → Settings → Website ID

---

### FASE 5: Deploy Inicial

1. Após configurar todas as variáveis, clique em **"Deploy"**
2. Aguarde o build (~2-3 minutos)
3. ✅ Se tudo der certo, você verá: **"Deployment completed"**
4. Clique em **"Visit"** para ver seu site ao vivo

Você receberá um domínio temporário tipo:
```
https://photo-restore-now-abc123.vercel.app
```

---

### FASE 6: Configurar Domínio Customizado (photorestorenow.com)

#### 6.1 No Vercel:
1. Vá em **Settings** → **Domains**
2. Clique em **"Add Domain"**
3. Digite: `photorestorenow.com`
4. Digite também: `www.photorestorenow.com`
5. Vercel mostrará os registros DNS necessários

#### 6.2 No seu provedor de domínio:
Configure os seguintes registros DNS:

**Para domínio raiz (photorestorenow.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**Para www:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

⏱️ **Tempo de propagação:** 5 minutos a 48 horas (geralmente ~1 hora)

#### 6.3 Aguardar SSL
- Vercel configura SSL/HTTPS automaticamente
- Aguarde aparecer o cadeado verde 🔒

---

### FASE 7: Configurar Stripe Webhook (PRODUÇÃO)

1. Acesse: https://dashboard.stripe.com/webhooks
2. Clique em **"Add endpoint"**
3. URL: `https://photorestorenow.com/api/webhooks/stripe`
4. Eventos para ouvir:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Clique em **"Add endpoint"**
6. Copie o **Signing Secret** (começa com `whsec_`)
7. Volte ao Vercel → Settings → Environment Variables
8. Atualize `STRIPE_WEBHOOK_SECRET` com o novo valor
9. Redesploy: Settings → Deployments → "..." → Redeploy

---

### FASE 8: Configurar Inngest (Produção)

1. Acesse: https://app.inngest.com
2. No seu app, vá em **Settings** → **Serve**
3. Clique em **"Add Sync URL"**
4. URL: `https://photorestorenow.com/api/inngest`
5. Clique em **"Sync"**
6. Verifique que as funções aparecem:
   - `processRestorationJob`
   - `handleRestorationFailure`

---

### FASE 9: Testes Pós-Deploy

Execute estes testes no site em produção:

#### Teste 1: Upload de Fotos
- [ ] Acesse https://photorestorenow.com
- [ ] Navegue até Pricing
- [ ] Faça upload de 1 foto de teste
- [ ] Verifique se R2 recebeu o upload

#### Teste 2: Pagamento
- [ ] Use cartão de teste: `4242 4242 4242 4242`
- [ ] Expiry: qualquer data futura
- [ ] CVC: qualquer 3 dígitos
- [ ] ZIP: qualquer 5 dígitos
- [ ] Conclua o pagamento

#### Teste 3: Webhook
- [ ] Verifique Stripe Dashboard → Events
- [ ] Confirme que `payment_intent.succeeded` foi recebido
- [ ] Verifique logs da Vercel (Runtime Logs)

#### Teste 4: Job Processing
- [ ] Acesse Inngest Dashboard
- [ ] Verifique se job `processRestorationJob` foi chamado
- [ ] Aguarde conclusão (pode demorar 1-2 min)

#### Teste 5: Email
- [ ] Verifique email de confirmação
- [ ] Verifique email de conclusão (com links de download)

#### Teste 6: Analytics
- [ ] Acesse Mixpanel Dashboard
- [ ] Verifique se eventos foram rastreados:
   - Payment Intent Created
   - Payment Succeeded
   - Job Started
   - Job Completed

#### Teste 7: Admin Dashboard
- [ ] Acesse https://photorestorenow.com/admin/analytics
- [ ] Verifique se dados aparecem
- [ ] Confirme métricas corretas

---

## 🔧 Comandos Úteis Pós-Deploy

### Ver Logs em Tempo Real
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Ver logs
vercel logs photorestorenow.com --follow
```

### Forçar Redesploy
No dashboard Vercel:
1. Settings → Deployments
2. Clique nos "..." do último deploy
3. "Redeploy"

### Reverter Deploy
No dashboard Vercel:
1. Deployments → escolha versão anterior
2. "..." → "Promote to Production"

---

## 🚨 Troubleshooting

### Erro: "Build Failed"
- Verifique logs do build
- Confirme que `npm run build` funciona localmente
- Verifique variáveis de ambiente

### Erro: "Database Connection Failed"
- Verifique `DATABASE_URL`
- Permita IP da Vercel no firewall do banco
- Para PostgreSQL externo, adicione `?connect_timeout=10`

### Erro: "Stripe Webhook Signature Invalid"
- Re-crie webhook no Stripe com URL de produção
- Atualize `STRIPE_WEBHOOK_SECRET`
- Redesploy

### Erro: "VanceAI API Failed"
- Verifique `VANCEAI_API_KEY`
- Confirme créditos disponíveis
- Verifique logs da Inngest

### Domínio não funciona
- Aguarde propagação DNS (até 48h)
- Use https://dnschecker.org para verificar
- Confirme registros A e CNAME corretos

---

## 📊 Monitoramento Pós-Deploy

### Vercel Dashboard
- **Analytics:** Ver tráfego, performance
- **Runtime Logs:** Erros em tempo real
- **Speed Insights:** Performance do site

### Stripe Dashboard
- **Payments:** Transações reais
- **Events:** Webhooks recebidos
- **Customers:** Usuários que pagaram

### Inngest Dashboard
- **Functions:** Status de jobs
- **Runs:** Histórico de execuções
- **Errors:** Falhas para investigar

### Mixpanel Dashboard
- **Events:** Todos os eventos rastreados
- **Funnels:** Conversão de usuários
- **Retention:** Usuários retornando

---

## ✅ Checklist Final

Antes de anunciar publicamente:

- [ ] Site carregando em https://photorestorenow.com
- [ ] SSL/HTTPS funcionando (cadeado verde)
- [ ] Upload de fotos funcionando
- [ ] Pagamento real processando
- [ ] Emails sendo enviados
- [ ] VanceAI restaurando fotos de verdade
- [ ] Admin dashboard acessível
- [ ] Analytics rastreando eventos
- [ ] Política de privacidade atualizada
- [ ] Termos de serviço atualizados
- [ ] Crisp chat configurado (opcional)
- [ ] Testado em mobile
- [ ] Testado em diferentes browsers
- [ ] Backup do banco configurado

---

## 💡 Dicas Finais

1. **Sempre teste primeiro com Stripe test mode** antes de ativar live mode
2. **Mantenha logs da primeira semana** para depuração
3. **Configure alertas no Mixpanel** para erros críticos
4. **Tenha um email de suporte** pronto para responder clientes
5. **Documente problemas comuns** em um FAQ

---

## 🆘 Suporte

Se algo der errado:

1. **Vercel Support:** https://vercel.com/support
2. **Stripe Support:** https://support.stripe.com
3. **Logs da Vercel:** Runtime Logs no dashboard
4. **Documentação:** [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md)

---

**Criado em:** 1 de Março de 2026  
**Status:** Pronto para deploy após testar VanceAI real ✅

