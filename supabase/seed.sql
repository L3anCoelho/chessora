-- =============================================================================
-- Dados iniciais: produto do e-book e conteúdo premium de demonstração.
-- Rode depois da migração (supabase db reset aplica os dois automaticamente).
-- =============================================================================

insert into public.products (id, name, grants_scopes, access_duration_days, external_product_ids, active)
values (
  'ebook-xadrez-inteligente',
  'Xadrez Inteligente: do primeiro lance à primeira vitória',
  array['module:taticas', 'module:estrategia', 'module:aberturas', 'module:finais', 'challenges:premium'],
  null,
  -- Preencha com o ID do produto na plataforma de checkout quando ele existir.
  array[]::text[],
  true
)
on conflict (id) do update
  set name = excluded.name, grants_scopes = excluded.grants_scopes;

-- Aula premium: Cravada (módulo Táticas)
insert into public.lesson_contents (lesson_id, module_id, required_scope, body)
values (
  'cravada',
  'taticas',
  'module:taticas',
  $json$[
    {"type": "paragraph", "text": "Uma peça está cravada quando não pode sair da linha sem expor uma peça mais valiosa atrás dela. Se a peça de trás é o rei, a cravada é absoluta: mover a peça cravada seria ilegal."},
    {"type": "diagram", "fen": "4k3/8/2n5/1B6/8/8/8/4K3 b - - 0 1", "highlights": ["b5", "c6", "e8"], "caption": "O cavalo em c6 está cravado pelo bispo de b5: ele não tem nenhum lance legal."},
    {"type": "heading", "text": "Como aproveitar uma cravada"},
    {"type": "list", "items": ["Ataque a peça cravada mais vezes do que ela é defendida.", "Ataque-a com uma peça mais barata, como um peão.", "Não tenha pressa de capturar: a peça cravada não vai fugir."]},
    {"type": "exercise", "id": "cravar-cavalo", "prompt": "Crave o cavalo preto contra o rei.", "fen": "4k3/8/2n5/8/8/8/8/4KB2 w - - 0 1", "acceptedMoves": ["Bb5"], "goal": "move", "successText": "Cravado. O cavalo não pode mais sair de c6."},
    {"type": "tip", "title": "Saindo da cravada", "text": "Quando sua peça estiver cravada, procure tirar o rei da linha ou colocar outra peça no meio antes que o adversário a ataque de novo."}
  ]$json$::jsonb
)
on conflict (lesson_id) do update set body = excluded.body, updated_at = now();

-- Aula premium: Controle do centro (módulo Estratégia)
insert into public.lesson_contents (lesson_id, module_id, required_scope, body)
values (
  'controle-do-centro',
  'estrategia',
  'module:estrategia',
  $json$[
    {"type": "paragraph", "text": "As casas d4, e4, d5 e e5 formam o centro. Peças no centro alcançam mais casas e chegam mais rápido a qualquer lado do tabuleiro."},
    {"type": "diagram", "fen": "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3", "highlights": ["d4", "e4", "d5", "e5"], "caption": "Depois de 1.e4 e5 2.Nf3 Nc6, os dois lados já disputam o centro com peões e cavalos."},
    {"type": "exercise", "id": "ocupar-centro", "prompt": "Ocupe o centro com um peão no primeiro lance.", "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "acceptedMoves": ["e4", "d4"], "goal": "move", "successText": "Isso. Um peão central abre caminho para dama e bispo."}
  ]$json$::jsonb
)
on conflict (lesson_id) do update set body = excluded.body, updated_at = now();

-- Desafios premium
insert into public.challenge_contents (challenge_id, required_scope, fen, solution, alternative_first_moves, explanation, hint)
values
  (
    'mate-abafado',
    'challenges:premium',
    '6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1',
    array['Nf7#'],
    null,
    'Nf7 dá xeque e o rei não tem casa: g8, g7 e h7 estão ocupadas pelas próprias peças pretas. É o mate abafado.',
    'Quem está bloqueando as saídas do rei?'
  ),
  (
    'descoberta-com-xeque',
    'challenges:premium',
    '3q4/8/7k/8/3N4/8/8/3R2K1 w - - 0 1',
    array['Nf5+'],
    null,
    'Nf5+ dá xeque com o cavalo e, ao sair de d4, abre a coluna d para a torre atacar a dama. As pretas precisam cuidar do rei e perdem a dama.',
    'O cavalo está na frente da torre. Para onde ele pode ir com xeque?'
  ),
  (
    'sacrificio-de-dama',
    'challenges:premium',
    '5r1k/6pp/7N/3Q4/8/8/8/6K1 w - - 0 1',
    array['Qg8+', 'Rxg8', 'Nf7#'],
    null,
    'Qg8+ obriga a torre a capturar, porque o cavalo de h6 protege g8. Com a torre em g8, o rei fica cercado e Nf7 é mate abafado.',
    'Force a torre preta a tirar a última casa livre do próprio rei.'
  )
on conflict (challenge_id) do update
  set fen = excluded.fen, solution = excluded.solution, explanation = excluded.explanation,
      hint = excluded.hint, updated_at = now();

-- Para tornar uma conta administradora (rode no SQL Editor, com o e-mail correto):
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'voce@exemplo.com');
