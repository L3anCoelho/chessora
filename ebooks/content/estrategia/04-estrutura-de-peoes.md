---
id: estrutura-de-peoes
title: Estrutura de peões
route: /aprender/estrategia/estrutura-de-peoes
summary: Peões dobrados, isolados e passados, e o que cada um significa para o plano.
---

## Ideia central

Os peões são as únicas peças que não voltam atrás. Por isso, a forma como eles ficam no tabuleiro, a **estrutura de peões**, dura a partida inteira e decide onde as peças devem ficar e qual lado do tabuleiro atacar.

Quatro tipos de peão aparecem em quase toda partida:

- **Peões dobrados:** dois peões do mesmo lado na mesma coluna. O da frente bloqueia o de trás, e eles não conseguem se proteger.
- **Peão isolado:** um peão sem peões do mesmo lado nas colunas vizinhas. Nenhum peão pode defendê-lo; só as peças.
- **Peão atrasado:** um peão que ficou para trás dos vizinhos e não pode avançar com segurança.
- **Peão passado:** um peão sem peões adversários na frente dele, nem nas colunas vizinhas. Nada além das peças pode impedi-lo de promover.

```board
fen: 4k3/p4p1p/2p3p1/2p5/3P4/8/P4PPP/4K3 w - - 0 1
caption: Peões dobrados em c6 e c5 (pretas) e peão isolado em d4 (brancas). Nenhum deles pode ser defendido por outro peão.
highlights: c6 c5 d4
```

## Por que importa

Peões fracos viram **alvos**: o adversário coloca as peças atacando-os e você passa a jogar na defesa. Peões fortes, como um peão passado, viram **trunfos**: no final, um peão passado pode valer tanto quanto uma peça.

Ao avaliar uma posição, olhe os peões dos dois lados e pergunte:

1. Algum peão meu é fraco? Ele está bem defendido?
2. O adversário tem peões fracos que eu possa atacar?
3. Alguém tem, ou pode criar, um peão passado?

```board
fen: 4k3/pp4pp/8/3P4/8/8/PP4PP/4K3 w - - 0 1
caption: O peão de d5 é passado: não há peões pretos nas colunas c, d e e para pará-lo. No final, ele é uma arma muito forte.
highlights: d5 d6 d7 d8
```

## Passo a passo: trocar um bispo por uma estrutura melhor

Na Variante da Troca da Abertura Espanhola, as brancas entregam o bispo pelo cavalo de propósito. Em troca, deixam as pretas com peões dobrados.

```steps
moves: 1.e4 e5 2.Nf3 Nc6 3.Bb5 a6
Bxc6 :: As brancas trocam o bispo pelo cavalo.
dxc6 :: As pretas recapturam com o peão de d, abrindo linhas para a dama e o bispo de c8. Agora elas têm dois peões na coluna c.
O-O :: As brancas rocam.
f6 :: As pretas defendem e5 com um peão.
d4 :: As brancas abrem o centro.
exd4 :: As pretas trocam.
Nxd4 :: O cavalo recaptura.
c5 :: As pretas expulsam o cavalo e ganham espaço com o peão dobrado.
Nb3 :: O cavalo recua.
Qxd1 :: As pretas trocam as damas.
Rxd1 :: A torre recaptura.
diagram: No lado do rei, as brancas têm quatro peões contra três: podem criar um peão passado. No lado da dama, as pretas também têm mais peões, mas os dobrados não conseguem fazer o mesmo. Em troca, as pretas têm os dois bispos. | highlights=e4 f2 g2 h2 c5 c7
```

É uma troca de vantagens: as pretas têm os dois bispos, as brancas têm a melhor estrutura. Quanto mais peças forem trocadas, mais a estrutura das brancas pesa.

## Erros comuns

- **Criar peões dobrados sem compensação.** Recapturar "de qualquer jeito" pode deixar peões dobrados. Antes de recapturar, compare as opções.
- **Defender um peão fraco com as peças erradas.** Se uma torre ou a dama passa a partida inteira defendendo um peão isolado, elas deixam de jogar. Às vezes vale trocar o peão fraco ou devolvê-lo.
- **Esquecer os peões passados.** Um peão passado precisa ser empurrado, de preferência com apoio do rei ou de uma torre atrás dele. Parado, ele pode ser bloqueado.
- **Avançar peões sem pensar nas casas que ficam para trás.** Cada avanço de peão deixa casas que nunca mais serão defendidas por ele. Essas casas viram pontos de apoio para as peças adversárias.

## Exercícios

```exercise
id: peoes-recaptura
moves: 1.d4 Nf6 2.Bg5 e6 3.e4 h6 4.Bxf6
prompt: As brancas trocaram o bispo pelo cavalo. Recapture sem estragar a estrutura de peões.
goal: move
solution: Qxf6
answer: Recapturar com a dama mantém os peões do roque intactos. Com [[4...gxf6]], as pretas ficariam com peões dobrados na coluna f e o roque enfraquecido.
```

```exercise
id: peoes-isolado
fen: r4rk1/pp3ppp/2n5/3p4/8/2N2N2/PP3PPP/R4RK1 w - - 0 1
prompt: O peão preto de d5 está isolado e sem defesa. Ganhe-o.
goal: move
solution: Nxd5
answer: O cavalo captura o peão de d5, que nenhuma peça preta defende. Colocar uma torre na coluna d, como [[Rfd1]], também é bom: o peão não vai fugir.
```

```exercise
id: peoes-maioria
fen: 6k1/pp3ppp/4p3/8/8/8/PPP2PPP/6K1 w - - 0 1
prompt: As brancas têm três peões contra dois no lado da dama. Comece a criar um peão passado.
goal: move
solution: c4
answer: A maioria de peões avança com o peão que não tem adversário na frente ("o candidato"): c4, depois b4 e c5 ou b5. Mais cedo ou mais tarde, um dos peões brancos vira passado. Levar o rei ao centro primeiro, com [[Kf1]], também é um bom plano.
```

## Resumo

1. Os peões não voltam atrás; a estrutura que eles formam define os planos da partida.
2. Peões dobrados, isolados e atrasados são fraquezas; peões passados são trunfos.
3. Ataque os peões fracos do adversário e, quando tiver maioria num lado, use-a para criar um peão passado.
