/**
 * Gera a árvore completa de um mate forçado, com TODAS as defesas.
 *
 *   node scripts/build-mate-tree.mjs "<fen>" [lances] [--json]
 */
import { Chess } from 'chess.js';
import { buildVariations, mateDistance } from './lib/mate.mjs';

const [fen, depthRaw, ...flags] = process.argv.slice(2);
const maxMoves = Number(depthRaw) || 3;

const chess = new Chess(fen);
const distance = mateDistance(chess, maxMoves);
if (distance === null) {
  console.error(`Não há mate forçado em até ${maxMoves} lances nesta posição.`);
  process.exit(1);
}

const variations = buildVariations(chess, distance);
if (flags.includes('--json')) {
  console.log(JSON.stringify(variations, null, 1));
} else {
  console.log(`Mate forçado em ${distance} lance(s). ${variations.length} variante(s):`);
  for (const variation of variations) {
    console.log('  ' + variation.moves.map((move) => move.san).join(' '));
  }
}
