# Configuração de Métodos de Pagamento no Stripe

## Métodos de Pagamento Disponíveis

O sistema agora suporta múltiplos métodos de pagamento através do Stripe:

✅ **Cartão de Crédito/Débito** (Visa, Mastercard, Amex, etc.)
✅ **PayPal**
✅ **Apple Pay** (Safari/iOS)
✅ **Google Pay** (Chrome/Android)
✅ **Link** (Stripe's one-click checkout)

---

## Configuração no Stripe Dashboard

### 1. Acessar o Dashboard
👉 https://dashboard.stripe.com/settings/payment_methods

### 2. Habilitar PayPal

1. Na seção **Payment methods**, procure por **PayPal**
2. Clique em **Turn on**
3. Aceite os termos do PayPal
4. Status deve ficar como **Enabled**

⚠️ **Nota**: PayPal precisa de aprovação do Stripe, que pode levar algumas horas.

### 3. Habilitar Apple Pay

1. Procure por **Apple Pay** na lista
2. Clique em **Turn on**
3. Adicione seu domínio (para produção):
   - Domínio: `photorestorenow.com`
   - Baixe o arquivo de verificação
   - Faça upload para `/.well-known/apple-developer-merchantid-domain-association`

⚠️ **Para desenvolvimento**: Apple Pay funciona automaticamente no Safari/iOS sem configuração.

### 4. Habilitar Google Pay

1. Procure por **Google Pay** na lista
2. Clique em **Turn on**
3. Para produção, adicione seu domínio

⚠️ **Para desenvolvimento**: Google Pay funciona automaticamente no Chrome.

### 5. Habilitar Link (Stripe)

1. Procure por **Link** na lista
2. Clique em **Turn on**
3. Link é automático e não requer configuração adicional

---

## Métodos Adicionais Disponíveis (Opcional)

Se quiser adicionar mais métodos de pagamento para o mercado americano:

### ACH Direct Debit (Transferência Bancária US)
- Ideal para: Pagamentos maiores
- Taxa: 0.8% (cap $5)
- Configuração: Dashboard → Payment methods → ACH Direct Debit

### Affirm (Parcelamento/Buy Now Pay Later)
- Ideal para: Valores acima de $50
- Taxa: 6% + $0.30
- Configuração: Dashboard → Payment methods → Affirm

### Afterpay/Clearpay
- Similar ao Affirm
- Configuração: Dashboard → Payment methods → Afterpay

---

## Verificar Métodos Habilitados

Para verificar quais métodos estão ativos no seu código:

```typescript
// Em services/payment.service.ts
payment_method_types: ['card', 'paypal', 'link']
```

Para adicionar mais métodos, basta incluir na lista:
```typescript
payment_method_types: ['card', 'paypal', 'link', 'affirm', 'afterpay_clearpay']
```

---

## Testando os Métodos de Pagamento

### 1. Cartão de Crédito (já funcionando)
```
Número: 4242 4242 4242 4242
Data: Qualquer data futura
CVC: Qualquer 3 dígitos
```

### 2. PayPal
- Use uma conta PayPal sandbox do Stripe
- Ou crie uma em: https://developer.paypal.com/

### 3. Apple Pay
- Precisa de Safari no macOS ou iOS
- Precisa ter cartão configurado no Apple Wallet

### 4. Google Pay
- Precisa de Chrome
- Precisa ter cartão configurado no Google Pay

---

## Layout do Formulário

O código usa `layout: 'accordion'` que mostra todos os métodos de pagamento em formato expansível:

```
┌──────────────────────────────────┐
│ 💳 Card                         ▼│
│ 💰 PayPal                       ▼│
│ 🍎 Apple Pay                    ▼│
│ 🔵 Google Pay                   ▼│
│ 🔗 Link                         ▼│
└──────────────────────────────────┘
```

Se preferir tabs (abas):
```typescript
layout: 'tabs' // Em vez de 'accordion'
```

---

## Status Atual

✅ **Configurado no código**:
- PaymentElement com múltiplos métodos
- Payment Intent com automatic_payment_methods
- Suporte para redirects (necessário para PayPal)

⏳ **Pendente no Stripe Dashboard**:
- Habilitar PayPal
- Habilitar Apple Pay (opcional para produção)
- Habilitar Google Pay (opcional para produção)

---

## Produção vs Desenvolvimento

### Desenvolvimento (localhost:3000)
- Apple Pay e Google Pay funcionam automaticamente
- PayPal usa sandbox do Stripe
- Não precisa configurar domínios

### Produção (photorestorenow.com)
- Precisa configurar domínios no Stripe
- Precisa fazer verificação Apple Pay
- PayPal funciona com aprovação do Stripe

---

## Próximos Passos

1. ✅ Código atualizado (já feito)
2. ⏳ Acessar Stripe Dashboard
3. ⏳ Habilitar PayPal
4. ⏳ Testar com diferentes métodos
5. ⏳ Em produção, configurar domínios

---

## Suporte

- Stripe Docs: https://stripe.com/docs/payments/payment-methods
- PayPal no Stripe: https://stripe.com/docs/payments/paypal
- Apple Pay: https://stripe.com/docs/apple-pay
- Google Pay: https://stripe.com/docs/google-pay
