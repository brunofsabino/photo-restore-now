# Configuração OAuth (Opcional)

Este guia explica como configurar os provedores OAuth (Google e Facebook) para seu aplicativo PhotoRestoreNow.

**⚠️ IMPORTANTE:** A autenticação OAuth é **OPCIONAL**. O aplicativo já funciona perfeitamente com o sistema de **Guest Checkout** (checkout como convidado), onde os usuários só precisam fornecer um email.

## Por que usar OAuth?

- Permite que usuários façam login com suas contas Google/Facebook
- Melhor experiência para usuários recorrentes
- Gerenciamento automático de perfis e sessões
- Não é necessário para funcionalidade básica

## Como funciona atualmente (sem OAuth)

1. Usuário escolhe um plano em `/pricing`
2. É redirecionado para `/auth/signin`
3. Clica em "Continue without account"
4. Insere seu email (e opcionalmente nome)
5. Continua para upload e checkout normalmente

## Configurando Google OAuth

### 1. Criar projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá para **APIs & Services > Credentials**

### 2. Configurar OAuth Consent Screen

1. Clique em **OAuth consent screen**
2. Escolha **External** (ou Internal se for workspace)
3. Preencha as informações básicas:
   - Nome do app: PhotoRestoreNow
   - Email de suporte: seu email
   - Logo (opcional)
4. Adicione escopos: `userinfo.email` e `userinfo.profile`
5. Adicione seus emails de teste

### 3. Criar credenciais OAuth 2.0

1. Vá para **Credentials > Create Credentials > OAuth 2.0 Client ID**
2. Tipo de aplicativo: **Web application**
3. Nome: PhotoRestoreNow
4. **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://seu-dominio.com
   ```
5. **Authorized redirect URIs:**
   ```
   http://localhost:3000/api/auth/callback/google
   https://seu-dominio.com/api/auth/callback/google
   ```
6. Clique em **Create**
7. Copie o **Client ID** e **Client Secret**

### 4. Adicionar ao .env.local

```env
GOOGLE_CLIENT_ID=seu_client_id_aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
```

## Configurando Facebook OAuth

### 1. Criar App no Facebook Developers

1. Acesse [Facebook Developers](https://developers.facebook.com/)
2. Clique em **My Apps > Create App**
3. Escolha **Consumer** como tipo de app
4. Preencha os detalhes do app

### 2. Configurar Facebook Login

1. No dashboard do app, adicione o produto **Facebook Login**
2. Escolha **Web** como plataforma
3. Configure:
   - Site URL: `http://localhost:3000` (desenvolvimento)
   - Valid OAuth Redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/facebook
     https://seu-dominio.com/api/auth/callback/facebook
     ```

### 3. Obter credenciais

1. Vá para **Settings > Basic**
2. Copie o **App ID** e **App Secret**

### 4. Adicionar ao .env.local

```env
FACEBOOK_CLIENT_ID=seu_app_id_aqui
FACEBOOK_CLIENT_SECRET=seu_app_secret_aqui
```

## Arquivo .env.local completo (com OAuth configurado)

```env
# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://photorestore:photorestore_dev@postgres:5432/photorestore

# Redis
REDIS_URL=redis://redis:6379

# Storage
STORAGE_PATH=./uploads

# NextAuth - Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=8f3e7a9b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0

# Google OAuth (CONFIGURADO)
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456

# Facebook OAuth (CONFIGURADO)
FACEBOOK_CLIENT_ID=1234567890123456
FACEBOOK_CLIENT_SECRET=abcdef123456789abcdef123456789ab

# Payment - Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# AI Providers
AI_PROVIDER=fake
VANCEAI_API_KEY=your_vanceai_api_key
VANCEAI_API_URL=https://api-service.vanceai.com
HOTPOT_API_KEY=your_hotpot_api_key
HOTPOT_API_URL=https://api.hotpot.ai

# Email - Resend
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=noreply@photorestorenow.com

# Test Mode
TEST_MODE=true
```

## Testando

1. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Acesse `/auth/signin`

3. Os botões "Continue with Google" e "Continue with Facebook" agora devem funcionar!

## Solução de Problemas

### Erro: "redirect_uri_mismatch"
- Verifique se as URLs de redirect estão corretas no console do provedor
- Certifique-se de que `NEXTAUTH_URL` está correto no `.env.local`

### Erro: "Configuration Error"
- Verifique se o `NEXTAUTH_SECRET` está definido
- Confirme que Client ID e Secret estão corretos

### Botão não responde
- Verifique o console do navegador para erros
- Certifique-se de que todas as variáveis de ambiente estão carregadas
- Reinicie o servidor após alterar o `.env.local`

## Desabilitando OAuth

Se você quiser desabilitar temporariamente o OAuth e usar apenas Guest Checkout:

1. Deixe as variáveis OAuth com valores placeholder no `.env.local`:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   FACEBOOK_CLIENT_ID=your_facebook_app_id
   FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
   ```

2. Os usuários ainda podem usar "Continue without account" normalmente

3. Os botões OAuth serão exibidos mas mostrarão erro se clicados (o que está OK para desenvolvimento)

## Produção

Para produção, certifique-se de:

1. Usar URLs HTTPS nas configurações OAuth
2. Adicionar domínio de produção nas URLs autorizadas
3. Atualizar `NEXTAUTH_URL` com a URL de produção
4. Publicar o app OAuth (remover modo teste) no Google/Facebook
5. Configurar domínio verificado no Facebook
