# Instruções de Deploy - PhotoRestoreNow

## 🚀 Deploy na Vercel (Recomendado)

### 1. Preparação

```bash
# Certifique-se de ter todas as dependências
npm install

# Build local para verificar
npm run build
```

### 2. Deploy via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### 3. Deploy via GitHub (Automático)

1. Faça push do código para GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Click em "New Project"
4. Importe o repositório
5. Configure as variáveis de ambiente
6. Deploy!

### 4. Configurar Environment Variables na Vercel

No dashboard da Vercel:

```
Project Settings > Environment Variables

Adicione todas as variáveis do .env.example:
- NEXT_PUBLIC_APP_URL
- STRIPE_SECRET_KEY
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_WEBHOOK_SECRET
- VANCEAI_API_KEY
- HOTPOT_API_KEY
- AI_PROVIDER
- RESEND_API_KEY
- RESEND_FROM_EMAIL
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION
- AWS_S3_BUCKET
- STORAGE_PROVIDER
```

### 5. Configurar Webhook do Stripe

1. Acesse [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click em "Add endpoint"
3. URL: `https://your-domain.vercel.app/api/webhooks/stripe`
4. Selecione eventos:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
5. Copie o "Signing secret" e adicione como `STRIPE_WEBHOOK_SECRET`

### 6. Domínio Customizado

1. Settings > Domains
2. Adicione seu domínio
3. Configure DNS conforme instruções
4. Aguarde propagação (pode levar até 48h)

### 7. Verificação Pós-Deploy

✅ Site carrega corretamente  
✅ Upload de fotos funciona  
✅ Pagamento teste passa (use 4242 4242 4242 4242)  
✅ Webhooks recebem eventos  
✅ Emails são enviados  

---

## 📊 Monitoramento

### Logs

```bash
# Via CLI
vercel logs

# Ou acesse:
Dashboard > Deployments > [Sua Versão] > Logs
```

### Analytics

Vercel fornece analytics gratuito:
- Page views
- Top pages
- Real User Monitoring
- Web Vitals

Acesse: Dashboard > Analytics

---

## 🔧 Troubleshooting

### Problema: Build falha

```bash
# Limpar cache e rebuildar
rm -rf .next
npm run build
```

### Problema: Variáveis de ambiente não funcionam

- Certifique-se de usar `NEXT_PUBLIC_` para variáveis do frontend
- Redeploy após adicionar novas variáveis
- Verifique se não há espaços ou aspas extras

### Problema: Webhooks não recebem eventos

- Verifique URL do webhook no Stripe
- Confirme que `STRIPE_WEBHOOK_SECRET` está correto
- Teste localmente com Stripe CLI primeiro

---

## 🌍 Deploy Alternativo (Self-Hosted)

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build
docker build -t photo-restore-now .

# Run
docker run -p 3000:3000 --env-file .env.local photo-restore-now
```

### VPS (Ubuntu/Debian)

```bash
# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clonar e instalar
git clone https://github.com/your-user/photo-restore-now
cd photo-restore-now
npm ci
npm run build

# PM2 para manter rodando
sudo npm i -g pm2
pm2 start npm --name "photo-restore" -- start
pm2 save
pm2 startup

# Nginx como proxy reverso
sudo apt install nginx
# Configure nginx para proxy para localhost:3000
```

---

## 📈 Checklist de Produção

Antes de lançar:

- [ ] Todas as variáveis de ambiente configuradas
- [ ] Domínio customizado configurado
- [ ] SSL/HTTPS ativado (automático na Vercel)
- [ ] Stripe em modo PRODUÇÃO (não teste)
- [ ] Webhook do Stripe configurado
- [ ] Email de produção verificado no Resend
- [ ] Storage bucket criado e configurado
- [ ] Testes de pagamento em produção
- [ ] Política de privacidade/termos revisados
- [ ] Analytics configurado
- [ ] Backups configurados (se self-hosted)

---

## 🎯 Performance

### Otimizações Automáticas da Vercel

- Edge Network (CDN global)
- Image Optimization
- Automatic HTTPS
- Gzip/Brotli compression
- Smart caching

### Métricas para Monitorar

- Time to First Byte (TTFB) < 600ms
- Largest Contentful Paint (LCP) < 2.5s
- First Input Delay (FID) < 100ms
- Cumulative Layout Shift (CLS) < 0.1

Acesse em: Vercel Dashboard > Speed Insights
