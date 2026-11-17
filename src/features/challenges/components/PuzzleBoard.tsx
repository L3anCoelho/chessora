import { useEffect, useRef, useState } from 'react';
import type { Chess, PieceSymbol, Square } from 'chess.js';
import type { PlayerColor } from '@/types/domain';
import { ChessBoard } from '@/features/chess/components/ChessBoard';
import { useChessGame } from '@/features/chess/hooks/useChessGame';
import { findKingSquare, isPromotionMove, legalTargets } from '@/features/chess/logic/rules';
import { usePreferences } from '@/hooks/usePreferences';
import type { ChallengeVerdict } from '../validate';

export type PuzzlePhase = 'playing' | 'replying' | 'wrong' | 'solved';

interface PuzzleBoardProps {
  fen: string;
  /** Avalia o lance do jogador. plyIndex = índice do lance na linha da solução. */
  evaluate: (plyIndex: number, san: string, after: Chess) => ChallengeVerdict;
  onPhaseChange?: (phase: PuzzlePhase, info: { lastSan: string | null }) => void;
  label?: string;
  /** Sequência para demonstrar a solução (desativa a interação). */
  demonstration?: string[] | null;
}

const WRONG_MOVE_DISPLAY_MS = 700;
const REPLY_DELAY_MS = 550;

/**
 * Tabuleiro de exercício: o usuário joga, o lance é avaliado e, se errado,
 * volta para a posição anterior para nova tentativa.
 */
export function PuzzleBoard({ fen, evaluate, onPhaseChange, label, demonstration }: PuzzleBoardProps) {
  const game = useChessGame(fen);
  const { preferences } = usePreferences();
  const [phase, setPhase] = useState<PuzzlePhase>('playing');
  const plyRef = useRef(0);
  const timers = useRef<number[]>([]);
  const playerColor = (fen.split(' ')[1] ?? 'w') as PlayerColor;
  const phaseCallback = useRef(onPhaseChange);
  phaseCallback.current = onPhaseChange;

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  const changePhase = (next: PuzzlePhase, lastSan: string | null) => {
    setPhase(next);
    phaseCallback.current?.(next, { lastSan });
  };

  // Demonstração da solução: reproduz os lances a partir da posição inicial.
  useEffect(() => {
    if (!demonstration) return;
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    game.reset(fen);
    demonstration.forEach((san, index) => later(() => game.move(san), 600 * (index + 1)));
    // Só reage quando a demonstração é pedida.
  }, [demonstration]);

  const handleMove = (from: Square, to: Square, promotion?: PieceSymbol) => {
    if (phase !== 'playing' || demonstration) return;
    const move = game.move({ from, to, promotion });
    if (!move) return;
    const verdict = evaluate(plyRef.current, move.san, game.chess);

    if (verdict.kind === 'wrong') {
      changePhase('wrong', move.san);
      later(() => {
        game.undo(1);
        setPhase('playing');
      }, WRONG_MOVE_DISPLAY_MS);
      return;
    }
    if (verdict.kind === 'solved') {
      changePhase('solved', move.san);
      return;
    }
    changePhase('replying', move.san);
    later(() => {
      game.move(verdict.reply);
      plyRef.current += 2;
      changePhase('playing', move.san);
    }, REPLY_DELAY_MS);
  };

  const status = game.status;
  return (
    <ChessBoard
      fen={game.fen}
      orientation={playerColor}
      movableColor={phase === 'playing' && !demonstration ? playerColor : null}
      getTargets={(square) => legalTargets(game.chess, square)}
      isPromotion={(from, to) => isPromotionMove(game.chess, from, to)}
      onMove={handleMove}
      lastMove={game.lastMove}
      checkSquare={status.inCheck ? findKingSquare(game.chess, status.turn) : null}
      showCoordinates={preferences.showCoordinates}
      showLegalMoves={preferences.showLegalMoves}
      label={label}
    />
  );
}
