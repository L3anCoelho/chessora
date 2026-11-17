---
id: seguranca-do-rei
title: Segurança do rei
route: /aprender/estrategia/seguranca-do-rei
summary: Rocar no momento certo, manter o abrigo de peões e criar uma saída para o rei.
---

## Ideia central

O rei é a única peça que não pode ser perdida. No começo e no meio da partida, com muitas peças no tabuleiro, ele precisa de **abrigo**: ficar atrás de uma barreira de peões, longe das colunas abertas, normalmente depois do roque.

Três hábitos resolvem a maioria dos problemas:

1. **Roque cedo**, antes que o centro se abra.
2. **Não mexa nos peões da frente do rei** sem motivo: cada peão que avança abre uma linha de ataque.
3. **Crie uma saída** para o rei (com um lance como [[h3]]) quando houver risco de mate na última fileira.

```board
fen: r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 w - - 0 1
caption: Reis rocados atrás de três peões intactos (f, g e h). É o abrigo ideal no meio-jogo.
highlights: f2 g2 h2 f7 g7 h7
```

## Por que importa

Um rei inseguro muda tudo: o adversário pode entregar material para atacá-lo, e você passa a jogar só na defesa. Muitas partidas entre iniciantes acabam em mate porque um lado esqueceu de rocar ou enfraqueceu o roque com lances de peão.

A segurança do rei também decide planos. Quando o rei adversário está no centro e o centro está aberto, vale a pena abrir ainda mais o jogo, até com sacrifícios. Quando o seu rei está exposto, a prioridade é protegê-lo, mesmo que custe um peão.

## Passo a passo: o castigo de um peão mal movido

Na Defesa Damiano, as pretas defendem o peão de e5 com [[2...f6]]. O lance enfraquece a diagonal do rei, e as brancas mostram por quê.

```steps
moves: 1.e4 e5 2.Nf3
f6? :: O peão defende e5, mas abre a diagonal h5-e8 e tira a casa f6 do cavalo.
Nxe5! :: As brancas entregam o cavalo para abrir caminho até o rei.
fxe5? :: As pretas aceitam. O melhor era [[3...Qe7]], com uma posição difícil, mas sem perder.
Qh5+ :: A dama entra pela diagonal enfraquecida.
Ke7 :: Se [[4...g6]], vem [[5.Qxe5+]], atacando o rei e a torre de h8 ao mesmo tempo.
Qxe5+ :: A dama recupera o material com xeque.
Kf7 :: O rei tenta voltar para casa.
Bc4+ :: Mais uma peça entra no ataque, com xeque.
d5 :: As pretas bloqueiam com um peão.
Bxd5+ :: E o bispo o captura, com xeque.
Kg6 :: O rei vai para a frente dos peões, totalmente exposto.
diagram: O rei preto está no meio do tabuleiro, cercado de peças brancas. As brancas têm três peões pelo cavalo e um ataque muito forte. | highlights=g6
```

Tudo começou com um lance de peão na frente do rei. A lição vale para todas as partidas: **antes de avançar um peão do lado do rei, pergunte que linha ele abre**.

## Erros comuns

- **Adiar o roque.** "Vou rocar depois" é uma das frases mais perigosas do xadrez. Se o centro se abrir com o rei em e1 ou e8, ele vira alvo.
- **Avançar os peões do roque sem motivo.** Lances como [[g4]] (ou [[g5]], com as pretas) com o rei rocado do mesmo lado abrem casas para as peças inimigas.
- **Esquecer a última fileira.** Com o rei rocado e os três peões na frente, uma torre ou a dama adversária na primeira fileira dá mate. Um lance de saída, como [[h3]], resolve o problema com antecedência.
- **Tirar as peças de defesa.** O cavalo de f3 (ou f6) é o melhor defensor do roque. Pense duas vezes antes de trocá-lo ou afastá-lo.

## Exercícios

```exercise
id: rei-damiano
moves: 1.e4 e5 2.Nf3 f6
prompt: As pretas enfraqueceram a diagonal do rei. Puna o lance.
goal: move
solution: Nxe5
answer: O cavalo captura em e5. Se as pretas recapturarem com [[3...fxe5]], vem [[4.Qh5+]] e o rei fica exposto. A melhor defesa, [[3...Qe7]], ainda deixa as brancas com vantagem. Um lance calmo como [[3.d4]] também é bom, mas [[3.Nxe5]] é o castigo mais direto.
```

```exercise
id: rei-diagonal
moves: 1.e4 e5 2.Nf3 f6 3.Nxe5 fxe5
prompt: As pretas aceitaram o cavalo. Ataque o rei.
goal: best
solution: Qh5+
answer: A dama dá xeque pela diagonal aberta. Se [[4...g6]], [[5.Qxe5+]] ataca o rei e a torre de h8 ao mesmo tempo; se [[4...Ke7]], [[5.Qxe5+]] recupera o cavalo e o ataque continua.
```

```exercise
id: rei-saida
fen: 4r1k1/pp3ppp/8/8/8/8/PP3PPP/3R2K1 w - - 0 1
prompt: A torre preta pode ameaçar a sua primeira fileira. Faça uma casa de fuga para o rei antes de qualquer coisa.
goal: move
solution: h3
answer: O peão de h3 abre a casa h2 para o rei e elimina para sempre o risco de mate na primeira fileira. Agora a torre de d1 fica livre para ir à sétima fileira. [[Kf1]] também resolve, aproximando o rei do centro.
```

## Resumo

1. Roque cedo e mantenha os peões da frente do rei no lugar enquanto houver muitas peças no tabuleiro.
2. Cada peão que avança na frente do rei abre uma linha de ataque; o adversário pode entregar material para aproveitá-la.
3. Crie uma saída para o rei (como [[h3]]) antes que o mate na última fileira vire uma ameaça.
