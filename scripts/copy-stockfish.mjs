// Copia o motor Stockfish (WASM, versão "lite single-threaded") para public/engine.
// Essa versão funciona em qualquer hospedagem estática, sem cabeçalhos COOP/COEP.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'node_modules', 'stockfish');
const target = join(root, 'public', 'engine');
const files = [
  ['bin/stockfish-19-lite-single.js', 'stockfish.js'],
  ['bin/stockfish-19-lite-single.wasm', 'stockfish.wasm'],
  ['Copying.txt', 'STOCKFISH-LICENSE.txt'],
];

if (!existsSync(source)) {
  console.warn('[stockfish] pacote não encontrado; o modo contra o computador ficará indisponível.');
  process.exit(0);
}
mkdirSync(target, { recursive: true });
for (const [from, to] of files) {
  copyFileSync(join(source, from), join(target, to));
}
console.log('[stockfish] motor copiado para public/engine');
