# PhotoRestoreNow - AI-Powered Photo Restoration SaaS

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![License](https://img.shields.io/badge/license-MIT-green)

**PhotoRestoreNow** é um serviço SaaS completo de restauração de fotos antigas usando IA, desenvolvido para o mercado americano 40+. Este MVP está pronto para produção com Next.js 14 (App Router), pagamentos via Stripe, integração com múltiplas APIs de IA, e arquitetura modular e escalável.

---

## 🎯 Visão Geral

### O Que é PhotoRestoreNow?

Um serviço online que permite aos usuários:
- ✅ Escolher pacotes de restauração (1, 3 ou 5 fotos)
- ✅ Fazer upload de fotos antigas/danificadas
- ✅ Pagar com cartão de crédito ou PayPal
- ✅ Receber fotos restauradas por IA em até 24h
- ✅ Download direto e entrega por email

### Público-Alvo

Americanos 40+ que desejam preservar memórias familiares e restaurar fotos vintage de forma rápida e profissional.

---

## 🏗️ Arquitetura do Sistema

### Stack Tecnológico

```
Frontend:
├── Next.js 14 (App Router)
├── React 18
├── TypeScript 5.3
├── Tailwind CSS 3.4
└── shadcn/ui (componentes)

Backend/Services:
├── Next.js API Routes
├── Stripe (pagamentos)
├── VanceAI / Hotpot AI (restauração)
├── AWS S3 / Cloudflare R2 (storage)
└── Resend (emails)

Deployment:
└── Vercel (otimizado para Next.js)
```

### Estrutura de Pastas

```
photo-restore-now/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── payment/
│   │   │   └── create-intent/
│   │   ├── webhooks/
│   │   │   └── stripe/
│   │   └── jobs/
│   │       └── status/
│   ├── page.tsx                  # Landing page
│   ├── pricing/page.tsx          # Página de preços
│   ├── upload/page.tsx           # Upload de fotos
│   ├── privacy/page.tsx          # Política de privacidade
│   ├── terms/page.tsx            # Termos de serviço
│   ├── layout.tsx                # Layout raiz
│   └── globals.css               # Estilos globais
│
├── components/                   # Componentes React
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── toast.tsx
│       └── toaster.tsx
│
├── contexts/                     # React Contexts
│   └── CartContext.tsx           # Gerenciamento do carrinho
│
├── lib/                          # Utilitários e helpers
│   ├── constants.ts              # Constantes da aplicação
│   └── utils.ts                  # Funções utilitárias
│
├── providers/                    # AI Providers (abstração)
│   ├── index.ts                  # Factory de providers
│   ├── vanceai.provider.ts       # Implementação VanceAI
│   └── hotpot.provider.ts        # Implementação Hotpot AI
│
├── services/                     # Serviços de negócio
│   ├── payment.service.ts        # Stripe payments
│   ├── storage.service.ts        # S3/R2 storage
│   ├── email.service.ts          # Resend emails
│   └── job.service.ts            # Processamento de jobs
│
├── types/                        # TypeScript types
│   └── index.ts                  # Definições de tipos
│
└── Configuration Files
    ├── package.json
    ├── tsconfig.json
    ├── next.config.mjs
    ├── tailwind.config.ts
    ├── postcss.config.mjs
    ├── .env.example
    └── .eslintrc.js
```

---

## 🚀 Setup e Instalação

### Pré-requisitos

- Node.js 18+ instalado
- Conta Stripe (modo teste)
- Chaves de API de pelo menos um provider de IA (VanceAI ou Hotpot)
- Conta Resend (para emails)
- Conta AWS S3 ou Cloudflare R2 (para storage)

### Passo 1: Clonar e Instalar Dependências

```bash
cd photo-restore-now
npm install
```

### Passo 2: Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e configure suas chaves:

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais:

```env
# Geral
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI Providers (configure pelo menos um)
VANCEAI_API_KEY=your_key
HOTPOT_API_KEY=your_key
AI_PROVIDER=vanceai

# Email
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Storage (configure um)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket
STORAGE_PROVIDER=s3
```

### Passo 3: Executar em Desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:3000`

### Passo 4: Build para Produção

```bash
npm run build
npm start
```

---

## 🔧 Decisões Técnicas e Arquitetura

### 1. Abstração de AI Providers

**Problema:** Necessidade de trocar entre VanceAI e Hotpot AI facilmente.

**Solução:** Padrão Factory + Interface

```typescript
// Interface comum
interface ImageRestorationProvider {
  uploadImage(): Promise<{jobId: string}>;
  restoreImage(jobId: string): Promise<void>;
  getResult(jobId: string): Promise<RestorationResult>;
  checkStatus(jobId: string): Promise<Status>;
}

// Factory
function getAIProvider(): ImageRestorationProvider {
  switch(process.env.AI_PROVIDER) {
    case 'vanceai': return new VanceAIProvider();
    case 'hotpot': return new HotpotAIProvider();
  }
}
```

**Benefícios:**
- Troca de provider mudando apenas 1 variável de ambiente
- Fácil adicionar novos providers no futuro
- Testes isolados por provider
- Código desacoplado

### 2. Sistema de Pagamentos com Stripe

**Por que Stripe?**
- ✅ Mais popular nos EUA
- ✅ Suporta cartão de crédito E PayPal nativamente
- ✅ PCI compliant (seguro)
- ✅ Webhooks confiáveis para processamento assíncrono
- ✅ Excelente documentação

**Fluxo de Pagamento:**

```
1. Frontend: Usuário adiciona ao carrinho
2. Frontend: Cria PaymentIntent via API
3. Frontend: Mostra Stripe Elements para pagamento
4. Stripe: Processa pagamento
5. Webhook: Stripe notifica sucesso
6. Backend: Inicia processamento de imagens
7. Email: Notifica usuário sobre confirmação
```

### 3. Carrinho de Compras Persistente

**Implementação:** Context API + localStorage

```typescript
// CartContext mantém estado global
const [cart, setCart] = useState<Cart>({
  items: [],
  totalAmount: 0,
  totalImages: 0
});

// Persiste automaticamente
useEffect(() => {
  localStorage.setItem('cart', JSON.stringify(cart));
}, [cart]);
```

**Vantagens:**
- Carrinho sobrevive a reloads
- Estado compartilhado entre páginas
- Não requer backend até checkout

### 4. Processamento Assíncrono de Jobs

**Desafio:** Restauração de IA pode levar minutos.

**Solução:** Job queue pattern

```typescript
// 1. Criar job após pagamento
const jobId = await createJob(email, packageId, images, paymentIntentId);

// 2. Processar de forma assíncrona
processJob(jobId).catch(handleError);

// 3. Polling ou webhooks para status
const status = await checkJobStatus(jobId);

// 4. Email quando completo
await sendRestorationComplete({...});
```

**Escalabilidade futura:**
- Fácil migrar para Redis + Bull queue
- Suporta múltiplos workers
- Retry automático em caso de falha

### 5. Storage com Abstração S3/R2

**Flexibilidade:** Suporta AWS S3 e Cloudflare R2 sem mudança de código.

```typescript
// Configuração automática
const s3Client = process.env.STORAGE_PROVIDER === 'r2' 
  ? new S3Client({ endpoint: R2_ENDPOINT })
  : new S3Client({ region: AWS_REGION });

// Uso transparente
await uploadFile(buffer, 'image.jpg', 'ORIGINAL_IMAGES');
```

**Segurança:**
- URLs assinadas com expiração
- Deleção automática após 7 dias
- Separação de originais e restauradas

### 6. Validação e Segurança

**Upload Seguro:**

```typescript
// Validação de tipo
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
if (!ALLOWED_TYPES.includes(file.type)) throw Error();

// Validação de tamanho (10MB max)
if (file.size > 10 * 1024 * 1024) throw Error();

// Sanitização de filename
filename = filename.replace(/[^a-z0-9.-]/gi, '_');
```

**Proteções Implementadas:**
- ✅ Nenhuma chave de API no frontend
- ✅ Validação de tipos no upload
- ✅ Rate limiting preparado (RATE_LIMIT_REQUESTS)
- ✅ HTTPS obrigatório em produção
- ✅ Webhooks com signature validation

---

## 💳 Sistema de Pagamentos

### Pacotes Disponíveis

| Pacote | Fotos | Preço | Economia |
|--------|-------|-------|----------|
| Single Photo | 1 | $19.99 | - |
| Family Pack | 3 | $49.99 | $10 |
| Memory Bundle | 5 | $79.99 | $20 |

### Integração Stripe

**Criar Payment Intent:**

```typescript
POST /api/payment/create-intent
{
  "amount": 4999,
  "email": "customer@email.com",
  "packageId": "3-photos",
  "imageCount": 3
}
```

**Webhook Handler:**

```typescript
POST /api/webhooks/stripe
Headers: stripe-signature

// Processa eventos:
- payment_intent.succeeded
- payment_intent.payment_failed
- checkout.session.completed
```

### Setup do Webhook (Produção)

```bash
# 1. No Stripe Dashboard
Developers > Webhooks > Add endpoint

# 2. URL do webhook
https://yourdomain.com/api/webhooks/stripe

# 3. Eventos para ouvir
payment_intent.succeeded
payment_intent.payment_failed
checkout.session.completed

# 4. Copiar signing secret para .env
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🤖 Integração com IA

### Providers Suportados

#### VanceAI
- **Endpoint:** `https://api-service.vanceai.com`
- **Modelo:** Photo Restoration AI
- **Tempo médio:** 30-60 segundos
- **Qualidade:** Alta

#### Hotpot AI
- **Endpoint:** `https://api.hotpot.ai`
- **Modelo:** Restore Picture
- **Tempo médio:** 45-90 segundos
- **Qualidade:** Muito alta

### Como Trocar de Provider

Basta mudar uma variável:

```env
# Use VanceAI
AI_PROVIDER=vanceai

# Ou use Hotpot
AI_PROVIDER=hotpot
```

### Adicionar Novo Provider

1. Crie novo arquivo em `providers/`:

```typescript
// providers/newprovider.provider.ts
export class NewProvider implements ImageRestorationProvider {
  async uploadImage(request) { /* ... */ }
  async restoreImage(jobId) { /* ... */ }
  async getResult(jobId) { /* ... */ }
  async checkStatus(jobId) { /* ... */ }
}
```

2. Registre no factory:

```typescript
// providers/index.ts
case 'newprovider':
  return new NewProvider();
```

3. Configure API key:

```env
NEWPROVIDER_API_KEY=...
AI_PROVIDER=newprovider
```

---

## 📧 Sistema de Emails

### Templates Implementados

1. **Order Confirmation** - Após pagamento
2. **Processing Started** - Quando inicia restauração
3. **Restoration Complete** - Com links de download
4. **Restoration Failed** - Em caso de erro

### Configurar Resend

```bash
# 1. Criar conta em resend.com
# 2. Verificar domínio (DNS records)
# 3. Criar API key
# 4. Configurar .env

RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### Exemplo de Uso

```typescript
await sendRestorationComplete({
  customerEmail: 'user@email.com',
  jobId: 'job_123',
  downloadLinks: ['https://...', 'https://...'],
  expiresAt: new Date(Date.now() + 7*24*60*60*1000)
});
```

---

## 🗄️ Storage e CDN

### Estrutura de Pastas no S3/R2

```
bucket-name/
├── uploads/
│   ├── original/     # Fotos originais
│   ├── restored/     # Fotos restauradas
│   └── temp/         # Arquivos temporários
```

### Configurar AWS S3

```env
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=photo-restore-now
STORAGE_PROVIDER=s3
```

### Configurar Cloudflare R2

```env
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=photo-restore-now
STORAGE_PROVIDER=r2
```

### Política de Deleção

- Originais: Deletados após 7 dias
- Restauradas: Deletadas após 7 dias
- Temp: Deletados após 24 horas

---

## 🔒 Segurança

### Checklist Implementado

- ✅ HTTPS obrigatório (Vercel)
- ✅ Validação de uploads (tipo, tamanho)
- ✅ Sanitização de filenames
- ✅ Nenhuma chave de API no frontend
- ✅ Webhook signature validation
- ✅ CORS configurado
- ✅ Rate limiting preparado
- ✅ Deleção automática de dados
- ✅ PCI compliant (via Stripe)

### Variáveis de Ambiente Sensíveis

**NUNCA COMMITAR:**
- `.env.local`
- `.env.production`
- Chaves de API
- Secrets do Stripe

**Sempre usar:**
- `.env.example` (template sem valores reais)
- Vercel Environment Variables (produção)
- GitHub Secrets (CI/CD)

---

## 📊 Escalabilidade

### Preparação para Crescimento

#### Banco de Dados
Atualmente usa Map em memória. Para produção:

```typescript
// Migrar para PostgreSQL/MySQL
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Ou MongoDB
import { MongoClient } from 'mongodb';
```

#### Fila de Jobs
Migrar para Redis + Bull:

```typescript
import Queue from 'bull';

const restorationQueue = new Queue('restoration', {
  redis: { host: '...', port: 6379 }
});

restorationQueue.process(async (job) => {
  await processJob(job.data.jobId);
});
```

#### Cache
Adicionar Redis para cache:

```typescript
// Pricing packages, configurações
const cachedPackages = await redis.get('pricing:packages');
```

#### CDN
- Vercel Edge Network (automático)
- Cloudflare CDN para assets estáticos
- R2 com CDN público para imagens

---

## 🚀 Deploy na Vercel

### Passo a Passo

1. **Push para GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-user/photo-restore-now
git push -u origin main
```

2. **Conectar no Vercel**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Ou via dashboard:
# vercel.com > New Project > Import from GitHub
```

3. **Configurar Environment Variables**

No Vercel Dashboard:
```
Settings > Environment Variables

Adicionar todas as variáveis do .env.example
```

4. **Configurar Webhook do Stripe**

```
URL: https://your-domain.vercel.app/api/webhooks/stripe
```

5. **Deploy Automático**

```bash
# Cada push em main = novo deploy
git push origin main
```

---

## 🧪 Testes

### Testar Localmente

```bash
# 1. Upload de fotos
# Acesse /upload e faça upload de imagens de teste

# 2. Testar pagamento (modo teste)
# Use cartão de teste do Stripe:
# 4242 4242 4242 4242
# Qualquer data futura + qualquer CVC

# 3. Testar webhook localmente
npm install -g stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 4. Simular pagamento bem-sucedido
stripe trigger payment_intent.succeeded
```

### Logs e Debug

```typescript
// Ativar logs detalhados
NODE_ENV=development

// Logs aparecem em:
console.log() // Terminal (dev)
Vercel Logs   // Dashboard (produção)
```

---

## 📈 Roadmap Futuro

### Fase 2 - Melhorias
- [ ] Autenticação de usuários (NextAuth)
- [ ] Dashboard do cliente com histórico
- [ ] Antes/Depois interativo
- [ ] Planos de assinatura (mensal)
- [ ] API pública para integrações

### Fase 3 - Escala
- [ ] Processamento em paralelo (workers)
- [ ] Fila Redis + Bull
- [ ] Database PostgreSQL
- [ ] Cache Redis
- [ ] Monitoring (Sentry, Datadog)

### Fase 4 - Features Premium
- [ ] Edição manual de fotos
- [ ] Colorização de fotos P&B
- [ ] Upscaling de resolução
- [ ] Remoção de arranhões manual
- [ ] Suporte a vídeos antigos

---

## 🤝 Contribuindo

Este é um projeto MVP. Contribuições são bem-vindas!

### Como Contribuir

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 📞 Suporte

- **Email:** support@photorestorenow.com
- **Documentação:** [docs.photorestorenow.com](https://docs.photorestorenow.com)
- **Issues:** [GitHub Issues](https://github.com/your-user/photo-restore-now/issues)

---

## 👨‍💻 Autor

Desenvolvido como MVP para demonstração de arquitetura SaaS completa com Next.js.

**Stack completa:**
- Frontend: Next.js 14, React 18, TypeScript, Tailwind CSS
- Backend: Next.js API Routes, Stripe, VanceAI/Hotpot
- Infrastructure: Vercel, AWS S3/Cloudflare R2, Resend
- UI: shadcn/ui, Radix UI

---

## 🎉 Features Principais Entregues

✅ **Landing Page** profissional com design moderno  
✅ **Sistema de Pacotes** (1, 3, 5 fotos)  
✅ **Upload Seguro** com validação  
✅ **Carrinho de Compras** persistente  
✅ **Pagamentos** via Stripe (cartão + PayPal)  
✅ **Abstração de IA** (VanceAI e Hotpot)  
✅ **Processamento Assíncrono** de jobs  
✅ **Email Transacional** (confirmação, entrega)  
✅ **Storage Cloud** (S3/R2)  
✅ **Políticas** (Privacy, Terms)  
✅ **Responsivo** mobile-first  
✅ **Pronto para Vercel**  

**Este é um MVP production-ready!** 🚀