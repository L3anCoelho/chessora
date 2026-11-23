/**
 * Procura armadilhas numa abertura: a partir de uma linha, descobre quais
 * lances do adversário permitem mate forçado, e em quantos lances.
 *
 *   node scripts/find-opening-trap.mjs "e4 e6 d4 d5 Nc3 Nf6 Bg5" --mate 3
 *   node scripts/find-opening-trap.mjs "d4 d5 c4 e6 Nc3 Nf6 Bg5" --mate 2 --depth 2
 *
 * --depth 2 procura também um lance mais fundo: para cada resposta razoável do
 * adversário, testa de novo. Tudo por busca exaustiva no chess.js, então o que
 * sai daqui é mate forçado de verdade.
 */
import { Chess } from 'chess.js';
import { mateDistance } from './lib/mate.mjs';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
};
const maxMate = Number(opt('mate', 3));
const extraPlies = Number(opt('depth', 1));
const linha = args.find((arg) => !arg.startsWith('--') && !/^\d+$/.test(arg)) ?? '';

const base = new Chess();
for (const san of linha.split(/\s+/).filter(Boolean)) base.move(san);
console.log(`Posição depois de: ${linha}`);
console.log(`Vez das ${base.turn() === 'w' ? 'brancas' : 'pretas'} (quem pode errar).`);

/** Lances do adversário que deixam mate forçado para o outro lado. */
function procurar(chess, pliesRestantes, prefixo = []) {
  const achados = [];
  for (const san of chess.moves()) {
    chess.move(san);
    const distancia = mateDistance(chess, maxMate);
    if (distancia !== null) {
      achados.push({ linha: [...prefixo, san], mate: distancia });
    } else if (pliesRestantes > 1 && !chess.isGameOver()) {
      // Segue mais fundo: o lado forte joga o melhor e o adversário erra depois.
      const melhor = chess.moves();
      for (const resposta of melhor) {
        chess.move(resposta);
        achados.push(...procurar(chess, pliesRestantes - 2, [...prefixo, san, resposta]));
        chess.undo();
      }
    }
    chess.undo();
  }
  return achados;
}

const achados = procurar(base, extraPlies);
if (achados.length === 0) {
  console.log(`Nenhum lance permite mate forçado em até ${maxMate}.`);
} else {
  achados.sort((a, b) => a.mate - b.mate || a.linha.length - b.linha.length);
  console.log(`${achados.length} erro(s) punível(is) com mate forçado:`);
  for (const achado of achados.slice(0, 25)) {
    console.log(`  ${achado.linha.join(' ')}  → mate em ${achado.mate}`);
  }
}
