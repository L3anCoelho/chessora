/** Stockfish (o mesmo pacote usado pelo site) rodando no Node, via UCI. */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.resolve(here, '../../../package.json'));
const ENGINE = path.join(path.dirname(require.resolve('stockfish/package.json')), 'bin/stockfish-19-lite-single.js');

export class Engine {
  constructor() {
    this.proc = spawn(process.execPath, [ENGINE], { stdio: ['pipe', 'pipe', 'ignore'] });
    this.buffer = '';
    this.listeners = [];
    this.waiters = new Set();
    this.dead = false;
    this.proc.stdin.on('error', () => {});
    this.proc.on('exit', () => {
      this.dead = true;
      for (const reject of this.waiters) reject(new Error('o Stockfish encerrou inesperadamente'));
      this.waiters.clear();
    });
    this.proc.stdout.on('data', (chunk) => {
      this.buffer += chunk.toString();
      let idx;
      while ((idx = this.buffer.indexOf('\n')) >= 0) {
        const line = this.buffer.slice(0, idx).trim();
        this.buffer = this.buffer.slice(idx + 1);
        for (const l of [...this.listeners]) l(line);
      }
    });
  }

  send(cmd) {
    this.proc.stdin.write(cmd + '\n');
  }

  waitFor(predicate, timeoutMs = 120000) {
    return new Promise((resolve, reject) => {
      if (this.dead) return reject(new Error('o Stockfish não está rodando'));
      const fail = (err) => {
        clearTimeout(timer);
        this.listeners = this.listeners.filter((x) => x !== l);
        reject(err);
      };
      const timer = setTimeout(() => fail(new Error('o Stockfish não respondeu a tempo')), timeoutMs);
      const l = (line) => {
        if (predicate(line)) {
          clearTimeout(timer);
          this.waiters.delete(fail);
          this.listeners = this.listeners.filter((x) => x !== l);
          resolve(line);
        }
      };
      this.waiters.add(fail);
      this.listeners.push(l);
    });
  }

  async init() {
    this.send('uci');
    await this.waitFor((l) => l === 'uciok');
    this.send('setoption name Hash value 64');
    this.send('isready');
    await this.waitFor((l) => l === 'readyok');
  }

  /**
   * Analisa a posição. Devolve as linhas por multipv com score do ponto de vista de quem joga.
   * score = { cp } ou { mate } (mate > 0: quem joga dá mate em N).
   */
  async analyse(fen, { depth = 16, multipv = 1, searchmoves = null } = {}) {
    this.send('ucinewgame');
    this.send(`setoption name MultiPV value ${multipv}`);
    this.send('isready');
    await this.waitFor((l) => l === 'readyok');
    const lines = new Map();
    const onInfo = (line) => {
      if (!line.startsWith('info') || !line.includes(' pv ') || !line.includes(' score ')) return;
      const d = Number(line.match(/ depth (\d+)/)?.[1]);
      const k = Number(line.match(/ multipv (\d+)/)?.[1] ?? 1);
      const m = line.match(/ score (cp|mate) (-?\d+)/);
      const pv = line.split(' pv ')[1].split(' ');
      if (line.includes('lowerbound') || line.includes('upperbound')) return;
      lines.set(k, { depth: d, score: m[1] === 'cp' ? { cp: Number(m[2]) } : { mate: Number(m[2]) }, pv });
    };
    this.listeners.push(onInfo);
    this.send(`position fen ${fen}`);
    this.send(`go depth ${depth}${searchmoves ? ` searchmoves ${searchmoves.join(' ')}` : ''}`);
    const best = await this.waitFor((l) => l.startsWith('bestmove'));
    this.listeners = this.listeners.filter((x) => x !== onInfo);
    return { bestmove: best.split(' ')[1], lines: [...lines.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v) };
  }

  quit() {
    this.send('quit');
    this.proc.stdin.end();
  }
}

/** Score numérico (centipeões) para comparar; mate vira um número grande. */
export function scoreValue(score) {
  if ('mate' in score) return score.mate > 0 ? 100000 - score.mate * 10 : -100000 - score.mate * 10;
  return score.cp;
}

export function formatScore(score) {
  if ('mate' in score) return `mate em ${Math.abs(score.mate)}${score.mate < 0 ? ' (contra)' : ''}`;
  return `${score.cp >= 0 ? '+' : ''}${(score.cp / 100).toFixed(2)}`;
}
