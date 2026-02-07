# Setup Cloudflare R2 Storage

## O que é Cloudflare R2?

Cloudflare R2 é um **storage S3-compatível** para arquivos estáticos (imagens, vídeos, etc.).

**Por que usar R2?**
- ✅ **FREE 10 GB** de armazenamento/mês
- ✅ **Transferência GRÁTIS** (S3 cobra caro!)
- ✅ API compatível com AWS S3 (código similar)
- ✅ Global CDN (rápido em qualquer lugar do mundo)
- ✅ Integração simples

**Custo após free tier:**
- $0.015/GB armazenado (~$1.50 por 100 GB)
- $0.00/GB transferência (SEMPRE GRÁTIS)

---

## Passo 1: Criar Conta Cloudflare

1. Acesse [cloudflare.com](https://cloudflare.com/)
2. **Sign up** (gratuito)
3. Verificar email

---

## Passo 2: Criar Bucket R2

### 2.1 Ativar R2

1. Dashboard Cloudflare → Sidebar → **R2 Object Storage**
2. Se primeiro acesso: **Purchase R2** (não se preocupe, é grátis até 10 GB)
3. Adicionar cartão de crédito (não será cobrado no free tier)

### 2.2 Criar Bucket

1. **Create bucket**
   - Bucket name: `photo-restore-now`
   - Location: **Automatic** (Cloudflare escolhe melhor localização)
2. **Create bucket**

---

## Passo 3: Gerar API Tokens

### 3.1 Criar Token

1. R2 Overview → **Manage R2 API Tokens**
2. **Create API Token**
   - Token name: `photorestorenow-production`
   - Permissions: **Object Read & Write**
   - Specify bucket: `photo-restore-now`
   - TTL: **Forever** (ou definir expiração)
3. **Create API Token**

### 3.2 Salvar Credenciais

Copiar e salvar com segurança:

```
Access Key ID: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Secret Access Key: yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

⚠️ **IMPORTANTE:** O Secret Access Key só é mostrado UMA VEZ. Salve imediatamente!

### 3.3 Obter Account ID

1. R2 Overview → Topo da página
2. Copiar **Account ID**: `1234567890abcdef1234567890abcdef`

---

## Passo 4: Configurar Public Access (Opcional)

Por padrão, R2 buckets são **privados**. Para servir imagens diretamente (sem signed URLs):

### 4.1 Conectar Custom Domain OU usar R2.dev

**Opção A: R2.dev (Simples)**
1. Bucket settings → **Settings** → **Public access**
2. **Allow access** → **Enable R2.dev subdomain**
3. Copiar URL: `https://pub-xxxxxxxxxxxx.r2.dev`
4. Salvar como `R2_PUBLIC_URL`

**Opção B: Custom Domain (Avançado)**
1. Bucket settings → **Settings** → **Custom Domains**
2. **Connect Domain**: `cdn.photorestorenow.com`
3. Adicionar CNAME no DNS:
   ```
   cdn.photorestorenow.com → <bucket-id>.r2.cloudflarestorage.com
   ```
4. Aguardar propagação
5. URL público: `https://cdn.photorestorenow.com`

**Recomendação:** Use R2.dev para começar (mais simples).

---

## Passo 5: Configurar Ambiente Local

### 5.1 Adicionar ao .env.local

Criar/atualizar `.env.local`:

```env
# Cloudflare R2
R2_ACCOUNT_ID=1234567890abcdef1234567890abcdef
R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_SECRET_ACCESS_KEY=yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
R2_BUCKET_NAME=photo-restore-now
R2_PUBLIC_URL=https://pub-xxxxxxxxxxxx.r2.dev
```

### 5.2 Testar Upload

Reiniciar dev server:
```bash
npm run dev
```

Testar upload:
1. Acessar: `http://localhost:3000/test-upload`
2. Selecionar imagem
3. Upload
4. Verificar se arquivo aparece em: R2 Dashboard → `photo-restore-now` bucket

---

## Passo 6: Configurar para Vercel (Produção)

### 6.1 Adicionar Environment Variables

Vercel Dashboard → Settings → Environment Variables:

```env
R2_ACCOUNT_ID=1234567890abcdef1234567890abcdef
R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_SECRET_ACCESS_KEY=yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
R2_BUCKET_NAME=photo-restore-now
R2_PUBLIC_URL=https://pub-xxxxxxxxxxxx.r2.dev
```

### 6.2 Redeploy

Vercel → Deployments → **Redeploy**

---

## Estrutura de Arquivos no R2

O app automaticamente organiza em pastas:

```
photo-restore-now/
├── original/
│   ├── 1738123456789-photo1.jpg
│   ├── 1738123456790-photo2.jpg
│   └── ...
├── restored/
│   ├── 1738123456789-photo1-restored.jpg
│   ├── 1738123456790-photo2-restored.jpg
│   └── ...
└── temp/
    └── ...
```

**Definido em:** `lib/constants.ts` → `STORAGE_PATHS`

---

## Como Funciona no Código

### Upload (services/r2-storage.service.ts)

```typescript
import { uploadFile } from '@/services/storage.service';

// Automaticamente usa R2 se configurado
const result = await uploadFile(
  buffer,      // Buffer da imagem
  'photo.jpg', // Nome do arquivo
  'ORIGINAL_IMAGES', // Pasta (original/)
  'image/jpeg' // Content-Type
);

console.log(result.url); // https://pub-xxx.r2.dev/original/1738123456789-photo.jpg
```

### Download

```typescript
import { downloadFile } from '@/services/storage.service';

const buffer = await downloadFile('original/1738123456789-photo.jpg');
```

### Signed URL (acesso temporário)

```typescript
import { getSignedDownloadUrl } from '@/services/storage.service';

// URL válida por 1 hora
const signedUrl = await getSignedDownloadUrl(
  'restored/1738123456789-photo-restored.jpg',
  3600 // 1 hora em segundos
);

// Usuário pode baixar via signed URL
console.log(signedUrl); // https://xxx.r2.cloudflarestorage.com/...?signature=...
```

---

## Fallback para Local Storage

Se R2 **não estiver configurado**, o app automaticamente usa storage local (`uploads/`):

```typescript
// services/storage.service.ts verifica:
if (R2Storage.isR2Configured()) {
  return R2Storage.uploadFile(...); // Usa R2
} else {
  // Fallback para filesystem local
  fs.writeFileSync(filePath, buffer);
}
```

**Útil para:**
- Desenvolvimento local (sem configurar R2)
- Testes
- Ambiente staging

⚠️ **Produção:** Sempre use R2 (ou outro cloud storage). Vercel não persiste arquivos no filesystem.

---

## Monitoramento

### Dashboard R2

1. Cloudflare → R2 → `photo-restore-now`
2. **Metrics:**
   - Storage usado
   - Requests (GET, PUT, DELETE)
   - Bandwidth (sempre $0!)

### Alertas (Opcional)

1. R2 → Settings → **Notifications**
2. Adicionar alerta quando atingir 8 GB (80% do free tier)

---

## Migrar de S3 para R2

Se já tem arquivos no S3:

```bash
# Instalar Rclone
brew install rclone  # ou apt-get install rclone

# Configurar S3 e R2
rclone config

# Copiar tudo
rclone copy s3:old-bucket r2:photo-restore-now
```

---

## Troubleshooting

### Erro: "Access Denied"
- Verificar permissões do token (Read & Write)
- Verificar bucket name (deve ser exato)
- Regenerar token se necessário

### Erro: "Invalid credentials"
- Verificar `R2_ACCESS_KEY_ID` e `R2_SECRET_ACCESS_KEY`
- Copiar novamente (sem espaços)

### Upload funciona mas download falha
- Se bucket é privado, use signed URLs
- Ou habilite public access (R2.dev)

### Imagens não carregam no site
- Verificar CORS do bucket:
  ```json
  [
    {
      "AllowedOrigins": ["https://photorestorenow.com"],
      "AllowedMethods": ["GET"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3600
    }
  ]
  ```

### Custo aumentando
- Verificar no dashboard: R2 → Metrics
- Primeiros 10 GB são grátis
- Transferência sempre grátis
- Deletar arquivos antigos/não utilizados

---

## Próximos Passos

1. ✅ Criar bucket R2
2. ✅ Gerar API tokens
3. ✅ Configurar .env.local
4. ✅ Testar upload localmente
5. ⏳ Configurar na Vercel
6. ⏳ Testar em produção

---

## Recursos

- **Documentação:** [developers.cloudflare.com/r2](https://developers.cloudflare.com/r2)
- **Pricing:** [cloudflare.com/products/r2/pricing](https://www.cloudflare.com/products/r2/pricing/)
- **S3 Compatibility:** [developers.cloudflare.com/r2/api/s3](https://developers.cloudflare.com/r2/api/s3/)
