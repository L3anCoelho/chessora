---
id: gambito-da-dama
title: Gambito da Dama
route: /aprender/aberturas/gambito-da-dama
summary: 1.d4 d5 2.c4 — oferecer um peão lateral para ganhar o centro.
---

## Ideia central

O Gambito da Dama começa com [[1.d4 d5 2.c4]]. As brancas oferecem o peão de c4 para tirar o peão de d5 do centro. Se as pretas capturarem, as brancas ficam livres para jogar e4 e dominar o centro com dois peões.

```board
moves: 1.d4 d5 2.c4
caption: O Gambito da Dama. O peão de c4 ataca d5, o único peão central das pretas.
highlights: d5
arrows: c4-d5
```

Apesar do nome, não é um gambito de verdade: se as pretas capturarem e tentarem segurar o peão a mais, quase sempre o perdem de volta. Por isso, aceitar ou recusar é uma questão de estilo, não de ganhar material.

## Por que importa

O Gambito da Dama é a abertura mais importante depois de [[1.d4]]. Ele ensina um tipo de jogo diferente das aberturas com [[1.e4]]: mais posicional, com menos armadilhas rápidas e mais luta por casas. Quem joga [[1.d4]] com as brancas usa o Gambito da Dama na maioria das partidas. Quem joga com as pretas precisa de uma boa resposta contra ele.

## Passo a passo: o Gambito da Dama Recusado

A resposta mais clássica é recusar com [[2...e6]], mantendo o peão de d5 apoiado.

```steps
d4 :: As brancas ocupam o centro com o peão da dama.
d5 :: As pretas fazem o mesmo.
c4 :: O Gambito: as brancas atacam d5 com um peão lateral.
e6 :: O Gambito da Dama Recusado. As pretas apoiam d5 e abrem o bispo de f8. O preço é fechar o bispo de c8.
Nc3 :: Mais pressão sobre d5.
Nf6 :: O cavalo também defende d5.
Bg5 :: O bispo crava o cavalo de f6 na dama: se o cavalo sair, a dama de d8 fica atacada.
Be7 :: As pretas desfazem a cravada colocando o bispo entre o cavalo e a dama.
e3 :: Abre o bispo de f1 e reforça d4.
O-O :: As pretas rocam cedo.
Nf3 :: Desenvolvimento.
Nbd7 :: O cavalo vai para d7, de onde pode apoiar ...c5 ou ...e5.
Rc1 :: A torre vai para a coluna c, que pode se abrir depois de uma troca em d5 ou c4.
c6 :: As pretas reforçam d5 e preparam a troca em c4.
Bd3 :: O bispo se desenvolve.
dxc4 :: Agora que o bispo saiu de f1, as pretas capturam: as brancas gastam mais um lance para recapturar.
Bxc4 :: O bispo recaptura.
Nd5 :: A manobra de libertação associada a Capablanca: o cavalo oferece trocas, e cada troca dá mais espaço às pretas.
diagram: O cavalo de d5 ataca o cavalo de c3, e o bispo de e7 agora encara o bispo de g5. As pretas querem trocar peças para soltar a posição. | highlights=d5 | arrows=d5-c3 e7-g5
Bxe7 :: As brancas trocam os bispos.
Qxe7 :: A dama recaptura.
O-O :: As brancas rocam.
Nxc3 :: Mais uma troca.
Rxc3 :: A torre recaptura.
e5 :: Finalmente o avanço libertador: o bispo de c8 ganha vida.
diagram: Com ...e5, as pretas resolveram o problema do bispo de c8 e têm uma posição sólida. | highlights=e5 c8
```

O plano das brancas no Gambito Recusado é usar o espaço e, às vezes, trocar em d5 para atacar o lado da dama com os peões (o "ataque das minorias"). O plano das pretas é sempre o mesmo: soltar o bispo de c8 com ...e5 ou ...c5.

### O Gambito Aceito: 2…dxc4

As pretas também podem aceitar o peão. A ideia não é ficar com ele, e sim usar o tempo que as brancas gastam para recuperá-lo.

```steps
moves: 1.d4 d5 2.c4
dxc4 :: As pretas aceitam o gambito.
Nf3 :: As brancas não têm pressa. O cavalo impede ...e5.
Nf6 :: Desenvolvimento.
e3 :: Abre o bispo de f1, que vai recuperar o peão de c4.
e6 :: As pretas abrem o bispo de f8.
Bxc4 :: As brancas recuperam o peão.
c5 :: As pretas atacam o centro branco, como sempre nessa abertura.
O-O :: As brancas rocam.
a6 :: Prepara ...b5, ganhando espaço no lado da dama com ganho de tempo sobre o bispo.
diagram: Os dois lados têm desenvolvimento normal e o material é igual. As brancas têm um pouco mais de centro; as pretas, jogo livre. | highlights=c4 c5
```

### Por que as pretas não devem segurar o peão

Se as pretas tentam manter o peão a mais de c4 com ...b5, as brancas atacam a corrente de peões e podem ganhar material.

```steps
moves: 1.d4 d5 2.c4 dxc4
e3 :: As brancas preparam Bxc4.
b5?! :: As pretas defendem c4 com outro peão. É um lance duvidoso: o peão de b5 vira alvo.
a4 :: As brancas atacam o peão que defende c4.
c6 :: As pretas reforçam b5.
axb5 :: As brancas trocam.
cxb5?? :: As pretas recapturam, mas abrem a grande diagonal até a torre de a8.
Qf3! :: A dama ataca a torre de a8. Se as pretas bloquearem com ...Cc6, a dama captura o cavalo com xeque. As brancas ganham material.
diagram: A dama de f3 ataca a torre de a8 pela diagonal longa, e as pretas não conseguem defender bem. | highlights=a8 | arrows=f3-a8
```

### Uma armadilha das pretas: a Armadilha do Elefante

No Gambito Recusado, existe uma armadilha famosa contra as brancas que tentam ganhar um peão em d5.

```steps
moves: 1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5
Nbd7 :: O cavalo vai para d7. Parece que o cavalo de f6 continua cravado.
cxd5 :: As brancas trocam em d5.
exd5 :: As pretas recapturam.
Nxd5?? :: As brancas acham que o cavalo de f6 está cravado e não pode recapturar.
Nxd5! :: Mas pode! O cavalo de f6 captura e entrega a dama.
Bxd8 :: As brancas ficam com a dama.
Bb4+ :: O bispo dá xeque. A única forma de bloquear é com a dama.
Qd2 :: A dama bloqueia.
Bxd2+ :: O bispo captura a dama.
Kxd2 :: O rei recaptura.
Kxd8 :: As pretas recuperam a dama. No saldo, as pretas ganharam um cavalo.
diagram: Fim da armadilha: as pretas ficaram com uma peça a mais. A cravada do bispo de g5 era só aparente. | highlights=d8
```

## Erros comuns

- **Segurar o peão do gambito a qualquer custo.** Com as pretas, aceitar o gambito é bom; tentar ficar com o peão é que costuma dar errado.
- **Esquecer o bispo de c8.** No Gambito Recusado, o bispo de c8 fica preso atrás de e6. Toda a estratégia das pretas é soltá-lo com ...e5 ou ...c5.
- **Confiar numa cravada que não é absoluta.** O cavalo de f6 cravado na dama ainda pode se mover se o lance trouxer uma vantagem maior. Uma cravada só é absoluta quando a peça de trás é o rei.
- **Pressa para jogar e4 com as brancas.** O avanço e4 é ótimo quando bem preparado. Se for jogado cedo, o peão pode ficar fraco e ser capturado.

## Exercícios

```exercise
id: gd-lance
moves: 1.d4 d5
prompt: Jogue o lance que define o Gambito da Dama.
goal: move
solution: c4
answer: O peão de c4 ataca o peão de d5. Se as pretas capturarem, as brancas ficam livres para jogar e4 e dominar o centro.
```

```exercise
id: gd-libertacao
moves: 1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O 6.Nf3 Nbd7 7.Rc1 c6 8.Bd3 dxc4 9.Bxc4
prompt: As pretas querem trocar peças para ganhar espaço. Qual é a manobra típica?
goal: move
solution: Nd5
answer: O cavalo vai para d5, ataca o cavalo de c3 e deixa o bispo de e7 frente a frente com o bispo de g5, oferecendo duas trocas. Depois das trocas, as pretas preparam ...e5 e soltam o bispo de c8.
```

```exercise
id: gd-diagonal
moves: 1.d4 d5 2.c4 dxc4 3.e3 b5 4.a4 c6 5.axb5 cxb5
prompt: As pretas acabaram de recapturar em b5. Encontre o golpe das brancas.
goal: best
solution: Qf3
answer: A dama ataca a torre de a8 pela diagonal longa, que ficou aberta depois das trocas. As pretas não conseguem defender a torre de forma confortável e perdem material.
```

```exercise
id: gd-elefante
moves: 1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Nbd7 5.cxd5 exd5 6.Nxd5
prompt: As brancas capturaram um peão em d5. Arme a Armadilha do Elefante.
goal: best
solution: Nxd5
answer: O cavalo de f6 captura em d5 mesmo cravado. Se as brancas tomarem a dama com [[7.Bxd8]], vem [[7...Bb4+]], a dama branca precisa bloquear em d2 e as pretas recuperam a dama, ficando com uma peça a mais.
```

## Resumo

1. No Gambito da Dama ([[1.d4 d5 2.c4]]), as brancas oferecem um peão lateral para desviar o peão central das pretas.
2. Com [[2...e6]], as pretas mantêm o centro, mas precisam soltar o bispo de c8 com ...e5 ou ...c5, de preferência depois de trocar peças.
3. Aceitar o gambito é bom; tentar segurar o peão a mais é que costuma custar caro.
