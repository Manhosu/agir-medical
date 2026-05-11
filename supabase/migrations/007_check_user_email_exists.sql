-- Função chamada pelo app mobile antes de enviar OTP.
-- Retorna true se o email existe em auth.users, false caso contrário.
-- SECURITY DEFINER para acessar auth.users sem expor dados.
-- Necessário para cumprir Apple Guideline 3.1.3(a): o app não pode
-- criar contas novas — apenas fazer login de assinantes existentes.

create or replace function check_user_email_exists(email_input text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  return exists(
    select 1
    from auth.users
    where lower(email) = lower(trim(email_input))
  );
end;
$$;

-- Permite que usuários anônimos chamem a função (necessário para a tela de login)
grant execute on function check_user_email_exists(text) to anon, authenticated;
