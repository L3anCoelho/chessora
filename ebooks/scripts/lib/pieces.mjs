/**
 * Carrega o desenho das peças direto do componente do site
 * (src/features/chess/components/Piece.tsx), para que o livro use exatamente as mesmas peças.
 */
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, '../../..');
const require = createRequire(path.join(projectRoot, 'package.json'));

let cache = null;

export async function loadPieces() {
  if (cache) return cache;
  const entry = `
    import { renderToStaticMarkup } from 'react-dom/server';
    import { Piece } from './src/features/chess/components/Piece.tsx';
    const out = {};
    for (const color of ['w', 'b']) for (const type of ['p','n','b','r','q','k']) {
      out[color + type] = renderToStaticMarkup(Piece({ type, color }));
    }
    globalThis.__PIECES__ = out;
  `;
  const result = await build({
    stdin: { contents: entry, resolveDir: projectRoot, loader: 'tsx' },
    bundle: true,
    write: false,
    platform: 'node',
    format: 'cjs',
    jsx: 'automatic',
    alias: { '@': path.join(projectRoot, 'src') },
    logLevel: 'silent',
  });
  const code = result.outputFiles[0].text;
  const fn = new Function('require', 'module', 'exports', code);
  const mod = { exports: {} };
  fn(require, mod, mod.exports);
  cache = globalThis.__PIECES__;
  return cache;
}
