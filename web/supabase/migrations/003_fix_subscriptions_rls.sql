-- =====================================================
-- FIX: RLS Policy para subscriptions - erro 406
-- Execute este SQL no Editor SQL do Supabase
-- =====================================================

-- Remover TODAS as políticas existentes de subscriptions
DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_admin_all" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.subscriptions;

-- Verificar se RLS está habilitado
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Criar política SIMPLES para SELECT (sem funções complexas)
CREATE POLICY "allow_select_own_subscription"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Criar política para INSERT (usuário pode criar sua própria assinatura)
CREATE POLICY "allow_insert_own_subscription"
  ON public.subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Criar política para UPDATE (usuário pode atualizar sua própria assinatura)
CREATE POLICY "allow_update_own_subscription"
  ON public.subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Criar política para service_role (backend/admin) poder fazer tudo
CREATE POLICY "service_role_all_subscriptions"
  ON public.subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Verificar se a tabela existe e tem as colunas corretas
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'subscriptions';

-- Verificar políticas criadas
-- SELECT * FROM pg_policies WHERE tablename = 'subscriptions';
