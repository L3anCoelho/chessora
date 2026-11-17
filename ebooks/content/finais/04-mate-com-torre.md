---
id: mate-com-torre
title: Mate com torre
route: /aprender/finais/mate-com-torre
summary: Empurrar o rei para a borda com rei e torre.
---

## Ideia central

Com rei e torre contra o rei sozinho, a vitória é garantida, desde que você saiba a técnica. A torre sozinha não dá mate: ela precisa da ajuda do rei. O plano tem três ideias:

1. **A torre corta o rei.** Ela fica numa fileira ou coluna e não deixa o rei adversário atravessar.
2. **O rei se aproxima.** O seu rei vem para perto do rei adversário, sempre protegendo a torre se ela for atacada.
3. **A caixa diminui.** A cada oportunidade, a torre avança uma fileira e o rei adversário fica com menos espaço, até ser empurrado para a borda.

O mate acontece na borda: o rei adversário fica na última fileira, o seu rei fica de frente para ele (em oposição), e a torre dá xeque pela fileira.

```board
fen: 4R1k1/8/6K1/8/8/8/8/8 b - - 0 1
caption: O padrão final. O rei branco em g6 cobre as casas da sétima fileira e a torre dá xeque na oitava.
highlights: e8 g8 g6
```

## Por que importa

O mate com torre aparece em partidas reais com frequência: depois de trocas, quem tem uma torre a mais precisa saber terminar. Quem não conhece a técnica pode dar xeques sem fim, perder a torre ou deixar passar o limite de lances sem progresso (a regra dos 50 lances, que dá empate).

## Passo a passo: o lance de espera

Nem sempre o rei adversário está na posição certa para o mate. Às vezes é preciso um **lance de espera**: um lance de torre que não muda nada, só obriga o adversário a se mover.

```steps
fen: 3k4/8/4K3/8/8/8/8/7R w - - 0 1
note: O rei preto está em d8 e o branco em e6. Os reis não estão frente a frente, então um xeque agora não é mate.
Rc1 :: A torre corta a coluna c. O rei preto só pode ir para e8.
Ke8 :: O rei preto é obrigado a ficar de frente para o rei branco.
Rc8# :: Agora sim: xeque pela oitava fileira, e o rei branco cobre d7, e7 e f7.
diagram: Xeque-mate. O lance de espera colocou o rei preto na frente do rei branco. | highlights=e8 c8
```

## Como empurrar o rei para a borda

Em posições com mais espaço, repita este ciclo:

- **Torre cortando:** coloque a torre numa fileira (ou coluna) entre os dois reis.
- **Rei se aproximando:** traga seu rei em direção ao rei adversário, de preferência para a oposição.
- **Torre apertando:** quando os reis estiverem em oposição, dê xeque com a torre. O rei adversário é obrigado a recuar uma fileira.
- **Torre atacada?** Afaste-a para o outro lado do tabuleiro, mantendo a mesma fileira, ou proteja-a com o rei.

## Erros comuns

- **Dar xeques sem plano.** Um xeque que não diminui a caixa só faz o rei adversário mudar de lugar. Prefira cortar e aproximar o rei.
- **Deixar a torre perto do rei adversário.** Uma torre que pode ser capturada desfaz todo o trabalho. Mantenha-a longe ou protegida.
- **Esquecer o rei.** A torre sozinha nunca dá mate num rei que não está na borda. O seu rei precisa participar.
- **Afogar o rei.** Com o rei adversário encurralado no canto, confira se ele ainda tem algum lance antes de jogar um lance de espera.

## Exercícios

```exercise
id: torre-mate-1
fen: 4k3/8/4K3/8/8/8/8/R7 w - - 0 1
prompt: Os reis estão frente a frente. Dê mate em um lance.
goal: mate
solution: Ra8#
answer: A torre dá xeque pela oitava fileira e o rei branco, em e6, cobre d7, e7 e f7. O rei preto não tem saída.
```

```exercise
id: torre-mate-2
fen: 3k4/8/4K3/8/8/8/8/7R w - - 0 1
prompt: Dê mate em dois lances. Comece com um lance de espera.
goal: mate
solution: Rc1 Ke8 Rc8#
answer: A torre corta a coluna c. O rei preto só pode ir para e8, de frente para o rei branco, e então a torre dá mate na oitava fileira.
```

```exercise
id: torre-mate-3
fen: 4k3/8/3K4/8/8/8/8/7R w - - 0 1
prompt: Dê mate em dois lances.
goal: mate
solution: Rf1 Kd8 Rf8#
answer: A torre corta a coluna f, e o rei preto só pode ir para d8, de frente para o rei branco. Aí vem o xeque-mate pela oitava fileira.
```

## Resumo

1. Rei e torre sempre ganham contra o rei sozinho, mas a torre precisa da ajuda do rei.
2. A técnica: a torre corta, o rei se aproxima e, com os reis em oposição, a torre empurra o rei adversário uma fileira.
3. Quando o rei adversário não está na posição certa, use um lance de espera com a torre.
