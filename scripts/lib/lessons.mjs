/**
 * Leitura e checagem das aulas premium.
 *
 * As aulas são escritas em content/lessons/*.json (fora de src/, para não
 * entrarem no pacote do navegador). Daqui saem duas coisas: a migração SQL e a
 * checagem de conteúdo usada tanto pelo script quanto pelos testes.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Chess } from 'chess.js';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const LESSONS_DIR = join(ROOT, 'content', 'lessons');

const SQUARE = /^[a-h][1-8]$/;

export function readLessonFiles() {
  return readdirSync(LESSONS_DIR)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => ({ name, ...JSON.parse(readFileSync(join(LESSONS_DIR, name), 'utf8')) }));
}

/** Blocos que vão para o banco (sem os campos de autoria). */
export function bodyForDatabase(lesson) {
  return lesson.body;
}

/**
 * Checagens que não precisam de motor: estrutura, FENs e legalidade dos lances.
 * @returns {string[]} lista de problemas (vazia = tudo certo)
 */
export function checkLesson(lesson) {
  const problems = [];
  const fail = (message) => problems.push(`${lesson.lessonId}: ${message}`);

  if (!lesson.lessonId || !lesson.moduleId || !lesson.requiredScope) fail('faltam lessonId/moduleId/requiredScope');
  const blocks = lesson.body ?? [];
  if (blocks.length < 6 || blocks.length > 9) fail(`tem ${blocks.length} blocos (o combinado é de 6 a 9)`);

  const interactive = blocks.filter(
    (block) => block.type === 'exercise' || block.type === 'guided-line' || block.type === 'guided-game',
  );
  if (interactive.length < 2) fail(`tem ${interactive.length} bloco(s) para praticar; o mínimo é 2`);

  for (const block of blocks) {
    if (block.type === 'diagram') {
      if (!isValidFen(block.fen)) fail(`diagrama com FEN inválido: ${block.fen}`);
      else {
        for (const square of block.highlights ?? []) {
          if (!SQUARE.test(square)) fail(`destaque inválido "${square}"`);
        }
        if (block.showMovesFrom) {
          const chess = new Chess(block.fen);
          if (chess.moves({ square: block.showMovesFrom }).length === 0) {
            fail(`showMovesFrom ${block.showMovesFrom} não tem lances`);
          }
        }
      }
      if (!block.caption) fail('diagrama sem legenda');
    }

    if (block.type === 'exercise') {
      if (!isValidFen(block.fen)) {
        fail(`exercício ${block.id}: FEN inválido`);
        continue;
      }
      if (!block.acceptedMoves?.length) fail(`exercício ${block.id}: sem acceptedMoves`);
      for (const san of block.acceptedMoves ?? []) {
        const chess = new Chess(block.fen);
        let move;
        try {
          move = chess.move(san);
        } catch {
          fail(`exercício ${block.id}: lance ilegal "${san}"`);
          continue;
        }
        if (block.goal === 'checkmate' && !chess.isCheckmate()) {
          fail(`exercício ${block.id}: "${move.san}" não dá mate`);
        }
      }
      if (!block.successText) fail(`exercício ${block.id}: sem successText`);
    }

    if (block.type === 'guided-line') {
      const errors = checkGuidedLine(block);
      for (const error of errors) fail(`guia ${block.id}: ${error}`);
    }

    if (block.type === 'guided-game') {
      const errors = checkGuidedGame(block);
      for (const error of errors) fail(`partida ${block.id}: ${error}`);
    }
  }

  return problems;
}

/** Roda a linha inteira no chess.js. Mesma regra do componente. */
export function checkGuidedLine(block) {
  const errors = [];
  const startFen = block.startFen ?? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  let chess;
  try {
    chess = new Chess(startFen);
  } catch {
    return [`posição inicial inválida: ${startFen}`];
  }
  const player = chess.turn();
  if (!block.steps?.length) return ['sem passos'];
  block.steps.forEach((step, index) => {
    if (chess.turn() !== player) {
      errors.push(`passo ${index + 1}: falta a resposta do passo anterior`);
      return;
    }
    try {
      chess.move(step.move);
    } catch {
      errors.push(`passo ${index + 1}: lance "${step.move}" é ilegal em ${chess.fen()}`);
      return;
    }
    if (step.reply) {
      try {
        chess.move(step.reply);
      } catch {
        errors.push(`passo ${index + 1}: resposta "${step.reply}" é ilegal em ${chess.fen()}`);
      }
    }
    if (!step.explanation) errors.push(`passo ${index + 1}: sem explicação`);
  });
  return errors;
}

/**
 * Confere uma partida guiada: cada variante é legal, termina como promete e,
 * quando exhaustive está ligado, nenhuma defesa legal fica sem resposta.
 */
export function checkGuidedGame(block) {
  const errors = [];
  const startFen = block.startFen ?? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  if (!isValidFen(startFen)) return [`posição inicial inválida: ${startFen}`];
  if (!block.variations?.length) return ['sem variantes'];

  // Cada posição de lance do aluno só pode ter uma resposta certa.
  const playerMoves = new Map();
  /** Posições em que o adversário joga, com as defesas previstas. */
  const opponentReplies = new Map();
  /** A partir de qual lance a cobertura total é exigida. */
  const exhaustiveFrom = block.exhaustive ? 0 : block.exhaustiveFrom;

  block.variations.forEach((variation, index) => {
    const label = variation.label ?? `variante ${index + 1}`;
    const chess = new Chess(startFen);
    if (!variation.moves?.length) {
      errors.push(`${label}: sem lances`);
      return;
    }
    for (const [ply, entry] of variation.moves.entries()) {
      const fen = chess.fen();
      let san;
      try {
        san = chess.move(entry.san).san;
      } catch {
        errors.push(`${label}: lance ${ply + 1} "${entry.san}" é ilegal em ${fen}`);
        return;
      }
      const key = `${fen}`;
      if (ply % 2 === 0) {
        const seen = playerMoves.get(key);
        if (seen && seen !== san) {
          errors.push(`${label}: nesta posição já havia o lance ${seen}, e agora aparece ${san}`);
        }
        playerMoves.set(key, san);
      } else {
        if (!opponentReplies.has(key)) opponentReplies.set(key, { ply, defesas: new Set() });
        opponentReplies.get(key).defesas.add(san);
      }
    }
    if (variation.moves.length % 2 === 0) {
      errors.push(`${label}: a variante precisa terminar num lance do aluno`);
    }
    const outcome = variation.outcome ?? 'mate';
    if (outcome === 'mate' && !chess.isCheckmate()) {
      errors.push(`${label}: deveria terminar em xeque-mate, mas não termina`);
    }
  });

  if (exhaustiveFrom !== undefined) {
    for (const [fen, info] of opponentReplies) {
      if (info.ply < exhaustiveFrom) continue;
      const legal = new Chess(fen).moves();
      const missing = legal.filter((san) => !info.defesas.has(san));
      if (missing.length > 0) {
        errors.push(`falta a resposta para ${missing.join(', ')} na posição ${fen}`);
      }
    }
  }

  return errors;
}

export function isValidFen(fen) {
  try {
    new Chess(fen);
    return true;
  } catch {
    return false;
  }
}

/** Todos os mates em um lance da posição. */
export function matesInOne(fen) {
  const chess = new Chess(fen);
  return chess.moves().filter((san) => {
    chess.move(san);
    const mate = chess.isCheckmate();
    chess.undo();
    return mate;
  });
}

export function findBlock(lesson, id) {
  return (lesson.body ?? []).find((block) => block.id === id);
}
