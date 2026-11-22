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
    "text": "A Italiana começa com três lances que qualquer iniciante entende: peão ao centro, cavalo para fora, bispo na diagonal que aponta para f7. Nesta aula você não vai ler a abertura, vai jogá-la."
  },
  {
    "type": "paragraph",
    "text": "Repita a sequência abaixo até ela sair sem pensar. Cada lance só é aceito se for o certo; quando errar, o tabuleiro volta e você tenta de novo."
  },
  {
    "type": "guided-line",
    "id": "italiana-linha",
    "title": "A linha principal, lance a lance",
    "orientation": "w",
    "intro": "Você joga com as brancas. As pretas respondem sozinhas.",
    "conclusion": "Essa é a posição que você quer alcançar: peças fora, rei seguro, torre na coluna e.",
    "steps": [
      {
        "move": "e4",
        "reply": "e5",
        "explanation": "Peão ao centro. Ele abre a saída da dama e do bispo de f1 no mesmo lance."
      },
      {
        "move": "Nf3",
        "reply": "Nc6",
        "explanation": "O cavalo sai atacando e5. As pretas defendem com outra peça, não com um peão."
      },
      {
        "move": "Bc4",
        "reply": "Bc5",
        "explanation": "Este é o lance que dá nome à abertura. O bispo escolhe a diagonal que termina em f7."
      },
      {
        "move": "c3",
        "reply": "Nf6",
        "explanation": "Um lance discreto: prepara d4 e tira a casa d4 do cavalo preto."
      },
      {
        "move": "d3",
        "reply": "d6",
        "explanation": "Segura e4 com um peão e libera o bispo de c1. Sem pressa de abrir o centro."
      },
      {
        "move": "O-O",
        "reply": "O-O",
        "explanation": "Rei no canto antes de qualquer plano de ataque. Os dois lados fazem a mesma coisa."
      },
      {
        "move": "Re1",
        "reply": "a6",
        "explanation": "A torre ocupa a coluna onde o jogo vai abrir. O desenvolvimento acabou; agora começa o plano."
      }
    ]
  },
  {
    "type": "tip",
    "title": "O plano depois do roque",
    "text": "O cavalo de b1 não cabe em c3, porque o peão está lá. O caminho dele é d2, f1 e g3, mirando f5. Enquanto isso, prepare d4 no momento em que as peças pretas estiverem mal colocadas."
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
    "text": "Quando você joga de pretas, f7 é o seu ponto fraco. Antes de cada lance, conte quantas peças brancas miram f7 e quantas suas defendem. Se a conta virar a favor delas, resolva isso antes de continuar o desenvolvimento."
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
    "text": "Contra 1.e4, a Siciliana responde pelo lado: 1...c5. As pretas não ocupam o centro, elas vigiam d4 e esperam o momento de trocar o peão de c por um peão central das brancas."
  },
  {
    "type": "paragraph",
    "text": "Jogue a linha abaixo com as pretas. Repare que, do quarto lance em diante, você tem dois peões no centro e as brancas só um."
  },
  {
    "type": "guided-line",
    "id": "siciliana-linha",
    "title": "A Siciliana aberta, lance a lance",
    "startFen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    "orientation": "b",
    "intro": "As brancas abriram com 1.e4. Você joga com as pretas.",
    "conclusion": "Essa é a estrutura típica: dois peões centrais pretos, coluna c semiaberta e a casa d5 como centro da disputa.",
    "steps": [
      {
        "move": "c5",
        "reply": "Nf3",
        "explanation": "O peão de c vigia d4 sem bloquear nenhuma peça preta."
      },
      {
        "move": "d6",
        "reply": "d4",
        "explanation": "Controla e5 e abre o bispo de c8. As brancas abrem o centro na hora que escolheram."
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
        "explanation": "Tira b5 das peças brancas e prepara ...b5 mais tarde. É o lance da Najdorf."
      },
      {
        "move": "e5",
        "reply": "Nb3",
        "explanation": "Ganha espaço e expulsa o cavalo. O preço é a casa d5, que fica sem defesa de peão."
      },
      {
        "move": "Be7",
        "reply": "O-O",
        "explanation": "Hora de terminar o desenvolvimento e rocar. Na Siciliana não sobra tempo para lances de peão extras."
      }
    ]
  },
  {
    "type": "tip",
    "title": "A casa d5 decide",
    "text": "Depois de ...e5, a luta gira em torno de d5. As brancas querem instalar uma peça ali; você quer trocar essa peça ou empurrar ...d5 de uma vez. Olhe para essa casa antes de escolher qualquer plano."
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
    "successText": "O cavalo sai e a dama precisa fugir. Você desenvolveu de graça: é por isso que as brancas recapturam com o cavalo."
  },
  {
    "type": "tip",
    "title": "O preço da Siciliana",
    "text": "Você gasta lances com peões (c5, d6, a6) enquanto as brancas colocam peças em jogo. Por isso, depois de ...a6, pare de mexer peões sem necessidade: desenvolva e roque."
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
    "text": "Na Francesa, as pretas preparam ...d5 com 1...e6. O peão de d5 chega apoiado, e não solto. O preço é o bispo de c8, que fica preso atrás do próprio peão de e6."
  },
  {
    "type": "paragraph",
    "text": "Jogue a Variante do Avanço com as pretas. O centro trava e os dois lados atacam a base da cadeia de peões do adversário."
  },
  {
    "type": "guided-line",
    "id": "francesa-linha",
    "title": "A Variante do Avanço, lance a lance",
    "startFen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    "orientation": "b",
    "intro": "As brancas abriram com 1.e4. Você joga com as pretas.",
    "conclusion": "Centro travado, peças pretas apontando para d4. Agora o plano é somar atacantes nessa casa.",
    "steps": [
      {
        "move": "e6",
        "reply": "d4",
        "explanation": "Prepara ...d5 com apoio. As brancas montam o centro completo."
      },
      {
        "move": "d5",
        "reply": "e5",
        "explanation": "O peão chega protegido. As brancas fecham o centro em vez de trocar."
      },
      {
        "move": "c5",
        "reply": "c3",
        "explanation": "A base da cadeia branca é d4. Ataque sempre a base, nunca a ponta."
      },
      {
        "move": "Nc6",
        "reply": "Nf3",
        "explanation": "Mais um atacante em d4. Conte os atacantes e os defensores dessa casa a cada lance."
      },
      {
        "move": "Qb6",
        "reply": "Be2",
        "explanation": "A dama entra na pressão sobre d4 e de quebra vigia b2."
      },
      {
        "move": "Bd7",
        "reply": "O-O",
        "explanation": "O bispo ruim sai pela porta dos fundos e a torre de a8 ganha caminho."
      }
    ]
  },
  {
    "type": "tip",
    "title": "O bispo de c8 é o seu problema",
    "text": "Em quase toda Francesa, esse bispo é a peça pior colocada do tabuleiro. Antes de atacar, decida o que fazer com ele: ...Bd7-b5 para trocar, ...b6 e ...Ba6, ou deixá-lo em d7 apoiando o resto."
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
  },
  {
    "type": "tip",
    "title": "Dos dois lados",
    "text": "Com as brancas, a regra se inverte: a sua cadeia é d4-e5 e a base preta é e6. Por isso as brancas atacam com f4-f5, nunca empurrando e5-e6 cedo demais."
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
    "text": "A Espanhola ataca o defensor: o bispo vai a b5 e encosta no cavalo de c6, que é quem segura o peão de e5. A ameaça é indireta e demora a aparecer, por isso a abertura é lenta e dura muitos lances."
  },
  {
    "type": "paragraph",
    "text": "Jogue a linha fechada com as brancas. Oito lances de cada lado, todos com um motivo simples."
  },
  {
    "type": "guided-line",
    "id": "espanhola-linha",
    "title": "A Espanhola fechada, lance a lance",
    "orientation": "w",
    "intro": "Você joga com as brancas.",
    "conclusion": "Rei seguro, torre em e1, bispo guardado em b3 e o centro ainda fechado. É daqui que a Espanhola começa de verdade.",
    "steps": [
      {
        "move": "e4",
        "reply": "e5",
        "explanation": "Centro ocupado dos dois lados."
      },
      {
        "move": "Nf3",
        "reply": "Nc6",
        "explanation": "O cavalo ataca e5, as pretas defendem com o cavalo de c6."
      },
      {
        "move": "Bb5",
        "reply": "a6",
        "explanation": "O bispo encosta no defensor de e5. As pretas perguntam logo o que ele pretende."
      },
      {
        "move": "Ba4",
        "reply": "Nf6",
        "explanation": "O bispo mantém a diagonal. Trocar em c6 daria às pretas o par de bispos."
      },
      {
        "move": "O-O",
        "reply": "Be7",
        "explanation": "Rei seguro antes de qualquer coisa. O peão de e4 fica solto por um instante, e isso é de propósito."
      },
      {
        "move": "Re1",
        "reply": "b5",
        "explanation": "Agora e4 está defendido. As pretas ganham espaço e enxotam o bispo."
      },
      {
        "move": "Bb3",
        "reply": "d6",
        "explanation": "O bispo se instala na diagonal que termina em f7 e fica fora do alcance dos peões pretos."
      },
      {
        "move": "c3",
        "reply": "O-O",
        "explanation": "Prepara d4 e abre a casa c2 para o bispo recuar se ...Na5 vier."
      }
    ]
  },
  {
    "type": "tip",
    "title": "Por que 4.Bxc6 não ganha o peão",
    "text": "Depois de 4.Bxc6 dxc6 5.Nxe5, as pretas têm 5...Dd4, atacando cavalo e peão, ou 5...De7, cravando o cavalo. O peão volta e as pretas ficam com os dois bispos. É o exercício abaixo."
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
    "successText": "Dois lances servem: 5...Dd4 ataca o cavalo e o peão de e4 ao mesmo tempo; 5...De7 crava o cavalo na coluna e. Nos dois casos o peão volta e as pretas ficam com o par de bispos."
  },
  {
    "type": "tip",
    "title": "Paciência",
    "text": "A Espanhola quase nunca é decidida nos dez primeiros lances. Se você não vê um golpe, melhore a peça pior colocada e espere. Quem tenta forçar cedo demais costuma abrir o próprio rei."
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
    "text": "O Gambito da Dama oferece o peão de c4 para tirar o peão de d5 do centro. Não é um sacrifício de verdade: as brancas recuperam o peão quando quiserem, porque as pretas não conseguem segurá-lo."
  },
  {
    "type": "paragraph",
    "text": "Jogue a Defesa Recusada com as brancas, a resposta mais sólida das pretas e a mais comum em qualquer nível."
  },
  {
    "type": "guided-line",
    "id": "gambito-linha",
    "title": "O Gambito da Dama Recusado, lance a lance",
    "orientation": "w",
    "intro": "Você joga com as brancas.",
    "conclusion": "Peças desenvolvidas, pressão em d5 e um centro estável. As pretas ainda precisam resolver o bispo de c8.",
    "steps": [
      {
        "move": "d4",
        "reply": "d5",
        "explanation": "Centro ocupado pelos dois lados, agora na coluna d."
      },
      {
        "move": "c4",
        "reply": "e6",
        "explanation": "O gambito. As pretas recusam e defendem d5 com um peão, aceitando prender o bispo de c8."
      },
      {
        "move": "Nc3",
        "reply": "Nf6",
        "explanation": "Mais um atacante em d5. Nessa abertura, quase tudo gira em torno dessa casa."
      },
      {
        "move": "Bg5",
        "reply": "Be7",
        "explanation": "O bispo crava o cavalo de f6, que é um dos defensores de d5. As pretas desfazem a cravada."
      },
      {
        "move": "e3",
        "reply": "O-O",
        "explanation": "Lance modesto e necessário: abre o bispo de f1 sem soltar d4."
      },
      {
        "move": "Nf3",
        "reply": "Nbd7",
        "explanation": "Desenvolvimento completo de um lado; do outro, o cavalo vai a d7 para não atrapalhar o peão de c7."
      }
    ]
  },
  {
    "type": "tip",
    "title": "Por que não dá para segurar o peão",
    "text": "Depois de 1.d4 d5 2.c4 dxc4, tentar manter o peão com ...b5 abre o lado da dama. As brancas jogam a4 e a estrutura preta desmonta. Aceite o peão, devolva-o e desenvolva."
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
    "successText": "O bispo recupera o peão e já fica numa boa diagonal. Terminar o desenvolvimento primeiro (Cf3, Cc3) também serve, porque o peão de c4 não tem como ser defendido."
  }
]$json$::jsonb
)
on conflict (lesson_id) do update
  set module_id = excluded.module_id,
      required_scope = excluded.required_scope,
      body = excluded.body,
      updated_at = now();

-- <<< fim das aulas premium geradas
