# Dockerfile para PhotoRestoreNow

# Stage 1: Dependências
FROM node:18-alpine AS deps
WORKDIR /app

# Copiar package files
COPY package.json package-lock.json* ./

# Instalar dependências
RUN npm ci

# Stage 2: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Variáveis de ambiente dummy para build
ENV STRIPE_SECRET_KEY="sk_test_dummy_for_build"
ENV STRIPE_PUBLISHABLE_KEY="pk_test_dummy_for_build"
ENV STRIPE_WEBHOOK_SECRET="whsec_dummy_for_build"
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_dummy_for_build"
ENV VANCEAI_API_KEY="dummy_for_build"
ENV VANCEAI_API_URL="https://api-service.vanceai.com"
ENV HOTPOT_API_KEY="dummy_for_build"
ENV HOTPOT_API_URL="https://api.hotpot.ai"
ENV RESEND_API_KEY="re_dummy_for_build"
ENV RESEND_FROM_EMAIL="noreply@photorestorenow.com"
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV REDIS_URL="redis://localhost:6379"
ENV SESSION_SECRET="dummy_session_secret_for_build_only"
ENV STORAGE_PATH="./uploads"
ENV NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Copiar dependências do stage anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Stage 3: Runtime
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos necessários do build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Criar diretório para uploads
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads

# Mudar para usuário não-root
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
