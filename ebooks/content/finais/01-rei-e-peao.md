---
id: rei-e-peao
title: Rei e peão
route: /aprender/finais/rei-e-peao
summary: A oposição e a regra do rei na frente do peão.
---

## Ideia central

No final de rei e peão contra rei, quem tem o peão quer promovê-lo; quem defende quer colocar o rei na frente dele. O resultado depende de dois conceitos:

- **Rei na frente do peão.** O rei do atacante deve ir à frente do próprio peão, abrindo caminho. Empurrar o peão sozinho, com o rei atrás, quase sempre leva ao empate.
- **Oposição.** Quando os dois reis estão na mesma coluna (ou fileira) com **uma casa entre eles**, quem **não** precisa jogar "tem a oposição". Como os reis não podem se encostar, quem joga é obrigado a ceder espaço.

```board
fen: 8/4k3/8/4K3/4P3/8/8/8 b - - 0 1
caption: Oposição: os reis em e7 e e5 têm uma casa entre eles. Como as pretas jogam, as brancas têm a oposição.
highlights: e7 e6 e5
```

## Por que importa

Quase todos os finais com mais peças acabam se transformando em finais de peões depois das trocas. Se você não sabe se um final de rei e peão está ganho ou empatado, não sabe se deve trocar as peças. Com esses dois conceitos, você consegue decidir em segundos.

Uma regra prática muito útil: **se o rei atacante chega à sexta fileira na frente do peão (e o peão não é da coluna a ou h), a vitória é garantida**, não importa quem jogue.

## Passo a passo: o rei na sexta fileira ganha

```steps
fen: 4k3/8/4K3/4P3/8/8/8/8 b - - 0 1
note: O rei branco está na sexta fileira, na frente do peão. As pretas jogam, mas não conseguem segurar.
Kd8 :: O rei preto vai para o lado.
Kf7 :: O rei branco controla e7 e e8, as casas por onde o peão vai passar.
Kd7 :: O rei preto tenta se aproximar.
e6+ :: O peão avança com xeque, protegido pelo rei.
Kd6 :: O rei preto ataca o peão, mas ele está defendido.
e7 :: O peão chega à sétima fileira.
Kc7 :: As pretas não conseguem impedir a promoção.
e8=Q :: O peão vira dama. Com rei e dama contra rei, o mate é questão de técnica.
```

## Passo a passo: a defesa correta empata

Quando o rei defensor fica **na frente** do peão e usa a oposição, o final é empate. Nesta linha, cada lance das pretas é o **único** que empata.

```steps
fen: 4k3/8/8/4K3/4P3/8/8/8 b - - 0 1
Ke7! :: O rei preto toma a oposição: reis em e5 e e7, com as brancas obrigadas a jogar. Recuar para d7 ou f7 perderia.
Kf5 :: O rei branco tenta passar pelo lado.
Kf7! :: O rei preto acompanha e toma a oposição de novo: reis em f5 e f7.
e5 :: As brancas avançam o peão.
Ke7! :: O rei volta para a frente do peão.
e6 :: O peão chega à sexta fileira.
Ke8! :: O rei recua em linha reta, para a casa de promoção. Ir para f8 perderia.
Kf6 :: O rei branco apoia o peão.
Kf8! :: Oposição mais uma vez: reis em f6 e f8.
e7+ :: O peão chega à sétima com xeque.
Ke8 :: O rei fica na casa de promoção. Ir para g8 levaria mate.
Ke6 :: As brancas protegem o peão, mas as pretas não têm nenhum lance legal e não estão em xeque.
diagram: Afogamento: as pretas não têm lances e o rei não está em xeque. A partida termina empatada. | highlights=e8 e7 e6
```

## Erros comuns

- **Empurrar o peão cedo demais.** Com o rei atrás do peão, o defensor fica na frente e empata. Primeiro avance o rei; o peão vem depois.
- **Defensor saindo da frente do peão.** O rei que defende deve ficar na frente do peão, recuando em linha reta quando necessário, e não fugir para o lado.
- **Ignorar quem joga.** A mesma posição pode estar ganha ou empatada dependendo de quem tem o lance. Sempre confira a oposição.
- **Esquecer os peões das colunas a e h.** Com um peão de torre, se o rei defensor chegar ao canto, o final é empate mesmo com o rei atacante bem colocado.

## Exercícios

```exercise
id: rp-oposicao
fen: 8/4k3/8/8/4K3/4P3/8/8 b - - 0 1
prompt: As pretas jogam. Só um lance empata. Qual?
goal: best
solution: Ke6
answer: O rei vai para e6 e toma a oposição: reis em e4 e e6, com as brancas obrigadas a jogar. Qualquer outro lance deixa o rei branco avançar para d5 ou f5 e o peão promove.
```

```exercise
id: rp-frente
fen: 3k4/8/8/3K4/3P4/8/8/8 b - - 0 1
prompt: As pretas jogam. Encontre o único lance que empata.
goal: best
solution: Kd7
answer: O rei vai para d7 e toma a oposição contra o rei de d5. Assim ele impede o rei branco de chegar à sexta fileira na frente do peão. Recuar para o lado, como [[Kc7]] ou [[Ke7]], permite que o rei branco avance e as brancas ganham.
```

```exercise
id: rp-sexta
fen: 4k3/8/4K3/4P3/8/8/8/8 w - - 0 1
prompt: O rei branco já está na sexta fileira. Faça progresso.
goal: move
solution: Kd6
answer: O rei vai para o lado do rei preto, ainda controlando as casas da frente do peão. Depois de [[Kd8]], vem [[e6]], [[e7]] e a promoção. [[Kf6]] funciona da mesma forma, pelo outro lado.
```

## Resumo

1. No final de rei e peão, o rei atacante vai na frente do peão; o defensor tenta ficar na frente dele.
2. Oposição: reis frente a frente com uma casa entre eles; quem não precisa jogar tem a vantagem.
3. Rei atacante na sexta fileira na frente do peão (exceto peão de torre) ganha sempre; o defensor que mantém a oposição empata.
