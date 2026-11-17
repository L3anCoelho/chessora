---
id: cravada
title: Cravada
route: /aprender/taticas/cravada
summary: Quando uma peça não pode sair da frente de outra mais valiosa.
---

## Ideia central

Uma peça está **cravada** quando não pode sair do lugar sem expor uma peça mais valiosa que está atrás dela. Só as peças que andam em linha reta (bispo, torre e dama) conseguem cravar.

Existem dois tipos de cravada:

- **Absoluta:** a peça de trás é o rei. Mover a peça cravada seria ilegal, porque deixaria o próprio rei em xeque.
- **Relativa:** a peça de trás é outra peça, como a dama. Mover a peça cravada é permitido, mas custa a peça de trás.

```board
fen: 4k3/8/2n5/1B6/8/8/8/4K3 b - - 0 1
caption: Cravada absoluta. O cavalo de c6 está na frente do rei de e8, na diagonal do bispo de b5. Ele não tem nenhum lance legal.
highlights: b5 c6 e8
arrows: b5-e8
```

## Por que importa

Uma peça cravada é uma peça que não defende nada e não foge de nada. Isso cria dois tipos de oportunidade:

1. **Atacar a peça cravada.** Se ela não pode fugir, ataque-a de novo, de preferência com uma peça mais barata, como um peão. Ela vai cair.
2. **Cravar para ganhar material.** Cravar uma peça valiosa contra o rei, por exemplo a dama, pode ganhá-la por uma peça mais barata.

Do lado da defesa, é importante saber que uma cravada relativa pode ser quebrada. A peça cravada pode se mover se o lance trouxer algo maior do que a peça que fica exposta. Muitos jogadores perdem partidas por confiar demais em cravadas relativas.

## Passo a passo: atacar a peça cravada

Quando uma peça está cravada, o plano mais simples é atacá-la com um peão.

```steps
fen: 4k3/pp3ppp/2n5/1B6/3P4/8/PP3PPP/4K3 w - - 0 1
d5 :: O peão ataca o cavalo de c6, que está cravado pelo bispo de b5 e não pode fugir.
Kd7 :: As pretas tiram o rei da diagonal, mas é tarde: o cavalo continua atacado.
dxc6+ :: O peão captura o cavalo com xeque.
bxc6 :: As pretas recuperam um peão, mas perderam um cavalo.
diagram: As brancas ganharam um cavalo por um peão: lucro de 2 pontos.
```

## Passo a passo: quando a cravada é só relativa

O exemplo mais famoso de uma cravada relativa que não segurou nada é o **Mate de Legal**, que tem esse nome por causa de um jogador francês do século XVIII. As pretas acham que o cavalo de f3 está cravado na dama. Não está.

```steps
moves: 1.e4 e5 2.Nf3 d6 3.Bc4
Bg4 :: O bispo crava o cavalo de f3 na dama de d1. Mas é uma cravada relativa.
Nc3 :: As brancas se desenvolvem.
g6? :: Um lance lento. As pretas não percebem o perigo em f7.
Nxe5! :: O cavalo "cravado" sai e entrega a dama.
Bxd1?? :: As pretas capturam a dama. Era preciso recapturar o cavalo com [[5...dxe5]], perdendo só um peão.
Bxf7+ :: Xeque. O rei não pode capturar o bispo, que está protegido pelo cavalo de e5.
Ke7 :: É a única casa do rei.
Nd5# :: Xeque-mate com três peças menores, depois de entregar a dama.
diagram: O Mate de Legal. O rei de e7 é atacado pelo cavalo de d5 e não tem casa livre. | highlights=e7 d5 f7 e5
```

## Erros comuns

- **Confiar numa cravada relativa.** Se a peça de trás não é o rei, a peça cravada ainda pode se mover. Antes de contar com a cravada, veja o que acontece se ela sair.
- **Deixar a peça cravada sem defesa extra.** Do lado da defesa, se sua peça está cravada, ela vai ser atacada de novo. Defenda-a mais uma vez ou desfaça a cravada (por exemplo, tirando o rei da linha ou colocando outra peça no meio).
- **Capturar a peça cravada cedo demais.** A peça cravada não vai fugir. Às vezes é melhor primeiro atacá-la com um peão ou trazer mais uma peça, e só depois capturar.
- **Esquecer que a cravada funciona dos dois lados.** Uma torre ou um bispo seu na mesma linha que seu rei pode ser cravado pelo adversário. Fique atento às colunas e diagonais que levam ao seu rei.

## Exercícios

```exercise
id: cravada-cavalo
fen: 4k3/8/2n5/8/8/8/8/4KB2 w - - 0 1
prompt: Crave o cavalo preto contra o rei.
goal: move
solution: Bb5
answer: De b5, o bispo crava o cavalo de c6 no rei de e8. O cavalo não pode mais se mover.
```

```exercise
id: cravada-peao
fen: 4k3/pp3ppp/2n5/1B6/3P4/8/PP3PPP/4K3 w - - 0 1
prompt: O cavalo preto está cravado. Ataque-o com a peça mais barata possível.
goal: move
solution: d5
answer: O peão ataca o cavalo cravado, que não pode fugir. As brancas ganham uma peça por um peão. (Outros lances também mantêm a vantagem, porque o cavalo não vai a lugar nenhum, mas [[d5]] resolve na hora.)
```

```exercise
id: cravada-dama
fen: 4k3/4q3/8/8/8/8/5KPP/3R4 w - - 0 1
prompt: A dama e o rei pretos estão na mesma coluna. Ganhe a dama.
goal: best
solution: Re1
answer: A torre crava a dama no rei de e8. A dama não pode sair da coluna e, se capturar a torre, o rei de f2 recaptura. As brancas trocam uma torre (5 pontos) pela dama (9 pontos).
```

```exercise
id: cravada-legal
moves: 1.e4 e5 2.Nf3 d6 3.Bc4 Bg4 4.Nc3 g6 5.Nxe5 Bxd1 6.Bxf7+ Ke7
prompt: O final do Mate de Legal. Dê xeque-mate em um lance.
goal: mate
solution: Nd5#
answer: O cavalo de d5 dá xeque. O rei não pode capturar o bispo de f7, protegido pelo cavalo de e5. As casas d6, d8 e f8 estão ocupadas por peças pretas, d7 é atacada pelo cavalo de e5, e6 e e8 pelo bispo de f7, e f6 pelo cavalo de d5.
```

## Resumo

1. Uma peça cravada não pode sair da frente de uma peça mais valiosa; se a peça de trás é o rei, o lance é ilegal.
2. Para aproveitar uma cravada, ataque a peça cravada de novo, de preferência com um peão.
3. Uma cravada relativa pode ser quebrada: antes de confiar nela, veja o que acontece se a peça cravada se mover.
