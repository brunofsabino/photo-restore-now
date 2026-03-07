# Production Deployment Checklist

## ✅ Pré-Deploy (Completed)

### Código & Qualidade
- [x] Substituir `console.log/error` por `logger` em arquivos de produção
- [x] Sem erros TypeScript/ESLint
- [x] Analytics integrado (Mixpanel server + client)
- [x] Error tracking configurado
- [x] Todos os services usando logger apropriado

### Segurança
- [x] Nenhuma API key hardcoded no código
- [x] Rotas admin protegidas com `getServerSession`
- [x] Webhook verification (Stripe signature)
- [x] Rate limiting em `/api/*` (via middleware)
- [x] File validation (tipo, tamanho, conteúdo)
- [x] Filename sanitization
- [x] XSS protection (sem `dangerouslySetInnerHTML`)

### Infraestrutura
- [x] R2 Cloud Storage configurado e testado
- [x] VanceAI API integrada (399 credits restantes)
- [x] Inngest background jobs funcionando
- [x] Prisma migrations aplicadas
- [x] Email service (Resend) configurado

## ⚠️ Antes de Deploy em Produção

### Variáveis de Ambiente
- [ ] **Atualizar .env.production:**
  ```bash
  # Stripe
  STRIPE_SECRET_KEY=sk_live_...  # Trocar por live key
  STRIPE_PUBLISHABLE_KEY=pk_live_...  # Trocar por live key
  STRIPE_WEBHOOK_SECRET=whsec_...  # Criar novo webhook para produção
  
  # Mixpanel
  MIXPANEL_TOKEN=<seu_token_real>  # Substituir "your_mixpanel_token_here"
  NEXT_PUBLIC_MIXPANEL_TOKEN=<seu_token_real>
  
  # Inngest
  INNGEST_EVENT_KEY=<production_key>  # Obter do https://app.inngest.com
  INNGEST_SIGNING_KEY=<production_signing_key>
  
  # AI Provider
  AI_PROVIDER=vanceai  # Mudar de "fake" para "vanceai"
  TEST_MODE=false  # DESABILITAR test mode
  
  # Admin
  ADMIN_EMAILS=seu_email@dominio.com  # Emails dos admins
  
  # Crisp (opcional)
  NEXT_PUBLIC_CRISP_WEBSITE_ID=<seu_website_id>
  ```

### Testes VanceAI Real
- [ ] Testar restauração com VanceAI real (gastar 2-3 créditos)
  ```bash
  # Mudar temporariamente para testar:
  AI_PROVIDER=vanceai
  TEST_MODE=true  # Primeiro com test mode ON
  
  # Depois testar completo:
  AI_PROVIDER=vanceai
  TEST_MODE=false  # Teste final real
  ```

### Stripe Webhooks
- [ ] Criar webhook no Stripe Dashboard (https://dashboard.stripe.com/webhooks)
  - URL: `https://seu-dominio.com/api/webhooks/stripe`
  - Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`
- [ ] Copiar Signing Secret e adicionar em `STRIPE_WEBHOOK_SECRET`
- [ ] Testar webhook com evento real

### Inngest
- [ ] Criar conta production em https://app.inngest.com
- [ ] Registrar app: `https://seu-dominio.com/api/inngest`
- [ ] Copiar Event Key e Signing Key para .env

### Database
- [ ] Verificar `DATABASE_URL` apontando para produção
- [ ] Executar migrations: `npx prisma migrate deploy`
- [ ] Verificar backup automático configurado

### Monitoramento
- [ ] Configurar Mixpanel alerts
- [ ] Testar email de error tracking para admins
- [ ] Verificar logs no Vercel/Railway

## 📊 Performance & Otimizações

### Imagens & Assets
- [x] R2 Storage para uploads (public URLs funcionando)
- [ ] Verificar cache headers do R2 bucket
- [ ] Configurar CDN se necessário

### API Performance
- [x] Inngest para jobs assíncronos (não bloqueia requests)
- [x] Rate limiting configurado (middleware)
- [ ] Monitorar tempo de resposta das APIs

### Database
- [ ] Adicionar índices se necessário:
  ```sql
  CREATE INDEX idx_orders_email ON "Order"(email);
  CREATE INDEX idx_jobs_status ON "Job"(status);
  CREATE INDEX idx_orders_status ON "Order"(status);
  ```

## 🚀 Deploy Steps

### Vercel (Recomendado)
1. [ ] Push código para GitHub
2. [ ] Importar projeto no Vercel
3. [ ] Configurar variáveis de ambiente (production)
4. [ ] Deploy
5. [ ] Configurar domínio customizado
6. [ ] Testar fluxo completo

### Após Deploy
- [ ] Testar upload de fotos
- [ ] Testar pagamento com cartão de teste
- [ ] Verificar webhook funcionando (Stripe dashboard > Events)
- [ ] Verificar jobs no Inngest dashboard
- [ ] Verificar analytics no Mixpanel
- [ ] Testar email notifications

## 🧪 Testing Checklist

### Fluxo Completo
- [ ] Usuário entra no site
- [ ] Faz upload de fotos (max 10MB cada)
- [ ] Cria payment intent
- [ ] Paga com Stripe (test cards primeiro)
- [ ] Webhook processa pagamento
- [ ] Inngest job inicia
- [ ] VanceAI restaura fotos
- [ ] R2 armazena restored files
- [ ] Email de confirmação enviado
- [ ] Email de conclusão enviado
- [ ] Download das fotos funcionando
- [ ] Analytics registrado

### Edge Cases
- [ ] Upload de arquivo muito grande (>10MB) - deve rejeitar
- [ ] Upload de arquivo não-imagem - deve rejeitar
- [ ] Pagamento falha - webhook deve logar
- [ ] VanceAI falha - retry 3x, depois email de erro
- [ ] R2 falha - fallback ou erro apropriado

## 📝 Documentação

### Atualizar
- [ ] README.md com instruções de produção
- [ ] DEPLOYMENT.md com guia passo-a-passo
- [ ] .env.example com todas as variáveis necessárias

### Criar
- [ ] Guia de troubleshooting
- [ ] Runbook para incidentes
- [ ] FAQ de suporte ao cliente

## 💰 Custos Estimados (Mensal)

**Assumindo 100 orders/mês com 5 fotos cada = 500 restaurações:**

- **VanceAI**: ~$50 (500 credits @ $0.10/credit)
- **Cloudflare R2**: ~$1 (storage + transferência)
- **Stripe**: ~$30 (2.9% + $0.30 por transação)
- **Vercel Pro**: $20/mês
- **Inngest**: Grátis até 50k events/mês
- **Mixpanel**: Grátis até 100k events/mês
- **Resend**: Grátis até 100 emails/dia

**Total estimado: ~$100/mês** para 100 pedidos

## ⚠️ Limites & Alertas

Configurar alertas quando:
- [ ] VanceAI créditos < 50
- [ ] Taxa de erro > 5%
- [ ] Tempo de processamento > 2min
- [ ] R2 storage > 10GB
- [ ] Custo mensal > $150

---

## 🎯 Go Live Checklist Final

Antes de anunciar publicamente:
- [ ] Todos os itens acima completos
- [ ] Testado por pelo menos 3 pessoas reais
- [ ] Política de privacidade atualizada
- [ ] Termos de serviço atualizados
- [ ] Sistema de suporte configurado (Crisp chat)
- [ ] Página de FAQ criada
- [ ] Google Analytics/Mixpanel rastreando
- [ ] Backup & restore procedure documentado
- [ ] Monitoramento de uptime configurado
- [ ] Plan B se VanceAI ou R2 falharem

---

**Status Atual: 85% Pronto para Produção** ✅

**Faltam apenas:**
1. Configurar variáveis de ambiente de produção
2. Testar VanceAI real (2-3 créditos)
3. Configurar webhooks/Inngest para produção
4. Deploy e teste final

**Tempo estimado para produção: 2-3 horas**
