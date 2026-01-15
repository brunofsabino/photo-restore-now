# Admin Dashboard & Analytics Setup Guide

## 🎯 O que foi implementado:

### 1. **Admin Dashboard** (`/admin`)
- ✅ Listagem de todos os pedidos
- ✅ Estatísticas em tempo real (pedidos, receita, usuários)
- ✅ Filtros por status (pending, processing, completed)
- ✅ **Segurança robusta** - Apenas emails autorizados

### 2. **Mixpanel Analytics**
- ✅ Tracking automático de páginas
- ✅ Identificação de usuários
- ✅ Eventos customizados prontos
- ✅ Funil de conversão

### 3. **Crisp Customer Support**
- ✅ Chat ao vivo
- ✅ Email integrado (support@photorestorenow.com)
- ✅ Dados do usuário automaticamente enviados

---

## 📋 Setup Passo a Passo

### 1. Mixpanel (Analytics Gratuito)

**a) Criar conta:**
1. Acesse: https://mixpanel.com
2. Clique em "Start for Free"
3. Crie sua conta

**b) Obter token:**
1. Após login, vá em **Settings** → **Project Settings**
2. Copie o **Project Token**

**c) Configurar no projeto:**
```bash
# No .env.local, substitua:
NEXT_PUBLIC_MIXPANEL_TOKEN=seu_token_aqui
```

**d) Testar:**
- Navegue pelo site
- Vá em Mixpanel → **Activity** → **Live View**
- Você verá eventos em tempo real! 🎉

---

### 2. Crisp (Suporte ao Cliente Gratuito)

**a) Criar conta:**
1. Acesse: https://crisp.chat
2. Clique em "Sign up free"
3. Crie sua conta

**b) Criar website:**
1. Após login, clique em "Add a website"
2. Nome: PhotoRestoreNow
3. URL: photorestorenow.com

**c) Obter Website ID:**
1. Vá em **Settings** → **Website Settings** → **Setup**
2. Você verá um código como:
```javascript
window.CRISP_WEBSITE_ID = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx";
```
3. Copie apenas o ID (entre aspas)

**d) Configurar no projeto:**
```bash
# No .env.local, substitua:
NEXT_PUBLIC_CRISP_WEBSITE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**e) Configurar email personalizado:**
1. No Crisp, vá em **Settings** → **Email Settings**
2. Configure: `support@photorestorenow.com`
3. Siga instruções de verificação de DNS

**f) Testar:**
- Acesse o site
- Widget de chat aparecerá no canto inferior direito
- Envie uma mensagem de teste
- Você recebe no Crisp inbox!

---

### 3. Admin Dashboard (Já Configurado!)

**a) Segurança:**
O admin está protegido por:
1. ✅ Autenticação NextAuth (precisa estar logado)
2. ✅ Lista de emails autorizados
3. ✅ Logging de tentativas de acesso
4. ✅ Verificação em todas as APIs

**b) Adicionar administradores:**
```bash
# No .env.local:
ADMIN_EMAILS=brunoferrazsabino@gmail.com,outro@email.com,mais@email.com
```

**c) Acessar:**
1. Faça login no site com sua conta Google
2. Acesse: http://localhost:3000/admin
3. Se seu email não estiver na lista: "Access Denied"
4. Se estiver autorizado: Dashboard completo! 🎉

---

## 🎨 O que aparece no Admin Dashboard:

### Cards de Estatísticas:
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Total Orders│   Revenue   │ Total Users │  Completed  │
│     15      │  $1,499.50  │     42      │     12      │
│ 2 processing│     USD     │ Registered  │  1 failed   │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### Tabela de Pedidos:
| Order ID | Customer | Package | Photos | Amount | Status | Date |
|----------|----------|---------|--------|--------|--------|------|
| cmka1l6c | John Doe | Family  | 3      | $39.98 | processing | Jan 11 |
| cmka1qhi | Jane Smith | Basic | 1      | $15.98 | completed | Jan 11 |

### Filtros:
- **All** - Todos os pedidos
- **Pending** - Aguardando processamento
- **Processing** - Em andamento
- **Completed** - Concluídos

---

## 📊 Eventos do Mixpanel (Já Implementados):

### Automáticos:
- ✅ Page View (todas as páginas)
- ✅ User Signed Up
- ✅ User Signed In
- ✅ User Signed Out

### Para Implementar (exemplos):
```typescript
import { trackEvent, MixpanelEvents } from '@/lib/mixpanel';

// Quando usuário seleciona pacote
trackEvent(MixpanelEvents.SELECTED_PACKAGE, {
  packageId: '3-photos',
  price: 39.98,
});

// Quando faz upload
trackEvent(MixpanelEvents.UPLOADED_PHOTO, {
  photoCount: 3,
});

// Quando pagamento sucede
trackRevenue(3998, 'order_id_123', {
  packageId: '3-photos',
  photoCount: 3,
});
```

---

## 🔐 Segurança do Admin:

### Camadas de Proteção:

1. **NextAuth Session**
```typescript
const session = await getServerSession();
if (!session?.user?.email) {
  return 401 Unauthorized
}
```

2. **Email Whitelist**
```typescript
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || [];
if (!ADMIN_EMAILS.includes(session.user.email)) {
  return 403 Forbidden
}
```

3. **Security Logging**
```typescript
logger.security('Non-admin user attempted access', {
  email: session.user.email,
  ip: request.ip,
});
```

4. **API Protection**
- Todas as APIs `/api/admin/*` verificam permissões
- Retornam 401/403 se não autorizado

---

## 🚀 Testando Agora:

### 1. Testar Admin Dashboard:
```bash
# Já rodando em:
http://localhost:3000/admin

# Faça login com: brunoferrazsabino@gmail.com
# Você verá o dashboard completo!
```

### 2. Testar Mixpanel (após configurar):
```bash
# Navegue pelo site
# Vá no Mixpanel → Activity → Live View
# Veja eventos em tempo real
```

### 3. Testar Crisp (após configurar):
```bash
# Widget de chat aparece no canto direito
# Envie mensagem de teste
# Responda no Crisp inbox
```

---

## 📱 Em Produção:

### URLs a Configurar:

**Admin:**
- https://photorestorenow.com/admin

**Crisp Email:**
- support@photorestorenow.com
- (Configurar DNS: MX, SPF, DKIM)

**Mixpanel:**
- Funciona automaticamente
- Trocar de Project (Test → Production)

---

## 💡 Próximos Passos Opcionais:

### 1. Notion Integration (Kanban Visual)
```bash
npm install @notionhq/client
# Sincroniza pedidos com Notion Database
```

### 2. Webhooks do Crisp
```bash
# Recebe notificações quando cliente envia mensagem
POST /api/webhooks/crisp
```

### 3. Alertas Slack/Discord
```bash
# Notifica quando:
- Novo pedido
- Pagamento falha
- Cliente envia mensagem
```

---

## 📝 Checklist de Configuração:

```markdown
□ Criar conta Mixpanel
□ Copiar Project Token
□ Adicionar token no .env.local
□ Testar eventos no Mixpanel Live View

□ Criar conta Crisp
□ Copiar Website ID
□ Adicionar ID no .env.local
□ Testar chat widget no site

□ Verificar email admin no .env.local
□ Fazer login no site
□ Acessar /admin
□ Ver dashboard funcionando

□ (Opcional) Configurar domínio Crisp
□ (Opcional) Adicionar mais admins
□ (Opcional) Criar dashboards custom no Mixpanel
```

---

## 🆘 Troubleshooting:

### "Access Denied" no Admin:
- ✅ Verifique se está logado
- ✅ Confira se seu email está em `ADMIN_EMAILS`
- ✅ Reinicie o servidor após mudar .env.local

### Mixpanel não rastreia:
- ✅ Verifique se `NEXT_PUBLIC_MIXPANEL_TOKEN` está preenchido
- ✅ Abra DevTools → Console (procure por "Mixpanel initialized")
- ✅ Vá no Mixpanel → Activity → Live View

### Crisp não aparece:
- ✅ Verifique se `NEXT_PUBLIC_CRISP_WEBSITE_ID` está preenchido
- ✅ Aguarde 5-10 segundos após carregar página
- ✅ Veja se não está bloqueado por AdBlock

---

## 📞 Support:

Se tiver dúvidas:
- Mixpanel Docs: https://docs.mixpanel.com
- Crisp Docs: https://docs.crisp.chat
- Código: `lib/mixpanel.ts`, `components/CrispProvider.tsx`
