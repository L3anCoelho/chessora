---
id: ataque-duplo
title: Ataque duplo
route: /aprender/taticas/ataque-duplo
summary: Duas ameaças num lance só, muitas vezes com a dama.
---

## Ideia central

Um ataque duplo é um lance que cria **duas ameaças ao mesmo tempo**. O adversário só tem um lance para responder e não consegue resolver as duas. O garfo, que você viu no capítulo anterior, é um tipo de ataque duplo. Mas as ameaças não precisam ser só capturas: uma delas pode ser uma **ameaça de xeque-mate**.

A peça que mais cria ataques duplos é a **dama**, porque anda em todas as direções. Uma dama no centro do tabuleiro pode atacar oito linhas de uma vez.

```board
fen: rn3rk1/p1p2pp1/8/8/4Q3/3B4/PPP2PPP/6K1 b - - 0 1
caption: A dama de e4 ameaça duas coisas: capturar a torre de a8 e dar mate em h7, apoiada pelo bispo de d3.
highlights: a8 h7
arrows: e4-a8 e4-h7
```

## Por que importa

Contra uma ameaça só, quase sempre existe uma defesa. Contra duas, muitas vezes não. É por isso que ataques duplos decidem tantas partidas. Eles aparecem principalmente quando o adversário tem:

- **peças soltas**, sem defesa (o assunto do próximo capítulo);
- **um rei mal protegido**, que pode levar mate;
- **peças alinhadas** numa mesma coluna, fileira ou diagonal.

Ao procurar um ataque duplo, pergunte: "existe uma casa de onde minha dama (ou torre, ou bispo) ataque duas coisas?" E inclua o rei adversário entre os alvos: um xeque é a ameaça mais forte que existe.

## Passo a passo: ameaça de mate e captura

```steps
fen: rn3rk1/p1p2pp1/8/8/8/3B4/PPP1QPPP/6K1 w - - 0 1
Qe4 :: A dama vai para a grande diagonal. Duas ameaças: Dh7#, com o apoio do bispo de d3, e Dxa8.
g6 :: As pretas impedem o mate, abrindo uma casa para o rei e fechando a diagonal até h7.
Qxa8 :: Mas a torre de a8 cai. As brancas ganham uma torre.
diagram: A dama capturou a torre. As pretas só conseguiram cuidar de uma das duas ameaças. | highlights=a8
```

## Passo a passo: xeque e captura

O ataque duplo mais forte é aquele que começa com xeque: o adversário é obrigado a cuidar do rei e não tem tempo para salvar a outra peça.

```steps
fen: r5k1/p5pp/8/8/8/2b5/5PPP/3Q2K1 w - - 0 1
Qd5+ :: A dama dá xeque no rei de g8 pela diagonal e, pela outra diagonal, ataca a torre de a8.
Kf8 :: O rei sai do xeque.
Qxa8+ :: A dama captura a torre, ainda com xeque.
```

## Erros comuns

- **Procurar só capturas.** Muitos ataques duplos começam com um lance que não captura nada, como [[Qe4]] no exemplo acima. Olhe também os lances que criam ameaças.
- **Esquecer a ameaça de mate como segundo alvo.** Uma ameaça de mate obriga o adversário a se defender. Combinada com um ataque a uma peça, ela quase sempre ganha material.
- **Deixar peças alinhadas com o rei.** Do lado da defesa, se seu rei e uma peça solta estão na mesma diagonal ou fileira, a dama adversária pode atacar os dois com um xeque.
- **Atacar duas peças que se defendem.** Um ataque duplo só ganha material se pelo menos uma das peças atacadas estiver sem defesa suficiente. Confira antes de jogar.

## Exercícios

```exercise
id: duplo-mate-torre
fen: rn3rk1/p1p2pp1/8/8/8/3B4/PPP1QPPP/6K1 w - - 0 1
prompt: Crie duas ameaças ao mesmo tempo: uma de mate e uma de captura.
goal: best
solution: Qe4
answer: A dama em e4 ameaça [[Qh7#]], com apoio do bispo de d3, e ameaça capturar a torre de a8. As pretas não conseguem impedir as duas coisas.
```

```exercise
id: duplo-xeque-torre
fen: r5k1/p5pp/8/8/8/2b5/5PPP/3Q2K1 w - - 0 1
prompt: Dê um xeque que também ataque uma peça preta.
goal: best
solution: Qd5+ Kf8 Qxa8+
answer: A dama dá xeque de d5 e ao mesmo tempo ataca a torre de a8. O rei sai do xeque e a torre cai.
```

```exercise
id: duplo-pretas
fen: rnbqkbnr/pp2pppp/2p5/4N3/8/3P4/PPP2PPP/RNBQKB1R b KQkq - 0 1
prompt: O cavalo branco de e5 está sem defesa. Encontre o ataque duplo das pretas.
goal: best
solution: Qa5+
answer: A dama dá xeque no rei de e1 pela diagonal e ataca o cavalo de e5 pela fileira. As brancas bloqueiam o xeque e as pretas capturam o cavalo.
```

## Resumo

1. Um ataque duplo cria duas ameaças num lance; o adversário só consegue responder a uma.
2. A dama é a melhor peça para ataques duplos, e a ameaça de mate é um dos alvos mais fortes.
3. Comece procurando xeques: um ataque duplo com xeque não dá tempo de defesa.
