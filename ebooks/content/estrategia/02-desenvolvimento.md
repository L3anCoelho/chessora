---
id: desenvolvimento
title: Desenvolvimento
route: /aprender/estrategia/desenvolvimento
summary: Colocar as peças em jogo na ordem certa, sem perder tempo.
---

## Ideia central

**Desenvolver** é tirar as peças da posição inicial e colocá-las em casas onde elas trabalham. No começo da partida, cada lance conta: quem coloca mais peças em jogo, mais rápido, costuma ficar com a iniciativa.

Em xadrez, chamamos cada lance de um **tempo**. "Ganhar um tempo" é desenvolver uma peça e, ao mesmo tempo, obrigar o adversário a gastar um lance para se defender, por exemplo atacando a dama dele.

```board
moves: 1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3 Nf6 5.d3 d6 6.O-O O-O
caption: Desenvolvimento harmonioso dos dois lados: cavalos e bispos em jogo, reis rocados e um peão em cada casa central.
```

## Por que importa

Uma peça que ainda está na primeira fileira não ataca nem defende nada. Se você tem quatro peças em jogo e o adversário tem duas, você está, na prática, jogando com mais material naquela região do tabuleiro. Ataques bem-sucedidos quase sempre acontecem quando um lado está mais desenvolvido.

As regras práticas do desenvolvimento:

- **Cavalos antes dos bispos**, em geral: as melhores casas dos cavalos (f3, c3, f6, c6) são óbvias; as dos bispos dependem da estrutura de peões.
- **Não mova a mesma peça duas vezes** sem motivo concreto.
- **Não tire a dama cedo**: ela pode ser atacada por peças menores, e cada fuga é um tempo perdido.
- **Roque cedo** e **ligue as torres**: o desenvolvimento termina quando as duas torres se enxergam na primeira fileira.

## Passo a passo: ganhando tempo contra a dama

Na Defesa Escandinava, a dama preta sai cedo. Veja como as brancas usam isso para se desenvolver com ganho de tempo.

```steps
e4 :: Centro.
d5 :: A Escandinava: as pretas atacam e4 na hora.
exd5 :: As brancas capturam.
Qxd5 :: A dama recaptura e vai para o centro, cedo.
Nc3! :: O cavalo se desenvolve atacando a dama. As brancas ganham um tempo: a dama precisa sair de novo.
Qa5 :: A dama foge para a5, de onde mira o cavalo de c3. Quando o peão de d2 sair, o cavalo ficará cravado contra o rei.
d4 :: As brancas ocupam o centro e abrem o bispo de c1.
Nf6 :: As pretas desenvolvem.
Nf3 :: Mais uma peça branca em jogo.
c6 :: As pretas abrem uma casa de fuga para a dama em c7 e controlam d5.
Bc4 :: O bispo vai para uma boa diagonal.
Bf5 :: O bispo das pretas também sai, antes de o peão de e6 fechá-lo.
Bd2 :: O bispo desfaz a cravada do cavalo de c3 e prepara ameaças contra a dama, como uma descoberta do cavalo.
e6 :: As pretas abrem o bispo de f8 e preparam o roque.
diagram: As brancas têm quatro peças desenvolvidas e logo vão rocar. As pretas estão bem, mas gastaram dois lances com a dama. | highlights=c3 f3 c4 d2 a5
```

A posição é jogável para as pretas, e a Escandinava é uma defesa respeitada. Mas o exemplo mostra o preço de tirar a dama cedo: as brancas desenvolveram peças **com ganho de tempo** enquanto a dama fugia.

## Erros comuns

- **Lances de peão demais na abertura.** Dois ou três lances de peão são suficientes para abrir caminho às peças. O resto da abertura é para desenvolver.
- **Desenvolver para casas ruins.** Um cavalo em a3 ou h3 desenvolve, mas controla pouco. Prefira casas que miram o centro.
- **Perseguir com uma peça só.** Atacar a mesma peça várias vezes com a mesma peça sua, enquanto o resto fica em casa, quase nunca funciona.
- **Esquecer as torres.** Muitos jogadores desenvolvem cavalos e bispos e esquecem que as torres também precisam entrar em jogo, de preferência em colunas abertas.

## Exercícios

```exercise
id: desenv-primeiro
moves: 1.e4 e5
prompt: Desenvolva uma peça ameaçando algo ao mesmo tempo.
goal: move
solution: Nf3
answer: O cavalo de f3 se desenvolve e ataca o peão de e5, obrigando as pretas a defendê-lo. É o lance mais jogado nesta posição.
```

```exercise
id: desenv-tempo
moves: 1.e4 d5 2.exd5 Qxd5
prompt: A dama preta saiu cedo. Desenvolva uma peça com ganho de tempo.
goal: move
solution: Nc3
answer: O cavalo de c3 se desenvolve e ataca a dama, que precisa fugir. As brancas colocam uma peça em jogo e as pretas gastam mais um lance com a dama.
```

```exercise
id: desenv-roque
moves: 1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3 Nf6 5.d3 d6 6.O-O
prompt: As pretas já desenvolveram cavalos e bispos. Qual é o próximo passo natural?
goal: move
solution: O-O
answer: O roque coloca o rei em segurança e aproxima a torre do centro. Lances como [[6...a6]] ou [[6...a5]] também são jogáveis, mas o roque completa o desenvolvimento.
```

## Resumo

1. Desenvolver é colocar as peças em casas ativas; quem se desenvolve mais rápido costuma ter a iniciativa.
2. Ganhar tempo é desenvolver uma peça atacando algo, obrigando o adversário a responder.
3. Cavalos antes dos bispos, não mova a mesma peça duas vezes, não tire a dama cedo e roque cedo.
