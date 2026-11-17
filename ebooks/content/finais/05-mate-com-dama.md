---
id: mate-com-dama
title: Mate com dama
route: /aprender/finais/mate-com-dama
summary: Mate rápido com rei e dama, sem cair no afogamento.
---

## Ideia central

Com rei e dama contra o rei sozinho, o mate sai em poucos lances, porque a dama controla muitas casas. Mas há um perigo que não existe no mate com torre: o **afogamento**. A dama tira tantas casas do rei adversário que é fácil deixá-lo sem nenhum lance legal e sem estar em xeque. Aí a partida termina empatada.

A técnica tem duas fases:

1. **Empurrar o rei para a borda com a dama.** Coloque a dama a um salto de cavalo de distância do rei adversário e vá acompanhando os movimentos dele. A caixa diminui a cada lance, sem dar xeque.
2. **Trazer o rei e dar mate.** Com o rei adversário preso na borda, a dama para de se mexer, o seu rei se aproxima e só então vem o mate.

```board
fen: 7k/8/5K2/8/8/8/8/6Q1 w - - 0 1
caption: O rei preto está no canto. Dama em g7, protegida pelo rei branco, é mate. Mas cuidado: alguns lances de dama aqui afogam o rei.
highlights: h8 g7
```

## Por que importa

Promover um peão e ficar com dama contra rei é o resultado de muitos finais. Se você afoga o rei adversário, joga fora uma partida ganha. Por isso, todo jogador precisa saber dar esse mate com segurança, de preferência sem pensar muito.

## Passo a passo: o perigo do afogamento

```steps
fen: 7k/8/5K2/8/8/8/8/6Q1 w - - 0 1
Qg6?? :: A dama se aproxima, mas não dá xeque. O rei preto não tem mais nenhuma casa: g8 e g7 são atacadas pela dama, h7 pela dama também. É afogamento e a partida empata.
diagram: Afogamento: as pretas não estão em xeque e não têm lance legal. Empate. | highlights=h8 g8 g7 h7
```

```steps
fen: 7k/8/5K2/8/8/8/8/6Q1 w - - 0 1
Qg7# :: O lance certo: a dama dá xeque em g7, protegida pelo rei de f6. É mate.
```

A regra de ouro: **quando o rei adversário tem poucas casas, antes de cada lance pergunte: "depois deste lance, ele ainda tem para onde ir?"** Se a resposta for não e não for xeque, procure outro lance.

## Erros comuns

- **Dar xeques em sequência.** Xeques com a dama, sem plano, deixam o rei adversário fugir para o centro. Use a dama para fechar a caixa, sem xeque.
- **Esquecer o próprio rei.** A dama sozinha não dá mate. Na fase final, o seu rei precisa chegar perto.
- **Afogar o rei.** É o erro mais caro: transforma uma vitória em empate. Antes de cada lance, conte as casas livres do rei adversário.
- **Deixar a dama sem proteção perto do rei adversário.** Uma dama colada no rei inimigo e sem proteção é simplesmente capturada.

## Exercícios

```exercise
id: dama-mate-canto
fen: 7k/8/5K2/8/8/8/8/6Q1 w - - 0 1
prompt: Dê mate em um lance, sem afogar o rei preto.
goal: mate
solution: Qg7#
answer: A dama dá xeque em g7 protegida pelo rei. Lances como [[Qg6]] tiram todas as casas do rei preto sem dar xeque e causam afogamento.
```

```exercise
id: dama-mate-fileira
fen: 7k/8/6K1/8/8/8/8/1Q6 w - - 0 1
prompt: O rei branco já cobre a sétima fileira. Dê mate em um lance.
goal: mate
solution: Qb8#
answer: A dama dá xeque pela oitava fileira. O rei branco, em g6, cobre g7 e h7, e o rei preto não tem saída.
```

```exercise
id: dama-mate-3
fen: k7/2Q5/8/1K6/8/8/8/8 w - - 0 1
prompt: Dê mate em três lances. Primeiro prenda o rei, depois traga o seu rei.
goal: mate
solution: Qd7 Kb8 Kb6 Ka8 Qd8#
answer: A dama vai para d7 e fecha a sétima fileira sem dar xeque; o rei preto só pode oscilar entre a8 e b8. O rei branco se aproxima com [[Kb6]] e, com o rei preto em a8, a dama dá mate na oitava fileira. A dama também pode fechar a sétima fileira de g7 ou h7: o importante é prender o rei sem dar xeque.
```

## Resumo

1. Rei e dama vencem com facilidade, mas o afogamento transforma a vitória em empate.
2. Use a dama para empurrar o rei para a borda, a um salto de cavalo de distância, sem dar xeque.
3. Com o rei adversário preso, traga seu rei e só então dê o mate; antes de cada lance, confira se o adversário ainda tem um lance legal.
