---
id: descoberta
title: Ataque descoberto
route: /aprender/taticas/descoberta
summary: Mover uma peça para liberar o ataque de outra que estava atrás dela.
---

## Ideia central

Num ataque descoberto, duas peças do mesmo lado estão alinhadas: uma peça de longo alcance (dama, torre ou bispo) atrás, e outra peça na frente, bloqueando a linha. Quando a peça da frente se move, a linha se abre e a peça de trás passa a atacar. O lance cria **dois ataques**: o da peça que se moveu e o da peça que ficou para trás.

Quando a linha que se abre dá xeque no rei, chamamos de **xeque descoberto**. É uma das armas mais fortes do xadrez, porque a peça que se moveu pode ir para qualquer lugar, até para uma casa atacada, e o adversário precisa primeiro cuidar do rei.

```board
fen: 3q2k1/5ppp/8/8/8/3B4/5PPP/3R2K1 w - - 0 1
caption: A torre de d1 e a dama preta de d8 estão na mesma coluna, mas o bispo de d3 está no meio. Se o bispo sair, a torre ataca a dama.
highlights: d3 d8
arrows: d1-d8
```

## Por que importa

O ataque descoberto é perigoso porque é difícil de ver. O adversário costuma olhar para a peça que se move e esquecer da peça parada atrás dela. Do seu lado, é uma tática que você pode **preparar**: alinhar uma torre ou uma dama atrás de uma peça sua, na direção do rei ou da dama adversária, e esperar o momento certo.

Para encontrar ataques descobertos, procure **linhas abertas entre uma peça sua de longo alcance e uma peça valiosa do adversário**, com uma peça sua no meio.

## Passo a passo: uma armadilha na Defesa Petrov

Na Defesa Petrov ([[1.e4 e5 2.Nf3 Nf6]]), muitos iniciantes copiam o lance das brancas e capturam o peão de e4. As brancas respondem com uma ideia de xeque descoberto.

```steps
moves: 1.e4 e5 2.Nf3 Nf6
Nxe5 :: As brancas capturam o peão de e5.
Nxe4?! :: As pretas copiam e capturam o peão de e4. Parece justo, mas é uma imprecisão.
Qe2 :: A dama ataca o cavalo de e4 e se alinha na coluna e, com o rei preto ao fundo e dois cavalos no meio.
Nf6?? :: O cavalo foge, mas deixa a coluna e aberta até o rei, só com o cavalo branco de e5 no meio.
Nc6+ :: Xeque descoberto: o cavalo sai de e5 e a dama de e2 dá xeque no rei de e8. Ao mesmo tempo, o cavalo de c6 ataca a dama de d8.
diagram: O xeque é da dama de e2; o ataque à dama preta é do cavalo de c6. As pretas precisam cuidar do rei e perdem a dama. | highlights=c6 d8 e8 | arrows=e2-e8 c6-d8
```

O certo para as pretas, depois de [[4.Qe2]], é [[4...Qe7]]: a dama preta bloqueia a coluna e defende o cavalo de e4. E, antes disso, em vez de [[3...Nxe4]], o lance correto é [[3...d6]], expulsando primeiro o cavalo de e5.

## Passo a passo: o bispo que sai com xeque

```steps
fen: 3q2k1/5ppp/8/8/8/3B4/5PPP/3R2K1 w - - 0 1
Bxh7+ :: O bispo captura um peão com xeque e, ao sair de d3, abre a coluna d para a torre.
Kf8 :: O rei sai do xeque. Capturar o bispo com [[Kxh7]] também não salvaria nada: a dama continua atacada pela torre.
Rxd8+ :: A torre captura a dama, com xeque.
```

## Erros comuns

- **Olhar só para a peça que se move.** Depois de cada lance do adversário, pergunte: "que linha ele abriu?" A peça de trás pode ser a verdadeira ameaça.
- **Alinhar o rei ou a dama com uma peça adversária de longo alcance.** Se uma torre inimiga está na mesma coluna que sua dama, mesmo com peças no meio, fique atento.
- **Desperdiçar o xeque descoberto.** Num xeque descoberto, a peça que se move está livre: use-a para capturar algo ou atacar uma segunda peça. Mover para qualquer lugar é desperdiçar o golpe.
- **Copiar os lances do adversário.** Na Petrov, [[3...Nxe4]] parece simétrico a [[3.Nxe5]], mas as posições não são iguais. Cada lance precisa ser verificado.

## Exercícios

```exercise
id: descoberta-petrov
moves: 1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nxe4 4.Qe2 Nf6
prompt: As pretas fugiram com o cavalo. Ganhe a dama preta com um xeque descoberto.
goal: best
solution: Nc6+
answer: O cavalo sai de e5 e abre a coluna e: a dama de e2 dá xeque no rei de e8. O cavalo de c6 ataca a dama de d8. As pretas cuidam do rei e as brancas capturam a dama.
```

```exercise
id: descoberta-bispo
fen: 3q2k1/5ppp/8/8/8/3B4/5PPP/3R2K1 w - - 0 1
prompt: A torre está atrás do bispo, na coluna da dama preta. Ganhe a dama.
goal: best
solution: Bxh7+ Kf8 Rxd8+
answer: O bispo captura em h7 com xeque e abre a coluna d. As pretas cuidam do rei e a torre captura a dama.
```

```exercise
id: descoberta-pretas
fen: 4r1k1/5ppp/8/8/4n3/8/4QPPP/7K b - - 0 1
prompt: O cavalo de e4 está entre a torre preta e a dama branca. Encontre o golpe das pretas.
goal: best
solution: Ng3+
answer: O cavalo dá xeque no rei de h1 e, ao sair de e4, abre a coluna e para a torre atacar a dama. Qualquer que seja a resposta das brancas ao xeque, por exemplo [[2.hxg3]], vem [[2...Rxe2]].
```

## Resumo

1. No ataque descoberto, uma peça sai da frente e libera o ataque da peça de longo alcance que estava atrás.
2. O xeque descoberto é o mais forte: a peça que se move fica livre para capturar ou atacar outra coisa.
3. Depois de cada lance do adversário, pergunte que linha se abriu; e evite alinhar seu rei ou sua dama com as torres, bispos e dama inimigos.
