# Copilot Instructions - PhotoRestoreNow

## Project Overview
PhotoRestoreNow is a **Next.js 14 (App Router) SaaS** for AI-powered photo restoration targeting the American 40+ market. It uses a **factory pattern** for AI providers, **Stripe** for payments, **Prisma + PostgreSQL** for data, and **NextAuth** for authentication. The architecture prioritizes modularity with clear service boundaries.

## Architecture & Patterns

### Factory Pattern for AI Providers
Multiple AI restoration providers (VanceAI, Hotpot, Fake) are abstracted via `services/ai-provider.factory.ts`:
```typescript
// Usage: AIProviderFactory.getProvider('vanceai' | 'hotpot' | 'fake')
// Provider selected via AI_PROVIDER env var
// Each implements: restorePhoto(imageBuffer: Buffer): Promise<Buffer>
```
**When adding new providers:** Create class in `services/*.provider.ts` implementing `IAIProvider`, add to factory switch statement.

### Service Layer Architecture
Services in `services/` directory are stateless and handle specific domains:
- `job.service.ts` - Orchestrates restoration jobs (uses in-memory Map, migrate to Prisma for production)
- `payment.service.ts` - Stripe payment intents & webhooks
- `storage.service.ts` - File uploads (currently local `uploads/`, migrate to S3/R2)
- `email.service.ts` - Resend email notifications

**Pattern:** Services coordinate between providers and external APIs. Keep business logic here, not in API routes.

### Data Flow: Cart → Payment → Job Processing
1. **Cart State:** `contexts/CartContext.tsx` uses localStorage + IndexedDB for file persistence
2. **Payment:** `/api/payment/create-intent` creates Stripe intent
3. **Webhook:** `/api/webhooks/stripe` receives payment confirmation
4. **Job Creation:** `job.service.createJob()` uploads originals, triggers async restoration
5. **Processing:** `processJob()` calls AI provider, uploads restored images, sends email

## Key Files & Conventions

### Naming Conventions
- **Components:** PascalCase (`BeforeAfterSlider.tsx`)
- **Services/Utils:** kebab-case (`job.service.ts`, `file-validation.ts`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Types:** PascalCase interfaces in `types/index.ts`

### Environment Variables
Critical vars in `.env`:
- `AI_PROVIDER=fake|vanceai|hotpot` - Controls which AI service to use
- `TEST_MODE=true` - Bypasses real Stripe payments (uses `fake` provider automatically)
- `DATABASE_URL` - Postgres connection (Prisma requires this)
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET` - Auth configuration

### Prisma Workflow
```bash
# After schema changes:
npx prisma generate        # Regenerate client
npx prisma migrate dev     # Create & apply migration
# Build command already includes: prisma generate && next build
```

Models: `User`, `Account`, `Session` (NextAuth), `Order`, `OrderImage` (restoration data)

### Testing Without External APIs
Development supports complete isolation via `TEST_MODE=true` + `AI_PROVIDER=fake`:
- Test endpoints: `/test-upload`, `/test-order`, `/api/test-restore`
- Fake provider returns original image unchanged (instant "restoration")
- Payment flows bypass Stripe when TEST_MODE enabled

## Component Structure

### shadcn/ui Pattern
Components in `components/ui/` are **copied code** (not npm package):
- Built on Radix UI + Tailwind
- Customize directly in files (no prop overrides needed)
- New components via: `npx shadcn-ui@latest add <component>`

### Page Organization (App Router)
- **Server Components by default** - Use `"use client"` only when needed (state, effects, browser APIs)
- API routes in `app/api/*/route.ts` - Export named HTTP methods (`GET`, `POST`)
- Middleware in root `middleware.ts` - Handles rate limiting + basic auth checks

## Development Workflows

### Running Locally
```bash
npm install              # Install dependencies
npm run dev             # Start dev server (localhost:3000)
npm run build           # Production build (tests build success)
npm run lint            # ESLint checks
npm run type-check      # TypeScript validation
```

### Docker Development
```bash
docker-compose up       # Runs app + postgres + redis
# App runs on http://localhost:3000
# Postgres on 5432, Redis on 6379 (for future use)
```

### Rate Limiting
Implemented in `middleware.ts` via `lib/rate-limit.ts`:
- Applies to all `/api/*` routes (except `/api/auth/*`)
- Returns 429 when exceeded
- **Modify limits in:** `lib/rate-limit.ts` config

### Security Patterns
- **Input validation:** `lib/file-validation.ts` (file size, type, content checks)
- **Sanitization:** `lib/sanitization.ts` (filename cleaning, XSS prevention)
- **Webhook verification:** `lib/webhook-verification.ts` (Stripe signature validation)
- **Logging:** `lib/logger.ts` (structured logs with levels - info, security, error)

## Integration Points

### Stripe Payment Flow
1. Frontend creates intent via `/api/payment/create-intent` (POST)
2. Client confirms with Stripe.js + `components/checkout/StripePaymentForm.tsx`
3. Webhook at `/api/webhooks/stripe` receives `payment_intent.succeeded`
4. Webhook triggers `job.service.createJob()` to start restoration

**Testing:** Use Stripe test card `4242 4242 4242 4242` or enable `TEST_MODE=true`

### NextAuth Configuration
File: `app/api/auth/[...nextauth]/route.ts`
- Providers: Google OAuth (configured), Facebook (placeholder)
- Prisma adapter for user storage
- Supports guest checkout via session cookies (`guestCheckout` cookie)

### File Storage Pattern
Current: Local filesystem (`uploads/original/`, `uploads/restored/`)
**Migration path:** Replace `storage.service.ts` functions with S3/R2 SDK calls. Interface unchanged.

### Email Notifications
Service: Resend (`services/email.service.ts`)
- `sendOrderConfirmation()` - Sent after payment
- `sendRestorationComplete()` - With download links
- `sendRestorationFailed()` - Error handling
Templates: Inline HTML in service (consider moving to `emails/` directory for complex templates)

## Common Tasks

### Adding a New AI Provider
1. Create `services/new-provider.provider.ts` implementing `IAIProvider`
2. Add to `AIProviderFactory.getProvider()` switch
3. Add env var to `.env.example`
4. Update type: `export type AIProviderType = 'vanceai' | 'hotpot' | 'fake' | 'new'`

### Creating New API Routes
```typescript
// app/api/example/route.ts
export async function POST(request: NextRequest) {
  // Validation first
  const body = await request.json();
  // Business logic in services
  const result = await someService.doWork(body);
  return NextResponse.json(result);
}
```
**Pattern:** Keep routes thin - delegate to services. Use `logger.*` for tracking.

### Adding Pricing Packages
Edit `lib/constants.ts` → `PRICING_PACKAGES` array:
```typescript
{
  id: '10-photos',
  name: 'Album Package',
  photoCount: 10,
  price: 6999, // cents
  features: ['...']
}
```
Type system enforces consistency via `PackageType` union.

## Important Constraints

- **Job storage is in-memory** (`job.service.ts` uses Map) - migrate to Prisma for production
- **File storage is local** - not suitable for multi-instance deployments
- **No queue system yet** - jobs process immediately in-memory (Redis prepared in docker-compose)
- **Guest checkout** - Cart data stored client-side (localStorage + IndexedDB), consider security implications
- **Documentation is in Portuguese** - README/ARCHITECTURE/etc are PT-BR, code is English

## Reference Documentation
Comprehensive guides in repo root:
- `ARCHITECTURE.md` - Design decisions & patterns (read this first for deep understanding)
- `DEVELOPMENT.md` - Code conventions & best practices
- `TESTING_GUIDE.md` - Test scenarios with/without external APIs
- `DEPLOYMENT.md` - Vercel deployment steps
- `PROJECT_STRUCTURE.md` - Complete file tree with descriptions
