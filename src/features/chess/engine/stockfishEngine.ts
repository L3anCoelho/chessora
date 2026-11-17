/**
 * Integração com o Stockfish (WASM) rodando num Web Worker.
 *
 * O motor é o "stockfish-19-lite-single" do pacote npm `stockfish`, copiado para
 * public/engine pelo script scripts/copy-stockfish.mjs. A análise roda fora da thread
 * principal, então a interface não trava enquanto o computador pensa.
 */
import type { EngineLevel } from '@/types/domain';

export interface EngineSearchSettings {
  /** Opção UCI "Skill Level" (0 a 20). */
  skillLevel: number;
  /** Profundidade máxima da busca; null = sem limite de profundidade. */
  depth: number | null;
  /** Tempo máximo de busca em milissegundos. */
  moveTimeMs: number;
}

export const ENGINE_LEVELS: Record<EngineLevel, EngineSearchSettings & { label: string; description: string }> = {
  facil: {
    label: 'Fácil',
    description: 'Comete erros de propósito. Bom para as primeiras partidas.',
    skillLevel: 0,
    depth: 2,
    moveTimeMs: 200,
  },
  medio: {
    label: 'Médio',
    description: 'Joga com cuidado, mas ainda deixa oportunidades.',
    skillLevel: 6,
    depth: 8,
    moveTimeMs: 600,
  },
  dificil: {
    label: 'Difícil',
    description: 'Força máxima desta versão do motor, com até 1,5 s por lance.',
    skillLevel: 20,
    depth: null,
    moveTimeMs: 1500,
  },
};

export class EngineUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EngineUnavailableError';
  }
}

export class SearchCancelledError extends Error {
  constructor() {
    super('Busca cancelada');
    this.name = 'SearchCancelledError';
  }
}

type Waiter = {
  match: (line: string) => boolean;
  resolve: (line: string) => void;
  reject: (error: Error) => void;
};

const INIT_TIMEOUT_MS = 20_000;

export class StockfishEngine {
  private worker: Worker | null = null;
  private waiters: Waiter[] = [];
  private initPromise: Promise<void> | null = null;
  /** Garante uma busca por vez: cada busca espera a anterior terminar. */
  private queue: Promise<unknown> = Promise.resolve();
  private generation = 0;
  private failure: Error | null = null;

  constructor(private readonly scriptUrl: string) {}

  init(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    this.initPromise = new Promise<void>((resolve, reject) => {
      if (typeof Worker === 'undefined' || typeof WebAssembly === 'undefined') {
        reject(new EngineUnavailableError('Este navegador não suporta Web Workers ou WebAssembly.'));
        return;
      }
      let worker: Worker;
      try {
        worker = new Worker(this.scriptUrl);
      } catch {
        reject(new EngineUnavailableError('Não foi possível iniciar o motor de xadrez.'));
        return;
      }
      this.worker = worker;
      const timer = window.setTimeout(() => {
        this.fail(new EngineUnavailableError('O motor de xadrez demorou demais para carregar.'));
        reject(this.failure);
      }, INIT_TIMEOUT_MS);

      worker.onmessage = (event: MessageEvent) => {
        const data: unknown = event.data;
        if (typeof data !== 'string') return;
        for (const line of data.split('\n')) this.handleLine(line.trim());
      };
      worker.onerror = (event) => {
        event.preventDefault();
        window.clearTimeout(timer);
        this.fail(new EngineUnavailableError('O arquivo do motor de xadrez não foi encontrado ou falhou ao carregar.'));
        reject(this.failure);
      };

      this.send('uci');
      this.waitFor((line) => line === 'uciok')
        .then(() => {
          this.send('isready');
          return this.waitFor((line) => line === 'readyok');
        })
        .then(() => {
          window.clearTimeout(timer);
          resolve();
        })
        .catch(reject);
    });
    return this.initPromise;
  }

  get isFailed(): boolean {
    return this.failure !== null;
  }

  /** Pede ao motor o melhor lance (em notação UCI, ex.: "e2e4") para a posição. */
  bestMove(fen: string, settings: EngineSearchSettings): Promise<string> {
    const generation = this.generation;
    const task = this.queue.then(async () => {
      await this.init();
      if (generation !== this.generation) throw new SearchCancelledError();
      this.send(`setoption name Skill Level value ${settings.skillLevel}`);
      this.send('isready');
      await this.waitFor((line) => line === 'readyok');
      this.send(`position fen ${fen}`);
      const limits = [`movetime ${settings.moveTimeMs}`];
      if (settings.depth !== null) limits.push(`depth ${settings.depth}`);
      this.send(`go ${limits.join(' ')}`);
      const line = await this.waitFor((candidate) => candidate.startsWith('bestmove'));
      if (generation !== this.generation) throw new SearchCancelledError();
      const move = line.split(/\s+/)[1];
      if (!move || move === '(none)') throw new Error('O motor não encontrou lance nesta posição.');
      return move;
    });
    // A fila continua mesmo se esta busca falhar.
    this.queue = task.catch(() => undefined);
    return task;
  }

  /** Cancela buscas em andamento ou na fila (ex.: o jogador desfez o lance). */
  cancel(): void {
    this.generation += 1;
    if (this.worker && !this.failure) this.send('stop');
  }

  /** Começa uma nova partida: limpa as tabelas internas do motor. */
  newGame(): void {
    this.cancel();
    if (this.worker && !this.failure) this.send('ucinewgame');
  }

  terminate(): void {
    this.cancel();
    this.worker?.terminate();
    this.worker = null;
    this.initPromise = null;
    const pending = this.waiters;
    this.waiters = [];
    pending.forEach((waiter) => waiter.reject(new SearchCancelledError()));
  }

  private send(command: string): void {
    this.worker?.postMessage(command);
  }

  private handleLine(line: string): void {
    if (!line) return;
    const index = this.waiters.findIndex((waiter) => waiter.match(line));
    if (index === -1) return;
    const [waiter] = this.waiters.splice(index, 1);
    waiter.resolve(line);
  }

  private waitFor(match: (line: string) => boolean): Promise<string> {
    if (this.failure) return Promise.reject(this.failure);
    return new Promise((resolve, reject) => this.waiters.push({ match, resolve, reject }));
  }

  private fail(error: Error): void {
    this.failure = error;
    this.worker?.terminate();
    this.worker = null;
    const pending = this.waiters;
    this.waiters = [];
    pending.forEach((waiter) => waiter.reject(error));
  }
}

let sharedEngine: StockfishEngine | null = null;

/** Uma única instância do motor por aba: carregar o WASM uma vez só. */
export function getEngine(): StockfishEngine {
  if (!sharedEngine || sharedEngine.isFailed) {
    sharedEngine = new StockfishEngine(`${import.meta.env.BASE_URL}engine/stockfish.js`);
  }
  return sharedEngine;
}
