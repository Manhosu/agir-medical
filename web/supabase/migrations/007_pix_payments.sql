-- Tabela para armazenar solicitacoes de pagamento via PIX manual
CREATE TABLE IF NOT EXISTS pix_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) NOT NULL,
  email VARCHAR(255),
  plan VARCHAR(50) NOT NULL DEFAULT 'standard',
  amount INTEGER NOT NULL, -- em centavos
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para busca por status
CREATE INDEX idx_pix_payments_status ON pix_payments(status);
CREATE INDEX idx_pix_payments_created_at ON pix_payments(created_at DESC);

-- Trigger para updated_at
CREATE TRIGGER update_pix_payments_updated_at
  BEFORE UPDATE ON pix_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE pix_payments ENABLE ROW LEVEL SECURITY;

-- Usuarios autenticados podem criar suas proprias solicitacoes
CREATE POLICY "Users can insert own pix payments"
  ON pix_payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Usuarios podem ver suas proprias solicitacoes
CREATE POLICY "Users can view own pix payments"
  ON pix_payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins podem ver e gerenciar todas
CREATE POLICY "Admins can view all pix payments"
  ON pix_payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update pix payments"
  ON pix_payments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Service role pode tudo (para API routes)
CREATE POLICY "Service role full access pix payments"
  ON pix_payments FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
