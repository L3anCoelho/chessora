-- Ajuste sugerido pelo verificador de segurança do Supabase.
-- A função do gatilho de cadastro não precisa ser chamável pela API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
-- has_scope só é usada nas políticas de usuários logados.
revoke execute on function public.has_scope(text) from public, anon;
grant execute on function public.has_scope(text) to authenticated;
-- is_admin continua executável: as políticas (inclusive a de produtos, lida por anon) dependem dela,
-- e ela só devolve true para quem já é admin.
