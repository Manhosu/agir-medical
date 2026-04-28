-- =====================================================
-- Conta de teste para Apple App Review
-- Email: apple.review@programa-agir.com.br
-- Password: AppleReview2026!
-- Codigo OTP fixo no app: 123456
-- =====================================================
-- Esse script cria a conta com senha fixa e ativa
-- assinatura. O bypass de OTP esta no codigo do mobile
-- (authStore.ts) para permitir que o revisor da Apple
-- faca login sem ter acesso ao email.

-- 1) Criar usuario via auth.users (se nao existir)
DO $$
DECLARE
  reviewer_id UUID;
  reviewer_exists BOOLEAN;
BEGIN
  -- Verificar se ja existe
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'apple.review@programa-agir.com.br')
  INTO reviewer_exists;

  IF NOT reviewer_exists THEN
    -- Criar usuario
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'apple.review@programa-agir.com.br',
      crypt('AppleReview2026!', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Apple Reviewer","role":"reviewer"}'::jsonb,
      'authenticated',
      'authenticated',
      NOW(),
      NOW()
    )
    RETURNING id INTO reviewer_id;

    RAISE NOTICE 'Usuario Apple Reviewer criado com ID: %', reviewer_id;
  ELSE
    SELECT id INTO reviewer_id FROM auth.users WHERE email = 'apple.review@programa-agir.com.br';
    -- Atualizar senha caso ja exista
    UPDATE auth.users
    SET encrypted_password = crypt('AppleReview2026!', gen_salt('bf')),
        email_confirmed_at = NOW(),
        updated_at = NOW()
    WHERE id = reviewer_id;
    RAISE NOTICE 'Usuario Apple Reviewer ja existe (ID: %), senha atualizada.', reviewer_id;
  END IF;

  -- 2) Garantir profile
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (reviewer_id, 'apple.review@programa-agir.com.br', 'Apple Reviewer', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        updated_at = NOW();

  -- 3) Cancelar assinaturas anteriores e criar nova ativa por 5 anos
  UPDATE public.subscriptions
  SET status = 'canceled', updated_at = NOW()
  WHERE user_id = reviewer_id AND status = 'active';

  INSERT INTO public.subscriptions (
    user_id,
    status,
    plan,
    starts_at,
    expires_at,
    payment_gateway,
    created_at,
    updated_at
  ) VALUES (
    reviewer_id,
    'active',
    'premium',
    NOW(),
    NOW() + INTERVAL '5 years',
    'apple_review',
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Assinatura Premium ativa criada para Apple Reviewer ate 5 anos a partir de agora.';
END $$;
