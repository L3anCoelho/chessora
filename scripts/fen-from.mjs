// node scripts/fen-from.mjs "e4 e5 Nf3 Nc6"  -> imprime o FEN resultante
import { Chess } from 'chess.js';
const chess = new Chess();
for (const san of (process.argv[2] ?? '').split(/\s+/).filter(Boolean)) chess.move(san);
console.log(chess.fen());
