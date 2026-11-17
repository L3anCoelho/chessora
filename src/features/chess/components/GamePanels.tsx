import { useEffect, useRef } from 'react';
import type { PieceSymbol } from 'chess.js';
import type { PlayerColor } from '@/types/domain';
import { toMovePairs } from '../logic/rules';
import { Piece } from './Piece';

export function CapturedPieces({
  pieces,
  color,
  advantage,
}: {
  /** Peças capturadas (da cor adversária). */
  pieces: PieceSymbol[];
  color: PlayerColor;
  advantage: number;
}) {
  const opponent: PlayerColor = color === 'w' ? 'b' : 'w';
  return (
    <div className="captured" aria-label={`Peças capturadas: ${pieces.length}`}>
      {pieces.map((piece, index) => (
        <Piece key={`${piece}-${index}`} type={piece} color={opponent} />
      ))}
      {advantage > 0 && <span className="captured-balance">+{advantage}</span>}
    </div>
  );
}

export function PlayerBar({
  name,
  color,
  isTurn,
  isThinking,
  captured,
  advantage,
}: {
  name: string;
  color: PlayerColor;
  isTurn: boolean;
  isThinking?: boolean;
  captured: PieceSymbol[];
  advantage: number;
}) {
  return (
    <div className="player-bar">
      <div className="player-identity">
        <span className={`player-swatch is-${color}`} aria-hidden="true" />
        <div>
          <div className="player-name">{name}</div>
          <CapturedPieces pieces={captured} color={color} advantage={advantage} />
        </div>
      </div>
      {isTurn && (
        <span className="turn-indicator" role="status">
          {isThinking ? 'Pensando' : 'Na vez'}
        </span>
      )}
    </div>
  );
}

export function MoveList({ moves, startsWith = 'w' }: { moves: string[]; startsWith?: PlayerColor }) {
  const listRef = useRef<HTMLOListElement>(null);
  const pairs = toMovePairs(moves, startsWith);
  const lastPly = moves.length - 1;

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
    list.scrollLeft = list.scrollWidth;
  }, [moves.length]);

  if (moves.length === 0) {
    return <p className="move-list-empty">Os lances aparecem aqui em notação algébrica.</p>;
  }

  return (
    <ol ref={listRef} className="move-list" aria-label="Histórico de lances" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {pairs.map((pair) => (
        <li key={pair.number} style={{ display: 'contents' }}>
          <span className="move-number">{pair.number}.</span>
          <span className={`move${pair.white?.ply === lastPly ? ' is-current' : ''}`}>{pair.white?.san ?? '…'}</span>
          <span className={`move${pair.black?.ply === lastPly ? ' is-current' : ''}`}>{pair.black?.san ?? ''}</span>
        </li>
      ))}
    </ol>
  );
}
