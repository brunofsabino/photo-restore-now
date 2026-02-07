# PhotoRestoreNow - Exemplos de Uso

Este arquivo contém exemplos práticos de como usar e estender o sistema.

---

## 🚀 Quick Start

### 1. Setup Inicial

```bash
# Clone e instale
git clone https://github.com/your-user/photo-restore-now
cd photo-restore-now
npm install

# Configure environment
cp .env.example .env.local
# Edite .env.local com suas credenciais

# Rode em desenvolvimento
npm run dev
```

### 2. Testar Fluxo Completo

```bash
# 1. Abra http://localhost:3000
# 2. Navegue para Pricing
# 3. Selecione um pacote
# 4. Faça upload de fotos de teste
# 5. Use cartão de teste Stripe: 4242 4242 4242 4242
# 6. Verifique email (em desenvolvimento, veja console logs)
```

---

## 📝 Exemplos de Código

### Exemplo 1: Adicionar Novo Pacote de Preços

```typescript
// lib/constants.ts
export const PRICING_PACKAGES: PricingPackage[] = [
  // ... pacotes existentes
  {
    id: '10-photos', // Novo pacote
    name: 'Archive Collection',
    photoCount: 10,
    price: 12999, // $129.99
    features: [
      'All Memory Bundle features',
      'Save $70 vs individual',
      'Bulk processing',
      'Premium support',
      '12-hour delivery',
      'Free re-restoration if not satisfied',
    ],
  },
];
```

```typescript
// types/index.ts
// Atualizar type
export type PackageType = '1-photo' | '3-photos' | '5-photos' | '10-photos';
```

### Exemplo 2: Criar Componente de Status de Job

```typescript
// components/job/JobStatus.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface JobStatusProps {
  jobId: string;
}

export function JobStatus({ jobId }: JobStatusProps) {
  const [status, setStatus] = useState<'processing' | 'completed' | 'failed'>('processing');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const checkStatus = async () => {
      const res = await fetch(`/api/jobs/status?jobId=${jobId}`);
      const data = await res.json();
      
      if (data.success) {
        setStatus(data.data.status);
        
        // Simular progresso
        if (data.data.status === 'processing') {
          setProgress(prev => Math.min(prev + 10, 90));
        } else if (data.data.status === 'completed') {
          setProgress(100);
        }
      }
    };

    // Poll a cada 3 segundos
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [jobId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Restoration Status</CardTitle>
      </CardHeader>
      <CardContent>
        {status === 'processing' && (
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <div className="flex-1">
              <p className="font-medium">Processing your photos...</p>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {status === 'completed' && (
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <p className="font-medium text-green-700">Restoration complete!</p>
          </div>
        )}

        {status === 'failed' && (
          <div className="flex items-center gap-3">
            <XCircle className="h-6 w-6 text-red-500" />
            <p className="font-medium text-red-700">Processing failed</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

**Uso:**

```typescript
// app/status/[jobId]/page.tsx
import { JobStatus } from '@/components/job/JobStatus';

export default function StatusPage({ params }: { params: { jobId: string } }) {
  return (
    <div className="container mx-auto py-12">
      <JobStatus jobId={params.jobId} />
    </div>
  );
}
```

### Exemplo 3: Adicionar Rate Limiting

```typescript
// lib/rate-limit.ts
import { LRUCache } from 'lru-cache';

type RateLimitOptions = {
  interval: number;
  uniqueTokenPerInterval: number;
};

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  });

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limit;
        
        return isRateLimited ? reject() : resolve();
      }),
  };
}

// Criar limiter
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minuto
  uniqueTokenPerInterval: 500,
});
```

**Uso em API Route:**

```typescript
// app/api/payment/create-intent/route.ts
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

export async function POST(request: NextRequest) {
  // Rate limiting por IP
  const ip = request.ip ?? '127.0.0.1';
  
  try {
    await limiter.check(10, ip); // 10 requests por minuto
  } catch {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  // ... resto do código
}
```

### Exemplo 4: Webhook Testing Local

```bash
# Terminal 1: Rodar aplicação
npm run dev

# Terminal 2: Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Terminal 3: Trigger eventos de teste
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
```

**Verificar logs:**

```typescript
// app/api/webhooks/stripe/route.ts
export async function POST(request: NextRequest) {
  // ... código existente
  
  // Adicionar logging
  console.log('📧 Webhook received:', event.type);
  console.log('💰 Payment Intent:', event.data.object.id);
  console.log('👤 Customer:', event.data.object.metadata);
  
  // ... resto do código
}
```

### Exemplo 5: Criar Template de Email Customizado

```typescript
// services/email-templates.ts
export function getWelcomeEmail(customerName: string, jobId: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { 
            display: inline-block; 
            background: #2563eb; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to PhotoRestoreNow!</h1>
          </div>
          <div class="content">
            <p>Hi ${customerName},</p>
            <p>Thank you for choosing PhotoRestoreNow! Your order has been confirmed.</p>
            <p><strong>Order ID:</strong> ${jobId}</p>
            <p>We're now processing your photos and you'll receive an email when they're ready.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/status/${jobId}" class="button">
                Track Your Order
              </a>
            </p>
            <p>Best regards,<br>The PhotoRestoreNow Team</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
```

**Uso:**

```typescript
// services/email.service.ts
import { getWelcomeEmail } from './email-templates';

export async function sendWelcome(email: string, name: string, jobId: string) {
  return sendEmail({
    to: email,
    subject: 'Welcome to PhotoRestoreNow!',
    html: getWelcomeEmail(name, jobId),
  });
}
```

### Exemplo 6: Adicionar Logging Estruturado

```typescript
// lib/logger.ts
type LogLevel = 'info' | 'warn' | 'error';

interface LogData {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: any;
}

class Logger {
  private log(level: LogLevel, message: string, meta?: Record<string, any>) {
    const logData: LogData = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    };

    if (process.env.NODE_ENV === 'production') {
      // Em produção: enviar para serviço de logging (Sentry, Datadog, etc)
      console.log(JSON.stringify(logData));
    } else {
      // Em desenvolvimento: formato legível
      const emoji = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '✅';
      console.log(`${emoji} [${level.toUpperCase()}] ${message}`, meta || '');
    }
  }

  info(message: string, meta?: Record<string, any>) {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: Record<string, any>) {
    this.log('warn', message, meta);
  }

  error(message: string, error?: Error | any, meta?: Record<string, any>) {
    this.log('error', message, {
      ...meta,
      error: error?.message,
      stack: error?.stack,
    });
  }
}

export const logger = new Logger();
```

**Uso:**

```typescript
// services/job.service.ts
import { logger } from '@/lib/logger';

export async function processJob(jobId: string) {
  logger.info('Job processing started', { jobId });

  try {
    // ... processamento
    logger.info('Job completed successfully', { 
      jobId, 
      duration: Date.now() - startTime 
    });
  } catch (error) {
    logger.error('Job processing failed', error, { jobId });
    throw error;
  }
}
```

### Exemplo 7: Implementar Retry com Backoff Exponencial

```typescript
// lib/retry.ts
interface RetryOptions {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }

      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }

  throw lastError!;
}
```

**Uso:**

```typescript
// providers/vanceai.provider.ts
import { retry } from '@/lib/retry';

async function uploadImage(request: RestorationRequest) {
  return await retry(
    async () => {
      const response = await axios.post(
        `${this.apiUrl}/upload`,
        formData,
        { timeout: 30000 }
      );
      
      if (response.data.code !== 200) {
        throw new Error('Upload failed');
      }
      
      return { jobId: response.data.data.uid };
    },
    {
      maxAttempts: 3,
      initialDelay: 2000,
      backoffFactor: 2,
    }
  );
}
```

---

## 🧪 Testes

### Teste Manual - Checklist

```markdown
## Upload e Validação
- [ ] Upload de imagem JPG funciona
- [ ] Upload de imagem PNG funciona
- [ ] Upload de imagem WEBP funciona
- [ ] Upload de arquivo > 10MB é rejeitado
- [ ] Upload de arquivo .pdf é rejeitado
- [ ] Múltiplos uploads respeitam limite do pacote

## Carrinho
- [ ] Adicionar item ao carrinho funciona
- [ ] Remover item do carrinho funciona
- [ ] Total é calculado corretamente
- [ ] Carrinho persiste após reload
- [ ] Limpar carrinho funciona

## Pagamento
- [ ] Cartão de teste passa (4242...)
- [ ] Cartão inválido é rejeitado
- [ ] PayPal aparece como opção
- [ ] Webhook recebe evento de sucesso
- [ ] Email de confirmação é enviado

## Processamento
- [ ] Job é criado após pagamento
- [ ] Status pode ser consultado
- [ ] Imagens são processadas
- [ ] Email de conclusão é enviado
- [ ] Links de download funcionam
```

### Teste com cURL

```bash
# Criar Payment Intent
curl -X POST http://localhost:3000/api/payment/create-intent \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1999,
    "email": "test@example.com",
    "packageId": "1-photo",
    "imageCount": 1
  }'

# Consultar status de job
curl http://localhost:3000/api/jobs/status?jobId=job_123456
```

---

## 🎨 Customização de Tema

### Alterar Cores Principais

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Trocar azul por verde
        primary: {
          DEFAULT: 'hsl(142, 71%, 45%)', // Verde
          foreground: 'hsl(0, 0%, 100%)',
        },
      },
    },
  },
};
```

```css
/* app/globals.css */
@layer base {
  :root {
    --primary: 142 71% 45%; /* Verde */
    --primary-foreground: 0 0% 100%;
  }
}
```

### Adicionar Dark Mode

```typescript
// tailwind.config.ts
export default {
  darkMode: ['class'], // Já configurado!
  // ...
};
```

```typescript
// components/ThemeToggle.tsx
'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark';
    if (stored) {
      setTheme(stored);
      document.documentElement.classList.toggle('dark', stored === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <Button onClick={toggleTheme} variant="ghost" size="icon">
      {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  );
}
```

---

## 🔧 Troubleshooting Comum

### Problema 1: "Module not found"

```bash
# Limpar cache e reinstalar
rm -rf node_modules .next
npm install
```

### Problema 2: Variáveis de ambiente não carregam

```bash
# Certifique-se de usar NEXT_PUBLIC_ para variáveis do frontend
NEXT_PUBLIC_STRIPE_KEY=pk_test_... # ✅ Acessível no frontend
STRIPE_SECRET_KEY=sk_test_...      # ✅ Apenas backend

# Reinicie o servidor após mudar .env.local
npm run dev
```

### Problema 3: Webhook não recebe eventos

```bash
# 1. Verifique se Stripe CLI está rodando
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 2. Verifique URL no Stripe Dashboard
# Deve ser: https://your-domain.com/api/webhooks/stripe

# 3. Verifique STRIPE_WEBHOOK_SECRET
# Deve começar com: whsec_...
```

### Problema 4: Build falha na Vercel

```bash
# Localmente, teste o build
npm run build

# Se passar local mas falhar na Vercel:
# - Verifique environment variables
# - Verifique se todas as dependencies estão em package.json
# - Veja logs detalhados no Vercel Dashboard
```

---

## 📚 Recursos Adicionais

### Documentação Oficial
- [Next.js](https://nextjs.org/docs)
- [Stripe](https://stripe.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

### Tutoriais Úteis
- [Next.js + Stripe](https://vercel.com/guides/getting-started-with-nextjs-stripe)
- [File Upload Best Practices](https://uploadcare.com/blog/file-upload-best-practices/)
- [Email Templates](https://reallygoodemails.com/)

### Ferramentas
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Email Testing](https://mailtrap.io/)
- [Image Compression](https://tinypng.com/)

---

Pronto para começar! 🚀
