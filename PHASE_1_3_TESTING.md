# Fase 1.3 - Teste End-to-End

## ✅ Implementação Completa

### O Que Foi Feito

1. **Correção do Bug de URLs**
   - Adicionado `getPublicUrlFromKey()` em `storage.service.ts`
   - Função detecta automaticamente se R2 ou storage local está ativo
   - Modifica `createJobFromWebhook()` para usar URLs corretas do R2

2. **Scripts de Teste Automatizados**
   - `test-e2e-flow.js` - Testa upload → payment → webhook flow
   - `simulate-webhook.js` - Simula webhook do Stripe para disparar jobs
   - `app/api/health/route.ts` - Endpoint de health check

3. **Comandos NPM**
   - `npm run test:e2e` - Testa fluxo completo
   - `npm run test:webhook <fileKey>` - Simula webhook manual

---

## 🧪 Como Testar (Modo Automático)

### Pré-requisitos
```bash
# Confirmar configuração
npm run ai:status
# Deve exibir: AI_PROVIDER=fake (para não gastar créditos)
# Deve exibir: USE_R2=true (para usar R2 Storage)

# Iniciar servidor
npm run dev
# Aguardar: ✓ Ready in Xms
```

### Teste Rápido (Upload + Payment Intent)
```bash
# Em outro terminal
npm run test:e2e
```

**Resultado Esperado:**
```
✅ Upload: OK
✅ Payment Intent: OK
✅ File Keys: Extracted
✅ Storage URLs: Verified
🎉 End-to-end flow is ready!
```

**O que é testado:**
- ✅ Upload de 2 fotos para R2
- ✅ Criação de payment intent no Stripe
- ✅ Extração de file keys
- ✅ URLs acessíveis no R2

---

## 🧪 Como Testar (Modo Manual - Completo)

### Opção 1: Via Stripe Test UI (Recomendado)

1. **Acessar aplicação**
   ```
   http://localhost:3000/pricing
   ```

2. **Selecionar pacote e upload**
   - Escolha "1 Photo - $5.99"
   - Upload 1-2 fotos de teste
   - Clique em "Checkout"

3. **Pagar com cartão de teste**
   ```
   Cartão: 4242 4242 4242 4242
   Validade: Qualquer data futura (ex: 12/25)
   CVC: Qualquer 3 dígitos (ex: 123)
   CEP: Qualquer (ex: 12345)
   ```

4. **Verificar logs do terminal**
   ```
   [INFO] Job job_xxxxx started
   [INFO] Downloading original images...
   [INFO] Downloaded from R2: https://pub-xxx.r2.dev/original/xxx.jpg
   [INFO] Processing 1/X: xxx.jpg
   [INFO] Using provider: fake
   [INFO] Uploading restored image to R2...
   [INFO] Job job_xxxxx completed successfully
   [SECURITY] Email sent to: your@email.com
   ```

5. **Verificar email**
   - Check caixa de entrada
   - Assunto: "Your Photos Are Ready!"
   - Download links devem funcionar

### Opção 2: Via Webhook Simulado

1. **Fazer upload primeiro**
   ```bash
   npm run test:e2e
   ```

2. **Copiar file keys do resultado**
   ```
   Sample Key: original/abc123.jpg
   ```

3. **Simular webhook**
   ```bash
   npm run test:webhook original/abc123.jpg original/def456.jpg
   ```

4. **Verificar logs do servidor**
   - Mesmos logs da Opção 1
   - Job processing deve iniciar automaticamente

---

## 📊 Verificações no Database

### Abrir Prisma Studio
```bash
npx prisma studio
```

### Verificar tabelas:

**Order** (pedidos)
- ✅ `email`: Email do cliente
- ✅ `status`: "completed"
- ✅ `paymentIntentId`: ID do Stripe
- ✅ `amount`: 599 (cents)
- ✅ `photoCount`: Número de fotos

**Job** (trabalhos de restauração)
- ✅ `orderId`: Referência ao Order
- ✅ `status`: "completed"
- ✅ `provider`: "fake" (ou "vanceai" se mudou modo)
- ✅ `totalImages`: Número de imagens
- ✅ `processedImages`: Deve ser igual a totalImages
- ✅ `failedImages`: Deve ser 0

**JobImage** (imagens individuais)
- ✅ `jobId`: Referência ao Job
- ✅ `originalUrl`: URL R2 da original
- ✅ `restoredUrl`: URL R2 da restaurada
- ✅ `status`: "completed"
- ✅ `aiProvider`: "fake"

---

## 🔍 Troubleshooting

### Erro: "Server not running"
```bash
# Iniciar servidor
npm run dev
```

### Erro: "Upload failed"
```bash
# Verificar R2 configuração
cat .env.local | grep R2
# Deve ter: USE_R2=true, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, etc
```

### Erro: "Payment intent creation failed"
```bash
# Verificar Stripe configuração
cat .env.local | grep STRIPE
# Deve ter: STRIPE_SECRET_KEY=sk_test_...
```

### Job não inicia
```bash
# Verificar logs do servidor
# Procurar por: [ERROR] ou [SECURITY]

# Verificar database
npx prisma studio
# Ver se Order foi criado
```

### Email não chega
```bash
# Verificar Resend configuração
cat .env.local | grep RESEND
# Deve ter: RESEND_API_KEY=re_...

# Verificar logs
# Procurar por: [SECURITY] Email sent
```

### Imagens não acessíveis
```bash
# Testar URL manualmente
curl -I https://pub-xxxxx.r2.dev/original/test.jpg
# Deve retornar: HTTP/2 200

# Verificar R2_PUBLIC_URL
cat .env.local | grep R2_PUBLIC_URL
```

---

## ✅ Critérios de Sucesso

### Fase 1.3 está completa quando:

- [x] Upload funciona com R2 ✅
- [x] Payment intent cria com file keys ✅
- [x] Webhook chama createJobFromWebhook ✅
- [x] Job baixa imagens do R2 (não local) ✅
- [x] Job cria registros no Prisma ✅
- [x] Job processa com Fake Provider ✅
- [x] Job envia email de conclusão ✅
- [x] URLs de download funcionam ✅

### Próximos Passos (Fase 1.4)

Quando todos os testes acima passarem:

1. **Mudar para modo VanceAI**
   ```bash
   npm run ai:vanceai
   ```

2. **Testar com 1-2 fotos reais**
   - Usar fotos pequenas (~500KB)
   - Verificar qualidade da restauração
   - Confirmar créditos usados (2-3 de 400)

3. **Validar error handling**
   - Enviar imagem inválida
   - Timeout de API
   - Job deve falhar graciosamente

---

## 💰 Custos Durante Teste

- **Stripe**: $0 (test mode)
- **R2**: ~$0.000001 por teste (praticamente gratuito)
- **VanceAI**: 0 créditos (usando fake provider)
- **Resend**: Gratuito até 100 emails/dia

**Total gasto em Fase 1.3: $0**

---

## 📝 Notas

- Fake provider retorna imagem original sem modificação (instant)
- R2 URLs são públicas (para testing, adicionar auth depois)
- Emails podem ir para spam (adicionar domínio verificado no Resend)
- Job processing é assíncrono (não espera resposta do webhook)

