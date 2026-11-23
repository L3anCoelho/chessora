/**
 * Varre uma linha de abertura e, em cada posição, procura erros do adversário
 * que permitam mate forçado. Serve para responder, com prova, se uma abertura
 * tem ou não uma armadilha curta que termina em mate.
 *
 *   node scripts/scan-opening.mjs "e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6 Bd3" --mate 2 --side b
 *
 * --side diz quem pode errar (b = as pretas erram, as brancas dão o mate).
 */
import { Chess } from 'chess.js';
import { mateDistance } from './lib/mate.mjs';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
};
const maxMate = Number(opt('mate', 2));
const side = opt('side', 'b');
const linha = args.find((arg) => !arg.startsWith('--') && /[a-h]/.test(arg)) ?? '';

const lances = linha.split(/\s+/).filter(Boolean);
const chess = new Chess();
const achados = [];

for (let i = 0; i <= lances.length; i += 1) {
  if (chess.turn() === side && !chess.isGameOver()) {
    const prefixo = chess.history();
    for (const san of chess.moves()) {
      chess.move(san);
      const distancia = chess.isGameOver() ? null : mateDistance(chess, maxMate);
      chess.undo();
      if (distancia !== null) {
        achados.push({ apos: prefixo.join(' '), erro: san, mate: distancia });
      }
    }
  }
  if (i < lances.length) chess.move(lances[i]);
}

console.log(`Linha varrida: ${linha}`);
console.log(`Quem erra: ${side === 'b' ? 'as pretas' : 'as brancas'} | mate em até ${maxMate}`);
if (achados.length === 0) {
  console.log('Nenhum erro, em nenhuma das posições da linha, permite mate forçado.');
} else {
  console.log(`${achados.length} achado(s):`);
  for (const achado of achados.slice(0, 20)) {
    console.log(`  depois de "${achado.apos}" o lance ${achado.erro} perde por mate em ${achado.mate}`);
  }
}
