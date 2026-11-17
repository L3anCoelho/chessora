---
id: controle-do-centro
title: Controle do centro
route: /aprender/estrategia/controle-do-centro
summary: Por que as casas d4, e4, d5 e e5 importam tanto.
---

## Ideia central

As quatro casas do meio do tabuleiro (d4, e4, d5 e e5) formam o **centro**. Uma peça no centro alcança mais casas do que na borda e chega rápido a qualquer lado do tabuleiro. Quem controla o centro tem mais espaço para manobrar e dificulta a vida das peças adversárias.

Controlar o centro não é só ocupá-lo com peões. Uma peça que **ataca** uma casa central também a controla, mesmo de longe.

```board
fen: 4k3/8/8/8/3N4/8/8/N3K3 w - - 0 1
caption: O cavalo de d4 ataca oito casas; o cavalo de a1, só duas. É o mesmo cavalo, em casas diferentes.
highlights: b3 b5 c2 c6 e2 e6 f3 f5 b3 c2
```

## Por que importa

O centro é o "cruzamento" do tabuleiro: as peças passam por ele para ir de um lado ao outro. Quem domina o centro:

- desenvolve as peças em boas casas, porque elas têm para onde ir;
- pode atacar em qualquer lado, porque as peças chegam rápido;
- empurra as peças adversárias para a borda, onde elas fazem pouco.

Por isso quase todas as aberturas começam com um peão central ([[e4]], [[d4]], [[e5]], [[d5]]) ou com uma peça que controla o centro ([[Nf3]], [[Nf6]]).

## Passo a passo: a luta pelo centro na Escocesa

Na Abertura Escocesa, as brancas abrem o centro cedo com d4. Veja como os dois lados disputam as casas centrais lance a lance.

```steps
e4 :: As brancas ocupam e4 e controlam d5.
e5 :: As pretas fazem o mesmo do outro lado.
Nf3 :: O cavalo ataca e5 e controla d4.
Nc6 :: O cavalo defende e5 e também controla d4.
d4 :: As brancas desafiam o centro na hora.
exd4 :: As pretas trocam o peão central.
Nxd4 :: O cavalo recaptura e fica forte em d4.
Nf6 :: As pretas atacam o peão de e4, que é o único peão central branco.
Nc3 :: O cavalo defende e4.
Bb4 :: O bispo crava o cavalo de c3, que deixa de defender e4 de verdade.
Nxc6 :: As brancas trocam o cavalo central antes que ele seja incomodado.
bxc6 :: As pretas recapturam na direção do centro: o peão de b vai para c6, de onde apoia ...d5.
Bd3 :: O bispo defende e4.
d5 :: Agora as pretas também têm um peão central e desafiam e4.
diagram: Os dois lados disputam as casas centrais com peões e peças. Ninguém domina o centro: a posição está equilibrada. | highlights=d5 e4
```

Repare em [[6...bxc6]]: entre as duas formas de recapturar, as pretas escolheram a que leva o peão **na direção do centro**. É uma regra útil: quando estiver em dúvida, recapture com o peão para o centro.

## Erros comuns

- **Jogar só com peões laterais.** Lances como [[a4]] ou [[h4]] na abertura não ajudam no centro e gastam tempo.
- **Ocupar o centro sem apoio.** Um peão central sozinho pode ser atacado e capturado. Apoie-o com outro peão ou com peças.
- **Deixar o adversário montar o centro ideal de graça.** Se o adversário tem peões em e4 e d4 e você não faz nada contra eles, ele ganha espaço e você fica espremido. Desafie o centro com ...e5, ...d5 ou ...c5.
- **Esquecer que peças também controlam o centro.** Um bispo em b2 ou g2 controla as casas centrais de longe. Contar só os peões dá uma ideia errada da posição.

## Exercícios

```exercise
id: centro-desafio
moves: 1.e4 e5 2.Nf3 Nc6
prompt: Desafie o centro preto com um peão, como na Abertura Escocesa.
goal: move
solution: d4
answer: O peão de d4 ataca e5 e abre o jogo no centro. [[Bc4]] e [[Bb5]], da Italiana e da Espanhola, também são bons lances, mas este exercício pede o desafio direto ao centro.
```

```exercise
id: centro-recaptura
moves: 1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Nf6 5.Nc3 Bb4 6.Nxc6 bxc6 7.Bd3 d5 8.exd5
prompt: As brancas trocaram em d5. Recapture mantendo um peão no centro.
goal: move
solution: cxd5
answer: Recapturar com o peão de c mantém um peão em d5, no centro. As pretas também podem rocar antes, porque o peão de d5 não vai fugir.
```

```exercise
id: centro-pretas
moves: 1.d4 Nf6 2.c4 e6 3.Nc3
prompt: Ocupe uma casa central com um peão.
goal: move
solution: d5
answer: O peão de d5 ocupa o centro, apoiado pelo peão de e6, e impede o avanço e4 das brancas.
```

## Resumo

1. O centro (d4, e4, d5 e e5) é a região onde as peças são mais fortes; controlá-lo dá espaço e mobilidade.
2. Controlar o centro pode ser ocupando com peões ou atacando as casas com peças.
3. Desafie o centro do adversário e, na dúvida, recapture com o peão na direção do centro.
