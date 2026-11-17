import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { PieceSymbol, Square } from 'chess.js';
import type { PlayerColor } from '@/types/domain';
import { FILES, parsePlacement } from '../logic/rules';
import { Piece, pieceLabel } from './Piece';
import './chess.css';

export interface ChessBoardProps {
  fen: string;
  orientation?: PlayerColor;
  /** Cor que o usuário pode mover agora; null = tabuleiro somente leitura. */
  movableColor?: PlayerColor | null;
  /** Lances legais a partir de uma casa (vem do chess.js). */
  getTargets?: (square: Square) => Square[];
  /** Indica se o lance de from para to é uma promoção. */
  isPromotion?: (from: Square, to: Square) => boolean;
  /** Recebe a tentativa de lance já validada como alvo legal. */
  onMove?: (from: Square, to: Square, promotion?: PieceSymbol) => void;
  lastMove?: { from: string; to: string } | null;
  checkSquare?: string | null;
  highlights?: string[];
  showCoordinates?: boolean;
  showLegalMoves?: boolean;
  label?: string;
}

const PROMOTION_CHOICES: PieceSymbol[] = ['q', 'r', 'b', 'n'];

interface DragState {
  from: Square;
  pointerId: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  active: boolean;
}

export function ChessBoard({
  fen,
  orientation = 'w',
  movableColor = null,
  getTargets,
  isPromotion,
  onMove,
  lastMove = null,
  checkSquare = null,
  highlights = [],
  showCoordinates = true,
  showLegalMoves = true,
  label = 'Tabuleiro de xadrez',
}: ChessBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Square | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

  const placement = useMemo(() => parsePlacement(fen), [fen]);
  const sideToMove = (fen.split(' ')[1] ?? 'w') as PlayerColor;
  const canInteract = movableColor !== null && movableColor === sideToMove && Boolean(onMove && getTargets);

  // A posição mudou (lance do adversário, desfazer, nova partida): limpa a seleção.
  useEffect(() => {
    setSelected(null);
    setDrag(null);
    setPendingPromotion(null);
  }, [fen]);

  const targets = useMemo(
    () => (selected && canInteract && getTargets ? getTargets(selected) : []),
    [selected, canInteract, getTargets],
  );

  const squares = useMemo(() => {
    const ranks = orientation === 'w' ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];
    const files = orientation === 'w' ? FILES : [...FILES].reverse();
    return ranks.flatMap((rank) => files.map((file) => `${file}${rank}` as Square));
  }, [orientation]);

  const squareFromPoint = useCallback(
    (clientX: number, clientY: number): Square | null => {
      const rect = boardRef.current?.getBoundingClientRect();
      if (!rect) return null;
      const col = Math.floor(((clientX - rect.left) / rect.width) * 8);
      const row = Math.floor(((clientY - rect.top) / rect.height) * 8);
      if (col < 0 || col > 7 || row < 0 || row > 7) return null;
      return squares[row * 8 + col] ?? null;
    },
    [squares],
  );

  const isOwnPiece = useCallback(
    (square: Square) => {
      const piece = placement[square];
      return canInteract && piece !== undefined && piece.color === movableColor;
    },
    [placement, canInteract, movableColor],
  );

  const attemptMove = useCallback(
    (from: Square, to: Square) => {
      if (!onMove || !getTargets || !getTargets(from).includes(to)) return false;
      if (isPromotion?.(from, to)) {
        setPendingPromotion({ from, to });
        return true;
      }
      setSelected(null);
      onMove(from, to);
      return true;
    },
    [onMove, getTargets, isPromotion],
  );

  /** Clique ou toque numa casa (também usado pelo teclado). */
  const activateSquare = useCallback(
    (square: Square): 'moved' | 'selected' | 'cleared' => {
      if (pendingPromotion) return 'cleared';
      if (selected && selected !== square && targets.includes(square)) {
        attemptMove(selected, square);
        return 'moved';
      }
      if (isOwnPiece(square)) {
        setSelected(square);
        return 'selected';
      }
      setSelected(null);
      return 'cleared';
    },
    [pendingPromotion, selected, targets, attemptMove, isOwnPiece],
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !canInteract) return;
    if ((event.target as HTMLElement).closest('.promotion-overlay')) return;
    const square = squareFromPoint(event.clientX, event.clientY);
    if (!square) return;
    const outcome = activateSquare(square);
    if (outcome === 'selected') {
      event.currentTarget.setPointerCapture(event.pointerId);
      setDrag({
        from: square,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        x: event.clientX,
        y: event.clientY,
        active: false,
      });
    }
    event.preventDefault();
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const moved = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 4;
    setDrag({ ...drag, x: event.clientX, y: event.clientY, active: drag.active || moved });
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (drag.active) {
      const target = squareFromPoint(event.clientX, event.clientY);
      if (target && target !== drag.from) attemptMove(drag.from, target);
    }
    setDrag(null);
  };

  const choosePromotion = (piece: PieceSymbol) => {
    if (!pendingPromotion || !onMove) return;
    const { from, to } = pendingPromotion;
    setPendingPromotion(null);
    setSelected(null);
    onMove(from, to, piece);
  };

  const rect = boardRef.current?.getBoundingClientRect();
  const squareSize = rect ? rect.width / 8 : 0;
  const highlightSet = new Set(highlights);

  return (
    <div className="board-frame">
      <div
        ref={boardRef}
        className={`board${canInteract ? ' is-interactive' : ''}${drag?.active ? ' is-dragging' : ''}`}
        role="grid"
        aria-label={label}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => setDrag(null)}
      >
        {squares.map((square, index) => {
          const fileIndex = FILES.indexOf(square[0] as (typeof FILES)[number]);
          const rank = Number(square[1]);
          // a1 é escura e h1 é clara: casa clara quando coluna (0-7) + fileira (1-8) é par.
          const isLight = (fileIndex + rank) % 2 === 0;
          const piece = placement[square];
          const isTarget = showLegalMoves && targets.includes(square);
          const hidePiece = drag?.active && drag.from === square;
          const classes = [
            'square',
            isLight ? 'is-light' : 'is-dark',
            selected === square && 'is-selected',
            lastMove && (lastMove.from === square || lastMove.to === square) && 'is-last-move',
            checkSquare === square && 'is-check',
            highlightSet.has(square) && 'is-highlight',
            isTarget && (piece ? 'is-capture-target' : 'is-move-target'),
          ]
            .filter(Boolean)
            .join(' ');
          const row = Math.floor(index / 8);
          const col = index % 8;
          const name = piece ? `${square}, ${pieceLabel(piece.type, piece.color)}` : square;
          return (
            <button
              type="button"
              key={square}
              className={classes}
              aria-label={isTarget ? `${name}, lance possível` : name}
              aria-pressed={selected === square}
              tabIndex={canInteract ? 0 : -1}
              onClick={(event) => {
                // Cliques de mouse/toque já foram tratados no pointerdown; aqui só o teclado.
                if (event.detail === 0) activateSquare(square);
              }}
            >
              {showCoordinates && col === 0 && <span className="coord coord-rank">{square[1]}</span>}
              {showCoordinates && row === 7 && <span className="coord coord-file">{square[0]}</span>}
              {piece && !hidePiece && <Piece type={piece.type} color={piece.color} />}
            </button>
          );
        })}

        {drag?.active && rect && placement[drag.from] && (
          <div
            className="drag-ghost"
            style={{
              width: squareSize,
              height: squareSize,
              transform: `translate(${drag.x - rect.left - squareSize / 2}px, ${drag.y - rect.top - squareSize / 2}px)`,
            }}
          >
            <Piece type={placement[drag.from].type} color={placement[drag.from].color} />
          </div>
        )}

        {pendingPromotion && (
          <div className="promotion-overlay" role="dialog" aria-modal="true" aria-label="Escolha a promoção">
            <div className="promotion-panel">
              <p>Promover para</p>
              <div className="promotion-options">
                {PROMOTION_CHOICES.map((piece) => (
                  <button
                    key={piece}
                    type="button"
                    className="promotion-option"
                    onClick={() => choosePromotion(piece)}
                    aria-label={pieceLabel(piece, movableColor ?? 'w')}
                    autoFocus={piece === 'q'}
                  >
                    <Piece type={piece} color={movableColor ?? 'w'} />
                  </button>
                ))}
              </div>
              <button type="button" className="promotion-cancel" onClick={() => setPendingPromotion(null)}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
