/**
 * Stockfish (o mesmo que o site usa) rodando no Node, para conferir exercícios.
 *
 * Usa MultiPV: além do melhor lance, devolve os seguintes, com avaliação.
 * Assim dá para saber se um exercício tem solução única ou se há outro lance
 * igualmente bom que precisa entrar em acceptedMoves.
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { createInterface } from 'node:readline';
import { Chess } from 'chess.js';

const require = createRequire(import.meta.url);

let engine = null;

/**
 * Sobe o Stockfish como processo filho e fala UCI por stdin/stdout.
 * É o mesmo modo de uso do cli.js do pacote: o build .js roda direto no Node.
 */
function startEngine() {
  if (engine) return engine;
  const enginePath = require.resolve('stockfish/bin/stockfish-19-lite-single.js');
  const child = spawn(process.execPath, [enginePath], { stdio: ['pipe', 'pipe', 'inherit'] });
  const handlers = new Set();
  createInterface({ input: child.stdout }).on('line', (line) => {
    for (const handler of [...handlers]) handler(line);
  });
  engine = {
    child,
    send: (command) => child.stdin.write(`${command}
`),
    subscribe: (handler) => {
      handlers.add(handler);
      return () => handlers.delete(handler);
    },
  };
  return engine;
}

function waitFor(predicate, timeoutMs, what) {
  const api = startEngine();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      off();
      reject(new Error(`Stockfish demorou demais: ${what}`));
    }, timeoutMs);
    const off = api.subscribe((line) => {
      if (predicate(line.trim())) {
        clearTimeout(timer);
        off();
        resolve();
      }
    });
  });
}

async function ready() {
  const api = startEngine();
  const done = waitFor((line) => line === 'readyok', 60000, 'isready');
  api.send('isready');
  await done;
}

/**
 * Analisa uma posição.
 * @returns {Promise<{san: string, uci: string, cp: number|null, mate: number|null, rank: number}[]>}
 *          lances ordenados do melhor para o pior, com avaliação do ponto de
 *          vista de quem está na vez.
 */
export async function analyse(fen, { depth = 16, multipv = 6 } = {}) {
  const api = startEngine();
  await ready();
  api.send('ucinewgame');
  api.send(`setoption name MultiPV value ${multipv}`);
  api.send(`position fen ${fen}`);

  const lines = new Map();
  const finished = new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      off();
      reject(new Error(`Stockfish demorou demais em ${fen}`));
    }, 180000);
    const off = api.subscribe((raw) => {
      const line = raw.trim();
      if (line.startsWith('info ') && line.includes(' multipv ')) {
        const rank = Number(/ multipv (\d+)/.exec(line)?.[1]);
        const cp = /score cp (-?\d+)/.exec(line);
        const mate = /score mate (-?\d+)/.exec(line);
        const pv = / pv ([a-h][1-8][a-h][1-8][qrbn]?)/.exec(line);
        const reached = Number(/ depth (\d+)/.exec(line)?.[1] ?? 0);
        if (rank && pv && reached >= depth) {
          lines.set(rank, { rank, uci: pv[1], cp: cp ? Number(cp[1]) : null, mate: mate ? Number(mate[1]) : null });
        }
      }
      if (line.startsWith('bestmove')) {
        clearTimeout(timer);
        off();
        resolve();
      }
    });
  });
  api.send(`go depth ${depth}`);
  await finished;

  const chess = new Chess(fen);
  return [...lines.values()]
    .sort((a, b) => a.rank - b.rank)
    .map((entry) => {
      const move = chess.move({
        from: entry.uci.slice(0, 2),
        to: entry.uci.slice(2, 4),
        promotion: entry.uci[4],
      });
      chess.undo();
      return { ...entry, san: move.san };
    });
}

/** Pontuação comparável (mate vale muito mais que qualquer material). */
export function scoreOf(entry) {
  if (entry.mate !== null) return entry.mate > 0 ? 100000 - entry.mate : -100000 - entry.mate;
  return entry.cp ?? 0;
}

/** Lances empatados no topo, dentro de uma margem em centésimos de peão. */
export function topMoves(entries, margin = 30) {
  if (entries.length === 0) return [];
  const best = scoreOf(entries[0]);
  return entries.filter((entry) => best - scoreOf(entry) <= margin).map((entry) => entry.san);
}

export async function stopEngine() {
  if (!engine) return;
  engine.send('quit');
  engine.child.stdin.end();
  engine.child.kill();
  engine = null;
}
