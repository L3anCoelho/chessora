# E-books Xadrez Inteligente

Fontes, verificação e gerador dos cinco e-books em PDF: Táticas, Estratégia, Aberturas, Finais e o volume Completo. Esta pasta é independente do site: nada aqui altera o código do site.

## Gerar os PDFs

Pré-requisitos: Node 20+, as dependências do site instaladas na pasta de cima (`npm install` na raiz do projeto, para `chess.js`, `stockfish`, `esbuild` e as fontes) e o Playwright com o Chromium (`npx playwright install chromium`). Para descobrir as páginas do sumário, o script usa `pdftotext` e `pdfinfo` (pacote poppler) e, para juntar a capa, o `qpdf`.

```bash
cd ebooks
npm install
node scripts/verify.mjs                                   # verificação obrigatória (cerca de 3 a 4 minutos na primeira vez)
SITE_URL=https://seu-dominio.com.br node scripts/build.mjs  # gera os 5 PDFs em ebooks/pdf/
```

Para gerar só alguns: `node scripts/build.mjs aberturas finais`. Para verificar só um produto: `node scripts/verify.mjs taticas`.

**Importante:** sem `SITE_URL`, os QR Codes apontam para `https://example.com` (um domínio reservado para exemplos). Gere de novo com o domínio real do site antes de distribuir.

## Onde fica cada coisa

| Caminho | O que é |
| --- | --- |
| `content/catalog.json` | Os produtos, a ordem dos capítulos e os textos de capa. |
| `content/<produto>/*.md` | Um arquivo por capítulo. O volume Completo reaproveita os mesmos arquivos. |
| `content/comum/como-usar.md` | Capítulo "Como usar este livro", presente em todos os volumes. |
| `scripts/verify.mjs` | Verificação com chess.js e Stockfish; gera `verificacao.md`. |
| `scripts/build.mjs` | Geração dos PDFs (HTML + Chromium). |
| `scripts/lib/` | Leitura do conteúdo, desenho dos tabuleiros, motor e estilo do livro (`book.css`). |
| `pdf/` | PDFs gerados. |

## Formato do conteúdo

Cada capítulo é Markdown com front matter (`id`, `title`, `route`, `summary`) e três blocos especiais: `board` (diagrama), `steps` (passo a passo lance a lance) e `exercise` (exercício com gabarito). Os lances são escritos na notação do chess.js (letras em inglês: N, B, R, Q, K) e convertidos para a notação em português no PDF (C, B, T, D, R). No texto corrido, `[[Nf3]]` vira **Cf3**. A documentação completa do formato está no início de `scripts/lib/content.mjs`.

Os capítulos de aula precisam ter, nesta ordem, as seções: Ideia central, Por que importa, Passo a passo, Erros comuns, Exercícios e Resumo (com exatamente 3 pontos). O verificador acusa erro se faltar alguma.

O mesmo conteúdo pode alimentar o site: os blocos `exercise` têm FEN, solução e explicação no mesmo formato usado pelos exercícios das aulas.

## O que a verificação confere

- Todo FEN é válido e todo lance de todo diagrama, passo a passo e exercício é legal (chess.js).
- Exercícios de mate: a solução termina em mate e o Stockfish confirma mate em N; soluções alternativas viram aviso.
- Exercícios de melhor lance: o Stockfish (profundidade 20) escolhe o mesmo lance; segundas opções próximas viram aviso.
- Exercícios de lance didático: o lance não pode ser um erro (perder mais de 1,2 peão em relação ao melhor).
- Passo a passo: cada lance é comparado com o melhor do motor (profundidade 14). Lances marcados com `?` precisam ser erros de verdade, e lances sem marca não podem ser erros. Em posições já decididas, a comparação é ignorada.
- Rotas dos QR Codes: precisam existir em `src/data/course.ts`.

Os resultados do motor ficam em cache em `.cache/`. Apague a pasta para refazer tudo do zero.
