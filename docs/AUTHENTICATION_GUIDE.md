# Guia de Implementação de Autenticação - PhotoRestoreNow

## 🔐 Status Atual

**O projeto NÃO possui autenticação de usuários implementada.**

Atualmente, o sistema funciona sem login:
- Cliente acessa o site
- Escolhe pacote
- Faz upload
- Paga
- Recebe fotos por email

---

## 🎯 Implementação Recomendada: NextAuth.js

### 1. Instalação

```bash
npm install next-auth @auth/prisma-adapter
npm install @prisma/client prisma -D
```

### 2. Configurar Prisma (Database)

```bash
npx prisma init
```

**prisma/schema.prisma:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  orders        Order[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Order {
  id              String   @id @default(cuid())
  userId          String
  packageId       String
  amount          Int
  status          String
  paymentIntentId String?
  user            User     @relation(fields: [userId], references: [id])
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 3. Criar API Route do NextAuth

**app/api/auth/[...nextauth]/route.ts:**
```typescript
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

### 4. Configurar Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto
3. Ative Google+ API
4. Credentials > Create Credentials > OAuth 2.0 Client ID
5. Adicione URLs autorizadas:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
6. Adicione redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`
7. Copie Client ID e Client Secret

**.env.local:**
```env
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 5. Configurar Facebook OAuth

1. Acesse [Facebook Developers](https://developers.facebook.com/)
2. Create App > Consumer > Continue
3. Settings > Basic
4. Adicione domínios:
   - App Domains: `localhost, yourdomain.com`
5. Facebook Login > Settings
6. Valid OAuth Redirect URIs:
   - `http://localhost:3000/api/auth/callback/facebook`
   - `https://yourdomain.com/api/auth/callback/facebook`
7. Copie App ID e App Secret

**.env.local:**
```env
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
```

### 6. Configurar NEXTAUTH_SECRET

```bash
# Gerar secret
openssl rand -base64 32
```

```env
NEXTAUTH_SECRET=your_generated_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### 7. Criar SessionProvider

**app/providers/SessionProvider.tsx:**
```typescript
'use client'

import { SessionProvider } from "next-auth/react"

export default function AuthSessionProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return <SessionProvider>{children}</SessionProvider>
}
```

**app/layout.tsx (atualizar):**
```typescript
import AuthSessionProvider from './providers/SessionProvider'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  )
}
```

### 8. Criar Página de Login

**app/auth/signin/page.tsx:**
```typescript
'use client'

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to PhotoRestoreNow</CardTitle>
          <CardDescription>
            Choose your preferred sign-in method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => signIn('google', { callbackUrl: '/upload' })}
            className="w-full"
            variant="outline"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <Button
            onClick={() => signIn('facebook', { callbackUrl: '/upload' })}
            className="w-full"
            variant="outline"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Continue with Facebook
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 9. Proteger Rotas

**middleware.ts (na raiz do projeto):**
```typescript
export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    '/upload/:path*',
    '/checkout/:path*',
    '/orders/:path*'
  ]
}
```

### 10. Usar Session nos Componentes

**Exemplo - Header com Login:**
```typescript
'use client'

import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function Header() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Loading...</div>
  }

  return (
    <header>
      {session ? (
        <div className="flex items-center gap-4">
          <img 
            src={session.user?.image || ''} 
            alt={session.user?.name || ''} 
            className="w-10 h-10 rounded-full"
          />
          <span>{session.user?.name}</span>
          <Button onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>
      ) : (
        <Button onClick={() => signIn()}>
          Sign In
        </Button>
      )}
    </header>
  )
}
```

**Exemplo - Proteger API Route:**
```typescript
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const userId = session.user.id
  // Processar pedido com userId...
}
```

---

## 📝 Variáveis de Ambiente Finais

Adicione ao **.env.local:**

```env
# Database
DATABASE_URL="postgresql://photorestore:photorestore_dev@localhost:5432/photorestore"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret_32_chars_min

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
```

---

## 🧪 Testar

```bash
# 1. Rodar Prisma migrations
npx prisma migrate dev

# 2. Gerar Prisma Client
npx prisma generate

# 3. Iniciar aplicação
npm run dev

# 4. Testar login
# Acesse: http://localhost:3000/auth/signin
```

---

## 💰 Custos

**Google OAuth:** ✅ GRÁTIS (até 10 milhões de usuários)
**Facebook Login:** ✅ GRÁTIS (ilimitado)
**Database (Vercel Postgres):** Plano gratuito até 256MB

---

## 🔄 Integração com Fluxo Existente

Atualize as rotas de pagamento para associar pedidos ao usuário:

```typescript
// app/api/payment/create-intent/route.ts
import { getServerSession } from "next-auth"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  // Criar pedido vinculado ao usuário
  const order = await prisma.order.create({
    data: {
      userId: userId || 'guest',
      packageId,
      amount,
      status: 'pending'
    }
  })
}
```

---

## ✅ Checklist de Implementação

- [ ] Instalar NextAuth.js e dependências
- [ ] Configurar Prisma com PostgreSQL
- [ ] Criar OAuth App no Google Cloud Console
- [ ] Criar OAuth App no Facebook Developers
- [ ] Configurar variáveis de ambiente
- [ ] Criar API route [...nextauth]
- [ ] Criar página de login
- [ ] Adicionar SessionProvider
- [ ] Proteger rotas com middleware
- [ ] Atualizar API routes para usar sessão
- [ ] Testar fluxo completo de login

---

## 📚 Recursos

- [NextAuth.js Docs](https://next-auth.js.org/)
- [Google OAuth Setup](https://next-auth.js.org/providers/google)
- [Facebook OAuth Setup](https://next-auth.js.org/providers/facebook)
- [Prisma Docs](https://www.prisma.io/docs)
