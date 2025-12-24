# Docker Setup - PhotoRestoreNow

## 🐳 Configuração Docker

Este projeto está configurado com Docker para facilitar o desenvolvimento e deploy.

---

## 📦 O que está incluído

### Serviços do Docker Compose

1. **app** - Aplicação Next.js principal
2. **redis** - Cache e fila de jobs (preparado para futuro)
3. **postgres** - Database (preparado para futuro)

---

## 🚀 Quick Start

### Desenvolvimento Local com Docker

```bash
# 1. Criar arquivo .env.local
cp .env.example .env.local
# Edite .env.local com suas credenciais

# 2. Iniciar todos os serviços
docker-compose up

# Ou em background
docker-compose up -d

# 3. Acessar aplicação
# http://localhost:3000
```

### Parar serviços

```bash
# Parar containers
docker-compose down

# Parar e remover volumes (CUIDADO: apaga dados)
docker-compose down -v
```

---

## 🛠️ Comandos Úteis

### Build

```bash
# Build da imagem
docker-compose build

# Rebuild sem cache
docker-compose build --no-cache

# Build apenas do app
docker-compose build app
```

### Logs

```bash
# Ver logs de todos os serviços
docker-compose logs

# Seguir logs em tempo real
docker-compose logs -f

# Logs de um serviço específico
docker-compose logs app
docker-compose logs postgres
docker-compose logs redis
```

### Executar comandos

```bash
# Executar comando no container
docker-compose exec app npm run lint

# Acessar shell do container
docker-compose exec app sh

# Instalar nova dependência
docker-compose exec app npm install <package>
```

### Gerenciar containers

```bash
# Listar containers
docker-compose ps

# Reiniciar serviço
docker-compose restart app

# Parar serviço específico
docker-compose stop postgres

# Iniciar serviço específico
docker-compose start postgres
```

---

## 📊 Serviços e Portas

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| Next.js | 3000 | Aplicação principal |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache/Queue |

---

## 🔧 Configuração Avançada

### Variáveis de Ambiente no Docker

```yaml
# docker-compose.yml
services:
  app:
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

Ou use arquivo `.env.local`:

```yaml
services:
  app:
    env_file:
      - .env.local
```

### Volumes Persistentes

```yaml
volumes:
  uploads:      # Arquivos de upload
  redis-data:   # Dados do Redis
  postgres-data: # Dados do PostgreSQL
```

**Backup de volumes:**

```bash
# Backup
docker run --rm -v photo-restore-now_postgres-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres-backup.tar.gz -C /data .

# Restore
docker run --rm -v photo-restore-now_postgres-data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/postgres-backup.tar.gz -C /data
```

---

## 🏭 Deploy com Docker

### Build para Produção

```bash
# 1. Build otimizado
docker build -t photo-restore-now:latest .

# 2. Rodar em produção
docker run -p 3000:3000 \
  --env-file .env.production \
  photo-restore-now:latest
```

### Deploy em VPS

```bash
# 1. No servidor, clonar repo
git clone https://github.com/your-user/photo-restore-now
cd photo-restore-now

# 2. Configurar .env.local com credenciais de produção
nano .env.local

# 3. Iniciar com docker-compose
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 4. Configurar Nginx como proxy reverso (opcional)
```

### Docker Hub

```bash
# Login
docker login

# Tag
docker tag photo-restore-now:latest yourusername/photo-restore-now:latest

# Push
docker push yourusername/photo-restore-now:latest

# Pull em outro servidor
docker pull yourusername/photo-restore-now:latest
```

---

## 🔍 Troubleshooting

### Container não inicia

```bash
# Ver logs
docker-compose logs app

# Verificar status
docker-compose ps

# Rebuild
docker-compose build --no-cache app
```

### Porta já em uso

```bash
# Mudar porta no docker-compose.yml
ports:
  - "3001:3000"  # Host:Container
```

### Permissões de arquivo

```bash
# Dar permissão ao diretório de uploads
sudo chown -R 1001:1001 uploads/
```

### Limpeza de espaço

```bash
# Remover containers parados
docker container prune

# Remover imagens não usadas
docker image prune

# Remover tudo (CUIDADO!)
docker system prune -a
```

---

## 🎯 Hot Reload

Em desenvolvimento, o Docker está configurado com hot reload:

```yaml
volumes:
  - .:/app              # Código fonte
  - /app/node_modules   # Não sobrescrever node_modules
  - /app/.next          # Não sobrescrever build
```

Mudanças no código serão refletidas automaticamente.

---

## 🔐 Segurança

### Não incluir no container:

```
# .dockerignore
.env
.env.local
node_modules
.git
```

### Usuário não-root:

```dockerfile
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
```

### Scan de vulnerabilidades:

```bash
docker scan photo-restore-now:latest
```

---

## 📈 Monitoramento

### Ver uso de recursos:

```bash
# CPU e memória
docker stats

# Específico do app
docker stats photo-restore-now-app-1
```

### Limites de recursos:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          memory: 512M
```

---

## 🚀 Próximos Passos

### Para usar PostgreSQL:

1. Descomentar no `docker-compose.yml`
2. Configurar `DATABASE_URL` no `.env.local`
3. Instalar Prisma: `npm install @prisma/client`
4. Rodar migrations: `npx prisma migrate dev`

### Para usar Redis:

1. Já está configurado no `docker-compose.yml`
2. Instalar: `npm install ioredis bull`
3. Conectar em: `redis://localhost:6379`

---

## 📚 Recursos

- [Docker Docs](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Next.js Docker](https://nextjs.org/docs/deployment#docker-image)
- [Node Alpine](https://hub.docker.com/_/node)

---

**Docker configurado e pronto para uso!** 🐳
