# Chessora

Plataforma de xadrez para aprender, praticar e jogar: partidas contra o Stockfish ou entre duas pessoas, aulas com
tabuleiro interativo, desafios com correção na hora e acompanhamento de progresso. A arquitetura já está preparada
para vender um e-book que libera os módulos premium depois da confirmação do pagamento.

## Como executar

Requisitos: Node.js 20 ou mais recente.

```bash
npm install          # instala dependências e copia o Stockfish para public/engine
npm run dev          # http://localhost:5173
npm test             # testes de regras, conteúdo e controle de acesso
npm run build        # verificação de TypeScript + build de produção em dist/
npm run preview      # serve o build
```

Sem nenhuma configuração, o site funciona com: partidas (computador e local), módulo Fundamentos, desafios gratuitos,
progresso salvo no navegador e preferências. Login, conteúdo premium e área administrativa dependem do Supabase.

O build em `dist/` é estático e roda em qualquer hospedagem. Como é uma SPA, configure o servidor para responder
`index.html` em rotas desconhecidas (no Netlify, `_redirects` com `/* /index.html 200`; na Vercel, um rewrite equivalente).

## Tecnologias

| Item | Uso |
| --- | --- |
| React 19 + TypeScript 5.9 + Vite 7 | Interface e build |
| React Router 7 | Rotas, com carregamento sob demanda por página |
| chess.js 1.4 | Todas as regras: lances legais, xeque, mate, afogamento, roque, en passant, promoção, repetição, 50 lances |
| Stockfish 19 (pacote `stockfish`, versão lite single-thread, WASM) | Motor do modo contra o computador, num Web Worker |
| Supabase (`@supabase/supabase-js` 2) | Autenticação, banco e RLS |
| lucide-react | Ícones |
| Manrope e Newsreader (fontsource) | Tipografia, servida pelo próprio site |
| Vitest | Testes |

## Estrutura

```
scripts/copy-stockfish.mjs      copia o motor para public/engine no npm install
supabase/
  migrations/…_initial_schema.sql   tabelas, RLS, funções de acesso, pagamento e admin
  seed.sql                          produto do e-book e conteúdo premium de demonstração
  functions/checkout-webhook/       webhook de pagamento (não publicado)
src/
  App.tsx                rotas
  config/                variáveis de ambiente e configuração do e-book (escopos, textos)
  types/domain.ts        modelos: User, UserProfile, Course, Module, Lesson, Challenge, ChessGame,
                         GameMove, EbookProduct, UserEntitlement, UserProgress, PaymentEvent
  data/                  catálogo do curso e desafios gratuitos (+ testes que validam cada posição)
  services/              Supabase, autenticação, repositório de conteúdo, progresso, checkout, admin
  features/
    chess/               tabuleiro, peças (SVG próprio), regras, motor, sessão de jogo, contrato online
    challenges/          validação de respostas e tabuleiro de exercício
    learning/            renderização das aulas
    premium/             serviço central de permissões e painel de conteúdo bloqueado
    authentication/      provedor de sessão e proteção de rotas
    progress/            provedor e estatísticas de progresso
  components/ui/         botões, formulários, modal, toast, badges, estados de carregamento/erro/vazio
  layouts/               layout do site e layout separado da administração
  pages/                 páginas (inclui admin/ e auth/)
  styles/                tokens do sistema visual e estilos das páginas
```

## Páginas

Início, Jogar, Aprender, Módulo, Aula, Desafios, Desafio, E-book, Retorno do pagamento, Meu Progresso, Entrar,
Criar conta, Recuperar senha, Nova senha, Perfil, Configurações, Administração (visão geral, conteúdo, usuários,
e-book), Acesso não autorizado, Página não encontrada (inclusive módulo, aula e desafio inexistentes) e página de erro.

## Variáveis de ambiente

Copie `.env.example` para `.env.local`. Todas as variáveis `VITE_` vão para o navegador.

| Variável | Para quê |
| --- | --- |
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave pública (anon). Nunca use a service_role aqui |
| `VITE_CHECKOUT_URL` | Link de pagamento do e-book (https). Vazio = "ainda não disponível" |
| `VITE_CHECKOUT_REF_PARAM` | Parâmetro que leva o ID da conta ao checkout (padrão `src`) |
| `VITE_EBOOK_PRICE_CENTS` | Preço exibido, em centavos. Vazio = "Preço a definir" |

Segredos do servidor (só no Supabase, via `supabase secrets set`): `KIWIFY_WEBHOOK_TOKEN`.
`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` já existem dentro das Edge Functions.

## Configurar o Supabase

1. Crie um projeto em supabase.com e copie URL e chave anon para `.env.local`.
2. Aplique o banco. Com a CLI: `supabase link --project-ref <ref>` e `supabase db push`, depois rode `supabase/seed.sql`
   no SQL Editor. Sem CLI: cole a migração e depois o seed no SQL Editor.
3. Em Authentication > URL Configuration, cadastre a URL do site e as URLs de redirecionamento
   `<site>/redefinir-senha` e `<site>/progresso`.
4. Para ter um administrador, crie a conta pelo site e rode no SQL Editor:
   `update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'seu@email');`

O que o banco garante (testado localmente com Postgres 16, ver "Validação"):

- Cada usuário lê e grava apenas o próprio progresso; ninguém altera a própria coluna `role`.
- `entitlements` e `payment_events` não aceitam gravação pelo cliente. Só o backend libera acesso.
- `lesson_contents` e `challenge_contents` só retornam linhas para quem tem o escopo (`has_scope`) ou é admin.
- `admin_list_users()` recusa quem não é admin.

## Stockfish

`npm install` executa `scripts/copy-stockfish.mjs`, que copia `stockfish-19-lite-single.js/.wasm` do pacote npm para
`public/engine/` (fora do Git). Essa versão é single-thread e não exige cabeçalhos COOP/COEP, então funciona em qualquer
hospedagem estática. O servidor precisa servir `.wasm` como `application/wasm` (Vite, Netlify, Vercel e Apache atuais já
fazem isso).

Os níveis ajustam a opção UCI `Skill Level` e limitam profundidade e tempo de busca
(`src/features/chess/engine/stockfishEngine.ts`): Fácil (Skill 0, profundidade 2, 200 ms), Médio (Skill 6, profundidade 8,
600 ms), Difícil (Skill 20, 1,5 s). Se o motor não carregar, a partida mostra o erro e oferece tentar de novo ou continuar
a mesma posição com duas pessoas.

Para trocar pela versão completa (mais forte, cerca de 100 MB, exige COOP/COEP), ajuste o script e o caminho em `getEngine()`.

Licença: o Stockfish é GPLv3. O rodapé linka o código-fonte e a licença (`public/engine/STOCKFISH-LICENSE.txt`).
Distribuir o motor exige cumprir a GPLv3; avalie com quem cuida da parte jurídica antes de vender o produto.

## Acesso e conteúdo premium

- Níveis de conteúdo: `public`, `registered` (gratuito com cadastro) e `premium` (exige um escopo, ex. `module:taticas`).
- Perfis: visitante, conta gratuita, premium e administrador, calculados em `src/features/premium/access.ts`
  (`buildSubject` e `canAccess`). Toda a interface consulta esse serviço; nada decide acesso por conta própria.
- Aulas e desafios premium não estão no JavaScript do site: só os metadados (título, resumo). O conteúdo vem do banco e
  passa pelo RLS. Um teste garante que nenhuma aula premium tenha corpo no código.
- Um direito de acesso vale se estiver `active`, já tiver começado e não tiver expirado. Reembolso e chargeback mudam o
  status e o acesso some.

Para adicionar conteúdo: aulas gratuitas em `src/data/course.ts`; desafios gratuitos em `src/data/challenges.ts` (os testes
conferem se a posição é válida e se a solução resolve); conteúdo premium em `lesson_contents` / `challenge_contents`, com o
metadado correspondente no código.

## Futura integração do e-book e liberação premium

Já existe: produto em `src/config/ebook.ts` e na tabela `products` (escopos liberados, validade, IDs externos), página do
e-book com aviso de conteúdo demonstrativo, capa substituível (`coverImageUrl`), preço configurável, FAQ e espaço para
depoimentos, capítulos com a rota que o QR Code de cada capítulo deve abrir, botão de compra que monta o link de checkout
com o ID da conta, página `/ebook/obrigado` que não libera nada sozinha, função SQL `apply_payment_event` e o webhook.

Passos para abrir as vendas:

1. Criar o produto na Kiwify (ou outra plataforma) e preencher `VITE_CHECKOUT_URL`.
2. Colocar o ID do produto da plataforma em `products.external_product_ids`.
3. Criar o webhook na plataforma com os eventos `compra_aprovada`, `compra_reembolsada`, `chargeback` e
   `subscription_canceled`, apontando para `https://<projeto>.supabase.co/functions/v1/checkout-webhook`, com um token.
4. `supabase secrets set KIWIFY_WEBHOOK_TOKEN=<token>` e `supabase functions deploy checkout-webhook --no-verify-jwt`.
5. Fazer uma compra de teste e conferir em `payment_events` e `entitlements`.
6. Trocar os textos de `src/config/ebook.ts`, a capa e `isDemoContent: false`.

Como a liberação funciona: o webhook confere a assinatura, normaliza o evento e chama `apply_payment_event`, que registra o
evento uma única vez (idempotente), encontra o produto pelo ID externo, encontra a conta pelo ID enviado no link
(`src`) ou, se faltar, pelo e-mail do comprador, e cria ou revoga o direito de acesso. Pagamentos sem conta encontrada
ficam registrados como `failed` para conciliação manual. Nenhum dado de cartão passa pelo site.

## Validação feita

- `npm run build` (inclui `tsc -b`) sem erros; 37 testes passando (`npm test`): regras do xadrez (xeque-mate, afogamento,
  material insuficiente, repetição tripla, 50 lances, roque com e sem condições, en passant, promoção, desfazer),
  integridade do catálogo, todas as soluções dos desafios e exercícios, unicidade do mate em 2, e o controle de acesso
  (visitante, cadastrado, premium, reembolso, expiração, admin).
- Navegação real em Chromium (1366 px e 390 px): todas as rotas, sem erros no console e sem rolagem horizontal; partida
  contra o Stockfish com clique e arrastar, lance ilegal recusado, desfazer, retomada de partida salva, xeque-mate local,
  computador abrindo com as brancas, desafio de mate em 2, resposta errada, promoção e roque nas aulas, registro no progresso.
- Migração e seed aplicados num Postgres 16 local com stubs do esquema `auth`, com cenários de RLS e pagamento
  (compra, compra repetida, compra por e-mail, produto desconhecido, comprador sem conta, reembolso, admin).

## Pendências reais

- **Supabase não foi conectado a um projeto real.** Login, cadastro, recuperação de senha, sincronização de progresso e
  área administrativa foram escritos contra a API do Supabase, mas não foram executados contra um projeto. O SQL foi
  validado num Postgres local, não no Supabase.
- **Webhook não publicado nem testado contra a Kiwify.** Os nomes dos eventos vêm da documentação da Kiwify; o formato da
  assinatura (HMAC-SHA1 do corpo no parâmetro `signature`) e os campos do payload precisam ser conferidos com um envio de
  teste. A função recusa tudo que não bate, então um formato diferente bloqueia vendas, mas não libera acesso indevido.
- **Administração somente leitura.** Mostra conteúdo, usuários e configuração do e-book; criar e editar módulos, aulas e
  desafios pela interface é a próxima etapa (as tabelas e políticas de admin já existem).
- **Conteúdo:** Fundamentos completo (10 aulas), Táticas com 1 aula aberta para cadastrados e 1 premium no seed, Estratégia
  com 1 aula premium no seed; as demais estão marcadas como "Em breve". 6 desafios gratuitos e 3 premium.
- O progresso feito sem conta fica no navegador e não é migrado para a conta ao se cadastrar.
- Partidas online: apenas o contrato em `src/features/chess/online.ts`; nenhuma tela oferece jogo online.
- Páginas de termos de uso e política de privacidade ainda não existem e serão necessárias antes de vender.
