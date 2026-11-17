-- =============================================================================
-- Xadrez Inteligente: esquema inicial
--
-- Princípios:
-- * RLS ligado em todas as tabelas. O frontend usa só a chave anon.
-- * Direitos de acesso (entitlements) e eventos de pagamento só são gravados pelo
--   backend (service_role, via webhook). Não existe política que permita a um
--   usuário liberar acesso premium para si mesmo.
-- * O conteúdo premium (lesson_contents, challenge_contents) só é entregue a quem
--   tem o escopo exigido, verificado por public.has_scope().
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Perfis
-- -----------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 40),
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Cria o perfil automaticamente no cadastro.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 40));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create policy "perfil: ler o próprio ou admin"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "perfil: atualizar o próprio"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- O usuário só pode mudar o próprio nome. A coluna role não é gravável pelo cliente.
revoke update on public.profiles from anon, authenticated;
grant update (display_name) on public.profiles to authenticated;

-- -----------------------------------------------------------------------------
-- Produtos e direitos de acesso
-- -----------------------------------------------------------------------------

create table public.products (
  id text primary key,
  name text not null,
  -- Escopos liberados pela compra. Ex.: {module:taticas, challenges:premium}
  grants_scopes text[] not null default '{}',
  -- Validade do acesso em dias. null = sem prazo.
  access_duration_days integer check (access_duration_days is null or access_duration_days > 0),
  -- IDs do produto na plataforma de checkout (ex.: Kiwify), usados pelo webhook.
  external_product_ids text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "produtos ativos são públicos"
  on public.products for select
  to anon, authenticated
  using (active or public.is_admin());

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null references public.products (id),
  source text not null check (source in ('purchase', 'admin_grant', 'promotion')),
  status text not null default 'active' check (status in ('active', 'revoked', 'refunded', 'expired')),
  -- ID da venda/pedido na plataforma de pagamento.
  external_reference text,
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index entitlements_external_reference_key
  on public.entitlements (product_id, external_reference)
  where external_reference is not null;

create index entitlements_user_idx on public.entitlements (user_id);

alter table public.entitlements enable row level security;

create policy "direitos: ler os próprios ou admin"
  on public.entitlements for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Sem políticas de insert/update/delete: só o service_role (backend) grava aqui.

create function public.has_scope(required_scope text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.entitlements e
    join public.products p on p.id = e.product_id
    where e.user_id = auth.uid()
      and e.status = 'active'
      and e.starts_at <= now()
      and (e.expires_at is null or e.expires_at > now())
      and required_scope = any (p.grants_scopes)
  );
$$;

-- -----------------------------------------------------------------------------
-- Conteúdo premium
-- -----------------------------------------------------------------------------

create table public.lesson_contents (
  lesson_id text primary key,
  module_id text not null,
  required_scope text not null,
  -- Mesmo formato de LessonBlock[] em src/types/domain.ts
  body jsonb not null check (jsonb_typeof(body) = 'array'),
  updated_at timestamptz not null default now()
);

create table public.challenge_contents (
  challenge_id text primary key,
  required_scope text not null,
  fen text not null,
  solution text[] not null check (cardinality(solution) > 0),
  alternative_first_moves text[],
  explanation text not null,
  hint text,
  updated_at timestamptz not null default now()
);

alter table public.lesson_contents enable row level security;
alter table public.challenge_contents enable row level security;

create policy "aulas premium: só com o escopo"
  on public.lesson_contents for select
  to authenticated
  using (public.is_admin() or public.has_scope(required_scope));

create policy "desafios premium: só com o escopo"
  on public.challenge_contents for select
  to authenticated
  using (public.is_admin() or public.has_scope(required_scope));

-- Gestão de conteúdo pela área administrativa.
create policy "aulas premium: admin gerencia"
  on public.lesson_contents for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "desafios premium: admin gerencia"
  on public.challenge_contents for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- Progresso
-- -----------------------------------------------------------------------------

create table public.game_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  mode text not null check (mode in ('computer', 'local')),
  outcome text check (outcome in ('win', 'loss', 'draw')),
  result text not null check (result in ('white', 'black', 'draw', 'aborted')),
  end_reason text not null check (
    end_reason in ('checkmate', 'stalemate', 'insufficient-material', 'threefold-repetition',
                   'fifty-move-rule', 'resignation', 'timeout', 'agreement')
  ),
  engine_level text check (engine_level in ('facil', 'medio', 'dificil')),
  move_count integer not null check (move_count >= 0),
  pgn text not null check (char_length(pgn) <= 20000),
  ended_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index game_results_user_idx on public.game_results (user_id, ended_at desc);

create table public.challenge_progress (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  challenge_id text not null,
  solved boolean not null default false,
  attempts integer not null default 0 check (attempts >= 0),
  solved_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, challenge_id)
);

create table public.lesson_progress (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  lesson_id text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

alter table public.game_results enable row level security;
alter table public.challenge_progress enable row level security;
alter table public.lesson_progress enable row level security;

create policy "partidas: ler as próprias ou admin"
  on public.game_results for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "partidas: gravar as próprias"
  on public.game_results for insert to authenticated
  with check (user_id = auth.uid());

create policy "desafios: ler o próprio progresso ou admin"
  on public.challenge_progress for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "desafios: gravar o próprio progresso"
  on public.challenge_progress for insert to authenticated
  with check (user_id = auth.uid());
create policy "desafios: atualizar o próprio progresso"
  on public.challenge_progress for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "aulas: ler o próprio progresso ou admin"
  on public.lesson_progress for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "aulas: gravar o próprio progresso"
  on public.lesson_progress for insert to authenticated
  with check (user_id = auth.uid());

-- Registra uma tentativa de desafio de forma atômica (roda com as permissões do usuário).
create function public.record_challenge_attempt(p_challenge_id text, p_solved boolean)
returns void
language sql
security invoker
set search_path = public
as $$
  insert into public.challenge_progress as cp (user_id, challenge_id, solved, attempts, solved_at)
  values (auth.uid(), p_challenge_id, p_solved, 1, case when p_solved then now() end)
  on conflict (user_id, challenge_id) do update
    set attempts = cp.attempts + 1,
        solved = cp.solved or excluded.solved,
        solved_at = coalesce(cp.solved_at, excluded.solved_at),
        updated_at = now();
$$;

revoke execute on function public.record_challenge_attempt(text, boolean) from public, anon;
grant execute on function public.record_challenge_attempt(text, boolean) to authenticated;

-- -----------------------------------------------------------------------------
-- Pagamentos
-- -----------------------------------------------------------------------------

create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  external_id text not null,
  event_type text not null check (
    event_type in ('purchase_approved', 'refunded', 'chargeback', 'subscription_canceled', 'other')
  ),
  external_product_id text,
  product_id text references public.products (id),
  user_id uuid references auth.users (id) on delete set null,
  buyer_email text,
  payload jsonb not null,
  status text not null default 'received' check (status in ('received', 'processed', 'ignored', 'failed')),
  error text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (provider, external_id, event_type)
);

alter table public.payment_events enable row level security;

create policy "eventos de pagamento: só admin lê"
  on public.payment_events for select to authenticated
  using (public.is_admin());

/*
 * Aplica um evento de pagamento JÁ VALIDADO pelo webhook (assinatura conferida).
 * Idempotente: o mesmo evento recebido duas vezes não gera dois acessos.
 * Executável apenas pelo service_role.
 */
create function public.apply_payment_event(
  p_provider text,
  p_external_id text,
  p_event_type text,
  p_external_product_id text,
  p_user_reference text,
  p_buyer_email text,
  p_payload jsonb
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_id uuid;
  v_product public.products%rowtype;
  v_user_id uuid;
begin
  insert into public.payment_events (provider, external_id, event_type, external_product_id, buyer_email, payload)
  values (p_provider, p_external_id, p_event_type, p_external_product_id, lower(p_buyer_email), p_payload)
  on conflict (provider, external_id, event_type) do nothing
  returning id into v_event_id;

  if v_event_id is null then
    return 'duplicate';
  end if;

  select * into v_product
  from public.products
  where p_external_product_id = any (external_product_ids);

  if not found then
    update public.payment_events set status = 'ignored', error = 'produto não mapeado', processed_at = now()
    where id = v_event_id;
    return 'ignored';
  end if;

  -- 1º: referência enviada no link de checkout (ID da conta). 2º: e-mail do comprador.
  if p_user_reference ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    select id into v_user_id from auth.users where id = p_user_reference::uuid;
  end if;
  if v_user_id is null and p_buyer_email is not null then
    select id into v_user_id from auth.users where lower(email) = lower(p_buyer_email) limit 1;
  end if;

  update public.payment_events set product_id = v_product.id, user_id = v_user_id where id = v_event_id;

  if v_user_id is null then
    -- Pagamento de alguém sem conta: fica registrado para conciliação manual.
    update public.payment_events set status = 'failed', error = 'usuário não encontrado', processed_at = now()
    where id = v_event_id;
    return 'user_not_found';
  end if;

  if p_event_type = 'purchase_approved' then
    insert into public.entitlements (user_id, product_id, source, status, external_reference, starts_at, expires_at)
    values (
      v_user_id, v_product.id, 'purchase', 'active', p_external_id, now(),
      case when v_product.access_duration_days is null then null
           else now() + make_interval(days => v_product.access_duration_days) end
    )
    on conflict (product_id, external_reference) where external_reference is not null
    do update set status = 'active', updated_at = now();
  elsif p_event_type in ('refunded', 'chargeback', 'subscription_canceled') then
    update public.entitlements
    set status = case when p_event_type = 'subscription_canceled' then 'revoked' else 'refunded' end,
        updated_at = now()
    where product_id = v_product.id and external_reference = p_external_id;
  end if;

  update public.payment_events set status = 'processed', processed_at = now() where id = v_event_id;
  return 'processed';
end;
$$;

revoke execute on function public.apply_payment_event(text, text, text, text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.apply_payment_event(text, text, text, text, text, text, jsonb) to service_role;

-- -----------------------------------------------------------------------------
-- Administração
-- -----------------------------------------------------------------------------

create function public.admin_list_users()
returns table (
  user_id uuid,
  email text,
  display_name text,
  role text,
  created_at timestamptz,
  active_entitlements bigint,
  lessons_completed bigint,
  challenges_solved bigint,
  games_played bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'acesso negado' using errcode = '42501';
  end if;
  return query
  select
    u.id,
    u.email::text,
    p.display_name,
    p.role,
    u.created_at,
    (select count(*) from public.entitlements e
      where e.user_id = u.id and e.status = 'active' and (e.expires_at is null or e.expires_at > now())),
    (select count(*) from public.lesson_progress lp where lp.user_id = u.id),
    (select count(*) from public.challenge_progress cp where cp.user_id = u.id and cp.solved),
    (select count(*) from public.game_results g where g.user_id = u.id)
  from auth.users u
  left join public.profiles p on p.id = u.id
  order by u.created_at desc;
end;
$$;

revoke execute on function public.admin_list_users() from public, anon;
grant execute on function public.admin_list_users() to authenticated;
