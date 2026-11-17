---
id: garfo
title: Garfo
route: /aprender/taticas/garfo
summary: Uma peça atacando duas ao mesmo tempo.
---

## Ideia central

Garfo é quando uma única peça ataca duas peças adversárias no mesmo lance. O adversário só consegue salvar uma delas, e você captura a outra. O garfo mais forte é aquele em que um dos alvos é o rei: como o xeque precisa ser respondido, a segunda peça cai com certeza.

```board
fen: 6k1/3q1p1p/5Np1/8/8/1Q6/5PPP/6K1 b - - 0 1
caption: O cavalo de f6 dá xeque no rei de g8 e ataca a dama de d7. É o garfo real, o mais temido do xadrez.
highlights: f6 g8 d7
arrows: f6-g8 f6-d7
```

## Por que importa

O garfo é a tática que mais ganha material entre iniciantes. Qualquer peça pode dar garfo, mas duas são especialistas:

- **O cavalo**, porque ataca em forma de "L" e alcança casas que as outras peças não alcançam. Um cavalo pode atacar o rei e a dama sem que nenhum dos dois consiga atacá-lo de volta.
- **O peão**, porque é a peça mais barata. Trocar um peão por um cavalo ou um bispo já é lucro de 2 pontos.

Para enxergar garfos, procure **duas peças adversárias que estejam à distância de um salto de cavalo de uma mesma casa**, ou duas peças lado a lado na frente de um peão seu.

## Passo a passo: o truque do garfo

Um garfo pode aparecer logo na abertura. Na linha abaixo, as pretas entregam um cavalo por um instante para recuperá-lo com um garfo de peão.

```steps
moves: 1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Nc3
Nxe4! :: O cavalo captura o peão de e4. Parece que as pretas simplesmente entregaram a peça.
Nxe4 :: As brancas recapturam. Agora as brancas têm um cavalo a mais.
d5! :: O garfo de peão: o peão de d5 ataca o bispo de c4 e o cavalo de e4 ao mesmo tempo.
diagram: O peão de d5 ataca duas peças brancas. As brancas só conseguem salvar uma. | highlights=d5 c4 e4 | arrows=d5-c4 d5-e4
Bd3 :: As brancas salvam o bispo.
dxe4 :: E o peão captura o cavalo. O material voltou a ficar igual, e as pretas ganharam um peão central.
```

O garfo real, com xeque, é ainda mais forte, porque não dá escolha ao adversário.

```steps
fen: 6k1/3q1p1p/6p1/8/4N3/1Q6/5PPP/6K1 w - - 0 1
Nf6+ :: O cavalo salta com xeque e ataca a dama de d7.
Kf8 :: O rei precisa sair do xeque. Não há como salvar a dama.
Nxd7+ :: O cavalo captura a dama, ainda com xeque. As brancas ganharam a dama por nada.
```

## Erros comuns

- **Olhar só para as próprias peças.** Muitos garfos passam despercebidos porque o jogador procura lances bons para si e esquece de olhar onde estão as peças do adversário. Pergunte sempre: "há duas peças adversárias que eu possa atacar ao mesmo tempo?"
- **Deixar rei e dama a um salto de cavalo de distância.** Do lado da defesa, cuidado quando o rei e a dama, ou o rei e uma torre, estão numa posição em que um cavalo inimigo pode atacar os dois.
- **Esquecer que o peão do garfo pode ser capturado.** Um garfo de peão só funciona se o peão não puder ser capturado logo em seguida. Antes de avançar, confira quem defende a casa de chegada.
- **Dar o garfo sem conferir a casa.** Se a casa de onde sai o garfo for defendida por uma peça mais barata, o adversário captura a peça que deu o garfo e o golpe acaba.

## Exercícios

```exercise
id: garfo-real
fen: 6k1/3q1p1p/6p1/8/4N3/1Q6/5PPP/6K1 w - - 0 1
prompt: Encontre o garfo que ganha a dama preta.
goal: best
solution: Nf6+ Kf8 Nxd7+
answer: O cavalo dá xeque de f6 e ataca a dama de d7. Depois que o rei se move, o cavalo captura a dama.
```

```exercise
id: garfo-peao
fen: 4k3/pp3ppp/2n1b3/8/2PP4/5N2/PP2BPPP/4K3 w - - 0 1
prompt: Use um peão para atacar duas peças pretas.
goal: move
solution: d5
answer: O peão de d5 ataca o cavalo de c6 e o bispo de e6 e está protegido pelo peão de c4. As pretas salvam uma peça e perdem a outra.
```

```exercise
id: garfo-cavalo-dama
fen: 2q3k1/5ppp/8/3N4/8/8/5PPP/3Q2K1 w - - 0 1
prompt: O rei e a dama pretos estão a um salto de cavalo de distância. Aproveite.
goal: best
solution: Ne7+ Kf8 Nxc8
answer: De e7, o cavalo dá xeque no rei de g8 e ataca a dama de c8. O rei sai e o cavalo captura a dama.
```

```exercise
id: garfo-pretas
fen: 4k3/ppp2ppp/8/8/3n4/8/PP3PPP/R3KB1R b - - 0 1
prompt: Encontre o garfo das pretas.
goal: best
solution: Nc2+
answer: O cavalo dá xeque no rei de e1 e ataca a torre de a1. Depois que o rei sai, as pretas capturam a torre.
```

## Resumo

1. Garfo é uma peça atacando duas ao mesmo tempo; com xeque, ele é quase sempre decisivo.
2. Cavalos e peões são os melhores garfadores: o cavalo pelo salto em "L", o peão por ser a peça mais barata.
3. Antes de cada lance, procure duas peças adversárias que possam ser atacadas da mesma casa, e evite deixar as suas nessa situação.
