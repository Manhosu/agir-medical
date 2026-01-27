# Configuracao do Webhook InfinitePay

Este documento explica como configurar o webhook do InfinitePay para que os pagamentos sejam processados automaticamente e as assinaturas dos usuarios sejam ativadas.

---

## 1. Pre-requisitos

Antes de configurar o webhook, voce precisa:

1. **Executar a migration do banco de dados** para criar as tabelas necessarias
2. **Fazer deploy da aplicacao** para que a URL do webhook esteja disponivel

### 1.1. Executar Migration

Acesse o **Supabase Dashboard** e execute o SQL do arquivo:
```
supabase/migrations/005_payment_tables.sql
```

Ou via Supabase CLI:
```bash
supabase db push
```

---

## 2. Configurar Webhook no Painel InfinitePay

### Passo 1: Acessar o Painel

1. Acesse: https://app.infinitepay.io
2. Faca login com sua conta
3. No menu lateral, va em **Configuracoes** ou **Developers**

### Passo 2: Localizar a Secao de Webhooks

1. Procure por **"Webhooks"**, **"Integracoes"** ou **"API"**
2. Clique em **"Adicionar Webhook"** ou **"Novo Webhook"**

### Passo 3: Configurar o Webhook

Preencha os campos da seguinte forma:

| Campo | Valor |
|-------|-------|
| **URL do Webhook** | `https://programa-agir.com.br/api/webhooks/infinitepay` |
| **Eventos** | Selecione todos os eventos de pagamento disponveis: |
| | - `invoice.paid` ou `payment.approved` |
| | - `invoice.payment_failed` ou `payment.failed` |
| | - `invoice.expired` |
| **Metodo** | POST |
| **Formato** | JSON |
| **Status** | Ativo |

### Passo 4: Copiar o Webhook Secret (Importante!)

Apos criar o webhook, o InfinitePay pode fornecer um **Secret** ou **Token** para validacao.

1. Copie esse secret
2. Adicione-o nas variaveis de ambiente do seu servidor:

```env
INFINITEPAY_WEBHOOK_SECRET=seu_secret_aqui
```

**Onde configurar a variavel de ambiente:**
- **Vercel**: Settings > Environment Variables
- **Railway**: Variables
- **Servidor proprio**: arquivo `.env.local`

---

## 3. Testar a Integracao

### 3.1. Teste Manual

Apos configurar, voce pode testar acessando:
```
GET https://programa-agir.com.br/api/webhooks/infinitepay
```

Deve retornar:
```json
{
  "status": "ok",
  "message": "InfinitePay webhook endpoint is active",
  "timestamp": "2024-01-26T..."
}
```

### 3.2. Teste de Pagamento

1. Faca um pagamento de teste usando um dos links:
   - Standard: https://invoice.infinitepay.io/programa-agir/79t6sJUR6R/
   - Premium: https://invoice.infinitepay.io/programa-agir/1myI0LkHxv/

2. Use um email que ja esteja cadastrado no sistema

3. Verifique no Supabase se a assinatura foi criada:
   - Tabela `subscriptions`: deve ter um novo registro com status "active"
   - Tabela `payment_history`: deve ter o registro do pagamento

---

## 4. Como Funciona

### Fluxo Normal (Usuario ja cadastrado)

```
1. Usuario clica em "Quero esse plano"
2. Abre pagina de pagamento do InfinitePay
3. Usuario paga (Pix, Cartao, etc)
4. InfinitePay envia webhook para nosso servidor
5. Sistema identifica usuario pelo email/CPF
6. Assinatura e ativada automaticamente
7. Usuario ja pode acessar o conteudo
```

### Fluxo Especial (Usuario paga ANTES de se cadastrar)

```
1. Usuario paga pelo link de pagamento
2. InfinitePay envia webhook
3. Sistema NAO encontra usuario cadastrado
4. Pagamento e salvo em "pending_payments"
5. Quando usuario se cadastrar com mesmo email/CPF:
   - Assinatura e ativada automaticamente
   - Pagamento e vinculado ao usuario
```

---

## 5. Monitoramento

### Ver Pagamentos no Supabase

**Pagamentos processados:**
```sql
SELECT * FROM payment_history ORDER BY created_at DESC;
```

**Pagamentos pendentes (aguardando cadastro):**
```sql
SELECT * FROM pending_payments WHERE status = 'pending_user';
```

**Assinaturas ativas:**
```sql
SELECT p.email, s.plan, s.status, s.expires_at
FROM subscriptions s
JOIN profiles p ON p.id = s.user_id
WHERE s.status = 'active'
ORDER BY s.created_at DESC;
```

---

## 6. Troubleshooting

### Webhook nao esta sendo chamado

1. Verifique se a URL esta correta no painel do InfinitePay
2. Verifique se o site esta online (https://programa-agir.com.br)
3. Verifique os logs do InfinitePay para ver se ha erros

### Pagamento feito mas assinatura nao ativou

1. Verifique se o email do pagamento e igual ao email cadastrado
2. Verifique a tabela `pending_payments` - pode estar la aguardando
3. Verifique os logs do servidor para erros

### Erro de assinatura invalida (401)

1. Verifique se o `INFINITEPAY_WEBHOOK_SECRET` esta correto
2. O secret deve ser exatamente igual ao fornecido pelo InfinitePay

---

## 7. Campos do Payload InfinitePay

O webhook espera receber os seguintes campos (variam conforme o evento):

```json
{
  "id": "pay_xxxxx",
  "status": "paid",
  "amount": 69700,
  "paid_amount": 69700,
  "customer": {
    "name": "Nome do Cliente",
    "email": "email@exemplo.com",
    "document": "12345678900",
    "phone": "11999999999"
  },
  "invoice_url": "https://invoice.infinitepay.io/programa-agir/79t6sJUR6R/",
  "paid_at": "2024-01-26T10:30:00Z"
}
```

**Importante:**
- O `amount` e em **centavos** (R$ 697,00 = 69700)
- O `document` e o CPF sem formatacao
- O sistema usa o `email` OU o `document` para identificar o usuario

---

## 8. Suporte

Em caso de duvidas ou problemas:

1. Verifique os logs do servidor (Vercel/Railway)
2. Verifique o painel do InfinitePay para status dos webhooks
3. Consulte a documentacao do InfinitePay: https://developers.infinitepay.io

---

**Ultima atualizacao:** Janeiro 2024
