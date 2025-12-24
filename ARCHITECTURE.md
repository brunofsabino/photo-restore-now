# Arquitetura e Decisões Técnicas - PhotoRestoreNow

## 📐 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│  Landing Page │ Pricing │ Upload │ Checkout │ Dashboard     │
│                                                               │
│  Context API (Cart) │ React Hooks │ Client Components       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                  API ROUTES (Next.js)                        │
├─────────────────────────────────────────────────────────────┤
│  /api/payment/create-intent                                  │
│  /api/webhooks/stripe                                        │
│  /api/jobs/status                                            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                   SERVICES LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  Payment Service │ Job Service │ Email Service │ Storage    │
└──┬──────────────┴──────────────┴───────────────┴──────────┬─┘
   │                                                          │
   ▼                                                          ▼
┌──────────────────┐  ┌──────────────────┐  ┌───────────────────┐
│  AI PROVIDERS    │  │  EXTERNAL APIs   │  │  STORAGE          │
├──────────────────┤  ├──────────────────┤  ├───────────────────┤
│  VanceAI         │  │  Stripe          │  │  AWS S3           │
│  Hotpot AI       │  │  Resend          │  │  Cloudflare R2    │
│  [Future: Remini]│  │  [Future: DB]    │  │                   │
└──────────────────┘  └──────────────────┘  └───────────────────┘
```

---

## 🎯 Decisões de Design

### 1. Por que Next.js App Router?

**Vantagens:**
- ✅ Server Components por padrão (melhor performance)
- ✅ Streaming e Suspense nativos
- ✅ API Routes integradas (sem backend separado)
- ✅ File-based routing (organização clara)
- ✅ Built-in optimizations (imagens, fonts, etc)
- ✅ Deploy perfeito na Vercel

**Comparado com:**
- ❌ Pages Router: Mais antigo, menos features
- ❌ Create React App: Sem SSR, sem API routes
- ❌ Vite + React Router: Precisa de backend separado

### 2. Por que shadcn/ui ao invés de Material-UI ou Chakra?

**Motivação:**
```
shadcn/ui = Componentes copiados pro seu projeto (não uma lib)
           + Radix UI (acessibilidade)
           + Tailwind CSS (estilização)
           + Completa customização
```

**Vantagens:**
- ✅ Código no seu projeto (fácil customizar)
- ✅ Sem bloat de library gigante
- ✅ Acessibilidade built-in (Radix)
- ✅ Tailwind = design consistente
- ✅ TypeScript nativo

**Comparado com:**
- ❌ Material-UI: Bundle grande, difícil customizar
- ❌ Chakra UI: Ótimo, mas mais opinativo
- ❌ Ant Design: Muito visual "corporate"

### 3. Abstração de AI Providers - Pattern Strategy

**Problema:**
```
Como permitir trocar entre VanceAI e Hotpot facilmente?
Como adicionar novos providers no futuro sem quebrar código?
```

**Solução: Strategy Pattern + Factory**

```typescript
// Interface comum (Strategy)
interface ImageRestorationProvider {
  uploadImage(): Promise<{jobId: string}>;
  restoreImage(jobId: string): Promise<void>;
  getResult(jobId: string): Promise<RestorationResult>;
}

// Implementações concretas
class VanceAIProvider implements ImageRestorationProvider { }
class HotpotProvider implements ImageRestorationProvider { }

// Factory para criar provider
function getAIProvider(): ImageRestorationProvider {
  switch(process.env.AI_PROVIDER) {
    case 'vanceai': return new VanceAIProvider();
    case 'hotpot': return new HotpotProvider();
  }
}
```

**Benefícios:**
- 🔄 Troca de provider: mudar 1 variável de ambiente
- 🔌 Pluggable: adicionar provider = criar nova class
- 🧪 Testável: cada provider testado isoladamente
- 🎯 SOLID: cada provider tem sua responsabilidade

**Exemplo de Uso:**

```typescript
// service/job.service.ts
const provider = getAIProvider(); // Factory decide qual usar
const { jobId } = await provider.uploadImage(request);
await provider.restoreImage(jobId);
const result = await provider.getResult(jobId);
```

### 4. Carrinho de Compras - Context API + localStorage

**Problema:**
```
Como manter estado do carrinho entre páginas?
Como persistir carrinho se usuário recarregar página?
Precisa de backend para carrinho?
```

**Solução: React Context + localStorage**

```typescript
// Context = Estado global
const CartContext = createContext<CartContextType>();

// Provider envolve a aplicação
export function CartProvider({ children }) {
  const [cart, setCart] = useState<Cart>({ items: [], totalAmount: 0 });
  
  // Carregar do localStorage ao montar
  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);
  
  // Salvar no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
  
  return <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
    {children}
  </CartContext.Provider>
}
```

**Vantagens:**
- ✅ Sem backend até checkout (reduz custo)
- ✅ Carrinho persiste em reloads
- ✅ Estado compartilhado entre todas as páginas
- ✅ Simples de implementar e manter

**Alternativas consideradas:**
- ❌ Redux: Overkill para carrinho simples
- ❌ Zustand: Bom, mas Context API suficiente aqui
- ❌ Backend session: Complexidade desnecessária

### 5. Pagamentos - Por que Stripe?

**Comparação de Gateways no mercado US:**

| Gateway | Taxa | PayPal | Facilidade | Documentação |
|---------|------|--------|------------|--------------|
| Stripe  | 2.9%+$0.30 | ✅ Sim | ⭐⭐⭐⭐⭐ | Excelente |
| PayPal  | 3.49%+$0.49 | ✅ Nativo | ⭐⭐⭐ | Boa |
| Square  | 2.9%+$0.30 | ❌ Não | ⭐⭐⭐⭐ | Boa |
| Braintree | 2.9%+$0.30 | ✅ Sim | ⭐⭐⭐ | Regular |

**Por que Stripe venceu:**
- ✅ Mais popular nos EUA
- ✅ Suporta cartão E PayPal (via Payment Methods)
- ✅ Webhooks confiáveis
- ✅ SDK TypeScript excelente
- ✅ Compliance PCI-DSS automático
- ✅ Test mode perfeito para desenvolvimento
- ✅ Dashboard intuitivo

**Fluxo de Pagamento Implementado:**

```
1. Cliente clica "Checkout"
   ↓
2. Frontend cria PaymentIntent via API
   POST /api/payment/create-intent { amount, email }
   ↓
3. Stripe retorna clientSecret
   ↓
4. Frontend mostra Stripe Elements (form de cartão)
   ↓
5. Cliente preenche dados e submete
   ↓
6. Stripe processa pagamento
   ↓
7. Webhook notifica backend: payment_intent.succeeded
   ↓
8. Backend inicia processamento de imagens
   ↓
9. Email de confirmação enviado
```

**Segurança:**
- 🔒 Chave secreta NUNCA exposta ao frontend
- 🔒 Webhook signature validation
- 🔒 PCI Compliance via Stripe (não lidamos com dados de cartão)

### 6. Processamento Assíncrono - Job Queue Pattern

**Problema:**
```
Restauração de IA pode levar 1-5 minutos
Usuário não pode esperar na página
Como processar múltiplas imagens?
Como lidar com falhas e retries?
```

**Solução: Job Queue Pattern (simplificado)**

```typescript
// 1. Criar job após pagamento
const jobId = await createJob({
  email,
  images,
  packageId,
  paymentIntentId,
});

// 2. Processar ASYNC (não bloqueia response)
processJob(jobId).catch(handleError);

// 3. Cliente pode consultar status
GET /api/jobs/status?jobId=xxx

// 4. Email quando completo
if (job.status === 'completed') {
  await sendRestorationComplete({...});
}
```

**Implementação Atual (MVP):**
```typescript
// Map em memória (para desenvolvimento)
const jobs = new Map<string, RestorationJob>();

// Processamento com retry
async function processJob(jobId: string) {
  for (let retry = 0; retry < MAX_RETRIES; retry++) {
    try {
      const result = await aiProvider.restore(image);
      if (result.success) break;
    } catch (error) {
      if (retry === MAX_RETRIES - 1) throw error;
      await sleep(RETRY_DELAY);
    }
  }
}
```

**Escalabilidade Futura:**
```typescript
// Para produção: migrar para Redis + Bull
import Queue from 'bull';

const restorationQueue = new Queue('restoration', {
  redis: { host: 'redis-host', port: 6379 }
});

restorationQueue.process(async (job) => {
  await processJob(job.data.jobId);
});

// Adicionar job à fila
await restorationQueue.add({ jobId }, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 5000 }
});
```

### 7. Storage - S3 vs R2 (Abstração)

**Comparação:**

| Feature | AWS S3 | Cloudflare R2 |
|---------|--------|---------------|
| Custo | $0.023/GB | $0.015/GB |
| Egress | $0.09/GB | **GRÁTIS** |
| API | S3 Compatible | S3 Compatible |
| CDN | CloudFront | Incluído |
| Velocidade | Excelente | Excelente |

**Por que abstrair:**
- 💰 R2 = mais barato para tráfego alto
- 🌍 S3 = mais regiões disponíveis
- 🔄 Migração sem code changes

**Implementação:**

```typescript
// Mesma interface para ambos
const s3Client = getStorageProvider() === 'r2'
  ? new S3Client({ endpoint: R2_ENDPOINT })
  : new S3Client({ region: AWS_REGION });

// Uso idêntico
await uploadFile(buffer, 'image.jpg');
```

### 8. Email - Por que Resend?

**Comparação de provedores:**

| Provider | Preço | DX | Deliverability | DKIM/SPF |
|----------|-------|----|--------------  |----------|
| Resend | $20/10k | ⭐⭐⭐⭐⭐ | Excelente | ✅ |
| SendGrid | $20/6k | ⭐⭐⭐ | Boa | ✅ |
| Mailgun | $35/10k | ⭐⭐⭐ | Boa | ✅ |
| AWS SES | $0.10/1k | ⭐⭐ | Excelente | Manual |

**Resend venceu por:**
- ✅ Developer Experience incrível
- ✅ SDK TypeScript nativo
- ✅ Templates em React (futuro)
- ✅ Setup DKIM/SPF simplificado
- ✅ Dashboard limpo
- ✅ Preço competitivo

### 9. Validação - Zod

**Por que Zod ao invés de Joi ou Yup?**

```typescript
// Zod = Type-safe + Runtime validation
const schema = z.object({
  email: z.string().email(),
  amount: z.number().positive(),
});

// TypeScript infere tipo automaticamente
type PaymentData = z.infer<typeof schema>; // { email: string; amount: number }

// Validação em runtime
const data = schema.parse(input); // Throw se inválido
const result = schema.safeParse(input); // { success: boolean, data }
```

**Vantagens:**
- ✅ TypeScript-first (inferência de tipos)
- ✅ Mais leve que Joi
- ✅ Melhor error messages
- ✅ Composable schemas

---

## 🔐 Segurança em Camadas

### Layer 1: Frontend

```typescript
// ✅ Validação de arquivo antes de upload
if (file.size > MAX_FILE_SIZE) {
  throw new Error('File too large');
}

if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error('Invalid file type');
}

// ✅ Sanitização de input
const sanitized = filename.replace(/[^a-z0-9.-]/gi, '_');
```

### Layer 2: API Routes

```typescript
// ✅ Validação com Zod
const schema = z.object({ email: z.string().email() });
const { email } = schema.parse(body); // Throw se inválido

// ✅ Rate limiting (preparado)
const requests = rateLimiter.check(ip);
if (requests > MAX_REQUESTS) {
  return Response.error('Too many requests', 429);
}
```

### Layer 3: Services

```typescript
// ✅ Webhook signature validation
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  webhookSecret
); // Throw se signature inválida

// ✅ Sanitização de SQL (quando usar DB)
const result = await db.query(
  'SELECT * FROM jobs WHERE id = ?',
  [jobId] // Prepared statement
);
```

### Layer 4: Infrastructure

```
✅ HTTPS obrigatório (Vercel)
✅ CORS configurado
✅ Environment variables nunca no código
✅ Secrets encryption (Vercel)
✅ No direct database access from frontend
```

---

## 📊 Performance e Otimizações

### 1. Next.js Built-in

```typescript
// ✅ Image Optimization
import Image from 'next/image';
<Image src="/photo.jpg" width={800} height={600} />
// → Lazy load + WebP + Responsive

// ✅ Font Optimization
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
// → Self-hosted + preload

// ✅ Code Splitting automático
// Cada page = bundle separado
```

### 2. Estratégias de Caching

```typescript
// API Route com cache
export const revalidate = 3600; // 1 hora

export async function GET() {
  const packages = PRICING_PACKAGES; // Cached
  return Response.json(packages);
}

// Client-side com SWR (futuro)
const { data } = useSWR('/api/jobs/status', fetcher, {
  refreshInterval: 3000, // Poll a cada 3s
  revalidateOnFocus: false,
});
```

### 3. Bundle Size

```bash
# Analisar bundle
npm run build
# Vercel mostra tamanho de cada route

# Otimizar imports
import { Button } from '@/components/ui/button'; # ✅
import * as UI from '@/components/ui'; # ❌ (importa tudo)
```

---

## 🚀 Escalabilidade - Roadmap

### Current (MVP)

```
- In-memory job queue (Map)
- Filesystem storage (dev)
- Single server (Vercel)
```

### Phase 2: Database

```typescript
// Migrar de Map para PostgreSQL
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createJob(data: JobData) {
  return await prisma.restorationJob.create({ data });
}
```

### Phase 3: Redis Queue

```typescript
// Processamento distribuído
import Queue from 'bull';

const queue = new Queue('restoration', {
  redis: process.env.REDIS_URL
});

// Worker separado
queue.process(async (job) => {
  await processRestoration(job.data);
});
```

### Phase 4: Microservices

```
┌─────────────┐     ┌────────────���┐     ┌─────────────┐
│   Frontend  │────▶│   API GW    │────▶│  Auth Svc   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
  ┌──────────┐      ┌──────────┐     ┌──────────┐
  │ Job Svc  │      │ Pay Svc  │     │Email Svc │
  └──────────┘      └──────────┘     └──────────┘
```

---

## 📝 Lessons Learned e Best Practices

### ✅ O que funcionou bem

1. **Abstração de AI Providers** → Troca fácil
2. **Stripe Webhooks** → Confiável e assíncrono
3. **shadcn/ui** → Customização total
4. **Context API** → Suficiente para MVP
5. **TypeScript** → Menos bugs em produção

### ⚠️ O que melhoraria

1. **Database** → Map não escala, migrar para Postgres
2. **Queue** → Bull + Redis para jobs
3. **Cache** → Redis para sessions e cache
4. **Tests** → Adicionar Jest + Playwright
5. **Monitoring** → Sentry para error tracking

### 🎯 Recomendações Finais

**Para MVP (agora):**
- ✅ Estrutura atual é suficiente
- ✅ Foco em validação de mercado
- ✅ Deploy e teste com usuários reais

**Para Produção (depois):**
- 📊 Adicionar database (Prisma + PostgreSQL)
- 📨 Implementar Redis + Bull queue
- 🧪 Adicionar testes automatizados
- 📈 Configurar monitoring (Sentry)
- 🔒 Audit de segurança profissional

---

## 💡 Conclusão

Este sistema foi arquitetado para:
- ✅ Rápido desenvolvimento (MVP em < 1 semana)
- ✅ Fácil manutenção (código organizado e limpo)
- ✅ Escalável (preparado para crescimento)
- ✅ Seguro (múltiplas camadas de proteção)
- ✅ Modular (adicionar features sem quebrar)

**É production-ready?** Sim, para MVP e primeiros clientes.

**Precisa de melhorias?** Sim, conforme tiver tração (database, queue, monitoring).

**Vale a pena?** Absolutamente. Arquitetura sólida que suporta evolução.
