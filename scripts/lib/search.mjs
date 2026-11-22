/**
 * Busca de material com chess.js, usada para conferir exercícios táticos.
 *
 * Não é um motor de xadrez de verdade: só conta material e detecta mate.
 * Isso basta para as posições construídas das aulas, que são esparsas e têm
 * um golpe concreto. Para posições de abertura (muitas peças) não use isto.
 *
 * Nada de isDraw()/isThreefoldRepetition() dentro da busca: em chess.js essas
 * chamadas percorrem o histórico inteiro e deixam a busca centenas de vezes
 * mais lenta. Mate e afogamento saem da própria lista de lances.
 */
import { Chess } from 'chess.js';

const VALUE = { p: 100, n: 300, b: 320, r: 500, q: 900, k: 0 };
const MATE = 100000;
const MAX_QUIESCENCE_PLY = 8;

/** Material do ponto de vista de quem está na vez. */
function material(chess) {
  let score = 0;
  for (const row of chess.board()) {
    for (const cell of row) {
      if (!cell) continue;
      score += (cell.color === 'w' ? 1 : -1) * VALUE[cell.type];
    }
  }
  return chess.turn() === 'w' ? score : -score;
}

function orderMoves(moves) {
  return moves.sort(
    (a, b) =>
      (b.captured ? VALUE[b.captured] : 0) +
      (b.promotion ? VALUE[b.promotion] : 0) -
      ((a.captured ? VALUE[a.captured] : 0) + (a.promotion ? VALUE[a.promotion] : 0)),
  );
}

/** Só capturas e promoções, para não parar a busca no meio de uma troca. */
function quiesce(chess, alpha, beta, ply) {
  const inCheck = chess.inCheck();
  // Em xeque não dá para "passar": gera todas as saídas, o que também acha o mate.
  if (inCheck) {
    const evasions = chess.moves({ verbose: true });
    if (evasions.length === 0) return -MATE + ply;
    if (ply >= MAX_QUIESCENCE_PLY) return material(chess);
    for (const move of orderMoves(evasions)) {
      chess.move(move);
      const score = -quiesce(chess, -beta, -alpha, ply + 1);
      chess.undo();
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }
    return alpha;
  }

  const stand = material(chess);
  if (stand >= beta) return beta;
  if (stand > alpha) alpha = stand;
  if (ply >= MAX_QUIESCENCE_PLY) return alpha;

  const captures = chess.moves({ verbose: true }).filter((move) => move.captured || move.promotion);
  for (const move of orderMoves(captures)) {
    chess.move(move);
    const score = -quiesce(chess, -beta, -alpha, ply + 1);
    chess.undo();
    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
  }
  return alpha;
}

function negamax(chess, depth, alpha, beta, ply) {
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return chess.inCheck() ? -MATE + ply : 0; // mate ou afogamento
  if (depth === 0) return quiesce(chess, alpha, beta, ply);

  for (const move of orderMoves(moves)) {
    chess.move(move);
    const score = -negamax(chess, depth - 1, -beta, -alpha, ply + 1);
    chess.undo();
    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
  }
  return alpha;
}

/**
 * Pontua cada lance da posição e devolve a lista ordenada (melhor primeiro).
 * @returns {{san: string, score: number}[]}
 */
export function rankMoves(fen, depth = 4) {
  const chess = new Chess(fen);
  const scored = chess.moves({ verbose: true }).map((move) => {
    chess.move(move);
    const score = -negamax(chess, depth - 1, -MATE, MATE, 1);
    chess.undo();
    return { san: move.san, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

/** Lances empatados no topo (margem em centésimos de peão). */
export function bestMoves(fen, depth = 4, margin = 0) {
  const ranked = rankMoves(fen, depth);
  if (ranked.length === 0) return [];
  const top = ranked[0].score;
  return ranked.filter((entry) => top - entry.score <= margin).map((entry) => entry.san);
}

/** Todos os lances que dão mate imediato. */
export function matesInOne(fen) {
  const chess = new Chess(fen);
  return chess.moves().filter((san) => {
    chess.move(san);
    const mate = chess.isCheckmate();
    chess.undo();
    return mate;
  });
}

/** Diferença, em peões, entre o melhor lance e o melhor dos outros. */
export function materialGap(fen, depth = 4) {
  const ranked = rankMoves(fen, depth);
  if (ranked.length < 2) return Infinity;
  const top = ranked[0].score;
  const next = ranked.find((entry) => entry.score < top);
  return next ? (top - next.score) / 100 : 0;
}

export function countPieces(fen) {
  return (fen.split(' ')[0].match(/[a-zA-Z]/g) ?? []).length;
}

export { MATE };
