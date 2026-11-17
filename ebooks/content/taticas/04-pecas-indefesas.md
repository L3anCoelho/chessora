---
id: pecas-indefesas
title: Peças indefesas
route: /aprender/taticas/pecas-indefesas
summary: Como identificar e punir peças sem proteção, e como não deixar as suas soltas.
---

## Ideia central

Uma peça **indefesa** (ou "solta") é uma peça que nenhuma outra peça do mesmo lado protege. Se ela for atacada, o dono precisa gastar um lance para salvá-la. Se for atacada junto com outra ameaça, ela cai.

Existe um ditado em inglês muito repetido entre jogadores: *loose pieces drop*, "peças soltas caem". Quase todas as táticas deste livro, do garfo ao ataque duplo, funcionam porque existe pelo menos uma peça solta no tabuleiro.

```board
fen: r4rk1/pbp2ppp/1p1q1n2/4N3/8/2N5/PPP2PPP/R2Q1RK1 b - - 0 1
caption: O cavalo de e5 está atacado pela dama de d6 e nenhuma peça branca o protege. É uma peça indefesa.
highlights: e5
arrows: d6-e5
```

## Por que importa

A forma mais simples de ganhar material é capturar uma peça que ninguém defende. Parece óbvio, mas entre iniciantes é a causa número um de partidas perdidas: uma peça fica solta, o adversário percebe e captura.

Saber contar **atacantes e defensores** também evita o erro contrário: capturar uma peça bem defendida e perder material na recaptura.

> **A regra da contagem.** Se uma peça é atacada mais vezes do que é defendida, ela pode ser capturada. Se o número é igual, a captura só vale a pena se a sua primeira peça a capturar for mais barata do que a peça capturada.

## Passo a passo: contando atacantes e defensores

```steps
fen: 3q2k1/5ppp/8/3n4/8/5B2/5PPP/3R2K1 w - - 0 1
note: O cavalo de d5 é atacado duas vezes (bispo de f3 e torre de d1) e defendido uma vez (dama de d8). Ele pode ser capturado.
Bxd5 :: O bispo captura o cavalo. Agora o bispo de d5 está atacado pela dama, mas defendido pela torre.
Qxd5? :: Se a dama recapturar...
Rxd5 :: ... a torre captura a dama. As pretas trocaram dama e cavalo (12 pontos) por um bispo (3 pontos).
diagram: Como o cavalo era atacado mais vezes do que era defendido, as brancas o ganharam. A recaptura das pretas só piorou as coisas. | highlights=d5
```

Repare que, depois de [[Bxd5]], as pretas não devem recapturar. Elas simplesmente ficam com uma peça a menos, o que já é ruim, mas perder a dama seria pior.

## Passo a passo: peça solta com xeque

Quando há uma peça solta e o rei adversário está exposto, um xeque pode atacar os dois ao mesmo tempo.

```steps
fen: rnbqkbnr/pp2pppp/2p5/4N3/8/3P4/PPP2PPP/RNBQKB1R b KQkq - 0 1
Qa5+ :: Xeque no rei de e1 e, na mesma jogada, ataque ao cavalo solto de e5.
Nc3 :: As brancas bloqueiam o xeque.
Qxe5+ :: A dama captura o cavalo, de novo com xeque.
```

## Erros comuns

- **Deixar peças soltas "porque ninguém está atacando".** Hoje ninguém ataca; no próximo lance, um garfo ou um xeque pode atacar. Prefira posições em que suas peças se protegem umas às outras.
- **Contar errado.** Ao contar defensores, lembre que uma peça cravada não defende de verdade, e que o rei só pode recapturar se a casa não estiver atacada.
- **Capturar com a peça mais valiosa primeiro.** Numa sequência de trocas, capture primeiro com a peça mais barata. Se você captura com a dama e o adversário recaptura com um peão, perde a dama.
- **Esquecer as peças soltas do adversário.** Toda vez que o adversário mover uma peça, pergunte: "ela ficou solta? E a peça que estava protegendo, ficou solta?"

## Exercícios

```exercise
id: solta-bispo
fen: 6k1/pb3ppp/1p6/8/8/5Q2/5PPP/6K1 w - - 0 1
prompt: Há uma peça preta sem nenhuma defesa. Capture-a.
goal: move
solution: Qxb7
answer: O bispo de b7 não é defendido por nenhuma peça preta. A dama o captura sem risco.
```

```exercise
id: solta-contagem
fen: 3q2k1/5ppp/8/3n4/8/5B2/5PPP/3R2K1 w - - 0 1
prompt: Conte atacantes e defensores do cavalo de d5. Ele pode ser capturado?
goal: move
solution: Bxd5
answer: Sim. O cavalo é atacado duas vezes (bispo e torre) e defendido uma vez (dama). Capture primeiro com a peça mais barata, o bispo. Se a dama recapturar, a torre captura a dama. ([[Rxd5]] também ganha o cavalo, porque a dama não pode recapturar sem ser capturada pelo bispo.)
```

```exercise
id: solta-pretas
fen: r4rk1/pbp2ppp/1p1q1n2/4N3/8/2N5/PPP2PPP/R2Q1RK1 b - - 0 1
prompt: Uma peça branca ficou sem defesa. Encontre-a e capture.
goal: best
solution: Qxe5
answer: O cavalo de e5 não é defendido por nenhuma peça ou peão. A dama de d6 o captura.
```

## Resumo

1. Uma peça indefesa é uma peça que ninguém protege; ela é o alvo natural de quase todas as táticas.
2. Para saber se uma captura funciona, conte atacantes e defensores e capture primeiro com a peça mais barata.
3. Depois de cada lance (seu ou do adversário), confira quais peças ficaram soltas.
