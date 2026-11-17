---
id: promocao-no-final
title: Promoção no final
route: /aprender/finais/promocao-no-final
summary: A regra do quadrado e as corridas de peões.
---

## Ideia central

Quando um peão passado corre sozinho para a promoção, a pergunta é simples: **o rei adversário consegue alcançá-lo?** Em vez de contar lance por lance, existe um atalho visual: a **regra do quadrado**.

Imagine um quadrado com um lado indo do peão até a casa de promoção, e o outro lado com o mesmo tamanho, na direção do rei adversário. Se o rei defensor está dentro do quadrado, ou consegue entrar nele no seu lance, ele alcança o peão. Se não consegue, o peão promove.

```board
fen: 7k/8/8/p7/8/8/5K2/8 w - - 0 1
caption: O quadrado do peão de a5 vai de a5 até a1 e de a1 até e1 (dourado nos cantos). O rei de f2 está fora, mas, jogando Re3 (ou Re2, Re1), ele entra no quadrado e alcança o peão.
highlights: a5 a1 e1 e5
```

## Por que importa

As corridas de peões decidem muitos finais. Saber a regra do quadrado permite:

- decidir rapidamente se vale a pena trocar as últimas peças e entrar num final de peões;
- escolher entre avançar um peão ou levar o rei para outro lado;
- perceber quando o adversário vai conseguir promover, e reagir a tempo.

> **Atenção ao primeiro lance do peão.** Um peão na segunda fileira pode avançar duas casas de uma vez. Nesse caso, desenhe o quadrado a partir da casa onde ele vai chegar (a quarta fileira).

## Passo a passo: o rei entra no quadrado

```steps
fen: 7k/8/8/p7/8/8/5K2/8 w - - 0 1
Ke3 :: O rei entra no quadrado do peão.
a4 :: O peão avança. O quadrado diminui, mas o rei continua dentro.
Kd3 :: O rei segue em direção ao peão.
a3 :: O peão avança de novo.
Kc2 :: O rei chega perto da casa de promoção.
a2 :: O peão chega à segunda fileira.
Kb2 :: O rei ataca o peão e vai capturá-lo.
diagram: O rei alcançou o peão a tempo. Com a regra do quadrado, dava para saber isso já no primeiro lance. | highlights=b2 a2
```

## Passo a passo: o lance duplo decide a corrida

```steps
fen: 8/8/8/8/1k6/8/7P/6K1 w - - 0 1
h4! :: O peão avança duas casas. O quadrado dele agora vai de h4 a d4 e de h8 a d8; o rei preto, em b4, está fora e não consegue entrar.
Kc5 :: O rei preto corre, mas está uma casa atrasado.
h5 :: O peão avança.
Kd6 :: O rei preto continua a corrida.
h6 :: O peão está a duas casas da promoção.
Ke7 :: O rei preto se aproxima.
h7 :: O peão chega à sétima fileira.
Kf7 :: O rei preto não alcança h8.
h8=Q :: O peão vira dama.
```

Se as brancas tivessem jogado [[h3]] no primeiro lance, o rei preto entraria no quadrado com [[Kc4]] e alcançaria o peão. O lance duplo fez toda a diferença.

## Erros comuns

- **Contar errado.** Contar lances "de cabeça" numa corrida de peões é fácil de errar. Use a regra do quadrado e confira duas vezes.
- **Esquecer o lance duplo.** Um peão na segunda fileira pode avançar duas casas. Isso muda o tamanho do quadrado.
- **Esquecer quem joga.** O rei só "entra" no quadrado se for a vez dele. Se o adversário joga primeiro e avança o peão, o quadrado diminui.
- **Ignorar peças no caminho.** A regra do quadrado vale para o rei sozinho. Se houver peças no caminho do rei ou do peão, é preciso calcular.

## Exercícios

```exercise
id: quadrado-entrar
fen: 7k/8/8/p7/8/8/5K2/8 w - - 0 1
prompt: O peão preto quer promover. Coloque o rei dentro do quadrado.
goal: move
solution: Ke3
answer: O quadrado do peão de a5 vai até a coluna e. O rei entra nele com [[Ke3]] (ou [[Ke2]], [[Ke1]]) e alcança o peão. Um lance como [[Kf3]] deixaria o rei fora do quadrado.
```

```exercise
id: quadrado-corrida
fen: 8/8/8/8/1k6/8/7P/6K1 w - - 0 1
prompt: O rei preto está longe. Qual avanço ganha a corrida?
goal: best
solution: h4
answer: O lance duplo coloca o peão em h4, e o rei preto fica fora do quadrado. Com [[h3]], o rei preto entraria no quadrado e o final seria empate.
```

```exercise
id: quadrado-pretas
fen: 8/8/8/8/8/P7/5k2/7K b - - 0 1
prompt: As pretas jogam. O rei consegue alcançar o peão branco?
goal: move
solution: Ke3
answer: Sim. O quadrado do peão de a3 vai de a3 a f3 e de a8 a f8. O rei entra nele com [[Ke3]] (ou [[Kf3]]) e alcança o peão. [[Ke2]] deixaria o rei fora do quadrado, e o peão promoveria.
```

## Resumo

1. A regra do quadrado diz, sem calcular lance por lance, se o rei alcança um peão passado.
2. Para um peão na segunda fileira, desenhe o quadrado a partir da quarta, por causa do lance duplo.
3. Numa corrida, confira de quem é a vez: um lance a mais ou a menos decide tudo.
