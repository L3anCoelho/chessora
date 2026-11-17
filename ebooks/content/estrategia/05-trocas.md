---
id: trocas
title: Trocas
route: /aprender/estrategia/trocas
summary: Quando trocar peças favorece você, e quando favorece o adversário.
---

## Ideia central

Uma troca acontece quando você captura uma peça e o adversário recaptura uma peça de mesmo valor. O material continua igual, mas **a posição muda**: some uma peça de cada lado, e isso pode ajudar um lado mais do que o outro.

A pergunta certa não é "a troca é igual?", e sim "**depois da troca, quem fica melhor?**"

```board
fen: 3qr1k1/5ppp/8/8/8/2N5/5PPP/3QR1K1 w - - 0 1
caption: As brancas têm um cavalo a mais. Cada troca de peças deixa essa vantagem maior em proporção: com menos peças no tabuleiro, o cavalo extra pesa mais.
highlights: c3
```

## Por que importa

As trocas são uma das decisões mais frequentes numa partida. Algumas regras práticas ajudam:

- **Com vantagem de material, troque peças** (não peões). Com menos peças, o adversário tem menos chances de criar complicações, e a peça a mais decide.
- **Com desvantagem de material, evite trocas.** Mantenha peças no tabuleiro para buscar contrajogo.
- **Troque as peças que atacam seu rei**, especialmente a dama adversária quando ela lidera um ataque.
- **Troque suas peças ruins pelas boas do adversário**: um bispo preso atrás dos próprios peões por um cavalo bem colocado, por exemplo.
- **Com o espaço apertado, troque peças**: com menos peças, sobra mais espaço para as que ficam.

## Passo a passo: simplificar com vantagem

Com uma peça a mais, as brancas trocam as torres e levam o rei para o centro. Sem peças pesadas, as pretas não têm como criar ameaças.

```steps
fen: 3rk3/5ppp/8/8/8/2N5/5PPP/3R2K1 w - - 0 1
Rxd8+ :: As brancas trocam as torres.
Kxd8 :: O rei recaptura.
Kf1 :: Sem torres, o rei branco pode ir para o centro com segurança.
Ke7 :: O rei preto faz o mesmo.
Ke2 :: O rei branco segue para o centro. Com um cavalo a mais e sem peças pesadas adversárias, as brancas vão ganhar os peões pretos aos poucos.
diagram: Um final com um cavalo a mais. Sem torres no tabuleiro, as pretas não têm contrajogo.
```

## Erros comuns

- **Trocar no automático.** Muitos jogadores trocam peças só porque é possível. Antes de cada troca, pergunte quem fica com as melhores peças depois.
- **Trocar quando está perdendo material.** Se você está com uma peça a menos, cada troca deixa o final mais fácil para o adversário.
- **Trocar o bispo bom e ficar com o ruim.** Um bispo cujos peões estão em casas da mesma cor dele é um bispo "ruim". Prefira trocar esse e manter o outro.
- **Perder tempo para evitar uma troca.** Às vezes, recuar uma peça para evitar a troca custa mais caro do que aceitá-la.

## Exercícios

```exercise
id: trocas-damas
fen: 3qr1k1/5ppp/8/8/8/2N5/5PPP/3QR1K1 w - - 0 1
prompt: As brancas têm um cavalo a mais. Troque as damas para simplificar.
goal: move
solution: Qxd8 Rxd8
answer: Com as damas fora do tabuleiro, as pretas perdem a peça que poderia criar ameaças contra o rei branco. [[Rxe8+]], trocando as torres primeiro, também é muito bom.
```

```exercise
id: trocas-torres
fen: 3rk3/5ppp/8/8/8/2N5/5PPP/3R2K1 w - - 0 1
prompt: Com um cavalo a mais, simplifique a posição.
goal: move
solution: Rxd8+ Kxd8
answer: A troca das torres deixa um final de cavalo a mais, que as brancas ganham levando o rei ao centro e atacando os peões pretos.
```

## Resumo

1. Uma troca mantém o material igual, mas muda a posição; pergunte quem fica melhor depois.
2. Com vantagem de material, troque peças; com desvantagem, evite trocas.
3. Troque as peças que atacam seu rei, suas peças ruins e, com pouco espaço, qualquer peça que alivie a posição.
