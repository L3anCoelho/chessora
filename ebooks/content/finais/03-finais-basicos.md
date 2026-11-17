---
id: finais-basicos
title: Finais básicos
route: /aprender/finais/finais-basicos
summary: Rei ativo, peões passados e a torre atrás do peão.
---

## Ideia central

Cada tipo de final tem suas técnicas, mas alguns princípios valem para quase todos. Os três mais importantes:

1. **Rei ativo.** No final, o rei deve ir para o centro e para perto dos peões. Um rei ativo ataca peões adversários e apoia os próprios.
2. **Peões passados devem avançar.** Um peão passado parado é só um peão. Avançando, ele obriga o adversário a usar peças para pará-lo.
3. **Torre atrás do peão passado.** Nos finais de torre, o melhor lugar para a torre é atrás de um peão passado, seja ele seu ou do adversário. Atrás do seu, ela empurra; atrás do dele, ela o persegue.

```board
fen: r7/5ppp/5k2/P7/8/8/5PPP/R5K1 w - - 0 1
caption: A torre branca está atrás do peão passado de a5; a torre preta está na frente dele. Atrás do peão, a torre branca apoia o avanço; na frente, a torre preta fica presa à defesa.
highlights: a1 a5 a8
arrows: a1-a5
```

## Por que importa

Muitas partidas chegam a um final com material igual ou com um peão a mais. Nesses finais, a diferença entre vencer e empatar está quase sempre na atividade das peças: o rei que chega primeiro ao centro, a torre que fica ativa, o peão passado que avança no momento certo.

> **Um peão passado afastado** (longe dos outros peões) é especialmente forte: o rei adversário precisa ir até ele, e enquanto isso o seu rei captura os peões do outro lado.

## Passo a passo: o rei vai para o centro

Com as damas e as peças fora do tabuleiro, o primeiro passo das brancas é centralizar o rei.

```steps
fen: 8/pp3kpp/8/8/8/8/PP3PPP/6K1 w - - 0 1
Kf1 :: Sem peças pesadas no tabuleiro, o rei não corre perigo. Ele sai do canto.
Ke6 :: As pretas fazem o mesmo.
Ke2 :: O rei branco segue para o centro.
Kd5 :: O rei preto chega a d5, uma casa central.
Kd3 :: O rei branco impede que o rei preto avance mais.
diagram: Os dois reis estão centralizados. O lado que chegar primeiro aos peões adversários costuma levar vantagem. | highlights=d3 d5
```

## Passo a passo: a torre atrás do peão

```steps
fen: r7/5ppp/5k2/P7/8/8/5PPP/R5K1 w - - 0 1
a6 :: O peão avança, protegido pela torre de a1. A torre preta não pode sair da frente dele.
Ke7 :: O rei preto vem em direção ao peão.
diagram: A torre preta está presa à defesa e o rei preto foi puxado para o lado da dama. Agora as brancas não precisam ter pressa com o peão: levá-lo até a7 cedo demais facilitaria a defesa. O plano é usar a vantagem no outro lado do tabuleiro. | highlights=a6 a8
```

## Erros comuns

- **Deixar o rei no canto.** No final, o rei que fica em g1 ou g8 "por segurança" é uma peça a menos. Leve-o para o centro assim que as damas forem trocadas.
- **Torre na frente do próprio peão passado.** Uma torre na frente do peão bloqueia o avanço dele e fica passiva. Coloque a torre atrás.
- **Peão passado parado.** Se o peão passado não avança, o adversário bloqueia a casa da frente com uma peça e ele perde a força.
- **Trocar para um final de peões sem calcular.** Finais de peões são muito exatos. Antes de trocar a última peça, use a regra do quadrado e a oposição para saber se o final está ganho.

## Exercícios

```exercise
id: basicos-rei
fen: 8/pp3kpp/8/8/8/8/PP3PPP/6K1 w - - 0 1
prompt: As damas já foram trocadas. Qual é o plano mais importante agora?
goal: move
solution: Kf1
answer: Levar o rei para o centro. De f1, ele vai para e2 e d3, perto dos peões. Avançar os peões do lado do rei, como [[f4]], também é útil, mas a centralização do rei vem em primeiro lugar.
```

```exercise
id: basicos-torre
fen: r7/5ppp/5k2/P7/8/8/5PPP/R5K1 w - - 0 1
prompt: A torre já está atrás do peão passado. Faça o peão avançar.
goal: move
solution: a6
answer: O peão avança protegido pela torre e a torre preta continua presa na frente dele. Depois disso, não há pressa de chegar a a7: nesta posição, o motor mostra que esse avanço precoce facilitaria a defesa das pretas.
```

## Resumo

1. No final, o rei é uma peça de ataque: leve-o para o centro.
2. Peões passados precisam avançar; um peão passado afastado desvia o rei adversário.
3. Nos finais de torre, a torre fica melhor atrás do peão passado, seja ele seu ou do adversário.
