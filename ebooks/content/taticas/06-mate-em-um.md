---
id: mate-em-um
title: Xeque-mate em um lance
route: /aprender/taticas/mate-em-um
summary: Os padrões de mate que aparecem em toda partida.
---

## Ideia central

Xeque-mate é o xeque do qual o rei não consegue escapar: ele não pode fugir para uma casa livre, não pode capturar a peça que dá xeque e nenhuma peça pode bloquear o ataque. Para dar mate, você precisa de duas coisas ao mesmo tempo: **dar xeque** e **cobrir todas as casas de fuga do rei**.

Quase sempre, quem tira as casas de fuga do rei são as próprias peças dele. Um rei cercado pelos próprios peões é um rei em perigo.

```board
fen: 4R1k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1
caption: O mate do corredor. A torre dá xeque pela oitava fileira e os peões pretos de f7, g7 e h7 impedem o rei de fugir.
highlights: e8 g8 f7 g7 h7
```

## Por que importa

Reconhecer padrões de mate economiza cálculo. Quando você vê um rei preso atrás dos próprios peões, já sabe que uma torre ou a dama na última fileira pode ser fatal. Quando vê uma dama apoiada por um peão perto do rei, já sabe onde procurar.

Os padrões deste capítulo são os mais comuns:

- **Mate do corredor:** a torre ou a dama dá xeque na última fileira e os peões prendem o rei.
- **Dama apoiada:** a dama dá xeque colada no rei, protegida por outra peça (um peão, um bispo, um cavalo), e o rei não pode capturá-la.
- **Mate abafado:** o cavalo dá xeque num rei cercado pelas próprias peças.
- **Mate em escada:** duas peças pesadas (torres ou dama) empurram o rei até a borda, fileira por fileira.

Pense sempre em mate primeiro: se existe um mate, nada mais importa.

## Passo a passo: o mate do louco

O mate mais rápido possível no xadrez acontece em dois lances e mostra como o próprio jogador pode abrir o caminho até seu rei.

```steps
f3?! :: Um primeiro lance ruim: não ocupa o centro e abre a diagonal que leva ao rei branco.
e5 :: As pretas ocupam o centro e abrem a diagonal da dama.
g4?? :: Mais um peão sai da frente do rei. Agora a diagonal h4-e1 está totalmente aberta.
Qh4# :: Xeque-mate. O rei não tem casa livre: f2 está atacada pela dama, e d1, d2 e f1 estão ocupadas por peças brancas.
diagram: O mate do louco. O rei branco foi preso pelas próprias peças. | highlights=e1 h4 | arrows=h4-e1
```

Ninguém joga assim de propósito, mas a lição vale para qualquer partida: **cada peão que sai da frente do rei abre uma linha de ataque**. Mova os peões do roque só quando houver um bom motivo.

## Erros comuns

- **Não deixar uma casa de fuga para o rei.** Depois do roque, se não houver perigo imediato, um lance como [[h3]] (ou [[h6]], com as pretas) cria uma saída e evita o mate do corredor.
- **Dar xeque sem olhar as casas de fuga.** Um xeque que não é mate pode só empurrar o rei para um lugar melhor. Antes de dar xeque, conte as casas para onde o rei pode ir.
- **Esquecer que a peça que dá mate precisa estar protegida.** Se a dama dá xeque colada no rei sem proteção, o rei simplesmente a captura.
- **Procurar só mates "bonitos".** A maioria dos mates entre iniciantes é simples: uma torre na última fileira ou uma dama apoiada por um peão. Procure primeiro os padrões básicos.

## Exercícios

```exercise
id: mate-corredor
fen: 6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1
prompt: O rei preto está preso atrás dos próprios peões. Dê mate em um lance.
goal: mate
solution: Re8#
answer: A torre dá xeque na oitava fileira. Os peões de f7, g7 e h7 impedem a fuga do rei, e nenhuma peça preta pode bloquear ou capturar a torre.
```

```exercise
id: mate-dama-bispo
fen: 5rk1/5pp1/8/8/4Q3/3B4/5PPP/6K1 w - - 0 1
prompt: A dama e o bispo estão na mesma diagonal. Dê mate em um lance.
goal: mate
solution: Qh7#
answer: A dama dá xeque em h7, protegida pelo bispo de d3. O rei não pode capturá-la, f8 está ocupada pela torre preta e as casas f7 e g7 têm peões pretos.
```

```exercise
id: mate-dama-peao
fen: 6k1/5p1p/5PpQ/8/8/8/5PPP/6K1 w - - 0 1
prompt: O peão branco de f6 está muito perto do rei preto. Dê mate em um lance.
goal: mate
solution: Qg7#
answer: A dama dá xeque em g7, protegida pelo peão de f6. O rei não pode capturá-la e não tem casas livres: f8 e h8 são atacadas pela dama.
```

```exercise
id: mate-escada
fen: k7/6R1/8/8/8/8/8/6KR w - - 0 1
prompt: A torre de g7 já cortou a sétima fileira. Termine o mate em escada.
goal: mate
solution: Rh8#
answer: A torre de h1 dá xeque na oitava fileira. O rei não pode subir para a sétima, controlada pela outra torre. É o fim do mate em escada.
```

```exercise
id: mate-abafado-pretas
fen: 6k1/5ppp/8/8/4n3/8/6PP/6RK b - - 0 1
prompt: O rei branco está cercado pelas próprias peças. Dê mate com o cavalo.
goal: mate
solution: Nf2#
answer: O cavalo dá xeque de f2. O rei de h1 não tem para onde ir: g1 está ocupada pela torre e g2 e h2 pelos peões. É um mate abafado.
```

```exercise
id: mate-diagonal-pretas
fen: 6k1/1b3ppp/8/8/8/6Pq/5P1P/5RK1 b - - 0 1
prompt: A dama e o bispo pretos miram a casa g2. Dê mate em um lance.
goal: mate
solution: Qg2#
answer: A dama dá xeque em g2, protegida pelo bispo de b7 pela grande diagonal. O rei não pode capturá-la e f1 está ocupada pela própria torre.
```

## Resumo

1. Mate é xeque sem saída: o rei não pode fugir, capturar a peça que dá xeque nem ser protegido por um bloqueio.
2. As casas de fuga do rei costumam ser tiradas pelas próprias peças dele: peões do roque, torres e cavalos ao redor.
3. Aprenda os padrões básicos (corredor, dama apoiada, mate abafado e escada) e procure o mate antes de qualquer outro lance.
