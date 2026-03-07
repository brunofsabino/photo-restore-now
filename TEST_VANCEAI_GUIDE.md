# 🧪 Como Testar VanceAI Real (Antes do Deploy)

## ⚠️ IMPORTANTE
Este teste vai consumir **2-3 créditos** dos seus 399 créditos VanceAI disponíveis.

---

## 📋 Pré-requisitos

- [x] Build funcionando (`npm run build` passou)
- [x] Dev server rodando (`npm run dev`)
- [ ] Decidir se vai testar agora

---

## 🎯 Objetivo

Testar o fluxo completo **com VanceAI real** para garantir que:
1. ✅ VanceAI API está funcionando
2. ✅ Fotos são realmente restauradas (não fake)
3. ✅ Integração está correta
4. ✅ Resultado é satisfatório

---

## 🔧 Passo 1: Configurar Modo VanceAI (Temporário)

### 1.1 Editar `.env.local`:

```bash
# Mude estas 2 linhas:

# ANTES:
AI_PROVIDER=fake
TEST_MODE=true

# DEPOIS:
AI_PROVIDER=vanceai
TEST_MODE=true  # Mantém true para não cobrar no Stripe
```

### 1.2 Reiniciar servidor:

```bash
# Parar servidor (Ctrl+C se estiver rodando)
# Iniciar novamente:
npm run dev
```

---

## 🧪 Passo 2: Fazer Teste Real

### 2.1 Preparar uma foto de teste
- Escolha uma foto velha, com danos, arranhões
- Formato: JPG, PNG ou WEBP
- Tamanho: máximo 10MB

### 2.2 Executar teste via browser:

1. Acesse: http://localhost:3000
2. Clique em **"Get Started"** ou **"Pricing"**
3. Escolha pacote **"1 Photo"** ($9.99)
4. Faça upload da foto de teste
5. Prossiga para pagamento
6. Use cartão de teste: **4242 4242 4242 4242**
7. Complete o checkout

### 2.3 Acompanhar processamento:

**Opção A: Via Inngest Dashboard**
1. Acesse: https://app.inngest.com
2. Vá em "Runs"
3. Procure por `processRestorationJob`
4. Acompanhe o progresso em tempo real

**Opção B: Via Terminal Logs**
```bash
# Em outro terminal, monitore os logs:
tail -f .next/server/app/api/inngest/route.log

# Ou veja logs do Inngest:
npx inngest-cli dev
```

### 2.4 Verificar resultado:

**Email:**
- Confira inbox do email usado no checkout
- Deve receber 2 emails:
  1. Confirmação de pedido
  2. Fotos restauradas (com links de download)

**Dashboard:**
- Acesse: http://localhost:3000/dashboard
- Veja o pedido na lista
- Baixe a foto restaurada
- **Compare com a original!**

---

## ✅ Critérios de Sucesso

O teste passou se:
- [ ] VanceAI processou sem erros
- [ ] Foto restaurada é visualmente melhor
- [ ] Email de conclusão foi recebido
- [ ] Download funciona
- [ ] Apenas 1 crédito foi consumido

---

## 📊 Verificar Créditos Consumidos

```bash
# Execute este script para verificar saldo:
node test-vanceai-credits.js
```

Esperado:
- **Antes do teste:** 399 créditos
- **Depois do teste:** 398 créditos (ou 397 se testou 2 fotos)

---

## 🔄 Passo 3: Voltar ao Modo Fake (Opcional)

Se quiser continuar desenvolvendo sem gastar créditos:

### 3.1 Editar `.env.local`:

```bash
# Volte para:
AI_PROVIDER=fake
TEST_MODE=true
```

### 3.2 Reiniciar servidor:

```bash
npm run dev
```

---

## 🚨 Se Algo Der Errado

### Erro: "VanceAI API Key Invalid"
```bash
# Verifique a chave:
echo $VANCEAI_API_KEY

# Deve aparecer uma chave válida (não vazia)
# Se estiver vazia, adicione no .env.local:
VANCEAI_API_KEY=sua_chave_aqui
```

### Erro: "Insufficient Credits"
- Seus créditos acabaram
- Compre mais em: https://vanceai.com
- Ou continue em modo fake

### Erro: "Job Failed"
1. Veja logs do Inngest
2. Verifique logs do servidor (`npm run dev` output)
3. Formato da imagem pode estar incorreto
4. Tente outra foto

### Foto restaurada igual à original
- **Isso é esperado em modo FAKE**
- Confirme que `AI_PROVIDER=vanceai` no `.env.local`
- Reinicie o servidor

---

## 📸 Comparação Visual

Para melhor comparação:

1. Abra a foto original
2. Abra a foto restaurada
3. Coloque lado a lado
4. Procure por:
   - Arranhões removidos ✅
   - Cores mais vivas ✅
   - Nitidez melhorada ✅
   - Manchas corrigidas ✅

---

## 💰 Custos

**Por este teste:**
- 1 foto = 1 crédito VanceAI = ~$0.10
- Total: **$0.10 - $0.30** (se testar 2-3 fotos)

**Saldo restante:**
- Créditos: 399 → 396-398
- Valor: ~$39.90 - $39.60

---

## ✅ Após Teste Bem-Sucedido

Você está pronto para:
1. ✅ Configurar ambiente de produção
2. ✅ Fazer deploy no Vercel
3. ✅ Configurar domínio photorestorenow.com
4. ✅ Ativar modo real (AI_PROVIDER=vanceai + TEST_MODE=false)

**Próximo passo:** [DEPLOY_VERCEL_GUIDE.md](DEPLOY_VERCEL_GUIDE.md)

---

## 🎯 Checklist Final

Antes de deploy em produção:

- [ ] Testou VanceAI real (este guia)
- [ ] Resultado satisfatório
- [ ] Entendeu o consumo de créditos
- [ ] Sabe voltar para modo fake
- [ ] Leu o guia de deploy

---

**Criado em:** 1 de Março de 2026  
**Créditos VanceAI disponíveis:** 399  
**Status:** Pronto para teste ✅

