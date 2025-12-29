# 🧪 Guia de Testes - PhotoRestoreNow

## ✅ Status: Você já executou

- ✅ `npm install next-auth @auth/prisma-adapter`
- ✅ `npm install @prisma/client prisma -D`
- ✅ `npx prisma migrate dev --name init`
- ✅ `npx prisma generate`
- ✅ `npm run dev`

---

## 🎯 3 Cenários de Teste

### **Cenário 1: Teste COMPLETO sem APIs Externas** ⭐ RECOMENDADO

**Configuração atual no `.env.local`:**
```env
AI_PROVIDER=fake          # Usa provider de simulação
TEST_MODE=true            # Bypass do Stripe
```

**O que funciona:**
- ✅ Upload de fotos
- ✅ "Restauração" simulada (retorna mesma imagem)
- ✅ Fluxo completo sem pagamento
- ✅ Emails (se configurar Resend)

**Como testar:**

#### **Fase 1 - Teste de IA Isolado:**
```bash
# Web Interface
http://localhost:3000/test-upload

# Ou via API
curl -X POST http://localhost:3000/api/test-restore \
  -F "image=@/path/to/photo.jpg" \
  -F "provider=fake"
```

#### **Fase 2 - Fluxo Completo:**
```bash
# Web Interface  
http://localhost:3000/test-order

# Ou via API
# Ver arquivo test-requests.http linhas 58-75
```

**Vantagens:**
- ✅ Sem custos
- ✅ Sem configuração externa
- ✅ Teste instantâneo
- ✅ Desenvolvimento rápido

---

### **Cenário 2: Teste COM APIs Reais de IA (Sem Stripe)**

**Necessário:**
- Criar conta em VanceAI OU Hotpot AI
- Configurar API key

#### **VanceAI (Recomendado para começar)**

**1. Criar conta:**
- Acesse: https://vanceai.com/
- Sign Up (gratuito)
- Vai para Dashboard > API Keys

**2. Planos:**
- **GRÁTIS**: 3 créditos (3 fotos)
- **$9.90**: 100 créditos
- **$19.90**: 200 créditos

**3. Configurar:**
Edite `.env.local`:
```env
AI_PROVIDER=vanceai
VANCEAI_API_KEY=sua_key_aqui
```

**4. Testar:**
```bash
# Web
http://localhost:3000/test-upload

# Selecione "vanceai" no dropdown
```

#### **Hotpot AI (Alternativa)**

**1. Criar conta:**
- Acesse: https://hotpot.ai/
- Create Account
- API Dashboard

**2. Planos:**
- **$10**: 100 créditos
- **$20**: 250 créditos
- Sem plano gratuito

**3. Configurar:**
```env
AI_PROVIDER=hotpot
HOTPOT_API_KEY=sua_key_aqui
```

---

### **Cenário 3: Teste COMPLETO com Stripe + IA Real**

#### **Stripe em Modo Teste (GRÁTIS)**

**1. Criar conta Stripe:**
- Acesse: https://dashboard.stripe.com/register
- Criar conta (gratuito)
- Não precisa verificar conta para testes

**2. Obter chaves de TESTE:**
- Dashboard > Developers > API Keys
- Copie as chaves de **teste** (começam com `sk_test_` e `pk_test_`)

**3. Configurar `.env.local`:**
```env
TEST_MODE=false
STRIPE_SECRET_KEY=sk_test_sua_chave_secreta
STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_publica
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_publica
```

**4. Configurar Webhook (Local):**
```bash
# Instalar Stripe CLI
# Mac/Linux:
brew install stripe/stripe-cli/stripe

# Windows:
# Download: https://github.com/stripe/stripe-cli/releases

# Login
stripe login

# Encaminhar webhooks para localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**5. Copiar Webhook Secret:**
O comando acima mostra algo como:
```
whsec_abc123...
```

Adicione no `.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_abc123...
```

**6. Testar fluxo completo:**
```bash
# Acesse
http://localhost:3000/pricing

# Use cartão de teste do Stripe:
# Número: 4242 4242 4242 4242
# Data: qualquer data futura
# CVC: qualquer 3 dígitos
# CEP: qualquer
```

---

## 📊 Comparação Rápida

| Cenário | Custos | Configuração | Tempo Setup | Testa |
|---------|--------|--------------|-------------|-------|
| **1. Fake (Mock)** | ✅ R$ 0 | ✅ Nenhuma | ⚡ 0 min | Fluxo completo |
| **2. IA Real** | 💰 ~R$ 50 | ⚙️ Média | ⏱️ 10 min | IA + Fluxo |
| **3. Completo** | 💰 ~R$ 50 | ⚙️ Alta | ⏱️ 30 min | Tudo |

---

## 🚀 Recomendação de Ordem

### **Para Desenvolvimento:**
1. ✅ **Comece com Cenário 1** (fake provider)
   - Teste todo o fluxo da aplicação
   - Ajuste UI/UX
   - Corrija bugs

2. ⚙️ **Depois vá para Cenário 2** (IA real)
   - Integre VanceAI (use créditos grátis)
   - Teste qualidade da restauração
   - Ajuste parâmetros

3. 🎯 **Por último, Cenário 3** (produção)
   - Configure Stripe completo
   - Teste pagamentos
   - Configure webhooks

---

## 🧪 Testes Práticos AGORA

### **Teste Rápido 1: Interface Web (Fake AI)**

```bash
# Certifique-se que está rodando
npm run dev

# Abra no navegador
http://localhost:3000/test-upload
```

**Passos:**
1. Clique em "Choose file"
2. Selecione qualquer foto
3. Provider: "fake"
4. Clique "Test Restoration"
5. ✅ Deve funcionar em 1-3 segundos

### **Teste Rápido 2: Fluxo Completo (Fake AI)**

```bash
# Abra no navegador
http://localhost:3000/test-order
```

**Passos:**
1. Digite um email
2. Escolha pacote (ex: 1 photo)
3. Faça upload de 1 foto
4. Clique "Create Test Order"
5. ✅ Processa e mostra resultado

### **Teste Rápido 3: API Direta**

```bash
# Com uma foto no desktop
curl -X POST http://localhost:3000/api/test-restore \
  -F "image=@$HOME/Desktop/foto.jpg" \
  -F "provider=fake"
```

---

## 📝 Troubleshooting

### Erro: "Provider not found"
```bash
# Verifique .env.local
cat .env.local | grep AI_PROVIDER
# Deve mostrar: AI_PROVIDER=fake
```

### Erro: Database connection
```bash
# Inicie o PostgreSQL via Docker
docker-compose up -d postgres

# Verifique conexão
docker-compose ps
```

### Erro: "Module not found"
```bash
# Reinstale dependências
npm install

# Reconstrua
npm run build
```

---

## ✅ Checklist de Teste

- [ ] Teste web funcionando (fake AI)
- [ ] API teste funcionando  
- [ ] Fluxo completo sem pagamento funciona
- [ ] (Opcional) VanceAI configurado e testado
- [ ] (Opcional) Stripe teste configurado
- [ ] (Opcional) Webhooks funcionando

---

## 💡 Dica Final

**Para desenvolvimento inicial, use APENAS o Cenário 1 (fake provider).**

Você pode desenvolver e testar TODO o sistema sem gastar nada e sem depender de APIs externas. Quando estiver satisfeito com a aplicação, aí sim configure as APIs reais.

---

## 🆘 Precisa de Ajuda?

Se algo não funcionar:
1. Verifique os logs no terminal onde rodou `npm run dev`
2. Verifique o console do navegador (F12)
3. Confirme que `.env.local` tem `AI_PROVIDER=fake`
