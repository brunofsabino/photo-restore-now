# Security Checklist for Production

## ✅ Implemented

### 1. Environment Variables
- All secrets use environment variables (not hardcoded)
- `.env` file is in `.gitignore`

### 2. Authentication
- NextAuth with OAuth providers (Google, Facebook)
- Guest checkout with email validation
- Session-based authentication

### 3. Database
- Prisma ORM prevents SQL injection
- Database credentials in environment variables

## 🚨 CRITICAL - Must Fix Before Production

### 1. **Environment Variables Security**
**Current Risk:** Secrets in Dockerfile build args
**Fix Required:**
```bash
# Use Docker secrets or external secret management
# Never put secrets in Dockerfile ENV commands
# Use .env.production with strong values
```

### 2. **File Upload Validation** ⚠️ HIGH PRIORITY
**Current Risk:** Only frontend validation, no backend checks
**Attack Vector:** Malicious files, code injection, XSS
**Fix:** Implement server-side validation

### 3. **Rate Limiting** ⚠️ HIGH PRIORITY
**Current Risk:** No protection against brute force, DDoS
**Attack Vector:** API abuse, credential stuffing
**Fix:** Add rate limiting middleware

### 4. **CSRF Protection**
**Current Risk:** Forms can be submitted from external sites
**Fix:** NextAuth provides CSRF tokens, but verify implementation

### 5. **Content Security Policy (CSP)**
**Current Risk:** XSS attacks possible
**Fix:** Add CSP headers

### 6. **API Route Authentication**
**Current Risk:** Some API routes may be accessible without auth
**Fix:** Verify all routes require proper authentication

## 📋 Production Deployment Checklist

### Before Deploy:

- [ ] Generate new `NEXTAUTH_SECRET` (32+ characters)
- [ ] Generate new `SESSION_SECRET` (32+ characters)
- [ ] Use real Stripe keys (not test keys)
- [ ] Configure real OAuth credentials (Google, Facebook)
- [ ] Set strong database password
- [ ] Enable HTTPS only
- [ ] Set secure cookie flags
- [ ] Configure CORS properly
- [ ] Add rate limiting
- [ ] Implement file upload security
- [ ] Enable security headers
- [ ] Set up error logging (hide stack traces)
- [ ] Configure backup strategy
- [ ] Set up monitoring and alerts
- [ ] Review all API routes for auth
- [ ] Test all authentication flows
- [ ] Scan for vulnerabilities

### Secrets to Generate:
```bash
# Generate strong secrets:
openssl rand -base64 32  # For NEXTAUTH_SECRET
openssl rand -base64 32  # For SESSION_SECRET
openssl rand -base64 32  # For DATABASE_PASSWORD
```

### Environment Variables for Production:
```env
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
DATABASE_URL=postgresql://user:STRONG_PASSWORD@host:5432/db?sslmode=require
NEXTAUTH_SECRET=<generated-secret-32-chars>
SESSION_SECRET=<generated-secret-32-chars>
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🛡️ Security Headers Needed

```typescript
// next.config.mjs
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
]
```

## 🔒 Additional Recommendations

### 1. Input Sanitization
- Sanitize all user inputs (email, name, etc.)
- Use libraries like `DOMPurify` for HTML content

### 2. Error Handling
- Never expose stack traces to users in production
- Log errors securely server-side
- Use generic error messages

### 3. Payment Security
- Always use Stripe's secure payment form
- Never store credit card data
- Use webhook signature verification

### 4. Database Security
- Use connection pooling
- Enable SSL/TLS for database connections
- Regular backups
- Least privilege access

### 5. Monitoring
- Set up logging (Winston, Pino)
- Monitor for suspicious activity
- Track failed login attempts
- Alert on unusual patterns

### 6. Updates
- Keep dependencies updated
- Run `npm audit` regularly
- Monitor security advisories

## 🚨 Immediate Actions Required

1. **Remove Docker secret warnings** - Use proper secret management
2. **Add file upload validation API route**
3. **Implement rate limiting**
4. **Add security headers**
5. **Generate production secrets**
6. **Configure HTTPS redirect**
