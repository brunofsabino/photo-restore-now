# Análise Financeira - PhotoRestoreNow

## 💰 Estrutura de Custos

### 1. VanceAI API (Principal Custo)

**Planos disponíveis:**
| Créditos | Preço | Custo/Crédito | Melhor Para |
|----------|-------|---------------|-------------|
| 100 | $4.95 | $0.049 | Teste inicial |
| 200 | $7.95 | $0.040 | Primeiros clientes |
| 500 | $12.95 | $0.026 | Crescimento |
| **1000** | **$17.95** | **$0.018** | **Operação regular** ⭐ |

**Consumo por foto:**
- Photo Restoration: 1-3 créditos
- **Média estimada: 2 créditos/foto**
- **Custo por foto: $0.036** (com plano 1000)

### 2. Outros Custos Fixos

**Mensais:**
- Hospedagem (Vercel Pro): $20/mês
- PostgreSQL (Supabase): $0-25/mês
- Domínio: $1/mês (~$12/ano)
- **Total fixo: ~$46/mês**

**Por Transação:**
- Stripe: 2.9% + $0.30
- Exemplo em $14.97: $0.73

**Grátis (dentro dos limites):**
- ✅ Resend Email: 3,000 emails/mês
- ✅ Mixpanel: 100,000 eventos/mês
- ✅ Crisp Chat: 1 operador

---

## 📊 Margem de Lucro por Pacote

### Cenário Real (com todos os custos)

#### **Try It Package - 1 foto ($5.99)**
```
Receita:           $5.99
Custo VanceAI:    -$0.04 (2 créditos)
Taxa Stripe:      -$0.47 (2.9% + $0.30)
─────────────────────────
Lucro Líquido:     $5.48
Margem:            91.5% ✅
```

#### **Family Memories - 3 fotos ($14.97)** ⭐ MAIS POPULAR
```
Receita:           $14.97
Custo VanceAI:    -$0.11 (6 créditos)
Taxa Stripe:      -$0.73
─────────────────────────
Lucro Líquido:     $14.13
Margem:            94.4% ✅
```

#### **Album Package - 5 fotos ($22.95)**
```
Receita:           $22.95
Custo VanceAI:    -$0.18 (10 créditos)
Taxa Stripe:      -$0.97
─────────────────────────
Lucro Líquido:     $21.80
Margem:            95.0% ✅
```

#### **Heritage Collection - 10 fotos ($39.97)**
```
Receita:           $39.97
Custo VanceAI:    -$0.36 (20 créditos)
Taxa Stripe:      -$1.46
─────────────────────────
Lucro Líquido:     $38.15
Margem:            95.4% ✅
```

---

## 🎯 Break-Even Analysis

### Custos Fixos Mensais: $46

**Pedidos necessários para cobrir custos fixos:**

| Pacote | Lucro/Pedido | Pedidos para Break-Even | Tempo* |
|--------|--------------|-------------------------|--------|
| Try It (1) | $5.48 | 9 pedidos | ~3 dias |
| Family (3) | $14.13 | 4 pedidos | ~1 dia |
| Album (5) | $21.80 | 3 pedidos | ~1 dia |
| Heritage (10) | $38.15 | 2 pedidos | ~1 dia |

*Assumindo tráfego mínimo de 3-5 conversões/dia

---

## 💵 Projeções de Receita

### Cenário Conservador (Mês 1-3)

**Assumindo:**
- 100 visitantes/dia
- 2% de conversão = 2 vendas/dia
- 60 vendas/mês
- Mix: 40% Try It, 50% Family, 10% Album

```
Receita Mensal:
- 24x Try It ($5.99):      $143.76
- 30x Family ($14.97):     $449.10
- 6x Album ($22.95):       $137.70
────────────────────────────────────
Total Receita:             $730.56
Total Custos VanceAI:      -$7.92
Total Custos Stripe:       -$38.74
Custos Fixos:              -$46.00
────────────────────────────────────
LUCRO LÍQUIDO MENSAL:      $637.90
```

**Margem: 87.3%**

---

### Cenário Realista (Mês 4-6)

**Assumindo:**
- 300 visitantes/dia
- 3% de conversão = 9 vendas/dia
- 270 vendas/mês
- Mix: 20% Try It, 60% Family, 15% Album, 5% Heritage

```
Receita Mensal:
- 54x Try It ($5.99):      $323.46
- 162x Family ($14.97):    $2,425.14
- 41x Album ($22.95):      $940.95
- 13x Heritage ($39.97):   $519.61
────────────────────────────────────
Total Receita:             $4,209.16
Total Custos VanceAI:      -$49.68
Total Custos Stripe:       -$215.89
Custos Fixos:              -$46.00
────────────────────────────────────
LUCRO LÍQUIDO MENSAL:      $3,897.59
```

**Margem: 92.6%**

---

### Cenário Otimista (Mês 7+)

**Assumindo:**
- 1000 visitantes/dia
- 5% de conversão = 50 vendas/dia
- 1,500 vendas/mês
- Mix: 10% Try It, 50% Family, 30% Album, 10% Heritage

```
Receita Mensal:
- 150x Try It ($5.99):     $898.50
- 750x Family ($14.97):    $11,227.50
- 450x Album ($22.95):     $10,327.50
- 150x Heritage ($39.97):  $5,995.50
────────────────────────────────────
Total Receita:             $28,449.00
Total Custos VanceAI:      -$540.00
Total Custos Stripe:       -$1,432.28
Custos Fixos:              -$46.00
────────────────────────────────────
LUCRO LÍQUIDO MENSAL:      $26,430.72
```

**Margem: 92.9%**

---

## 🚀 ROI em Créditos VanceAI

### Investimento Inicial: $17.95 (1000 créditos)

**Capacidade: 500 fotos** (2 créditos/foto)

**Cenários de retorno:**

| Pacote Vendido | Fotos | Receita | Fotos Restantes |
|----------------|-------|---------|-----------------|
| 5x Heritage (10) | 50 | $199.85 | 450 |
| 20x Family (3) | 60 | $299.40 | 440 |
| 50x Family (3) | 150 | $748.50 | 350 |
| 100x Family (3) | 300 | $1,497.00 | 200 |

**Com apenas 4 vendas Family + 1 Heritage:**
- Receita: $99.82
- Custo créditos já coberto! ✅
- 480 fotos ainda disponíveis

**ROI na capacidade total (500 fotos como Try It):**
- Receita: $2,995
- Custo: $17.95
- **ROI: 16,582%** 🚀

---

## 💡 Otimizações de Margem

### 1. Upsell de Colorização
```
Custo adicional VanceAI: +1 crédito ($0.018)
Cobrar do cliente: +$2.99
Lucro adicional: $2.97/foto (16,500% de margem!)
```

### 2. Compra em Bulk de Créditos
```
Atual (1000): $0.018/crédito
Volume maior: Negociar com VanceAI para desconto enterprise
Meta: <$0.015/crédito = +20% de lucro
```

### 3. Tier Premium (Físico)
```
Oferecer impressão + entrega:
- Custo impressão 4x6: $0.15
- Custo envio USPS: $0.73
- Cobrar: +$9.99
- Lucro adicional: $9.11/foto
```

---

## 📈 Metas de Crescimento

### Fase 1 - MVP (Mês 1-2)
**Meta: Break-even**
- 4-5 pedidos/dia
- ~$600/mês de receita
- Foco: Validação do produto

### Fase 2 - Tração (Mês 3-6)
**Meta: $3,000-5,000/mês**
- 10-15 pedidos/dia
- Iniciar ads (Facebook/Google)
- Budget ads: $500/mês
- LTV/CAC > 3:1

### Fase 3 - Escala (Mês 7+)
**Meta: $10,000-25,000/mês**
- 30-50 pedidos/dia
- Aumentar budget ads: $2,000/mês
- Adicionar novos canais
- Contratar suporte part-time

---

## ⚠️ Riscos e Mitigações

### Risco 1: Aumento de preço VanceAI
**Mitigação:**
- Monitorar preços mensalmente
- Ter alternativas (Hotpot, Remini)
- Margem atual (92%+) suporta aumento de 50%

### Risco 2: Chargebacks
**Mitigação:**
- Stripe fee inclui proteção básica
- Garantia clara (7 dias, 100%)
- Suporte proativo

### Risco 3: Qualidade inconsistente
**Mitigação:**
- Review manual de 10% das fotos
- Reprocessamento grátis se necessário
- Custo: $0.036/reprocessamento

---

## 🎯 Conclusão

### ✅ **SIM, VOCÊ TEM LUCRO EXCELENTE!**

**Principais Pontos:**
1. **Margem de 91-95%** em todos os pacotes
2. **Break-even em 2-4 pedidos** apenas
3. **Escalabilidade alta** - custos quase não aumentam
4. **Preços competitivos** vs mercado
5. **Upsell opportunities** para aumentar ticket médio

**Recomendação:** 
- Iniciar com plano 1000 créditos VanceAI ($17.95)
- Focar em vender pacote "Family Memories" (melhor conversão)
- Adicionar upsell de colorização (+$2.99)
- Meta inicial: 5-10 pedidos/dia = $1,500-3,000/mês lucro

---

## 📊 Dashboard Financeiro (Implementar)

**Métricas para monitorar:**
- [ ] Revenue por dia/semana/mês
- [ ] Custos VanceAI (créditos usados)
- [ ] Custos Stripe (fees)
- [ ] Margem de lucro por pacote
- [ ] LTV (Lifetime Value) do cliente
- [ ] CAC (Customer Acquisition Cost)
- [ ] Taxa de conversão por pacote
- [ ] Créditos VanceAI restantes
- [ ] Taxa de reprocessamento
- [ ] NPS (Net Promoter Score)

---

**Última atualização:** Janeiro 2026
**Baseado em:** VanceAI pricing atual, Stripe fees 2.9% + $0.30
