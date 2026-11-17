---
id: planejamento
title: Planejamento
route: /aprender/estrategia/planejamento
summary: Montar um plano simples a partir da posição.
---

## Ideia central

Um plano é uma ideia que guia vários lances seguidos: "vou levar a torre para a coluna aberta e depois para a sétima fileira", "vou atacar o peão isolado", "vou trocar as damas e levar o rei ao centro". Jogar com plano é melhor do que escolher cada lance isolado, porque os lances trabalham juntos.

O plano nasce da posição. Use as perguntas da introdução deste livro e, depois, as duas perguntas mais úteis do planejamento:

1. **Qual é a minha pior peça?** Melhore-a.
2. **Qual é a maior fraqueza do adversário?** Ataque-a.

```board
fen: 4r1k1/pp3ppp/8/8/8/7P/PP3PP1/3R2K1 w - - 0 1
caption: A coluna d está aberta e a torre branca já está nela. A sétima fileira (dourado) é o próximo alvo: de lá, a torre ataca os peões pretos.
highlights: a7 b7 f7 g7 h7
arrows: d1-d7
```

## Por que importa

Sem plano, as peças andam de um lado para o outro e o adversário assume a iniciativa. Com plano, até lances simples ganham propósito. Os planos mais comuns para quem está começando:

- **Ocupar uma coluna aberta com uma torre** e, se possível, entrar na sétima fileira.
- **Melhorar a pior peça**: um cavalo na borda vai para o centro; um bispo preso troca de diagonal.
- **Atacar um peão fraco** com mais peças do que o adversário consegue usar para defendê-lo.
- **Atacar o rei** quando ele está mal protegido.
- **Simplificar** quando você está com vantagem de material.

## Passo a passo: torre na coluna aberta, depois na sétima

```steps
fen: 4r1k1/pp3ppp/8/8/8/7P/PP3PP1/3R2K1 w - - 0 1
note: O plano: a torre já está na coluna aberta; o rei tem uma casa de fuga em h2. Agora a torre pode entrar na sétima fileira sem medo de mate na primeira.
Rd7 :: A torre entra na sétima fileira e ataca o peão de b7.
Rb8 :: As pretas defendem b7 com a torre, que fica passiva.
Kf1 :: Com a torre preta presa à defesa, o rei branco se aproxima do centro.
a5 :: As pretas tentam algo no lado da dama.
Ke2 :: O rei continua o caminho.
diagram: A torre branca, na sétima fileira, prende a torre preta à defesa. O rei branco vai ajudar no final. | highlights=d7 b8
```

Repare que o plano tinha uma condição: o peão de h3 já existia. Sem ele, depois de [[Rd7]] a torre preta daria mate em e1. Bons planos começam pela segurança do próprio rei.

## Erros comuns

- **Lances sem objetivo.** Antes de mover uma peça, diga a si mesmo para que ela vai lá. Se não souber responder, procure outro lance.
- **Planos grandes demais.** Para quem está começando, um bom plano tem dois ou três lances. "Torre na coluna aberta, depois na sétima" é um plano melhor do que "dar mate em dez lances".
- **Esquecer o plano do adversário.** Antes de executar o seu, pergunte o que o adversário quer fazer. Às vezes, impedir o plano dele é mais importante.
- **Insistir num plano que deixou de funcionar.** A posição muda a cada lance. Se o adversário defendeu o alvo, procure outro.

## Exercícios

```exercise
id: plano-coluna
fen: r4rk1/pp3ppp/2n1b3/8/8/2N1B3/PP3PPP/R4RK1 w - - 0 1
prompt: A coluna d está aberta. Coloque uma torre nela.
goal: move
solution: Rfd1
answer: A torre ocupa a coluna aberta e controla a casa d7 e a coluna inteira. Usar a torre de f1 mantém a de a1 protegendo o lado da dama. [[Rad1]] também é bom; o importante é chegar à coluna aberta antes do adversário.
```

```exercise
id: plano-setima
fen: 4r1k1/pp3ppp/8/8/8/7P/PP3PP1/3R2K1 w - - 0 1
prompt: O rei branco já tem uma casa de fuga. Ative a torre.
goal: move
solution: Rd7
answer: A torre entra na sétima fileira e ataca os peões pretos. Com o peão em h3, não há risco de mate na primeira fileira. Aproximar o rei com [[Kf1]] primeiro é igualmente bom; os dois lances fazem parte do mesmo plano.
```

```exercise
id: plano-pior-peca
fen: r4rk1/pp2bppp/2n1pn2/8/3P4/N3BN2/PP3PPP/R4RK1 w - - 0 1
prompt: Qual é a pior peça branca? Melhore-a.
goal: move
solution: Nc4
answer: O cavalo de a3, na borda, é a pior peça branca. De c4, ele mira e5, d6 e b6. [[Nb5]] também leva o cavalo para uma casa melhor.
```

## Resumo

1. Um plano liga vários lances em torno de um objetivo; nasce das características da posição.
2. As duas perguntas mais úteis: qual é a minha pior peça e qual é a maior fraqueza do adversário.
3. Planos simples funcionam melhor: coluna aberta, sétima fileira, melhorar uma peça, atacar um peão fraco, sempre com o rei seguro.
