# Guia de Desenvolvimento - PhotoRestoreNow

## 🛠️ Setup do Ambiente de Desenvolvimento

### Requisitos

- Node.js 18 ou superior
- npm ou yarn
- Git
- Editor de código (VS Code recomendado)

### Extensões VS Code Recomendadas

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Configuração Inicial

```bash
# 1. Clonar o repositório
git clone https://github.com/your-user/photo-restore-now
cd photo-restore-now

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas chaves

# 4. Rodar em desenvolvimento
npm run dev
```

---

## 📁 Estrutura do Código

### Convenções de Nomenclatura

```typescript
// Componentes: PascalCase
export function PricingCard() {}

// Funções/variáveis: camelCase
const formatPrice = (amount: number) => {}

// Constantes: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 10485760;

// Types/Interfaces: PascalCase
interface RestorationJob {}
type PackageType = '1-photo' | '3-photos';

// Arquivos:
// - Componentes: PascalCase.tsx
// - Utils/Services: kebab-case.ts
// - Páginas: page.tsx (Next.js)
```

### Padrões de Código

```typescript
// ✅ BOM: Funções com single responsibility
async function uploadImage(file: File) {
  const validated = validateFile(file);
  const buffer = await fileToBuffer(validated);
  return await storage.upload(buffer);
}

// ❌ RUIM: Função fazendo muitas coisas
async function processEverything(file: File) {
  // validação + conversão + upload + email + etc
}

// ✅ BOM: Early returns
function validateFile(file: File) {
  if (!file) return null;
  if (file.size > MAX_SIZE) return null;
  return file;
}

// ❌ RUIM: Nested ifs profundos
function validateFile(file: File) {
  if (file) {
    if (file.size <= MAX_SIZE) {
      // ...
    }
  }
}
```

---

## 🧩 Adicionar Novo Provider de IA

### 1. Criar Provider Class

```typescript
// providers/myprovider.provider.ts
import { ImageRestorationProvider, RestorationRequest, RestorationResult } from '@/types';

export class MyProvider implements ImageRestorationProvider {
  name = 'My Provider';
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.MYPROVIDER_API_KEY || '';
    this.apiUrl = process.env.MYPROVIDER_API_URL || '';

    if (!this.apiKey) {
      throw new Error('MyProvider API key not configured');
    }
  }

  async uploadImage(request: RestorationRequest): Promise<{ jobId: string }> {
    // Implementar upload
    const response = await fetch(this.apiUrl + '/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: request.imageBuffer,
    });

    const data = await response.json();
    return { jobId: data.id };
  }

  async restoreImage(jobId: string): Promise<void> {
    // Implementar início de restauração
    await fetch(this.apiUrl + `/restore/${jobId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });
  }

  async getResult(jobId: string): Promise<RestorationResult> {
    // Implementar obtenção de resultado
    const response = await fetch(this.apiUrl + `/result/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        errorMessage: 'Failed to get result',
      };
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());

    return {
      success: true,
      restoredImageBuffer: imageBuffer,
      jobId,
    };
  }

  async checkStatus(jobId: string): Promise<{ status: 'processing' | 'completed' | 'failed' }> {
    // Implementar verificação de status
    const response = await fetch(this.apiUrl + `/status/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    const data = await response.json();
    
    return {
      status: data.status === 'done' ? 'completed' : 'processing',
    };
  }
}
```

### 2. Registrar no Factory

```typescript
// providers/index.ts
import { MyProvider } from './myprovider.provider';

export function getAIProvider(): ImageRestorationProvider {
  const providerName = DEFAULT_AI_PROVIDER;

  switch (providerName) {
    case 'vanceai':
      return new VanceAIProvider();
    case 'hotpot':
      return new HotpotAIProvider();
    case 'myprovider':  // ← Adicionar aqui
      return new MyProvider();
    default:
      return new VanceAIProvider();
  }
}
```

### 3. Configurar Environment

```env
# .env.local
MYPROVIDER_API_KEY=your_api_key_here
MYPROVIDER_API_URL=https://api.myprovider.com
AI_PROVIDER=myprovider
```

### 4. Testar

```bash
# Configurar provider
export AI_PROVIDER=myprovider

# Rodar testes
npm run dev
# Testar upload e restauração
```

---

## 🎨 Adicionar Novo Componente UI

### Usando shadcn/ui

```bash
# Instalar novo componente
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add select
npx shadcn-ui@latest add badge
```

### Criar Componente Customizado

```typescript
// components/pricing/PricingCard.tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

interface PricingCardProps {
  title: string;
  price: number;
  features: string[];
  onSelect: () => void;
}

export function PricingCard({ title, price, features, onSelect }: PricingCardProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-3xl">{formatPrice(price)}</p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i}>✓ {feature}</li>
          ))}
        </ul>
        <Button onClick={onSelect} className="w-full mt-4">
          Select Package
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## 🔧 Adicionar Nova API Route

### Exemplo: Endpoint de Histórico

```typescript
// app/api/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getJobsByEmail } from '@/services/job.service';
import { z } from 'zod';

const querySchema = z.object({
  email: z.string().email(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    // Validar
    const { email: validEmail } = querySchema.parse({ email });

    // Buscar jobs
    const jobs = getJobsByEmail(validEmail);

    return NextResponse.json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid email' },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Internal error' },
      },
      { status: 500 }
    );
  }
}
```

### Testar API

```bash
# cURL
curl http://localhost:3000/api/history?email=test@email.com

# Ou use Postman/Insomnia
```

---

## 🧪 Testes

### Testar Pagamentos Localmente

```bash
# 1. Instalar Stripe CLI
# MacOS
brew install stripe/stripe-cli/stripe

# Linux
# Ver: https://stripe.com/docs/stripe-cli

# 2. Login
stripe login

# 3. Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 4. Usar cartão de teste
# 4242 4242 4242 4242
# Qualquer data futura
# Qualquer CVC (ex: 123)
```

### Testar Upload

```typescript
// Criar arquivo de teste
const testFile = new File(['test content'], 'test.jpg', {
  type: 'image/jpeg',
});

// Validar
const isValid = isValidFileType(testFile, ALLOWED_FILE_TYPES);
console.log('Valid:', isValid); // true
```

---

## 📊 Debug e Troubleshooting

### Logs

```typescript
// Development: usar console.log livremente
console.log('Processing job:', jobId);
console.error('Error:', error);

// Production: estruturar logs
logger.info('Job started', { jobId, email });
logger.error('Job failed', { jobId, error: error.message });
```

### Debug de Webhooks

```typescript
// app/api/webhooks/stripe/route.ts
export async function POST(request: NextRequest) {
  // Log request raw
  const body = await request.text();
  console.log('Webhook body:', body);
  
  // Log signature
  const signature = request.headers.get('stripe-signature');
  console.log('Signature:', signature);
  
  // ... resto do código
}
```

### Inspecionar Estado do Carrinho

```typescript
// Qualquer componente
import { useCart } from '@/contexts/CartContext';

function MyComponent() {
  const { cart } = useCart();
  console.log('Cart state:', cart);
  // ...
}
```

---

## 🚀 Performance Tips

### Otimizar Imagens

```typescript
// Use next/image sempre que possível
import Image from 'next/image';

<Image 
  src="/hero.jpg" 
  width={1200} 
  height={600} 
  alt="Hero"
  priority // Para LCP
/>
```

### Lazy Loading

```typescript
// Componentes pesados
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false, // Client-side only se necessário
});
```

### Memoização

```typescript
import { useMemo, useCallback } from 'react';

// Cálculos caros
const totalPrice = useMemo(() => {
  return cart.items.reduce((sum, item) => sum + item.price, 0);
}, [cart.items]);

// Callbacks
const handleAddToCart = useCallback((item) => {
  addToCart(item);
}, [addToCart]);
```

---

## 🔐 Segurança Checklist

- [ ] Nunca logar API keys
- [ ] Validar todos os inputs
- [ ] Sanitizar filenames
- [ ] Rate limiting em APIs sensíveis
- [ ] CORS configurado corretamente
- [ ] Webhooks com signature validation
- [ ] HTTPS em produção (Vercel faz automático)
- [ ] Secrets em variáveis de ambiente, nunca no código

---

## 📚 Recursos Úteis

### Documentação

- [Next.js Docs](https://nextjs.org/docs)
- [Stripe API](https://stripe.com/docs/api)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [TypeScript](https://www.typescriptlang.org/docs/)

### Tools

- [Stripe CLI](https://stripe.com/docs/stripe-cli) - Testar webhooks
- [Postman](https://www.postman.com/) - Testar APIs
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Vercel CLI](https://vercel.com/docs/cli)

---

## 🤝 Git Workflow

```bash
# Feature branch
git checkout -b feature/new-feature

# Commit com mensagem descritiva
git commit -m "feat: add new pricing package"

# Push
git push origin feature/new-feature

# Abrir PR no GitHub
```

### Convenção de Commits

```
feat: nova feature
fix: correção de bug
docs: mudanças em documentação
style: formatação, missing semi colons, etc
refactor: refatoração de código
test: adicionar testes
chore: atualizar dependências, etc
```
