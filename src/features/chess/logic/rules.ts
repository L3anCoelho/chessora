/**
 * Regras e utilitários puros sobre chess.js. Sem React, para facilitar testes.
 */
import { Chess, type Move, type PieceSymbol, type Square } from 'chess.js';
import type { GameEndReason, GameResult, PlayerColor } from '@/types/domain';

export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;

export interface BoardPiece {
  type: PieceSymbol;
  color: PlayerColor;
}

export type Placement = Record<string, BoardPiece>;

/** Lê apenas a parte de posição de um FEN. Usado para desenhar diagramas sem validar regras. */
export function parsePlacement(fen: string): Placement {
  const placement: Placement = {};
  const rows = fen.split(' ')[0]?.split('/') ?? [];
  rows.forEach((row, rowIndex) => {
    let file = 0;
    for (const char of row) {
      if (/\d/.test(char)) {
        file += Number(char);
        continue;
      }
      const square = `${FILES[file]}${8 - rowIndex}`;
      const lower = char.toLowerCase() as PieceSymbol;
      placement[square] = { type: lower, color: char === lower ? 'b' : 'w' };
      file += 1;
    }
  });
  return placement;
}

export function isValidFen(fen: string): boolean {
  try {
    new Chess(fen);
    return true;
  } catch {
    return false;
  }
}

export interface GameStatus {
  turn: PlayerColor;
  inCheck: boolean;
  isOver: boolean;
  result: GameResult | null;
  endReason: GameEndReason | null;
}

export function getGameStatus(chess: Chess): GameStatus {
  const turn = chess.turn();
  const inCheck = chess.inCheck();
  if (chess.isCheckmate()) {
    return { turn, inCheck, isOver: true, result: turn === 'w' ? 'black' : 'white', endReason: 'checkmate' };
  }
  const drawReason: GameEndReason | null = chess.isStalemate()
    ? 'stalemate'
    : chess.isInsufficientMaterial()
      ? 'insufficient-material'
      : chess.isThreefoldRepetition()
        ? 'threefold-repetition'
        : chess.isDrawByFiftyMoves()
          ? 'fifty-move-rule'
          : null;
  if (drawReason) return { turn, inCheck, isOver: true, result: 'draw', endReason: drawReason };
  return { turn, inCheck, isOver: false, result: null, endReason: null };
}

export const END_REASON_LABEL: Record<GameEndReason, string> = {
  checkmate: 'Xeque-mate',
  stalemate: 'Empate por afogamento',
  'insufficient-material': 'Empate por material insuficiente',
  'threefold-repetition': 'Empate por repetição tripla',
  'fifty-move-rule': 'Empate pela regra dos 50 lances',
  resignation: 'Desistência',
  timeout: 'Tempo esgotado',
  agreement: 'Empate por acordo',
};

export function describeResult(result: GameResult | null, endReason: GameEndReason | null): string {
  if (!result || !endReason) return '';
  if (result === 'draw') return END_REASON_LABEL[endReason];
  const winner = result === 'white' ? 'Brancas' : 'Pretas';
  return `${END_REASON_LABEL[endReason]}. ${winner} vencem.`;
}

export function findKingSquare(chess: Chess, color: PlayerColor): Square | null {
  for (const row of chess.board()) {
    for (const cell of row) {
      if (cell && cell.type === 'k' && cell.color === color) return cell.square;
    }
  }
  return null;
}

export function legalTargets(chess: Chess, from: Square): Square[] {
  return chess.moves({ square: from, verbose: true }).map((move) => move.to);
}

export function isPromotionMove(chess: Chess, from: Square, to: Square): boolean {
  return chess
    .moves({ square: from, verbose: true })
    .some((move) => move.to === to && move.promotion !== undefined);
}

export const PIECE_VALUE: Record<PieceSymbol, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

export interface CapturedSummary {
  /** Peças capturadas PELAS brancas (ou seja, peças pretas fora do tabuleiro). */
  byWhite: PieceSymbol[];
  byBlack: PieceSymbol[];
  /** Diferença de material: positivo = vantagem das brancas. */
  materialBalance: number;
}

const CAPTURE_ORDER: PieceSymbol[] = ['q', 'r', 'b', 'n', 'p'];

export function summarizeCaptures(history: Move[]): CapturedSummary {
  const byWhite: PieceSymbol[] = [];
  const byBlack: PieceSymbol[] = [];
  let balance = 0;
  for (const move of history) {
    if (move.captured) {
      (move.color === 'w' ? byWhite : byBlack).push(move.captured);
      balance += (move.color === 'w' ? 1 : -1) * PIECE_VALUE[move.captured];
    }
    if (move.promotion) {
      // Na promoção o peão vira outra peça: o material muda mesmo sem captura.
      balance += (move.color === 'w' ? 1 : -1) * (PIECE_VALUE[move.promotion] - PIECE_VALUE.p);
    }
  }
  const sort = (list: PieceSymbol[]) =>
    [...list].sort((a, b) => CAPTURE_ORDER.indexOf(a) - CAPTURE_ORDER.indexOf(b));
  return { byWhite: sort(byWhite), byBlack: sort(byBlack), materialBalance: balance };
}

export interface MovePair {
  number: number;
  white?: { san: string; ply: number };
  black?: { san: string; ply: number };
}

/** Agrupa a lista de lances em pares numerados (1. e4 e5). Respeita partidas que começam com as pretas. */
export function toMovePairs(sanMoves: string[], startsWith: PlayerColor = 'w', startNumber = 1): MovePair[] {
  const pairs: MovePair[] = [];
  let ply = 0;
  let number = startNumber;
  if (startsWith === 'b' && sanMoves.length > 0) {
    pairs.push({ number, black: { san: sanMoves[0], ply: 0 } });
    ply = 1;
    number += 1;
  }
  for (; ply < sanMoves.length; ply += 2) {
    pairs.push({
      number,
      white: { san: sanMoves[ply], ply },
      black: sanMoves[ply + 1] ? { san: sanMoves[ply + 1], ply: ply + 1 } : undefined,
    });
    number += 1;
  }
  return pairs;
}

/** Remove marcadores de xeque/mate e anotações para comparar lances. */
export function normalizeSan(san: string): string {
  return san.replace(/[+#?!]/g, '').trim();
}

/** Converte "e2e4" / "e7e8q" (UCI) em objeto de lance do chess.js. */
export function parseUciMove(uci: string): { from: Square; to: Square; promotion?: PieceSymbol } | null {
  const match = /^([a-h][1-8])([a-h][1-8])([qrbn])?$/.exec(uci.trim());
  if (!match) return null;
  return {
    from: match[1] as Square,
    to: match[2] as Square,
    promotion: match[3] as PieceSymbol | undefined,
  };
}
