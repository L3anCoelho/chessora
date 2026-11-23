/**
 * Confere uma linha de lances: todos são legais? termina em mate?
 *
 *   node scripts/check-line.mjs "e4 e5 Nf3 Nc6 Bc4 Nd4"
 *   node scripts/check-line.mjs --fen "<fen>" "Qg6+ Kh8 Qg7#"
 *
 * Serve para não escrever nenhuma linha de memória: se o script reclamar, a
 * linha está errada.
 */
import { Chess } from 'chess.js';

const args = process.argv.slice(2);
const fenIndex = args.indexOf('--fen');
const startFen = fenIndex === -1 ? undefined : args[fenIndex + 1];
const texto = args[args.length - 1] ?? '';

const chess = startFen ? new Chess(startFen) : new Chess();
const lances = texto.split(/\s+/).filter(Boolean);

for (const [i, san] of lances.entries()) {
  const antes = chess.fen();
  try {
    chess.move(san);
  } catch {
    console.error(`✗ lance ${i + 1} "${san}" é ilegal em ${antes}`);
    const legais = new Chess(antes).moves();
    console.error(`  legais: ${legais.join(' ')}`);
    process.exit(1);
  }
}

const estado = chess.isCheckmate()
  ? 'XEQUE-MATE'
  : chess.isStalemate()
    ? 'afogamento'
    : chess.inCheck()
      ? 'xeque (sem mate)'
      : 'partida em aberto';

console.log(`✓ ${lances.length} lance(s) legais. Final: ${estado}`);
console.log(`  fen: ${chess.fen()}`);
