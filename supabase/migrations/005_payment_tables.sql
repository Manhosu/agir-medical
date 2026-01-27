-- Migration: Criar tabelas para processamento de pagamentos
-- Descricao: Adiciona tabelas para historico de pagamentos e pagamentos pendentes

-- =====================================================
-- Tabela: payment_history
-- Historico de todos os pagamentos processados
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Relacionamentos
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,

    -- Informacoes do gateway
    gateway VARCHAR(50) NOT NULL DEFAULT 'infinitepay',
    gateway_payment_id VARCHAR(255) NOT NULL,

    -- Detalhes do pagamento
    plan VARCHAR(50) NOT NULL,
    amount INTEGER NOT NULL, -- Em centavos
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
    status VARCHAR(50) NOT NULL DEFAULT 'completed',

    -- Timestamps
    paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Metadados adicionais
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indices para payment_history
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON public.payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_gateway_payment_id ON public.payment_history(gateway_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_created_at ON public.payment_history(created_at DESC);

-- RLS para payment_history
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Usuarios podem ver apenas seus proprios pagamentos
CREATE POLICY "Users can view own payment history"
    ON public.payment_history FOR SELECT
    USING (auth.uid() = user_id);

-- Apenas service role pode inserir/atualizar (via webhook)
CREATE POLICY "Service role can manage payment history"
    ON public.payment_history FOR ALL
    USING (auth.role() = 'service_role');

-- =====================================================
-- Tabela: pending_payments
-- Pagamentos recebidos para usuarios nao cadastrados
-- =====================================================
CREATE TABLE IF NOT EXISTS public.pending_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Identificador do gateway
    infinitepay_id VARCHAR(255) NOT NULL UNIQUE,

    -- Dados do cliente (para matching posterior)
    customer_email VARCHAR(255),
    customer_cpf VARCHAR(11),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),

    -- Detalhes do pagamento
    plan VARCHAR(50) NOT NULL,
    amount INTEGER NOT NULL, -- Em centavos
    paid_at TIMESTAMPTZ NOT NULL,

    -- Status do pagamento pendente
    status VARCHAR(50) NOT NULL DEFAULT 'pending_user',
    -- pending_user: Aguardando usuario se cadastrar
    -- linked: Vinculado a um usuario
    -- expired: Expirado (nao vinculado apos X dias)

    -- Usuario vinculado (quando encontrado)
    linked_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    linked_at TIMESTAMPTZ,

    -- Payload completo para referencia
    payload JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Indices para pending_payments
CREATE INDEX IF NOT EXISTS idx_pending_payments_email ON public.pending_payments(customer_email);
CREATE INDEX IF NOT EXISTS idx_pending_payments_cpf ON public.pending_payments(customer_cpf);
CREATE INDEX IF NOT EXISTS idx_pending_payments_status ON public.pending_payments(status);
CREATE INDEX IF NOT EXISTS idx_pending_payments_infinitepay_id ON public.pending_payments(infinitepay_id);

-- RLS para pending_payments
ALTER TABLE public.pending_payments ENABLE ROW LEVEL SECURITY;

-- Apenas service role pode gerenciar (via webhook)
CREATE POLICY "Service role can manage pending payments"
    ON public.pending_payments FOR ALL
    USING (auth.role() = 'service_role');

-- =====================================================
-- Trigger para updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para payment_history
DROP TRIGGER IF EXISTS update_payment_history_updated_at ON public.payment_history;
CREATE TRIGGER update_payment_history_updated_at
    BEFORE UPDATE ON public.payment_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para pending_payments
DROP TRIGGER IF EXISTS update_pending_payments_updated_at ON public.pending_payments;
CREATE TRIGGER update_pending_payments_updated_at
    BEFORE UPDATE ON public.pending_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Funcao: Vincular pagamentos pendentes automaticamente
-- Chamada quando um novo usuario e criado
-- =====================================================
CREATE OR REPLACE FUNCTION link_pending_payments_on_signup()
RETURNS TRIGGER AS $$
DECLARE
    pending RECORD;
    new_subscription_id UUID;
BEGIN
    -- Buscar pagamentos pendentes para este email ou CPF
    FOR pending IN
        SELECT * FROM public.pending_payments
        WHERE status = 'pending_user'
        AND (
            customer_email = LOWER(NEW.email)
            OR (
                customer_cpf IS NOT NULL
                AND customer_cpf = (
                    SELECT REGEXP_REPLACE(cpf, '[^0-9]', '', 'g')
                    FROM public.profiles
                    WHERE id = NEW.id
                )
            )
        )
    LOOP
        -- Criar assinatura
        INSERT INTO public.subscriptions (
            user_id,
            status,
            plan,
            starts_at,
            expires_at,
            payment_gateway,
            gateway_subscription_id
        ) VALUES (
            NEW.id,
            'active',
            pending.plan,
            NOW(),
            NOW() + INTERVAL '365 days',
            'infinitepay',
            pending.infinitepay_id
        )
        RETURNING id INTO new_subscription_id;

        -- Registrar no historico
        INSERT INTO public.payment_history (
            user_id,
            subscription_id,
            gateway,
            gateway_payment_id,
            plan,
            amount,
            status,
            paid_at
        ) VALUES (
            NEW.id,
            new_subscription_id,
            'infinitepay',
            pending.infinitepay_id,
            pending.plan,
            pending.amount,
            'completed',
            pending.paid_at
        );

        -- Marcar como vinculado
        UPDATE public.pending_payments
        SET
            status = 'linked',
            linked_user_id = NEW.id,
            linked_at = NOW()
        WHERE id = pending.id;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para vincular automaticamente ao criar profile
DROP TRIGGER IF EXISTS link_payments_on_profile_insert ON public.profiles;
CREATE TRIGGER link_payments_on_profile_insert
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION link_pending_payments_on_signup();

-- =====================================================
-- Comentarios nas tabelas
-- =====================================================
COMMENT ON TABLE public.payment_history IS 'Historico de pagamentos processados via gateways';
COMMENT ON TABLE public.pending_payments IS 'Pagamentos recebidos para usuarios ainda nao cadastrados';
COMMENT ON COLUMN public.payment_history.amount IS 'Valor em centavos (ex: R$ 697,00 = 69700)';
COMMENT ON COLUMN public.pending_payments.amount IS 'Valor em centavos (ex: R$ 697,00 = 69700)';
