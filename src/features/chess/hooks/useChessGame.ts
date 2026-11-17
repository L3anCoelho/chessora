import { useCallback, useMemo, useRef, useState } from 'react';
import { Chess, type Move, type PieceSymbol, type Square } from 'chess.js';
import type { GameEndReason, GameResult } from '@/types/domain';
import { getGameStatus, START_FEN, summarizeCaptures, type GameStatus } from '../logic/rules';

export interface ManualEnding {
  result: GameResult;
  endReason: GameEndReason;
}

export interface ChessGameApi {
  fen: string;
  history: Move[];
  sanMoves: string[];
  lastMove: { from: Square; to: Square } | null;
  status: GameStatus;
  captures: ReturnType<typeof summarizeCaptures>;
  initialFen: string;
  /** Instância somente leitura para consultas (lances legais, peças). Não mova peças por ela. */
  chess: Chess;
  move: (move: { from: Square; to: Square; promotion?: PieceSymbol } | string) => Move | null;
  undo: (plies?: number) => number;
  reset: (fen?: string) => void;
  loadPgn: (pgn: string) => boolean;
  pgn: () => string;
  /** Encerra a partida sem xeque-mate (desistência, por exemplo). */
  endManually: (ending: ManualEnding) => void;
}

/**
 * Estado de uma partida. Toda validação de lance passa pelo chess.js:
 * um lance ilegal simplesmente não é aplicado.
 */
export function useChessGame(initialFen: string = START_FEN): ChessGameApi {
  const chessRef = useRef<Chess>(new Chess(initialFen));
  const [startFen, setStartFen] = useState(initialFen);
  const [version, setVersion] = useState(0);
  const [manualEnding, setManualEnding] = useState<ManualEnding | null>(null);
  const bump = useCallback(() => setVersion((value) => value + 1), []);

  const move = useCallback<ChessGameApi['move']>(
    (input) => {
      const chess = chessRef.current;
      if (manualEnding || chess.isGameOver()) return null;
      try {
        const result = chess.move(input);
        bump();
        return result;
      } catch {
        return null; // lance ilegal
      }
    },
    [bump, manualEnding],
  );

  const undo = useCallback(
    (plies = 1) => {
      let undone = 0;
      for (let i = 0; i < plies; i += 1) {
        if (!chessRef.current.undo()) break;
        undone += 1;
      }
      if (undone > 0) {
        setManualEnding(null);
        bump();
      }
      return undone;
    },
    [bump],
  );

  const reset = useCallback(
    (fen: string = START_FEN) => {
      chessRef.current = new Chess(fen);
      setStartFen(fen);
      setManualEnding(null);
      bump();
    },
    [bump],
  );

  const loadPgn = useCallback(
    (pgn: string) => {
      const chess = new Chess();
      try {
        chess.loadPgn(pgn);
      } catch {
        return false;
      }
      const headers = chess.getHeaders();
      chessRef.current = chess;
      setStartFen(headers.FEN ?? START_FEN);
      setManualEnding(null);
      bump();
      return true;
    },
    [bump],
  );

  const derived = useMemo(() => {
    const chess = chessRef.current;
    const history = chess.history({ verbose: true });
    const last = history.at(-1);
    const status = getGameStatus(chess);
    return {
      fen: chess.fen(),
      history,
      sanMoves: history.map((entry) => entry.san),
      lastMove: last ? { from: last.from, to: last.to } : null,
      status: manualEnding
        ? { ...status, isOver: true, result: manualEnding.result, endReason: manualEnding.endReason }
        : status,
      captures: summarizeCaptures(history),
    };
    // `version` força o recálculo depois de cada mudança no objeto mutável do chess.js.
  }, [version, manualEnding]);

  return {
    ...derived,
    initialFen: startFen,
    chess: chessRef.current,
    move,
    undo,
    reset,
    loadPgn,
    pgn: () => chessRef.current.pgn(),
    endManually: setManualEnding,
  };
}
