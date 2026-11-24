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

-- >>> aulas premium (gerado por scripts/build-lesson-sql.mjs; não edite à mão)

-- aberturas · italiana
insert into public.lesson_contents (lesson_id, module_id, required_scope, body)
values (
  'italiana',
  'aberturas',
  'module:aberturas',
  $json$[
  {
    "type": "paragraph",
    "text": "A Italiana começa com três lances que qualquer iniciante entende: peão ao centro, cavalo para fora, bispo na diagonal que aponta para f7. Nesta aula você joga a abertura inteira, do primeiro lance até o xeque-mate."
  },
  {
    "type": "guided-game",
    "id": "italiana-partida",
    "title": "Do primeiro lance ao mate: a armadilha de Légal",
    "orientation": "w",
    "exhaustiveFrom": 13,
    "intro": "Você joga com as brancas, do começo ao fim. O adversário escolhe sozinho o que tentar, e cada tentativa dele pede uma resposta diferente.",
    "conclusion": "Você venceu as cinco tentativas: a gananciosa, que termina em mate, e as quatro em que ele se defende ou joga diferente, e você segue bem.",
    "variations": [
      {
        "label": "Ele come a dama e leva mate",
        "ending": "Xeque-mate com três peças menores, e a dama branca no chão. É a armadilha de Légal: o cavalo de e5 estava envenenado.",
        "moves": [
          {
            "san": "e4",
            "note": "Peão ao centro, abrindo dama e bispo."
          },
          {
            "san": "e5",
            "note": "ele faz o mesmo"
          },
          {
            "san": "Nf3",
            "note": "O cavalo ataca e5."
          },
          {
            "san": "Nc6",
            "note": "ele defende com o cavalo"
          },
          {
            "san": "Bc4",
            "note": "O lance que dá nome à abertura: o bispo escolhe a diagonal que termina em f7."
          },
          {
            "san": "d6",
            "note": "ele segura e5 com o peão"
          },
          {
            "san": "Nc3",
            "note": "Desenvolvimento simples. Guarde este cavalo: é ele que vai dar o mate."
          },
          {
            "san": "Bg4",
            "note": "ele crava o seu cavalo na dama"
          },
          {
            "san": "h3",
            "note": "Pergunta ao bispo: troca ou recua?"
          },
          {
            "san": "Bh5",
            "note": "ele mantém a cravada"
          },
          {
            "san": "Nxe5",
            "note": "O lance que parece um erro. O cavalo captura mesmo estando cravado, porque a cravada só vale a pena enquanto ele não ataca nada."
          },
          {
            "san": "Bxd1",
            "note": "ele aceita: come a sua dama"
          },
          {
            "san": "Bxf7+",
            "note": "Xeque. O rei preto não tem nenhuma casa a não ser e7."
          },
          {
            "san": "Ke7",
            "note": "o único lance legal"
          },
          {
            "san": "Nd5#"
          }
        ]
      },
      {
        "label": "Ele desconfia e recaptura",
        "ending": "Sem mate aqui: ele achou a defesa certa. Mas você ganhou um peão limpo e o bispo de h5 caiu junto.",
        "outcome": "advantage",
        "moves": [
          {
            "san": "e4"
          },
          {
            "san": "e5"
          },
          {
            "san": "Nf3"
          },
          {
            "san": "Nc6"
          },
          {
            "san": "Bc4"
          },
          {
            "san": "d6"
          },
          {
            "san": "Nc3"
          },
          {
            "san": "Bg4"
          },
          {
            "san": "h3"
          },
          {
            "san": "Bh5"
          },
          {
            "san": "Nxe5"
          },
          {
            "san": "Nxe5",
            "note": "ele recaptura em vez de pegar a dama"
          },
          {
            "san": "Qxh5",
            "note": "A dama sai da cravada capturando o bispo. Peão a mais e peças melhores."
          }
        ]
      },
      {
        "label": "Ele troca o bispo logo",
        "ending": "Sem armadilha: ele trocou antes de cair nela. Você fica com os dois bispos e a dama bem colocada em f3.",
        "outcome": "advantage",
        "moves": [
          {
            "san": "e4"
          },
          {
            "san": "e5"
          },
          {
            "san": "Nf3"
          },
          {
            "san": "Nc6"
          },
          {
            "san": "Bc4"
          },
          {
            "san": "d6"
          },
          {
            "san": "Nc3"
          },
          {
            "san": "Bg4"
          },
          {
            "san": "h3"
          },
          {
            "san": "Bxf3",
            "note": "ele desfaz a cravada trocando"
          },
          {
            "san": "Qxf3",
            "note": "Recapture com a dama: ela fica ativa e ainda olha para f7."
          }
        ]
      },
      {
        "label": "Ele nem entra no Giuoco Piano: joga Bc5 direto",
        "ending": "Sem armadilha nenhuma: a partir daqui é a linha principal, calma, de desenvolvimento. É exatamente a posição da aula \"E quando ele não erra\", logo abaixo.",
        "outcome": "equal",
        "moves": [
          {
            "san": "e4"
          },
          {
            "san": "e5"
          },
          {
            "san": "Nf3"
          },
          {
            "san": "Nc6"
          },
          {
            "san": "Bc4"
          },
          {
            "san": "Bc5",
            "note": "ele espelha o seu bispo em vez de jogar d6: é o Giuoco Piano, sem armadilha nenhuma"
          },
          {
            "san": "c3",
            "note": "Prepare d4 com calma. Sem o peão em d6 primeiro, a armadilha de Légal nem existe nessa ordem de lances."
          },
          {
            "san": "Nf6",
            "note": "ele desenvolve e ataca e4"
          },
          {
            "san": "d3",
            "note": "Segure e4 e desenvolva o resto das peças. Daqui a partida é só boa teoria, sem truque."
          },
          {
            "san": "d6",
            "note": "ele completa o desenvolvimento"
          },
          {
            "san": "O-O",
            "note": "Rei em segurança. Isso é tudo: sem erro do adversário, não existe atalho."
          }
        ]
      },
      {
        "label": "Ele desenvolve em vez de cravar",
        "ending": "Sem cravada nenhuma: o bispo preto nem chegou a g4, então não existe nada para a armadilha de Légal funcionar em cima. É só desenvolvimento normal dos dois lados.",
        "outcome": "equal",
        "moves": [
          {
            "san": "e4"
          },
          {
            "san": "e5"
          },
          {
            "san": "Nf3"
          },
          {
            "san": "Nc6"
          },
          {
            "san": "Bc4"
          },
          {
            "san": "d6"
          },
          {
            "san": "Nc3"
          },
          {
            "san": "Nf6",
            "note": "ele desenvolve o cavalo direto, sem cravar o seu com o bispo"
          },
          {
            "san": "d3",
            "note": "Continue o desenvolvimento normal. Sem a cravada em g4, não há cavalo \"envenenado\" para oferecer."
          }
        ]
      }
    ]
  },
  {
    "type": "tip",
    "title": "Quando a armadilha não funciona",
    "text": "Duas das três tentativas acima não terminam em mate, e está tudo certo. Armadilha é um bônus: se o adversário se defende, você segue com vantagem e joga a posição. Quem conta com a armadilha para ganhar acaba jogando lances ruins de propósito."
  },
  {
    "type": "guided-line",
    "id": "italiana-linha",
    "title": "E quando ele não erra: a linha principal",
    "orientation": "w",
    "intro": "Sem armadilha, a Italiana é uma abertura calma. Sete lances e o desenvolvimento acabou.",
    "conclusion": "Peças fora, rei seguro, torre na coluna e. É daqui que o meio-jogo começa.",
    "steps": [
      {
        "move": "e4",
        "reply": "e5",
        "explanation": "Peão ao centro."
      },
      {
        "move": "Nf3",
        "reply": "Nc6",
        "explanation": "O cavalo sai atacando e5 e as pretas defendem com uma peça."
      },
      {
        "move": "Bc4",
        "reply": "Bc5",
        "explanation": "Os dois bispos escolhem as diagonais que miram f7 e f2."
      },
      {
        "move": "c3",
        "reply": "Nf6",
        "explanation": "Prepara d4 e tira a casa d4 do cavalo preto."
      },
      {
        "move": "d3",
        "reply": "d6",
        "explanation": "Segura e4 sem pressa de abrir o centro."
      },
      {
        "move": "O-O",
        "reply": "O-O",
        "explanation": "Rei no canto antes de qualquer plano de ataque."
      },
      {
        "move": "Re1",
        "reply": "a6",
        "explanation": "A torre ocupa a coluna onde o jogo vai abrir."
      }
    ]
  },
  {
    "type": "exercise",
    "id": "italiana-define",
    "prompt": "As peças já saíram. Jogue o lance que transforma isso numa Abertura Italiana.",
    "fen": "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 4 3",
    "acceptedMoves": [
      "Bc4"
    ],
    "goal": "move",
    "successText": "Bispo em c4. A partir daqui, f7 é a casa que as pretas precisam vigiar."
  },
  {
    "type": "exercise",
    "id": "italiana-f7",
    "prompt": "As pretas desenvolveram um cavalo e esqueceram f7. Dê xeque-mate em um lance.",
    "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
    "acceptedMoves": [
      "Qxf7#"
    ],
    "goal": "checkmate",
    "successText": "A dama captura em f7 apoiada pelo bispo de c4. Só o rei defendia essa casa."
  },
  {
    "type": "tip",
    "title": "Do outro lado do tabuleiro",
    "text": "Quando você joga de pretas, f7 é o seu ponto fraco e a cravada em g4 é a sua armadilha favorita. Antes de capturar qualquer peça cravada, pergunte: depois de eu comer, sobra xeque para ele?"
  }
]$json$::jsonb
)
on conflict (lesson_id) do update
  set module_id = excluded.module_id,
      required_scope = excluded.required_scope,
      body = excluded.body,
      updated_at = now();

-- aberturas · siciliana
insert into public.lesson_contents (lesson_id, module_id, required_scope, body)
values (
  'siciliana',
  'aberturas',
  'module:aberturas',
  $json$[
  {
    "type": "paragraph",
    "text": "Contra 1.e4, a Siciliana responde pelo lado: 1...c5. Aqui você joga com as pretas, do segundo lance até o xeque-mate, contra um adversário que entrega um peão para atacar e acaba atacado."
  },
  {
    "type": "guided-game",
    "id": "siciliana-partida",
    "title": "Do primeiro lance ao mate: a casa h2 esquecida",
    "startFen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    "orientation": "b",
    "intro": "As brancas abriram com 1.e4 e vão entregar um peão pelo desenvolvimento. Você joga com as pretas até o fim. Mas as brancas têm outros sistemas inteiros contra a Siciliana — o Fechado e o Alapin — que você também vai reconhecer aqui.",
    "conclusion": "Em quase todas as tentativas o problema das brancas é o mesmo: o cavalo de f3 é o único defensor de h2, e ele foi obrigado a sair. Se as brancas não entregarem o gambito — ou jogarem um sistema diferente, como o Fechado ou o Alapin —, a armadilha nem chega a existir.",
    "variations": [
      {
        "label": "Ele captura o cavalo",
        "ending": "Xeque-mate. A dama chega a h2 apoiada pelo cavalo de g4, e a torre de f1 tirou a última saída do próprio rei.",
        "moves": [
          {
            "san": "c5",
            "note": "A Siciliana: o peão vigia d4 sem bloquear nenhuma peça preta."
          },
          {
            "san": "d4",
            "note": "ele abre o centro na marra"
          },
          {
            "san": "cxd4",
            "note": "Aceite: um peão lateral seu sai, um peão central dele some."
          },
          {
            "san": "c3",
            "note": "ele oferece um peão pelo desenvolvimento"
          },
          {
            "san": "dxc3",
            "note": "Pode aceitar. O peão a mais é real, e você devolve depois se precisar."
          },
          {
            "san": "Nxc3",
            "note": "ele recupera o tempo"
          },
          {
            "san": "Nc6",
            "note": "Desenvolvimento normal. Na Siciliana não sobra tempo para lances de peão extras."
          },
          {
            "san": "Nf3",
            "note": "ele tira o cavalo"
          },
          {
            "san": "e6",
            "note": "Abre o bispo de f8 e segura d5."
          },
          {
            "san": "Bc4",
            "note": "ele mira f7"
          },
          {
            "san": "Qc7",
            "note": "Lance-chave: a dama sai da coluna d e já aponta para a diagonal que termina em h2."
          },
          {
            "san": "O-O",
            "note": "ele roca"
          },
          {
            "san": "Nf6",
            "note": "Desenvolve e prepara o salto para g4."
          },
          {
            "san": "Qe2",
            "note": "ele arruma a torre"
          },
          {
            "san": "Ng4",
            "note": "O cavalo encosta. Agora dama e cavalo miram h2 juntos."
          },
          {
            "san": "h3",
            "note": "ele enxota o cavalo, mas tira a defesa de h2"
          },
          {
            "san": "Nd4",
            "note": "O golpe. O cavalo ataca a dama de e2 e o cavalo de f3, que é o único defensor de h2."
          },
          {
            "san": "Nxd4",
            "note": "ele come o cavalo"
          },
          {
            "san": "Qh2#"
          }
        ]
      },
      {
        "label": "Ele recua o cavalo para e1",
        "ending": "Mesmo mate. Não importa para onde o cavalo de f3 vá: ao sair, ele larga h2.",
        "moves": [
          {
            "san": "c5"
          },
          {
            "san": "d4"
          },
          {
            "san": "cxd4"
          },
          {
            "san": "c3"
          },
          {
            "san": "dxc3"
          },
          {
            "san": "Nxc3"
          },
          {
            "san": "Nc6"
          },
          {
            "san": "Nf3"
          },
          {
            "san": "e6"
          },
          {
            "san": "Bc4"
          },
          {
            "san": "Qc7"
          },
          {
            "san": "O-O"
          },
          {
            "san": "Nf6"
          },
          {
            "san": "Qe2"
          },
          {
            "san": "Ng4"
          },
          {
            "san": "h3"
          },
          {
            "san": "Nd4"
          },
          {
            "san": "Ne1",
            "note": "ele salva a dama recuando o cavalo"
          },
          {
            "san": "Qh2#"
          }
        ]
      },
      {
        "label": "Ele avança o cavalo para g5",
        "ending": "Mesmo mate de novo. O cavalo de f3 era insubstituível.",
        "moves": [
          {
            "san": "c5"
          },
          {
            "san": "d4"
          },
          {
            "san": "cxd4"
          },
          {
            "san": "c3"
          },
          {
            "san": "dxc3"
          },
          {
            "san": "Nxc3"
          },
          {
            "san": "Nc6"
          },
          {
            "san": "Nf3"
          },
          {
            "san": "e6"
          },
          {
            "san": "Bc4"
          },
          {
            "san": "Qc7"
          },
          {
            "san": "O-O"
          },
          {
            "san": "Nf6"
          },
          {
            "san": "Qe2"
          },
          {
            "san": "Ng4"
          },
          {
            "san": "h3"
          },
          {
            "san": "Nd4"
          },
          {
            "san": "Ng5",
            "note": "ele contra-ataca em vez de se defender"
          },
          {
            "san": "Qh2#"
          }
        ]
      },
      {
        "label": "Ele acha a defesa e come em g4",
        "ending": "Sem mate: ele achou o único jeito de segurar h2. Mas o cavalo de d4 come a dama com xeque, e você sai com dama por cavalo.",
        "outcome": "advantage",
        "moves": [
          {
            "san": "c5"
          },
          {
            "san": "d4"
          },
          {
            "san": "cxd4"
          },
          {
            "san": "c3"
          },
          {
            "san": "dxc3"
          },
          {
            "san": "Nxc3"
          },
          {
            "san": "Nc6"
          },
          {
            "san": "Nf3"
          },
          {
            "san": "e6"
          },
          {
            "san": "Bc4"
          },
          {
            "san": "Qc7"
          },
          {
            "san": "O-O"
          },
          {
            "san": "Nf6"
          },
          {
            "san": "Qe2"
          },
          {
            "san": "Ng4"
          },
          {
            "san": "h3"
          },
          {
            "san": "Nd4"
          },
          {
            "san": "hxg4",
            "note": "a melhor defesa: ele come o cavalo que mirava h2"
          },
          {
            "san": "Nxe2+",
            "note": "Com xeque, o que não dá tempo de ele reagir. Você ganhou a dama."
          }
        ]
      },
      {
        "label": "Ele não entrega o gambito: joga Cf3 primeiro",
        "ending": "Sem gambito e sem armadilha: as brancas desenvolveram antes de abrir o centro, e a casa h2 nunca fica com um defensor só. É um Siciliano Aberto normal.",
        "outcome": "equal",
        "moves": [
          {
            "san": "c5",
            "note": "A Siciliana: o peão vigia d4 sem bloquear nenhuma peça preta."
          },
          {
            "san": "Nf3",
            "note": "ele desenvolve antes de abrir o centro, sem oferecer peão nenhum"
          },
          {
            "san": "Nc6",
            "note": "Desenvolva normalmente. Sem c3 cedo, não há peão para aceitar."
          },
          {
            "san": "d4",
            "note": "só agora ele abre o centro"
          },
          {
            "san": "cxd4",
            "note": "Troque como sempre: um peão lateral seu sai, um peão central dele some."
          },
          {
            "san": "Nxd4",
            "note": "ele recaptura com o cavalo, já no lugar certo"
          },
          {
            "san": "Nf6",
            "note": "Desenvolva atacando e4. Essa é a estrutura normal da Siciliana Aberta, sem truque nenhum."
          },
          {
            "san": "Nc3",
            "note": "ele defende e4"
          },
          {
            "san": "d6",
            "note": "Apoie e5 e abra o bispo de c8. Dali para a frente é a partida comum, sem o cavalo de f3 isolado defendendo h2."
          }
        ]
      },
      {
        "label": "Ele joga a Siciliana Fechada (2.Cc3)",
        "ending": "Um sistema inteiro diferente: as brancas nem abrem o centro com d4, então a casa h2 nunca fica desprotegida. Fianqueto, reagrupe e jogue um plano lento dos dois lados.",
        "outcome": "equal",
        "moves": [
          {
            "san": "c5",
            "note": "A Siciliana: o peão vigia d4 sem bloquear nenhuma peça preta."
          },
          {
            "san": "Nc3",
            "note": "a Siciliana Fechada: ele nem pensa em abrir o centro com d4"
          },
          {
            "san": "Nc6",
            "note": "Desenvolva normalmente: sem d4 no ar, não há coluna c para disputar ainda."
          },
          {
            "san": "g3",
            "note": "ele prepara o fianqueto do bispo de f1"
          },
          {
            "san": "g6",
            "note": "Espelhe o plano: o seu bispo de f8 também vai para o fianqueto."
          },
          {
            "san": "Bg2",
            "note": "ele completa o fianqueto"
          },
          {
            "san": "Bg7",
            "note": "Mesma ideia do seu lado. Os dois bispos vigiam a diagonal inteira, sem trocas no centro."
          },
          {
            "san": "d3",
            "note": "ele apoia e4 com calma"
          },
          {
            "san": "d6",
            "note": "Apoie e5 e prepare o seu próprio desenvolvimento. É um jogo mais lento, sem armadilha de nenhum dos dois lados."
          }
        ]
      },
      {
        "label": "Ele joga o Alapin (2.c3)",
        "ending": "Outro sistema sem gambito nenhum: as brancas preparam d4 com apoio de peão, sem nunca abrir mão de um peão central. A dama preta fica bem ativa em d5.",
        "outcome": "equal",
        "moves": [
          {
            "san": "c5",
            "note": "A Siciliana: o peão vigia d4 sem bloquear nenhuma peça preta."
          },
          {
            "san": "c3",
            "note": "o Alapin: ele prepara d4 com apoio de peão, sem gambito"
          },
          {
            "san": "d5",
            "note": "Ataque e4 na mesma hora, antes que d4 aconteça."
          },
          {
            "san": "exd5",
            "note": "ele troca"
          },
          {
            "san": "Qxd5",
            "note": "Recapture com a dama. Aqui é seguro: com o peão em c3, as brancas não têm Cc3 para ganhar tempo atacando-a."
          },
          {
            "san": "d4",
            "note": "ele ocupa o centro"
          },
          {
            "san": "Nf6",
            "note": "Desenvolva mantendo a pressão sobre d4."
          },
          {
            "san": "Nf3",
            "note": "ele desenvolve"
          },
          {
            "san": "e6",
            "note": "Abra o bispo de f8 e prepare o roque. A partida segue equilibrada, outra vez sem a casa h2 isolada."
          }
        ]
      }
    ]
  },
  {
    "type": "tip",
    "title": "O que procurar nessa armadilha",
    "text": "Ela só existe porque h2 tem um defensor só. Antes de atacar uma casa perto do rei adversário, conte os defensores dela. Quando o número chega a um, procure um lance que expulse ou distraia esse defensor."
  },
  {
    "type": "guided-line",
    "id": "siciliana-linha",
    "title": "E quando ele não entrega peão: a Siciliana aberta",
    "startFen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    "orientation": "b",
    "intro": "A linha principal, sem armadilha. Você continua com as pretas.",
    "conclusion": "Dois peões centrais pretos, coluna c semiaberta e a casa d5 como centro da disputa.",
    "steps": [
      {
        "move": "c5",
        "reply": "Nf3",
        "explanation": "O peão de c vigia d4 sem bloquear nenhuma peça preta."
      },
      {
        "move": "d6",
        "reply": "d4",
        "explanation": "Controla e5 e abre o bispo de c8."
      },
      {
        "move": "cxd4",
        "reply": "Nxd4",
        "explanation": "A troca que dá nome à ideia: um peão lateral sai, um peão central branco some."
      },
      {
        "move": "Nf6",
        "reply": "Nc3",
        "explanation": "Desenvolve atacando e4 e obriga as brancas a defender."
      },
      {
        "move": "a6",
        "reply": "Be2",
        "explanation": "Tira b5 das peças brancas e prepara ...b5. É o lance da Najdorf."
      },
      {
        "move": "e5",
        "reply": "Nb3",
        "explanation": "Ganha espaço e expulsa o cavalo. O preço é a casa d5."
      },
      {
        "move": "Be7",
        "reply": "O-O",
        "explanation": "Termine o desenvolvimento e roque."
      }
    ]
  },
  {
    "type": "exercise",
    "id": "siciliana-define",
    "prompt": "As brancas jogaram 1.e4. Responda com a Siciliana.",
    "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    "acceptedMoves": [
      "c5"
    ],
    "goal": "move",
    "successText": "1...c5. Você recusou a simetria e já mira a casa d4."
  },
  {
    "type": "exercise",
    "id": "siciliana-tempo",
    "prompt": "As brancas recapturaram com a dama. Desenvolva uma peça atacando-a.",
    "fen": "rnbqkbnr/pp2pppp/3p4/8/3QP3/5N2/PPP2PPP/RNB1KB1R b KQkq - 0 4",
    "acceptedMoves": [
      "Nc6"
    ],
    "goal": "move",
    "successText": "O cavalo sai e a dama precisa fugir. Você desenvolveu de graça."
  }
]$json$::jsonb
)
on conflict (lesson_id) do update
  set module_id = excluded.module_id,
      required_scope = excluded.required_scope,
      body = excluded.body,
      updated_at = now();

-- aberturas · francesa
insert into public.lesson_contents (lesson_id, module_id, required_scope, body)
values (
  'francesa',
  'aberturas',
  'module:aberturas',
  $json$[
  {
    "type": "paragraph",
    "text": "Na Francesa as pretas preparam ...d5 com 1...e6. Essa muralha de peões é sólida demais para permitir mate nos primeiros lances — e é justamente por isso que a abertura é respeitada. O que existe aqui é uma armadilha que ganha a dama."
  },
  {
    "type": "guided-game",
    "id": "francesa-partida",
    "title": "Do primeiro lance ao ganho da dama",
    "orientation": "w",
    "exhaustiveFrom": 17,
    "intro": "Você joga com as brancas, do começo ao fim. No lance 9 as pretas vão ter três respostas possíveis, e você vence as três. Mais cedo, elas também podem evitar a armadilha inteira — seja mudando o plano de desenvolvimento, seja escolhendo outra manobra para o cavalo.",
    "conclusion": "As três fugas do rei preto estão cobertas, e em todas a dama cai. Essa é a armadilha clássica da Variante do Avanço. E se as pretas nunca atacarem d4 com a dama — ou manobrarem o cavalo por e7 em vez de c6 —, a armadilha nem chega a existir.",
    "variations": [
      {
        "label": "Ele bloqueia com o bispo",
        "ending": "A dama cai: o bispo de b5 saiu de d3 e abriu a coluna d para a sua dama. É um ataque descoberto com xeque.",
        "outcome": "advantage",
        "moves": [
          {
            "san": "e4",
            "note": "Peão ao centro."
          },
          {
            "san": "e6",
            "note": "a Francesa: ele prepara ...d5 com apoio"
          },
          {
            "san": "d4",
            "note": "Centro completo."
          },
          {
            "san": "d5",
            "note": "ele chega com o peão protegido"
          },
          {
            "san": "e5",
            "note": "Feche o centro em vez de trocar. A sua cadeia fica d4-e5 e a base é d4."
          },
          {
            "san": "c5",
            "note": "ele ataca a base da sua cadeia, que é o certo"
          },
          {
            "san": "c3",
            "note": "Segure d4 com outro peão. A disputa toda vai girar nessa casa."
          },
          {
            "san": "Nc6",
            "note": "mais um atacante em d4"
          },
          {
            "san": "Nf3",
            "note": "Mais um defensor. Conte atacantes e defensores a cada lance."
          },
          {
            "san": "Qb6",
            "note": "a dama dele entra na pressão sobre d4"
          },
          {
            "san": "Bd3",
            "note": "Lance natural de desenvolvimento. Repare que ele tapa a sua própria coluna d: isso vai importar."
          },
          {
            "san": "cxd4",
            "note": "ele começa a liquidar no centro"
          },
          {
            "san": "cxd4",
            "note": "Recapture. Agora d4 está defendido só pelo cavalo de f3."
          },
          {
            "san": "Nxd4",
            "note": "ele come o peão"
          },
          {
            "san": "Nxd4",
            "note": "Recapture de novo. Tudo normal até aqui."
          },
          {
            "san": "Qxd4",
            "note": "o erro: ele pega o cavalo com a dama"
          },
          {
            "san": "Bb5+",
            "note": "O golpe. O bispo sai de d3 com xeque e, ao sair, abre a coluna d: a sua dama passa a atacar a dama dele."
          },
          {
            "san": "Bd7",
            "note": "ele tapa o xeque"
          },
          {
            "san": "Qxd4",
            "note": "Dama capturada. Ele tem de atender ao xeque e não dá tempo de salvar a dama."
          }
        ]
      },
      {
        "label": "O rei vai para e7",
        "ending": "Mesmo resultado: ele cuidou do xeque, você pegou a dama.",
        "outcome": "advantage",
        "moves": [
          {
            "san": "e4"
          },
          {
            "san": "e6"
          },
          {
            "san": "d4"
          },
          {
            "san": "d5"
          },
          {
            "san": "e5"
          },
          {
            "san": "c5"
          },
          {
            "san": "c3"
          },
          {
            "san": "Nc6"
          },
          {
            "san": "Nf3"
          },
          {
            "san": "Qb6"
          },
          {
            "san": "Bd3"
          },
          {
            "san": "cxd4"
          },
          {
            "san": "cxd4"
          },
          {
            "san": "Nxd4"
          },
          {
            "san": "Nxd4"
          },
          {
            "san": "Qxd4"
          },
          {
            "san": "Bb5+"
          },
          {
            "san": "Ke7",
            "note": "ele anda com o rei"
          },
          {
            "san": "Qxd4"
          }
        ]
      },
      {
        "label": "O rei vai para d8",
        "ending": "A terceira e última resposta legal. Também perde a dama.",
        "outcome": "advantage",
        "moves": [
          {
            "san": "e4"
          },
          {
            "san": "e6"
          },
          {
            "san": "d4"
          },
          {
            "san": "d5"
          },
          {
            "san": "e5"
          },
          {
            "san": "c5"
          },
          {
            "san": "c3"
          },
          {
            "san": "Nc6"
          },
          {
            "san": "Nf3"
          },
          {
            "san": "Qb6"
          },
          {
            "san": "Bd3"
          },
          {
            "san": "cxd4"
          },
          {
            "san": "cxd4"
          },
          {
            "san": "Nxd4"
          },
          {
            "san": "Nxd4"
          },
          {
            "san": "Qxd4"
          },
          {
            "san": "Bb5+"
          },
          {
            "san": "Kd8",
            "note": "ele foge para o outro lado"
          },
          {
            "san": "Qxd4"
          }
        ]
      },
      {
        "label": "Ele não cai: desenvolve em vez de comer",
        "ending": "Nada de armadilha. Ele desenvolveu o bispo e a partida segue equilibrada: agora é jogar o plano normal da Francesa.",
        "outcome": "equal",
        "moves": [
          {
            "san": "e4"
          },
          {
            "san": "e6"
          },
          {
            "san": "d4"
          },
          {
            "san": "d5"
          },
          {
            "san": "e5"
          },
          {
            "san": "c5"
          },
          {
            "san": "c3"
          },
          {
            "san": "Nc6"
          },
          {
            "san": "Nf3"
          },
          {
            "san": "Qb6"
          },
          {
            "san": "Bd3"
          },
          {
            "san": "cxd4"
          },
          {
            "san": "cxd4"
          },
          {
            "san": "Bd7",
            "note": "ele desenvolve o bispo ruim em vez de capturar"
          },
          {
            "san": "O-O",
            "note": "Rei em segurança. Sem armadilha, a Francesa é uma disputa longa por d4 e d5."
          }
        ]
      },
      {
        "label": "Ele nem ataca d4 com a dama",
        "ending": "Sem a dama em b6 pressionando d4, não existe ataque descoberto nenhum para armar. Desenvolva com calma: a vantagem aqui é só a posicional de sempre.",
        "outcome": "equal",
        "moves": [
          {
            "san": "e4"
          },
          {
            "san": "e6"
          },
          {
            "san": "d4"
          },
          {
            "san": "d5"
          },
          {
            "san": "e5"
          },
          {
            "san": "c5"
          },
          {
            "san": "c3"
          },
          {
            "san": "Nc6"
          },
          {
            "san": "Nf3"
          },
          {
            "san": "Be7",
            "note": "ele desenvolve o bispo em vez de atacar d4 com a dama: sem Db6, não há o que a sua Bb5+ venha a descobrir depois"
          },
          {
            "san": "Be2",
            "note": "Desenvolva com calma. Sem a dama preta em b6, o truque do bispo em b5 não tem alvo nenhum."
          }
        ]
      },
      {
        "label": "Ele manobra o cavalo por e7 em vez de c6",
        "ending": "Outro plano, outra estrutura: o cavalo de e7 mira f5, não d4. Sem o cavalo em c6 para cair depois, a troca Cxd4 nem acontece — então não há coluna d aberta para a sua dama.",
        "outcome": "equal",
        "moves": [
          {
            "san": "e4"
          },
          {
            "san": "e6"
          },
          {
            "san": "d4"
          },
          {
            "san": "d5"
          },
          {
            "san": "e5"
          },
          {
            "san": "c5"
          },
          {
            "san": "c3"
          },
          {
            "san": "Ne7",
            "note": "ele manobra o cavalo para f5 em vez de desenvolver para c6"
          },
          {
            "san": "Nf3",
            "note": "Continue o desenvolvimento normal."
          },
          {
            "san": "Nbc6",
            "note": "ele completa o desenvolvimento com o outro cavalo"
          },
          {
            "san": "Be2",
            "note": "Sem a dama atacando d4 e sem o cavalo de c6 para capturar nada, essa partida é só a luta normal da Francesa."
          }
        ]
      }
    ]
  },
  {
    "type": "tip",
    "title": "Por que não existe mate rápido na Francesa",
    "text": "O peão de e6 tapa a diagonal que leva a f7, que é por onde quase todos os mates de abertura entram. Procurei, posição por posição nas linhas principais, um erro que permitisse mate forçado em dois lances: não existe nenhum. Em compensação, as armadilhas que ganham material são frequentes."
  },
  {
    "type": "guided-line",
    "id": "francesa-linha",
    "title": "A Variante do Avanço pelo lado das pretas",
    "startFen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    "orientation": "b",
    "intro": "Agora do outro lado, para você saber se defender dela.",
    "conclusion": "Centro travado e peças pretas apontando para d4. O plano é somar atacantes nessa casa.",
    "steps": [
      {
        "move": "e6",
        "reply": "d4",
        "explanation": "Prepara ...d5 com apoio."
      },
      {
        "move": "d5",
        "reply": "e5",
        "explanation": "O peão chega protegido e as brancas fecham o centro."
      },
      {
        "move": "c5",
        "reply": "c3",
        "explanation": "A base da cadeia branca é d4. Ataque sempre a base."
      },
      {
        "move": "Nc6",
        "reply": "Nf3",
        "explanation": "Mais um atacante em d4."
      },
      {
        "move": "Qb6",
        "reply": "Be2",
        "explanation": "A dama pressiona d4 e vigia b2. Repare: aqui as brancas NÃO jogaram Bd3, e por isso não há armadilha."
      },
      {
        "move": "Bd7",
        "reply": "O-O",
        "explanation": "O bispo ruim sai pela porta dos fundos."
      }
    ]
  },
  {
    "type": "exercise",
    "id": "francesa-define",
    "prompt": "As brancas montaram o centro com 2.d4. Jogue o lance principal da Francesa.",
    "fen": "rnbqkbnr/pppp1ppp/4p3/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2",
    "acceptedMoves": [
      "d5"
    ],
    "goal": "move",
    "successText": "2...d5. O peão chega apoiado por e6 e obriga as brancas a decidir o que fazer com e4."
  },
  {
    "type": "exercise",
    "id": "francesa-base",
    "prompt": "As brancas fecharam o centro com 3.e5. Ataque a base da cadeia de peões delas.",
    "fen": "rnbqkbnr/ppp2ppp/4p3/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3",
    "acceptedMoves": [
      "c5"
    ],
    "goal": "move",
    "successText": "3...c5. A cadeia branca é d4-e5; d4 é a base e é por ali que ela cai."
  }
]$json$::jsonb
)
on conflict (lesson_id) do update
  set module_id = excluded.module_id,
      required_scope = excluded.required_scope,
      body = excluded.body,
      updated_at = now();

-- aberturas · espanhola
insert into public.lesson_contents (lesson_id, module_id, required_scope, body)
values (
  'espanhola',
  'aberturas',
  'module:aberturas',
  $json$[
  {
    "type": "paragraph",
    "text": "A Espanhola ataca o defensor: o bispo vai a b5 e encosta no cavalo que segura o peão de e5. Aqui você joga com as pretas e arma uma cilada para quem acha que o peão de e5 está de graça."
  },
  {
    "type": "guided-game",
    "id": "espanhola-partida",
    "title": "Do primeiro lance ao mate: o peão envenenado de e5",
    "startFen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    "orientation": "b",
    "exhaustiveFrom": 11,
    "intro": "As brancas abriram com 1.e4. Você joga com as pretas e oferece um peão que não pode ser comido.",
    "conclusion": "O cavalo em d4 é um garfo: ele ataca o bispo e o cavalo de f3 ao mesmo tempo. Qualquer lance que não resolva as duas ameaças ao mesmo tempo — comer o peão, roque, Ba4, c3 ou Bc4 — custa material ou pior; só a troca imediata (Cxd4) deixa a posição normal.",
    "variations": [
      {
        "label": "Ele come o peão e depois bloqueia com o bispo",
        "ending": "Xeque-mate. O bispo de e2 não pode capturar o cavalo porque está cravado pela dama de e4, e o rei não tem casa nenhuma.",
        "moves": [
          {
            "san": "e5",
            "note": "Resposta simétrica ao centro."
          },
          {
            "san": "Nf3",
            "note": "ele ataca o seu peão de e5"
          },
          {
            "san": "Nc6",
            "note": "Defenda com uma peça, nunca com um peão: o peão não entra em jogo depois."
          },
          {
            "san": "Bb5",
            "note": "a Espanhola: ele encosta no defensor de e5"
          },
          {
            "san": "Nd4",
            "note": "Um lance estranho de propósito: o cavalo sai de c6 e deixa e5 sem defesa. É a isca."
          },
          {
            "san": "Nxe5",
            "note": "ele morde: come o peão"
          },
          {
            "san": "Qg5",
            "note": "O golpe duplo. A dama ataca o cavalo de e5 e o peão de g2 ao mesmo tempo."
          },
          {
            "san": "Nxf7",
            "note": "ele contra-ataca o seu rei e a sua torre"
          },
          {
            "san": "Qxg2",
            "note": "Ignore a torre. O seu ataque chega primeiro: g2 cai e h1 fica na mira."
          },
          {
            "san": "Rf1",
            "note": "ele salva a torre, mas tira a casa f1 do próprio rei"
          },
          {
            "san": "Qxe4+",
            "note": "Mais um peão, com xeque. Agora ele só tem dois lances legais."
          },
          {
            "san": "Be2",
            "note": "ele bloqueia com o bispo"
          },
          {
            "san": "Nf3#"
          }
        ]
      },
      {
        "label": "Ele bloqueia com a dama e escapa do mate",
        "ending": "Sem mate: foi o único jeito. Mas ele devolveu a dama, e você fica com dama e cavalo contra torre e bispo.",
        "outcome": "advantage",
        "moves": [
          {
            "san": "e5"
          },
          {
            "san": "Nf3"
          },
          {
            "san": "Nc6"
          },
          {
            "san": "Bb5"
          },
          {
            "san": "Nd4"
          },
          {
            "san": "Nxe5"
          },
          {
            "san": "Qg5"
          },
          {
            "san": "Nxf7"
          },
          {
            "san": "Qxg2"
          },
          {
            "san": "Rf1"
          },
          {
            "san": "Qxe4+"
          },
          {
            "san": "Qe2",
            "note": "ele entrega a dama para não levar mate"
          },
          {
            "san": "Qxe2+",
            "note": "Capture com xeque. A conta de material ficou boa demais para ele reagir."
          }
        ]
      },
      {
        "label": "Ele desconfia da isca",
        "ending": "Sem armadilha: ele trocou em vez de comer. A partida segue normal, com o seu peão de d4 incomodando o centro dele.",
        "outcome": "advantage",
        "moves": [
          {
            "san": "e5"
          },
          {
            "san": "Nf3"
          },
          {
            "san": "Nc6"
          },
          {
            "san": "Bb5"
          },
          {
            "san": "Nd4"
          },
          {
            "san": "Nxd4",
            "note": "a resposta correta: ele troca em vez de comer o peão"
          },
          {
            "san": "exd4",
            "note": "Recapture. Você não ganhou nada, mas também não perdeu: é uma partida normal."
          }
        ]
      },
      {
        "label": "Ele ignora o garfo e desenvolve",
        "ending": "O cavalo de d4 ataca o bispo de b5 e o cavalo de f3 ao mesmo tempo. Ignorando os dois, as brancas só têm a si mesmas a culpar: você captura o bispo de graça.",
        "outcome": "advantage",
        "moves": [
          {
            "san": "e5"
          },
          {
            "san": "Nf3"
          },
          {
            "san": "Nc6"
          },
          {
            "san": "Bb5"
          },
          {
            "san": "Nd4"
          },
          {
            "san": "O-O",
            "note": "ele ignora o garfo e roca, como se nada tivesse acontecido"
          },
          {
            "san": "Nxb5",
            "note": "Capture o bispo. Nada o defende: o garfo cobrou o preço."
          }
        ]
      },
      {
        "label": "Ele salva só o bispo",
        "ending": "Salvar o bispo não resolve: o cavalo de d4 ainda ataca o cavalo de f3, e ele estava sem defesa com o rei branco ainda no centro.",
        "outcome": "advantage",
        "moves": [
          {
            "san": "e5"
          },
          {
            "san": "Nf3"
          },
          {
            "san": "Nc6"
          },
          {
            "san": "Bb5"
          },
          {
            "san": "Nd4"
          },
          {
            "san": "Ba4",
            "note": "ele recua o bispo, mas esquece do cavalo de f3"
          },
          {
            "san": "Nxf3+",
            "note": "Capture o outro cavalo do garfo, com xeque de quebra: o rei branco ainda está no centro."
          }
        ]
      },
      {
        "label": "Ele tenta expulsar o cavalo com c3",
        "ending": "O peão ataca o cavalo, mas não defende o bispo. O cavalo escapa capturando: você fica com uma peça a mais.",
        "outcome": "advantage",
        "moves": [
          {
            "san": "e5"
          },
          {
            "san": "Nf3"
          },
          {
            "san": "Nc6"
          },
          {
            "san": "Bb5"
          },
          {
            "san": "Nd4"
          },
          {
            "san": "c3",
            "note": "ele ataca o cavalo com o peão, em vez de reagir ao garfo"
          },
          {
            "san": "Nxb5",
            "note": "Capture o bispo antes de sair da casa atacada: nada em b5 o defende."
          }
        ]
      },
      {
        "label": "Ele recua o bispo para c4 e esquece o cavalo",
        "ending": "O bispo foge para uma diagonal melhor, mas abandona o cavalo de f3, que era a outra ponta do garfo.",
        "outcome": "advantage",
        "moves": [
          {
            "san": "e5"
          },
          {
            "san": "Nf3"
          },
          {
            "san": "Nc6"
          },
          {
            "san": "Bb5"
          },
          {
            "san": "Nd4"
          },
          {
            "san": "Bc4",
            "note": "ele reposiciona o bispo em vez de resolver o garfo"
          },
          {
            "san": "Nxf3+",
            "note": "Capture o cavalo com xeque. A estrutura branca fica rachada depois da recaptura."
          }
        ]
      }
    ]
  },
  {
    "type": "tip",
    "title": "Cuidado com esta aula",
    "text": "O lance 4...Cd4 só funciona porque é um garfo real: ataca o bispo e o cavalo ao mesmo tempo. Mesmo assim, a teoria considera o lance discutível, porque 5.Cxd4 (a única resposta que desfaz as duas ameaças de uma vez) deixa as brancas bem. A armadilha serve para você reconhecê-la quando estiver do outro lado; não construa o seu jogo em cima dela."
  },
  {
    "type": "guided-line",
    "id": "espanhola-linha",
    "title": "A Espanhola de verdade: a linha fechada",
    "orientation": "w",
    "intro": "Agora com as brancas, sem armadilha. Oito lances de cada lado, todos com um motivo simples.",
    "conclusion": "Rei seguro, torre em e1, bispo guardado em b3 e o centro ainda fechado.",
    "steps": [
      {
        "move": "e4",
        "reply": "e5",
        "explanation": "Centro ocupado dos dois lados."
      },
      {
        "move": "Nf3",
        "reply": "Nc6",
        "explanation": "O cavalo ataca e5, as pretas defendem com o cavalo."
      },
      {
        "move": "Bb5",
        "reply": "a6",
        "explanation": "O bispo encosta no defensor de e5 e as pretas perguntam o que ele pretende."
      },
      {
        "move": "Ba4",
        "reply": "Nf6",
        "explanation": "Trocar em c6 daria às pretas o par de bispos."
      },
      {
        "move": "O-O",
        "reply": "Be7",
        "explanation": "Rei seguro antes de qualquer coisa, mesmo com e4 solto por um instante."
      },
      {
        "move": "Re1",
        "reply": "b5",
        "explanation": "Agora e4 está defendido."
      },
      {
        "move": "Bb3",
        "reply": "d6",
        "explanation": "O bispo se instala fora do alcance dos peões pretos."
      },
      {
        "move": "c3",
        "reply": "O-O",
        "explanation": "Prepara d4 e abre c2 para o bispo recuar."
      }
    ]
  },
  {
    "type": "exercise",
    "id": "espanhola-define",
    "prompt": "Jogue o lance que define a Abertura Espanhola.",
    "fen": "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    "acceptedMoves": [
      "Bb5"
    ],
    "goal": "move",
    "successText": "O bispo pressiona o cavalo que defende e5. Nada é ganho ainda, mas a pergunta está feita."
  },
  {
    "type": "exercise",
    "id": "espanhola-recupera",
    "prompt": "As brancas capturaram o peão de e5. Recupere o material com a dama.",
    "fen": "r1bqkbnr/1pp2ppp/p1p5/4N3/4P3/8/PPPP1PPP/RNBQK2R b KQkq - 0 5",
    "acceptedMoves": [
      "Qd4",
      "Qe7"
    ],
    "goal": "move",
    "successText": "Dois lances servem: 5...Dd4 ataca o cavalo e o peão de e4 ao mesmo tempo; 5...De7 crava o cavalo na coluna e. Nos dois casos o peão volta."
  }
]$json$::jsonb
)
on conflict (lesson_id) do update
  set module_id = excluded.module_id,
      required_scope = excluded.required_scope,
      body = excluded.body,
      updated_at = now();

-- aberturas · gambito-da-dama
insert into public.lesson_contents (lesson_id, module_id, required_scope, body)
values (
  'gambito-da-dama',
  'aberturas',
  'module:aberturas',
  $json$[
  {
    "type": "paragraph",
    "text": "O Gambito da Dama oferece o peão de c4 para tirar o peão de d5 do centro. Como a Francesa, é uma abertura sólida demais para dar mate cedo — mas tem uma armadilha famosa em que a dama parece perdida e quem perde uma peça é o outro."
  },
  {
    "type": "guided-game",
    "id": "gambito-partida",
    "title": "Do primeiro lance ao ganho de uma peça",
    "startFen": "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
    "orientation": "b",
    "exhaustiveFrom": 13,
    "intro": "As brancas abriram com 1.d4. Você joga com as pretas e vai deixar a sua dama aparentemente de graça.",
    "conclusion": "Você venceu as cinco tentativas: a gananciosa, que custa uma peça a ele, a cautelosa, a que nem entra na armadilha, a que evita a cravada desde o início e a que troca tudo cedo demais para a armadilha existir.",
    "variations": [
      {
        "label": "Ele come a dama e perde uma peça",
        "ending": "Fim da armadilha: o seu rei pega o bispo de d8 e a conta fecha com uma peça a mais para você. O rei no centro não incomoda, porque as damas já saíram.",
        "outcome": "advantage",
        "moves": [
          {
            "san": "d5",
            "note": "Disputa o centro de igual para igual."
          },
          {
            "san": "c4",
            "note": "ele oferece o gambito"
          },
          {
            "san": "e6",
            "note": "Recuse: defenda d5 com um peão. O preço é prender o bispo de c8."
          },
          {
            "san": "Nc3",
            "note": "ele soma um atacante em d5"
          },
          {
            "san": "Nf6",
            "note": "Mais um defensor de d5. Quase tudo nessa abertura gira em torno dessa casa."
          },
          {
            "san": "Bg5",
            "note": "ele crava o seu cavalo de f6"
          },
          {
            "san": "Nbd7",
            "note": "O lance que arma a cilada. Parece que d5 ficou mal defendido, mas é proposital."
          },
          {
            "san": "cxd5",
            "note": "ele troca no centro"
          },
          {
            "san": "exd5",
            "note": "Recapture com o peão, mantendo o centro."
          },
          {
            "san": "Nxd5",
            "note": "a isca funcionou: ele acha que o cavalo de f6 está cravado e come em d5"
          },
          {
            "san": "Nxd5",
            "note": "Capture mesmo com o cavalo cravado. A cravada era só aparente."
          },
          {
            "san": "Bxd8",
            "note": "ele leva a sua dama, achando que ganhou"
          },
          {
            "san": "Bb4+",
            "note": "O xeque que resolve tudo. Agora ele tem um único lance legal."
          },
          {
            "san": "Qd2",
            "note": "o único lance: tapar com a dama"
          },
          {
            "san": "Bxd2+",
            "note": "Troque as damas com xeque."
          },
          {
            "san": "Kxd2",
            "note": "ele recaptura com o rei"
          },
          {
            "san": "Kxd8",
            "note": "E o seu rei recolhe o bispo. Você fica com uma peça a mais."
          }
        ]
      },
      {
        "label": "Ele recua o rei em vez de recapturar",
        "ending": "Ele fugiu com o rei, então o seu rei pega o bispo de d8 primeiro. Ele recupera o bispo de d2 no lance seguinte e a conta fecha igual: uma peça a mais para você.",
        "outcome": "advantage",
        "moves": [
          {
            "san": "d5"
          },
          {
            "san": "c4"
          },
          {
            "san": "e6"
          },
          {
            "san": "Nc3"
          },
          {
            "san": "Nf6"
          },
          {
            "san": "Bg5"
          },
          {
            "san": "Nbd7"
          },
          {
            "san": "cxd5"
          },
          {
            "san": "exd5"
          },
          {
            "san": "Nxd5"
          },
          {
            "san": "Nxd5"
          },
          {
            "san": "Bxd8"
          },
          {
            "san": "Bb4+",
            "note": "O xeque que resolve tudo. Agora ele tem um único lance legal."
          },
          {
            "san": "Qd2"
          },
          {
            "san": "Bxd2+"
          },
          {
            "san": "Kd1",
            "note": "a outra resposta legal: ele não captura"
          },
          {
            "san": "Kxd8",
            "note": "Recolha o bispo com o rei. A peça a mais continua sua."
          }
        ]
      },
      {
        "label": "Ele desconfia e guarda o bispo",
        "ending": "Ele não pegou a dama, mas já tinha entregado o cavalo em d5. Uma peça a mais e ainda com xeque para organizar o resto.",
        "outcome": "advantage",
        "moves": [
          {
            "san": "d5"
          },
          {
            "san": "c4"
          },
          {
            "san": "e6"
          },
          {
            "san": "Nc3"
          },
          {
            "san": "Nf6"
          },
          {
            "san": "Bg5"
          },
          {
            "san": "Nbd7"
          },
          {
            "san": "cxd5"
          },
          {
            "san": "exd5"
          },
          {
            "san": "Nxd5"
          },
          {
            "san": "Nxd5"
          },
          {
            "san": "Be3",
            "note": "ele recua em vez de pegar a dama"
          },
          {
            "san": "Bb4+",
            "note": "Xeque de qualquer jeito. O cavalo que ele deu em d5 não volta."
          }
        ]
      },
      {
        "label": "Ele não cai na armadilha",
        "ending": "Sem armadilha: ele desenvolveu em vez de capturar em d5. A partida segue equilibrada, no Gambito da Dama Recusado de sempre.",
        "outcome": "equal",
        "moves": [
          {
            "san": "d5"
          },
          {
            "san": "c4"
          },
          {
            "san": "e6"
          },
          {
            "san": "Nc3"
          },
          {
            "san": "Nf6"
          },
          {
            "san": "Bg5"
          },
          {
            "san": "Nbd7"
          },
          {
            "san": "cxd5"
          },
          {
            "san": "exd5"
          },
          {
            "san": "e3",
            "note": "ele desenvolve em vez de morder a isca"
          },
          {
            "san": "Be7",
            "note": "Desfaça a cravada e prepare o roque. Daqui é uma partida normal."
          }
        ]
      },
      {
        "label": "Ele nem crava o cavalo: joga Cf3 em vez de Bg5",
        "ending": "Sem cravada, não há cavalo \"aparentemente preso\" nem isca nenhuma. É só o Gambito da Dama Recusado mais comum de todos.",
        "outcome": "equal",
        "moves": [
          {
            "san": "d5"
          },
          {
            "san": "c4"
          },
          {
            "san": "e6"
          },
          {
            "san": "Nc3"
          },
          {
            "san": "Nf6"
          },
          {
            "san": "Nf3",
            "note": "ele desenvolve o cavalo em vez de cravar com o bispo"
          },
          {
            "san": "Be7",
            "note": "Desenvolva com calma. Sem o bispo em g5, não existe cavalo cravado para fingir que está preso."
          }
        ]
      },
      {
        "label": "Ele troca em d5 antes de cravar",
        "ending": "A troca cedo demais: sem o bispo em g5 e sem o cavalo cravado, não existe isca nenhuma para armar. É a Variante de Troca do Gambito da Dama, uma estrutura simétrica e tranquila.",
        "outcome": "equal",
        "moves": [
          {
            "san": "d5"
          },
          {
            "san": "c4"
          },
          {
            "san": "e6"
          },
          {
            "san": "Nc3"
          },
          {
            "san": "Nf6"
          },
          {
            "san": "cxd5",
            "note": "ele troca em d5 antes de cravar o cavalo"
          },
          {
            "san": "exd5",
            "note": "Recapture com o peão. Sem bispo em g5, sem cravada, sem armadilha: é só a Variante de Troca, com um centro simétrico e sólido."
          }
        ]
      }
    ]
  },
  {
    "type": "tip",
    "title": "A lição por trás da armadilha",
    "text": "O cavalo de f6 parecia cravado pelo bispo de g5, mas cravada contra a dama não é absoluta: você pode mover a peça cravada se o que vem depois compensa. Antes de confiar numa cravada, calcule o que acontece se o adversário simplesmente ignorar."
  },
  {
    "type": "guided-line",
    "id": "gambito-linha",
    "title": "O Gambito da Dama Recusado pelo lado das brancas",
    "orientation": "w",
    "intro": "Agora com as brancas, sem armadilha nenhuma.",
    "conclusion": "Peças desenvolvidas, pressão em d5 e um centro estável.",
    "steps": [
      {
        "move": "d4",
        "reply": "d5",
        "explanation": "Centro ocupado pelos dois lados."
      },
      {
        "move": "c4",
        "reply": "e6",
        "explanation": "O gambito. As pretas recusam e defendem d5 com um peão."
      },
      {
        "move": "Nc3",
        "reply": "Nf6",
        "explanation": "Mais um atacante em d5."
      },
      {
        "move": "Bg5",
        "reply": "Be7",
        "explanation": "O bispo crava o cavalo de f6; as pretas desfazem a cravada antes de qualquer coisa."
      },
      {
        "move": "e3",
        "reply": "O-O",
        "explanation": "Lance modesto que abre o bispo de f1 sem soltar d4."
      },
      {
        "move": "Nf3",
        "reply": "Nbd7",
        "explanation": "Desenvolvimento completo dos dois lados."
      }
    ]
  },
  {
    "type": "exercise",
    "id": "gambito-define",
    "prompt": "Jogue o lance que oferece o Gambito da Dama.",
    "fen": "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
    "acceptedMoves": [
      "c4"
    ],
    "goal": "move",
    "successText": "2.c4. O peão ataca d5 de lado, que é o único jeito de tirar o centro preto do lugar."
  },
  {
    "type": "exercise",
    "id": "gambito-recupera",
    "prompt": "As pretas aceitaram o peão e desenvolveram. Recupere o peão agora, com uma peça.",
    "fen": "rnbqkb1r/ppp1pppp/5n2/8/2pP4/4P3/PP3PPP/RNBQKBNR w KQkq - 1 4",
    "acceptedMoves": [
      "Bxc4"
    ],
    "goal": "move",
    "successText": "O bispo recupera o peão e já fica numa boa diagonal. Terminar o desenvolvimento primeiro também serve: o peão de c4 não tem como ser defendido."
  }
]$json$::jsonb
)
on conflict (lesson_id) do update
  set module_id = excluded.module_id,
      required_scope = excluded.required_scope,
      body = excluded.body,
      updated_at = now();

-- estrategia · desenvolvimento
insert into public.lesson_contents (lesson_id, module_id, required_scope, body)
values (
  'desenvolvimento',
  'estrategia',
  'module:estrategia',
  $json$[
  {
    "type": "paragraph",
    "text": "Desenvolver é tirar as peças da última fileira e colocá-las onde elas fazem alguma coisa. Nos dez primeiros lances, quem tem mais peças em jogo costuma ditar o que acontece."
  },
  {
    "type": "paragraph",
    "text": "A ordem que funciona é quase sempre a mesma: um peão central, os cavalos, os bispos, o roque. Jogue a sequência abaixo e repare que nenhuma peça é movida duas vezes."
  },
  {
    "type": "guided-line",
    "id": "desenvolvimento-ordem",
    "title": "Seis lances, seis peças em jogo",
    "orientation": "w",
    "intro": "Você joga com as brancas. Não há nada de espetacular aqui, e é esse o ponto.",
    "conclusion": "Seis lances e o desenvolvimento acabou: dois peões no centro, dois cavalos, dois bispos e o rei no canto. Só agora começa o plano.",
    "steps": [
      {
        "move": "d4",
        "reply": "d5",
        "explanation": "Um peão central abre caminho para a dama e para o bispo de c1."
      },
      {
        "move": "Nf3",
        "reply": "Nf6",
        "explanation": "O cavalo primeiro. Ele tem menos casas boas que o bispo, então é mais fácil decidir onde ele vai."
      },
      {
        "move": "e3",
        "reply": "e6",
        "explanation": "Lance modesto que libera o bispo de f1. Nem todo lance precisa ser agressivo."
      },
      {
        "move": "Bd3",
        "reply": "Bd6",
        "explanation": "O bispo numa diagonal que aponta para o lado do rei adversário."
      },
      {
        "move": "O-O",
        "reply": "O-O",
        "explanation": "Rei em segurança e torre mais perto do centro, num lance só."
      },
      {
        "move": "c4",
        "reply": "c6",
        "explanation": "Com as peças prontas, agora sim: o peão disputa o centro. Esta é a hora certa de mexer peões de novo."
      }
    ]
  },
  {
    "type": "tip",
    "title": "Três erros que custam a partida",
    "text": "Mover a mesma peça duas vezes sem motivo, tirar a dama cedo e empurrar peões laterais antes de rocar. Cada um deles entrega um ou dois tempos ao adversário, e é com esses tempos que ele ataca."
  },
  {
    "type": "exercise",
    "id": "desenv-defende-peca",
    "prompt": "As brancas tiraram a dama cedo e atacam e5. Defenda o peão desenvolvendo um cavalo.",
    "fen": "rnbqkbnr/pppp1ppp/8/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 1 2",
    "acceptedMoves": [
      "Nc6"
    ],
    "goal": "move",
    "successText": "Cc6 defende e5 e desenvolve ao mesmo tempo. Defender com um peão resolveria menos: o peão não entra em jogo depois."
  },
  {
    "type": "exercise",
    "id": "desenv-roque",
    "prompt": "As peças menores já estão fora. Faça o lance que termina o desenvolvimento.",
    "fen": "r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 2 6",
    "acceptedMoves": [
      "O-O"
    ],
    "goal": "move",
    "successText": "O roque tira o rei do centro e liga as torres. Depois dele você pode pensar em atacar."
  }
]$json$::jsonb
)
on conflict (lesson_id) do update
  set module_id = excluded.module_id,
      required_scope = excluded.required_scope,
      body = excluded.body,
      updated_at = now();

-- estrategia · seguranca-do-rei
insert into public.lesson_contents (lesson_id, module_id, required_scope, body)
values (
  'seguranca-do-rei',
  'estrategia',
  'module:estrategia',
  $json$[
  {
    "type": "paragraph",
    "text": "O rei no centro é o maior perigo da abertura. As colunas centrais são as primeiras a abrir, e é por elas que as torres e a dama adversárias entram."
  },
  {
    "type": "paragraph",
    "text": "Rocar resolve dois problemas de uma vez: tira o rei da zona de perigo e traz a torre para perto do centro. Como regra, roque nos dez primeiros lances, antes de qualquer plano de ataque."
  },
  {
    "type": "exercise",
    "id": "rei-roque-agora",
    "prompt": "O centro vai abrir a qualquer momento. Ponha o rei em segurança.",
    "fen": "r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 2 6",
    "acceptedMoves": [
      "O-O"
    ],
    "goal": "move",
    "successText": "Roque feito. O rei sai da coluna e, e a torre de h1 passa a olhar para o meio do tabuleiro."
  },
  {
    "type": "tip",
    "title": "Não estrague o abrigo",
    "text": "Depois de rocar, evite mexer os peões que estão na frente do rei. Cada um deles que avança abre uma linha ou deixa uma casa fraca atrás de si. Só mexa com um motivo concreto."
  },
  {
    "type": "diagram",
    "fen": "3r2k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
    "highlights": [
      "d1",
      "d8",
      "g1",
      "h2"
    ],
    "caption": "Os dois reis estão presos atrás dos próprios peões. Quem dominar a coluna d primeiro ameaça o mate do corredor.",
    "orientation": "w"
  },
  {
    "type": "exercise",
    "id": "rei-casa-de-fuga",
    "prompt": "O abrigo tem um defeito: o rei não tem casa de fuga. Abra uma com o peão da torre.",
    "fen": "3r2k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
    "acceptedMoves": [
      "h3",
      "h4"
    ],
    "goal": "move",
    "successText": "Agora o rei respira em h2 e o mate na última fileira deixa de ser uma ameaça. Esse lance se chama janela."
  },
  {
    "type": "tip",
    "title": "Quando abrir a janela",
    "text": "Não gaste o lance cedo demais: em posições com muitas peças ele é tempo perdido. O momento certo é quando as damas ou as torres começam a dominar uma coluna aberta."
  }
]$json$::jsonb
)
on conflict (lesson_id) do update
  set module_id = excluded.module_id,
      required_scope = excluded.required_scope,
      body = excluded.body,
      updated_at = now();

-- estrategia · estrutura-de-peoes
insert into public.lesson_contents (lesson_id, module_id, required_scope, body)
values (
  'estrutura-de-peoes',
  'estrategia',
  'module:estrategia',
  $json$[
  {
    "type": "paragraph",
    "text": "Peões não voltam atrás. Toda vez que você move um, decide alguma coisa para o resto da partida. Por isso vale conhecer os três defeitos e a única virtude que importam de verdade."
  },
  {
    "type": "paragraph",
    "text": "Peões dobrados são dois peões na mesma coluna: eles não se defendem e andam devagar. Peão isolado é o que não tem vizinho em nenhuma coluna ao lado: precisa ser defendido por peças. E peão passado é o que não tem nenhum peão adversário à frente nem nas colunas vizinhas: esse é o que ganha finais."
  },
  {
    "type": "diagram",
    "fen": "6k1/pp3ppp/8/8/8/2P5/PP1P1PPP/6K1 w - - 0 1",
    "highlights": [
      "c3",
      "d2"
    ],
    "caption": "As brancas têm um peão a mais na ala da dama. É dali que nasce um peão passado, se os peões forem empurrados na hora certa.",
    "orientation": "w"
  },
  {
    "type": "exercise",
    "id": "estrutura-recaptura",
    "prompt": "As pretas capturaram em c3. Recapture com a peça que não dobra os seus peões.",
    "fen": "r1bqk2r/pppp1ppp/2n2n2/4p3/2B1P3/2bP4/PPPB1PPP/R2QK1NR w KQkq - 0 6",
    "acceptedMoves": [
      "Bxc3"
    ],
    "goal": "move",
    "successText": "Bxc3 mantém os peões lado a lado. Recapturar com bxc3 também é jogável, mas deixa dois peões na coluna c e um peão de a isolado."
  },
  {
    "type": "tip",
    "title": "Peão dobrado nem sempre é ruim",
    "text": "Dobrar peões abre uma coluna para as suas torres e pode somar atacantes no centro. O defeito só pesa de verdade no final, quando sobram poucas peças e os peões precisam andar sozinhos."
  },
  {
    "type": "exercise",
    "id": "estrutura-ruptura",
    "prompt": "Três peões brancos contra três pretos, mas os brancos estão mais adiantados. Encontre o avanço que cria um peão passado imparável.",
    "fen": "8/ppp5/8/PPP5/8/8/8/K6k w - - 0 1",
    "acceptedMoves": [
      "b6"
    ],
    "goal": "move",
    "successText": "b6! Se as pretas capturam com qualquer um dos peões, o outro peão branco passa e chega a dama primeiro. É a ruptura clássica de três contra três."
  },
  {
    "type": "tip",
    "title": "A pergunta que resolve o final",
    "text": "Conte os peões de cada lado do tabuleiro. Onde você tiver mais peões do que o adversário, é ali que nasce o seu peão passado. Empurre o peão que não tem adversário na frente primeiro."
  }
]$json$::jsonb
)
on conflict (lesson_id) do update
  set module_id = excluded.module_id,
      required_scope = excluded.required_scope,
      body = excluded.body,
      updated_at = now();

-- estrategia · trocas
insert into public.lesson_contents (lesson_id, module_id, required_scope, body)
values (
  'trocas',
  'estrategia',
  'module:estrategia',
  $json$[
  {
    "type": "paragraph",
    "text": "Trocar peças parece neutro, mas quase nunca é. Cada troca muda o tipo de posição, e quem está melhor deve escolher o tipo de posição que favorece a própria vantagem."
  },
  {
    "type": "paragraph",
    "text": "A regra mais útil para iniciantes: com material a mais, troque peças; com material a menos, evite trocas e mantenha as peças no tabuleiro. Menos peças deixam a vantagem material mais fácil de converter."
  },
  {
    "type": "exercise",
    "id": "trocas-damas",
    "prompt": "Você tem um peão a mais. Troque as damas.",
    "fen": "6k1/5ppp/8/3q4/8/8/P2Q1PPP/6K1 w - - 0 1",
    "acceptedMoves": [
      "Qxd5"
    ],
    "goal": "move",
    "successText": "Sem as damas, o peão a mais vale muito mais: não há contra-ataque possível e o peão de a2 vira dama no fim."
  },
  {
    "type": "tip",
    "title": "Troque o defensor, não o atacante",
    "text": "Quando você ataca o rei adversário, troque as peças que defendem esse rei e mantenha as suas atacantes. Quando você se defende, faça o contrário: cada peça atacante que sair do tabuleiro alivia a pressão."
  },
  {
    "type": "exercise",
    "id": "trocas-torres",
    "prompt": "Você tem um peão a mais e as torres estão frente a frente. Troque-as e vá para o final de peões.",
    "fen": "3r4/4kppp/8/8/8/8/P4PPP/3R2K1 w - - 0 1",
    "acceptedMoves": [
      "Rxd8"
    ],
    "goal": "move",
    "successText": "Com as torres fora, sobra um final de peões em que o peão de a2 corre sozinho pela ala da dama. É o tipo de final que se ganha sem precisar calcular muito."
  },
  {
    "type": "tip",
    "title": "Antes de trocar, pergunte",
    "text": "Qual das duas peças é melhor, a minha ou a dele? Depois da troca, quem fica com a estrutura melhor? Se você não souber responder, provavelmente não é hora de trocar."
  }
]$json$::jsonb
)
on conflict (lesson_id) do update
  set module_id = excluded.module_id,
      required_scope = excluded.required_scope,
      body = excluded.body,
      updated_at = now();

-- estrategia · planejamento
insert into public.lesson_contents (lesson_id, module_id, required_scope, body)
values (
  'planejamento',
  'estrategia',
  'module:estrategia',
  $json$[
  {
    "type": "paragraph",
    "text": "Plano não é prever dez lances. É escolher um objetivo pequeno e colocar as peças a serviço dele. Sem objetivo, você joga lance a lance e acaba só reagindo ao adversário."
  },
  {
    "type": "paragraph",
    "text": "Para achar o objetivo, faça três perguntas: qual é a minha peça pior colocada, qual é a fraqueza do adversário que não some, e qual coluna ou diagonal está aberta. A resposta a qualquer uma delas já serve de plano."
  },
  {
    "type": "diagram",
    "fen": "r5k1/pp3ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
    "highlights": [
      "d1",
      "d7",
      "d8"
    ],
    "caption": "A coluna d está aberta e só a torre branca a ocupa. O caminho natural é d1, depois d7, a fileira onde moram os peões pretos.",
    "orientation": "w"
  },
  {
    "type": "exercise",
    "id": "plano-coluna-aberta",
    "prompt": "A coluna d está aberta e nenhuma peça a disputa. Ocupe-a com a sua torre.",
    "fen": "r5k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1",
    "acceptedMoves": [
      "Rd1"
    ],
    "goal": "move",
    "successText": "Td1. Coluna aberta é a estrada das torres: é por ela que elas entram na posição adversária."
  },
  {
    "type": "tip",
    "title": "Da coluna para a sétima",
    "text": "Dominar a coluna aberta é meio caminho. O outro meio é entrar na sétima fileira, onde a torre ataca os peões que ainda não se mexeram e prende o rei na última fileira."
  },
  {
    "type": "exercise",
    "id": "plano-setima",
    "prompt": "A torre já domina a coluna aberta. Entre na sétima fileira.",
    "fen": "r5k1/pp3ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
    "acceptedMoves": [
      "Rd7"
    ],
    "goal": "move",
    "successText": "Td7 ataca os peões de b7 e f7 e deixa a torre preta sem nada para fazer. É a casa mais forte que uma torre pode ocupar."
  },
  {
    "type": "tip",
    "title": "Um plano de cada vez",
    "text": "Se você não enxerga nenhum plano, melhore a peça pior colocada e olhe de novo. Isso quase nunca é um lance ruim, e muitas vezes o plano aparece sozinho depois dele."
  }
]$json$::jsonb
)
on conflict (lesson_id) do update
  set module_id = excluded.module_id,
      required_scope = excluded.required_scope,
      body = excluded.body,
      updated_at = now();

-- finais · rei-e-peao
insert into public.lesson_contents (lesson_id, module_id, required_scope, body)
values (
  'rei-e-peao',
  'finais',
  'module:finais',
  $json$[
  {
    "type": "paragraph",
    "text": "Rei e peão contra rei é o final mais importante que existe, porque todos os outros acabam nele. A regra prática é curta: o peão sozinho não promove; quem promove é o rei na frente dele."
  },
  {
    "type": "diagram",
    "fen": "5k2/8/8/5K2/5P2/8/8/8 b - - 0 1",
    "highlights": [
      "f5",
      "f7",
      "f8"
    ],
    "caption": "O rei branco está na frente do peão e os reis estão a duas casas um do outro, na mesma coluna. Quem tem a vez aqui está em desvantagem.",
    "orientation": "w"
  },
  {
    "type": "paragraph",
    "text": "Dois reis na mesma coluna, com uma casa vazia entre eles, é o que se chama de oposição. Quem precisa mover primeiro é obrigado a sair da frente, e por isso perde terreno."
  },
  {
    "type": "exercise",
    "id": "rp-oposicao-unica",
    "prompt": "As pretas jogam. Só um lance segura o empate. Encontre-o.",
    "fen": "5k2/8/8/5K2/5P2/8/8/8 b - - 0 1",
    "acceptedMoves": [
      "Kf7"
    ],
    "goal": "move",
    "successText": "Kf7 mantém o rei na frente do peão e devolve a vez às brancas. Qualquer outro lance larga a coluna f e o peão promove."
  },
  {
    "type": "tip",
    "title": "Como achar o lance na prática",
    "text": "Pergunte sempre: depois do meu lance, o rei adversário consegue ficar duas casas à minha frente na mesma coluna? Se consegue, procure outro lance."
  },
  {
    "type": "exercise",
    "id": "rp-rei-na-frente",
    "prompt": "As brancas jogam e ganham. Faça progresso sem largar a frente do peão.",
    "fen": "8/8/4K3/4P3/5k2/8/8/8 w - - 0 1",
    "acceptedMoves": [
      "Kf6",
      "Kd6",
      "Kd5"
    ],
    "goal": "move",
    "successText": "O rei continua na frente do peão e as pretas não têm como bloquear. Recuar para a sétima fileira jogaria a vitória fora: o peão ficaria sozinho."
  },
  {
    "type": "tip",
    "title": "O resumo que vale a partida",
    "text": "Rei na frente do peão e com a oposição: vitória. Rei adversário na frente do peão, bem colocado: empate. Peão correndo sozinho, com o rei atrás: quase sempre empate."
  }
]$json$::jsonb
)
on conflict (lesson_id) do update
  set module_id = excluded.module_id,
      required_scope = excluded.required_scope,
      body = excluded.body,
      updated_at = now();

-- finais · promocao-no-final
insert into public.lesson_contents (lesson_id, module_id, required_scope, body)
values (
  'promocao-no-final',
  'finais',
  'module:finais',
  $json$[
  {
    "type": "paragraph",
    "text": "No final, um peão longe dos reis decide a partida. Para saber se dá tempo de pegá-lo, existe um truque que dispensa contar lance a lance: o quadrado."
  },
  {
    "type": "paragraph",
    "text": "Desenhe um quadrado que tenha o peão num canto e a casa de promoção no outro. Se o rei adversário está dentro desse quadrado, ou consegue entrar no próprio lance, ele alcança o peão. Se não, o peão promove."
  },
  {
    "type": "diagram",
    "fen": "8/8/8/8/6k1/8/1P6/5K2 b - - 0 1",
    "highlights": [
      "b4",
      "c4",
      "d4",
      "e4",
      "f4",
      "f5",
      "f6",
      "f7",
      "f8",
      "b8"
    ],
    "caption": "O peão de b2 pode dar o passo duplo, então o quadrado conta a partir de b4: de b4 a f4 e daí até f8. O rei preto, em g4, está um passo fora.",
    "orientation": "w"
  },
  {
    "type": "exercise",
    "id": "prom-entrar-quadrado",
    "prompt": "As pretas jogam. Entre no quadrado do peão para alcançá-lo a tempo.",
    "fen": "8/8/8/8/6k1/8/1P6/5K2 b - - 0 1",
    "acceptedMoves": [
      "Kf5",
      "Kf4",
      "Kf3"
    ],
    "goal": "move",
    "successText": "Entrando na coluna f, o rei acompanha o peão até b8 e o pega. Para o lado errado, o peão chega primeiro."
  },
  {
    "type": "tip",
    "title": "Cuidado com o passo duplo",
    "text": "Se o peão ainda está na casa de origem, conte o quadrado a partir da casa do passo duplo, não da casa onde ele está. Esquecer isso é o erro mais comum nessa conta."
  },
  {
    "type": "exercise",
    "id": "prom-corrida",
    "prompt": "O rei preto está longe demais. Promova o peão.",
    "fen": "8/1P6/8/8/8/7k/8/6K1 w - - 0 1",
    "acceptedMoves": [
      "b8=Q"
    ],
    "goal": "move",
    "successText": "Dama nova no tabuleiro. Com rei e dama contra rei, o mate vem em poucos lances."
  },
  {
    "type": "tip",
    "title": "Promova para dama, quase sempre",
    "text": "Escolher torre ou cavalo só compensa em situações raras, como fugir de um afogamento ou dar um xeque que a dama não daria. Na dúvida, dama."
  }
]$json$::jsonb
)
on conflict (lesson_id) do update
  set module_id = excluded.module_id,
      required_scope = excluded.required_scope,
      body = excluded.body,
      updated_at = now();

-- finais · finais-basicos
insert into public.lesson_contents (lesson_id, module_id, required_scope, body)
values (
  'finais-basicos',
  'finais',
  'module:finais',
  $json$[
  {
    "type": "paragraph",
    "text": "Quando sobram torres e peões, duas regras resolvem a maior parte das posições: o rei vira uma peça de ataque e a torre fica atrás do peão passado, nunca na frente dele."
  },
  {
    "type": "paragraph",
    "text": "A torre atrás do peão ganha força a cada avanço, porque cobre todas as casas que o peão ainda vai percorrer. A torre na frente só atrapalha o próprio peão."
  },
  {
    "type": "diagram",
    "fen": "r5k1/5ppp/8/8/P7/8/5PPK/7R w - - 0 1",
    "highlights": [
      "a1",
      "a4",
      "a8"
    ],
    "caption": "O peão de a4 é passado. A torre preta já está atrás dele, do lado certo. A torre branca, em h1, ainda está longe da ação.",
    "orientation": "w"
  },
  {
    "type": "exercise",
    "id": "fb-torre-atras",
    "prompt": "Coloque a sua torre atrás do peão passado.",
    "fen": "r5k1/5ppp/8/8/P7/8/5PPK/7R w - - 0 1",
    "acceptedMoves": [
      "Ra1"
    ],
    "goal": "move",
    "successText": "Ta1. Agora o peão avança apoiado, e é a torre preta que fica parada segurando a casa a8."
  },
  {
    "type": "tip",
    "title": "O rei também joga",
    "text": "Com poucas peças no tabuleiro, o rei deixa de ser alvo e vira atacante. Se não há nada urgente, leve o rei para o centro antes de qualquer outro plano."
  },
  {
    "type": "exercise",
    "id": "fb-avanca",
    "prompt": "A torre já está atrás do peão. Avance o peão passado.",
    "fen": "r5k1/5pp1/7p/P7/8/8/5PPK/R7 w - - 0 1",
    "acceptedMoves": [
      "a6"
    ],
    "goal": "move",
    "successText": "a6. Cada passo do peão deixa a torre preta mais passiva, porque ela não pode sair de a8."
  },
  {
    "type": "tip",
    "title": "Quando trocar",
    "text": "Com um peão a mais, troque peças e evite trocar peões. Com um peão a menos, faça o contrário: cada peão que sai do tabuleiro aumenta a sua chance de empatar."
  }
]$json$::jsonb
)
on conflict (lesson_id) do update
  set module_id = excluded.module_id,
      required_scope = excluded.required_scope,
      body = excluded.body,
      updated_at = now();

-- finais · mate-com-torre
insert into public.lesson_contents (lesson_id, module_id, required_scope, body)
values (
  'mate-com-torre',
  'finais',
  'module:finais',
  $json$[
  {
    "type": "paragraph",
    "text": "Rei e torre contra rei é um mate que você vai precisar dar muitas vezes. A torre sozinha não consegue: ela corta o tabuleiro, e quem empurra o rei adversário é o seu rei."
  },
  {
    "type": "paragraph",
    "text": "Jogue a sequência abaixo até o fim. Repare que a torre dá um único xeque na partida inteira: o último."
  },
  {
    "type": "guided-line",
    "id": "torre-tecnica",
    "title": "Do corte ao mate, lance a lance",
    "startFen": "5k2/4R3/8/5K2/8/8/8/8 w - - 0 1",
    "orientation": "w",
    "intro": "A torre já cortou o rei preto na oitava fileira. Agora é com o seu rei.",
    "conclusion": "Esse é o padrão: reis frente a frente e a torre entrando pela lateral. Decore o desenho, não os lances.",
    "steps": [
      {
        "move": "Kf6",
        "reply": "Kg8",
        "explanation": "Os reis ficam frente a frente, com uma casa no meio. É essa oposição que tira as casas do rei preto."
      },
      {
        "move": "Rc7",
        "reply": "Kh8",
        "explanation": "Lance de espera. A torre anda pela sétima fileira, continua cortando o rei e devolve a vez às pretas."
      },
      {
        "move": "Kg6",
        "reply": "Kg8",
        "explanation": "O rei acompanha. Agora o rei preto só tem uma casa, e é justamente a que você quer."
      },
      {
        "move": "Rc8#",
        "explanation": "Xeque-mate. A torre entra pela oitava fileira e o rei branco cobre as casas de fuga."
      }
    ]
  },
  {
    "type": "tip",
    "title": "O erro que faz você perder tempo",
    "text": "Dar xeque com a torre sem o rei por perto só empurra o rei adversário para longe e recomeça o trabalho. Dê xeque quando ele for mate ou quando ele diminuir a caixa."
  },
  {
    "type": "exercise",
    "id": "torre-mate-frente",
    "prompt": "Os reis estão frente a frente. Dê xeque-mate em um lance.",
    "fen": "6k1/8/6K1/8/8/8/8/R7 w - - 0 1",
    "acceptedMoves": [
      "Ra8#"
    ],
    "goal": "checkmate",
    "successText": "Ta8 é mate: a torre cobre a oitava fileira e o rei branco cobre f7, g7 e h7."
  },
  {
    "type": "exercise",
    "id": "torre-escada",
    "prompt": "Com duas torres o rei nem precisa ajudar. Termine o mate em escada.",
    "fen": "6k1/R7/8/8/8/8/8/1R4K1 w - - 0 1",
    "acceptedMoves": [
      "Rb8#"
    ],
    "goal": "checkmate",
    "successText": "Uma torre corta a sétima fileira, a outra dá o mate na oitava. É a escada: cada torre cuida de uma fileira."
  }
]$json$::jsonb
)
on conflict (lesson_id) do update
  set module_id = excluded.module_id,
      required_scope = excluded.required_scope,
      body = excluded.body,
      updated_at = now();

-- finais · mate-com-dama
insert into public.lesson_contents (lesson_id, module_id, required_scope, body)
values (
  'mate-com-dama',
  'finais',
  'module:finais',
  $json$[
  {
    "type": "paragraph",
    "text": "Com rei e dama contra rei o mate é rápido, mas tem uma armadilha: afogar o rei adversário e empatar uma partida ganha. A dama faz a caixa, e o mate só vem com o apoio do rei."
  },
  {
    "type": "paragraph",
    "text": "Na sequência abaixo a dama não se mexe até o último lance. Ela já prendeu o rei preto na coluna h; o que falta é o rei branco chegar."
  },
  {
    "type": "guided-line",
    "id": "dama-tecnica",
    "title": "A dama prende, o rei chega, lance a lance",
    "startFen": "7k/8/8/8/8/8/2K5/6Q1 w - - 0 1",
    "orientation": "w",
    "intro": "A dama em g1 já tira a coluna g do rei preto. Traga o seu rei.",
    "conclusion": "Cinco lances, e a dama só se mexeu para dar mate. O método é esse: caixa primeiro, rei depois.",
    "steps": [
      {
        "move": "Kd3",
        "reply": "Kh7",
        "explanation": "O rei começa a caminhada. A dama segura a coluna g sozinha e o rei preto anda entre h7 e h8."
      },
      {
        "move": "Ke4",
        "reply": "Kh8",
        "explanation": "Mais um passo. Não tenha pressa de dar xeque: aqui o xeque só empurraria o rei preto de volta para o meio."
      },
      {
        "move": "Kf5",
        "reply": "Kh7",
        "explanation": "O rei branco já está perto o bastante para começar a cobrir as casas de fuga."
      },
      {
        "move": "Kf6",
        "reply": "Kh6",
        "explanation": "Agora o rei branco cobre g5, g6 e g7. O rei preto só tem h6 e h8."
      },
      {
        "move": "Qh1#",
        "explanation": "A dama desce a coluna h e dá mate. O rei branco já cobria todas as saídas."
      }
    ]
  },
  {
    "type": "tip",
    "title": "O teste do afogamento",
    "text": "Antes de cada lance da dama, pergunte: depois disso, o rei adversário ainda tem alguma casa? Se não tiver e não for xeque, é afogamento e a partida acaba empatada."
  },
  {
    "type": "exercise",
    "id": "dama-mate-oitava",
    "prompt": "O rei branco já cobre a sétima fileira. Dê xeque-mate em um lance.",
    "fen": "6k1/8/6K1/8/8/8/8/1Q6 w - - 0 1",
    "acceptedMoves": [
      "Qb8#"
    ],
    "goal": "checkmate",
    "successText": "Db8 é mate. O rei branco em g6 cobre f7, g7 e h7, e a dama cobre a oitava fileira."
  },
  {
    "type": "exercise",
    "id": "dama-mate-coluna",
    "prompt": "O rei preto está preso na oitava fileira. Dê xeque-mate em um lance.",
    "fen": "5k2/8/5K2/8/8/8/8/3Q4 w - - 0 1",
    "acceptedMoves": [
      "Qd8#"
    ],
    "goal": "checkmate",
    "successText": "Dd8 é mate. É o mesmo desenho do exercício anterior: rei em frente, dama na fileira do fundo."
  }
]$json$::jsonb
)
on conflict (lesson_id) do update
  set module_id = excluded.module_id,
      required_scope = excluded.required_scope,
      body = excluded.body,
      updated_at = now();

-- finais · mate-qualquer-defesa
insert into public.lesson_contents (lesson_id, module_id, required_scope, body)
values (
  'mate-qualquer-defesa',
  'finais',
  'module:finais',
  $json$[
  {
    "type": "paragraph",
    "text": "Nas aulas anteriores você jogou o mate contra uma defesa só. Numa partida de verdade o adversário escolhe para onde fugir, e cada fuga pede uma resposta diferente. É isso que você treina aqui."
  },
  {
    "type": "paragraph",
    "text": "As três partidas abaixo têm todas as defesas previstas, sem exceção. O adversário sorteia uma tentativa a cada vez, e a aula só fica completa quando você vencer todas."
  },
  {
    "type": "guided-game",
    "id": "mate-dama-defesas",
    "title": "Dama e rei: mate em três, contra qualquer fuga",
    "startFen": "5k2/8/8/4K3/8/8/8/1Q6 w - - 0 1",
    "orientation": "w",
    "exhaustive": true,
    "intro": "Você joga com as brancas. Comece aproximando o rei: a dama sozinha não dá mate.",
    "conclusion": "As três fugas do rei preto levam a mates diferentes. Repare que o lance que muda é sempre o da dama, nunca o do rei.",
    "variations": [
      {
        "label": "O rei corre para o canto",
        "ending": "Dg7 é mate porque o rei de f6 defende a dama e cobre as casas vizinhas.",
        "moves": [
          {
            "san": "Kf6",
            "note": "O rei vem primeiro. Dar xeque agora só empurraria o rei preto para longe."
          },
          {
            "san": "Kg8",
            "note": "ele corre para a direita"
          },
          {
            "san": "Qg6+",
            "note": "Agora sim, o xeque: a dama entra apoiada pelo rei e tira a fileira do adversário."
          },
          {
            "san": "Kh8",
            "note": "ele se enfia no canto"
          },
          {
            "san": "Qg7#"
          }
        ]
      },
      {
        "label": "O rei volta pela direita",
        "ending": "Df7 é mate pelo mesmo motivo: dama colada no rei adversário, defendida pelo seu rei.",
        "moves": [
          {
            "san": "Kf6"
          },
          {
            "san": "Kg8"
          },
          {
            "san": "Qg6+"
          },
          {
            "san": "Kf8",
            "note": "ele tenta voltar"
          },
          {
            "san": "Qf7#"
          }
        ]
      },
      {
        "label": "O rei foge pela esquerda",
        "ending": "Dd8 é mate: a dama cobre a oitava fileira inteira e o rei de f6 tira as casas de fuga.",
        "moves": [
          {
            "san": "Kf6"
          },
          {
            "san": "Ke8",
            "note": "ele foge para o outro lado"
          },
          {
            "san": "Qd3",
            "note": "Sem xeque. A dama fecha a coluna d e deixa o rei preto com uma casa só."
          },
          {
            "san": "Kf8",
            "note": "o único lance que sobrou"
          },
          {
            "san": "Qd8#"
          }
        ]
      }
    ]
  },
  {
    "type": "tip",
    "title": "Por que nem todo lance é xeque",
    "text": "Na terceira defesa o lance certo é um lance quieto, sem xeque. Dar xeque por dar xeque é o erro mais comum nesses finais: o rei adversário ganha casas e você recomeça do zero."
  },
  {
    "type": "guided-game",
    "id": "mate-escada-defesas",
    "title": "Duas torres: a escada, contra qualquer fuga",
    "startFen": "4k3/8/8/8/8/8/R7/1R5K w - - 0 1",
    "orientation": "w",
    "exhaustive": true,
    "intro": "Com duas torres o seu rei nem precisa ajudar. Uma torre corta uma fileira, a outra dá o mate.",
    "conclusion": "Nas duas fugas o mate é o mesmo lance. Com a escada não importa para onde o rei vai: ele não escapa da fileira.",
    "variations": [
      {
        "label": "O rei vai para a direita",
        "ending": "A torre de a7 corta a sétima fileira e a de b8 dá o mate na oitava.",
        "moves": [
          {
            "san": "Ra7",
            "note": "A primeira torre corta a sétima fileira. O rei preto fica preso na oitava."
          },
          {
            "san": "Kf8",
            "note": "ele anda para a direita"
          },
          {
            "san": "Rb8#"
          }
        ]
      },
      {
        "label": "O rei vai para a esquerda",
        "ending": "Mesmo lance, mesmo mate. A fileira inteira estava fechada.",
        "moves": [
          {
            "san": "Ra7"
          },
          {
            "san": "Kd8",
            "note": "ele anda para a esquerda"
          },
          {
            "san": "Rb8#"
          }
        ]
      }
    ]
  },
  {
    "type": "tip",
    "title": "O que fazer quando o rei está no meio do tabuleiro",
    "text": "Com duas torres, repita a escada: corte uma fileira, espere o rei andar, corte a próxima. Com dama e rei, aproxime o rei até ele cobrir as casas vizinhas e só então dê o xeque."
  },
  {
    "type": "guided-game",
    "id": "mate-torre-sozinha-defesas",
    "title": "Uma torre sozinha: oposição direta, contra qualquer fuga",
    "startFen": "4k3/8/8/4K3/8/8/8/R7 w - - 0 1",
    "orientation": "w",
    "exhaustive": true,
    "intro": "Com uma torre só, o rei faz quase todo o trabalho. Tome a oposição direta: o rei preto vai ter que escolher um lado.",
    "conclusion": "As duas fugas pedem o mesmo plano, espelhado: a torre corta a coluna do lado em que o rei NÃO foi, o rei preto fica só com uma casa, e a torre entra na oitava fileira para o mate.",
    "variations": [
      {
        "label": "O rei vai para f8",
        "ending": "Tg8 é mate: a torre cobre a oitava fileira inteira e o rei branco, em e6, cobre e7, e8 e f7.",
        "moves": [
          {
            "san": "Ke6",
            "note": "Tome a oposição direta (reis na mesma coluna, com uma casa entre eles). É isso que obriga o rei preto a escolher um lado."
          },
          {
            "san": "Kf8",
            "note": "ele vai para a direita"
          },
          {
            "san": "Rg1",
            "note": "A torre corta a coluna g, do lado para onde ele NÃO foi. Agora o rei preto só tem e8."
          },
          {
            "san": "Ke8",
            "note": "o único lance que sobrou"
          },
          {
            "san": "Rg8#"
          }
        ]
      },
      {
        "label": "O rei vai para d8",
        "ending": "Tc8 é mate, pelo mesmo motivo espelhado: a torre cobre a oitava fileira e o rei branco cobre e7, e8 e d7.",
        "moves": [
          {
            "san": "Ke6"
          },
          {
            "san": "Kd8",
            "note": "ele vai para a esquerda"
          },
          {
            "san": "Rc1",
            "note": "A torre corta a coluna c, do lado oposto ao rei."
          },
          {
            "san": "Ke8",
            "note": "o único lance que sobrou"
          },
          {
            "san": "Rc8#"
          }
        ]
      }
    ]
  },
  {
    "type": "tip",
    "title": "Uma torre é mais lenta, não mais fraca",
    "text": "Sem a segunda torre, o seu rei precisa entrar no jogo e tomar a oposição antes de cortar a coluna. É um lance a mais em cada etapa, mas o resultado é o mesmo: o rei adversário acaba preso numa única casa."
  }
]$json$::jsonb
)
on conflict (lesson_id) do update
  set module_id = excluded.module_id,
      required_scope = excluded.required_scope,
      body = excluded.body,
      updated_at = now();

-- taticas · ataque-duplo
insert into public.lesson_contents (lesson_id, module_id, required_scope, body)
values (
  'ataque-duplo',
  'taticas',
  'module:taticas',
  $json$[
  {
    "type": "paragraph",
    "text": "Ataque duplo é um lance só com duas ameaças. O adversário resolve uma e perde a outra. Não precisa ser cavalo: dama, torre, bispo e peão fazem a mesma coisa."
  },
  {
    "type": "paragraph",
    "text": "O jeito de achar é sempre o mesmo. Primeiro, liste as peças adversárias que estão sem defesa. Depois, procure uma casa de onde a sua peça alcance duas delas ao mesmo tempo."
  },
  {
    "type": "exercise",
    "id": "duplo-duas-soltas",
    "prompt": "Duas peças pretas estão sem defesa. Ataque as duas com um lance só.",
    "fen": "7k/r4p2/p4np1/8/8/3Q4/1P1P2PK/8 w - - 0 1",
    "acceptedMoves": [
      "Qd4"
    ],
    "goal": "move",
    "successText": "Dd4 mira a torre de a7 por uma diagonal e o cavalo de f6 pela outra. As pretas salvam uma peça e perdem a outra."
  },
  {
    "type": "tip",
    "title": "O xeque é a ameaça mais forte",
    "text": "Quando uma das duas ameaças é xeque, o adversário não tem escolha: ele precisa atender ao xeque e não tem tempo de salvar a outra peça. Por isso vale sempre olhar os xeques primeiro."
  },
  {
    "type": "exercise",
    "id": "duplo-com-xeque",
    "prompt": "Dê um xeque que também ataque uma peça preta sem defesa.",
    "fen": "8/2rp3k/n1pp4/8/8/P3P3/4P3/3Q3K w - - 0 1",
    "acceptedMoves": [
      "Qd3+"
    ],
    "goal": "move",
    "successText": "Dd3 dá xeque pela diagonal que termina em h7 e, pela outra diagonal, alcança o cavalo de a6. O rei sai do xeque e o cavalo cai."
  },
  {
    "type": "tip",
    "title": "Do outro lado",
    "text": "A mesma conta vale para você. Antes de mover, pergunte quais das suas peças estão sem defesa. Duas peças soltas no tabuleiro são um convite para um ataque duplo."
  }
]$json$::jsonb
)
on conflict (lesson_id) do update
  set module_id = excluded.module_id,
      required_scope = excluded.required_scope,
      body = excluded.body,
      updated_at = now();

-- taticas · pecas-indefesas
insert into public.lesson_contents (lesson_id, module_id, required_scope, body)
values (
  'pecas-indefesas',
  'taticas',
  'module:taticas',
  $json$[
  {
    "type": "paragraph",
    "text": "Peça indefesa é a peça que ninguém está protegendo. Ela não cai sozinha, mas é o alvo de quase toda tática: sem defensor, basta um ataque para ela ser perdida."
  },
  {
    "type": "paragraph",
    "text": "Antes de qualquer lance, faça uma varredura rápida: quais peças pretas estão sem defesa? E quais das minhas estão? Essa pergunta custa cinco segundos e evita a maior parte dos erros."
  },
  {
    "type": "exercise",
    "id": "indefesa-captura",
    "prompt": "Uma peça preta está sem nenhuma defesa. Capture-a.",
    "fen": "n5k1/6p1/p2p4/3b4/8/PQ6/PP6/1K6 w - - 0 1",
    "acceptedMoves": [
      "Qxd5+"
    ],
    "goal": "move",
    "successText": "Dxd5 leva o bispo de graça e ainda com xeque. Nada defendia d5: o cavalo de a8 está longe e os peões não alcançam."
  },
  {
    "type": "tip",
    "title": "Conte antes de capturar",
    "text": "Capturar só vale a pena quando você ataca mais vezes do que o adversário defende. Conte os atacantes, conte os defensores e compare os valores. Se a conta empatar, a captura costuma ser ruim."
  },
  {
    "type": "exercise",
    "id": "indefesa-duas",
    "prompt": "O bispo de e7 e o cavalo de e4 estão sem defesa, e os dois na mesma coluna. Ataque os dois.",
    "fen": "8/3pb2k/2p4p/6R1/4n3/6P1/P3P1K1/8 w - - 0 1",
    "acceptedMoves": [
      "Re5"
    ],
    "goal": "move",
    "successText": "Te5 encaixa a torre entre as duas peças, atacando uma para cima e outra para baixo. As pretas só conseguem salvar uma."
  },
  {
    "type": "tip",
    "title": "Peça defendida também cai",
    "text": "Uma peça pode ter defensor e mesmo assim estar perdida, se o defensor estiver cravado, sobrecarregado ou se você atacar mais vezes do que ele defende. Mas comece pelas que não têm defensor nenhum: são as mais fáceis."
  }
]$json$::jsonb
)
on conflict (lesson_id) do update
  set module_id = excluded.module_id,
      required_scope = excluded.required_scope,
      body = excluded.body,
      updated_at = now();

-- taticas · descoberta
insert into public.lesson_contents (lesson_id, module_id, required_scope, body)
values (
  'descoberta',
  'taticas',
  'module:taticas',
  $json$[
  {
    "type": "paragraph",
    "text": "No ataque descoberto, quem ataca não é a peça que se move. Uma peça sua está na frente de outra; quando ela sai do caminho, a de trás passa a atacar. E a peça que saiu ainda faz uma segunda ameaça."
  },
  {
    "type": "diagram",
    "fen": "6k1/2q3pp/8/3N4/8/1B6/5PPP/6K1 w - - 0 1",
    "highlights": [
      "b3",
      "d5",
      "g8"
    ],
    "caption": "O bispo de b3 aponta para o rei preto, mas o próprio cavalo de d5 está no caminho. Qualquer lance do cavalo abre essa diagonal.",
    "orientation": "w"
  },
  {
    "type": "paragraph",
    "text": "Procure esse desenho no seu tabuleiro: duas peças suas na mesma linha, com uma peça adversária importante no fim dela. A peça da frente fica livre para atacar o que quiser."
  },
  {
    "type": "exercise",
    "id": "descoberta-xeque",
    "prompt": "Abra a diagonal do bispo e capture alguma coisa no mesmo lance.",
    "fen": "6k1/2q3pp/8/3N4/8/1B6/5PPP/6K1 w - - 0 1",
    "acceptedMoves": [
      "Nxc7+"
    ],
    "goal": "move",
    "successText": "Cxc7 come a dama e, ao sair de d5, descobre o xeque do bispo. As pretas precisam atender ao xeque e não têm como recuperar a dama."
  },
  {
    "type": "tip",
    "title": "Por que o xeque é tão forte aqui",
    "text": "Quando a descoberta vem com xeque, o adversário é obrigado a cuidar do rei. Ele não tem o lance livre que precisaria para recapturar a peça que você acabou de levar."
  },
  {
    "type": "exercise",
    "id": "descoberta-dama",
    "prompt": "A torre de e1, o seu cavalo e a dama preta estão na mesma coluna. Ganhe uma peça.",
    "fen": "6k1/4qppp/2b5/4N3/8/8/5PPP/4RK2 w - - 0 1",
    "acceptedMoves": [
      "Nxc6"
    ],
    "goal": "move",
    "successText": "Cxc6 leva o bispo e abre a coluna e, onde a torre passa a atacar a dama. Capturar a torre com Dxe1 não serve às pretas, porque o rei de f1 defende a casa."
  },
  {
    "type": "tip",
    "title": "Olhe para as suas peças empilhadas",
    "text": "Sempre que duas peças suas ficarem na mesma coluna, fileira ou diagonal, pergunte o que existe no fim dessa linha. É assim que a descoberta aparece numa partida de verdade."
  }
]$json$::jsonb
)
on conflict (lesson_id) do update
  set module_id = excluded.module_id,
      required_scope = excluded.required_scope,
      body = excluded.body,
      updated_at = now();

-- taticas · mate-em-um
insert into public.lesson_contents (lesson_id, module_id, required_scope, body)
values (
  'mate-em-um',
  'taticas',
  'module:taticas',
  $json$[
  {
    "type": "paragraph",
    "text": "Mate em um não se calcula, se reconhece. Depois de ver o mesmo desenho algumas dezenas de vezes, ele aparece sozinho. Esta aula é só treino: três posições, três padrões diferentes."
  },
  {
    "type": "paragraph",
    "text": "Em todas elas, use a mesma rotina: olhe onde o rei adversário pode ir, veja quais dessas casas já estão cobertas e procure o lance que fecha a última."
  },
  {
    "type": "exercise",
    "id": "mate1-coluna-h",
    "prompt": "O rei preto está no canto. Dê xeque-mate em um lance.",
    "fen": "8/p3p2k/p7/6Q1/8/3R4/P7/7K w - - 0 1",
    "acceptedMoves": [
      "Rh3#"
    ],
    "goal": "checkmate",
    "successText": "Th3 dá xeque pela coluna h. A dama de g5 já cobria g6, g7 e h6, então o rei não tem para onde ir."
  },
  {
    "type": "exercise",
    "id": "mate1-dama-apoiada",
    "prompt": "A torre de g2 cobre a coluna g. Dê xeque-mate em um lance.",
    "fen": "7k/2pp4/3p4/5Q2/8/7P/6R1/6K1 w - - 0 1",
    "acceptedMoves": [
      "Qh5#"
    ],
    "goal": "checkmate",
    "successText": "Dh5 ataca o rei pela coluna h, e a torre de g2 tira as casas g7 e g8. Rei no canto com a coluna vizinha fechada é mate."
  },
  {
    "type": "tip",
    "title": "O mate do corredor",
    "text": "O padrão mais comum de todos: o rei fica preso atrás dos próprios peões e uma torre ou dama entra pela última fileira. Se o seu rei tem os três peões intactos na frente, abra uma casa de fuga quando sobrar tempo."
  },
  {
    "type": "exercise",
    "id": "mate1-corredor",
    "prompt": "O rei preto não tem casa de fuga na oitava fileira. Dê xeque-mate em um lance.",
    "fen": "7k/1p5p/5p2/2R5/8/8/P7/6QK w - - 0 1",
    "acceptedMoves": [
      "Rc8#"
    ],
    "goal": "checkmate",
    "successText": "Tc8 entra na oitava fileira. Os peões de b7 e h7 são os próprios carcereiros do rei preto."
  },
  {
    "type": "tip",
    "title": "Treine na ordem certa",
    "text": "Numa partida, olhe sempre nesta ordem: xeques, capturas e ameaças. A maioria dos mates em um aparece logo no primeiro item dessa lista."
  }
]$json$::jsonb
)
on conflict (lesson_id) do update
  set module_id = excluded.module_id,
      required_scope = excluded.required_scope,
      body = excluded.body,
      updated_at = now();

-- <<< fim das aulas premium geradas
