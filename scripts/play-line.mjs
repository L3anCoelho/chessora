/**
 * Joga uma posição com o Stockfish dos dois lados e imprime a linha em SAN.
 * Serve para montar guias lance a lance de finais, com lances comprovadamente
 * corretos em vez de escritos de memória.
 *
 *   node scripts/play-line.mjs "<fen>" [lances] [--depth 20]
 */
import { Chess } from 'chess.js';
import { analyse, stopEngine } from './lib/engine.mjs';

const [fen, countRaw, ...flags] = process.argv.slice(2);
const plies = Number(countRaw) || 20;
const depth = Number(flags[flags.indexOf('--depth') + 1]) || 20;

const chess = new Chess(fen);
const line = [];
for (let i = 0; i < plies && !chess.isGameOver(); i += 1) {
  const [best] = await analyse(chess.fen(), { depth, multipv: 1 });
  if (!best) break;
  chess.move(best.san);
  line.push(`${best.san}${best.mate !== null ? ` {M${best.mate}}` : ''}`);
}
console.log(line.join(' '));
console.log('final:', chess.fen(), chess.isCheckmate() ? '(MATE)' : chess.isStalemate() ? '(AFOGAMENTO)' : '');
await stopEngine();
