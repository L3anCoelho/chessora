import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PieceSymbol, Square } from 'chess.js';
import { CheckCircle2, CornerUpLeft, Lightbulb, RotateCcw } from 'lucide-react';
import type { GuidedLineBlock } from '@/types/domain';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Feedback';
import { ChessBoard } from '@/features/chess/components/ChessBoard';
import { useChessGame } from '@/features/chess/hooks/useChessGame';
import { findKingSquare, isPromotionMove, legalTargets, toMovePairs } from '@/features/chess/logic/rules';
import { pieceWithArticle, sanToPortuguese } from '@/features/chess/logic/notation';
import { compileGuidedLine, isExpectedMove } from '@/features/learning/logic/guidedLine';
import { usePreferences } from '@/hooks/usePreferences';

type Phase = 'playing' | 'wrong' | 'replying' | 'done';

const WRONG_MOVE_MS = 700;
const REPLY_DELAY_MS = 550;

const COLOR_LABEL = { w: 'brancas', b: 'pretas' } as const;

/** Dica de primeiro nível: diz qual peça mexer, sem entregar a casa. */
function pieceHint(san: string): string {
  const piece = pieceWithArticle(san);
  if (!piece) return 'O lance é um roque.';
  return `Mova ${piece}.`;
}

export function GuidedLine({ block, onFinished }: { block: GuidedLineBlock; onFinished?: (id: string) => void }) {
  const compiled = useMemo(() => {
    try {
      return { ok: true as const, line: compileGuidedLine(block) };
    } catch (error) {
      return { ok: false as const, message: (error as Error).message };
    }
  }, [block]);

  if (!compiled.ok) {
    return (
      <Notice tone="warning" title="Guia indisponível">
        Esta sequência tem um lance inválido e não pode ser treinada agora. {compiled.message}
      </Notice>
    );
  }
  return <GuidedLineBoard block={block} line={compiled.line} onFinished={onFinished} />;
}

function GuidedLineBoard({
  block,
  line,
  onFinished,
}: {
  block: GuidedLineBlock;
  line: ReturnType<typeof compileGuidedLine>;
  onFinished?: (id: string) => void;
}) {
  const game = useChessGame(line.startFen);
  const { preferences } = usePreferences();
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('playing');
  const [hintLevel, setHintLevel] = useState(0);
  const timers = useRef<number[]>([]);
  const finished = useRef(false);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  const total = line.steps.length;
  const current = stepIndex < total ? line.steps[stepIndex] : null;
  const previous = stepIndex > 0 ? line.steps[stepIndex - 1] : null;
  const playerColor = line.playerColor;

  const handleMove = (from: Square, to: Square, promotion?: PieceSymbol) => {
    if (phase !== 'playing' || !current) return;
    const move = game.move({ from, to, promotion });
    if (!move) return;

    if (!isExpectedMove(current.move, move.san)) {
      setPhase('wrong');
      setHintLevel((level) => Math.max(level, 1));
      later(() => {
        game.undo(1);
        setPhase('playing');
      }, WRONG_MOVE_MS);
      return;
    }

    const advance = () => {
      const next = stepIndex + 1;
      setStepIndex(next);
      setHintLevel(0);
      if (next >= total) {
        setPhase('done');
        if (!finished.current) {
          finished.current = true;
          onFinished?.(block.id);
        }
      } else {
        setPhase('playing');
      }
    };

    if (current.reply) {
      setPhase('replying');
      later(() => {
        game.move(current.reply!);
        advance();
      }, REPLY_DELAY_MS);
      return;
    }
    advance();
  };

  const restart = () => {
    clearTimers();
    game.reset(line.startFen);
    setStepIndex(0);
    setPhase('playing');
    setHintLevel(0);
  };

  const stepBack = () => {
    if (stepIndex === 0) return;
    clearTimers();
    const target = line.steps[stepIndex - 1];
    game.undo(target.reply ? 2 : 1);
    setStepIndex(stepIndex - 1);
    setPhase('playing');
    setHintLevel(0);
  };

  const status = game.status;
  const startNumber = Number(line.startFen.split(' ')[5] ?? 1) || 1;
  const pairs = toMovePairs(game.sanMoves, playerColor, startNumber);
  const hintText = current
    ? hintLevel >= 2
      ? `O lance é ${sanToPortuguese(current.move)}.`
      : hintLevel === 1
        ? pieceHint(current.move)
        : null
    : null;

  return (
    <section className="guided-line" aria-label={`Guia lance a lance: ${block.title}`}>
      <header className="guided-head">
        <h3>{block.title}</h3>
        <p className="faint">
          {phase === 'done' ? 'Linha concluída' : `Lance ${Math.min(stepIndex + 1, total)} de ${total}`}
        </p>
      </header>
      {block.intro && <p className="guided-intro">{block.intro}</p>}

      <div className="guided-body">
        <div className="lesson-board">
          <ChessBoard
            fen={game.fen}
            orientation={block.orientation ?? playerColor}
            movableColor={phase === 'playing' ? playerColor : null}
            getTargets={(square) => legalTargets(game.chess, square)}
            isPromotion={(from, to) => isPromotionMove(game.chess, from, to)}
            onMove={handleMove}
            lastMove={game.lastMove}
            checkSquare={status.inCheck ? findKingSquare(game.chess, status.turn) : null}
            showCoordinates={preferences.showCoordinates}
            showLegalMoves={preferences.showLegalMoves}
            label={`${block.title}. ${phase === 'done' ? 'Linha concluída.' : `Jogue com as ${COLOR_LABEL[playerColor]}.`}`}
          />
        </div>

        <div className="guided-side">
          <div className="guided-feedback" role="status" aria-live="polite">
            {phase === 'wrong' && <p className="guided-wrong">Não é esse lance aqui. Tente de novo.</p>}
            {phase === 'done' && (
              <p className="guided-done">
                <CheckCircle2 size={16} aria-hidden="true" /> {block.conclusion ?? 'Linha completa. Repita até sair sem pensar.'}
              </p>
            )}
            {phase !== 'done' && previous && (
              <p className="guided-explanation">
                <strong>{sanToPortuguese(previous.move)}</strong>
                {previous.reply && <> {sanToPortuguese(previous.reply)}</>} — {previous.explanation}
              </p>
            )}
            {phase !== 'done' && !previous && <p className="guided-explanation faint">Jogue o primeiro lance da linha.</p>}
            {hintText && phase !== 'done' && (
              <p className="guided-hint">
                <Lightbulb size={14} aria-hidden="true" /> {hintText}
              </p>
            )}
          </div>

          {pairs.length > 0 && (
            <ol className="guided-moves" aria-label="Lances jogados">
              {pairs.map((pair) => (
                <li key={pair.number}>
                  <span className="faint">{pair.number}.</span>{' '}
                  {pair.white ? sanToPortuguese(pair.white.san) : '…'}{' '}
                  {pair.black ? sanToPortuguese(pair.black.san) : ''}
                </li>
              ))}
            </ol>
          )}

          <div className="guided-actions">
            <Button
              size="sm"
              variant="secondary"
              icon={<Lightbulb size={14} />}
              onClick={() => setHintLevel((level) => Math.min(level + 1, 2))}
              disabled={phase === 'done' || hintLevel >= 2}
            >
              Dica
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={<CornerUpLeft size={14} />}
              onClick={stepBack}
              disabled={stepIndex === 0}
            >
              Voltar um lance
            </Button>
            <Button size="sm" variant="ghost" icon={<RotateCcw size={14} />} onClick={restart} disabled={stepIndex === 0 && phase === 'playing'}>
              Recomeçar
            </Button>
          </div>
        </div>
      </div>

      {phase === 'done' && (
        <ol className="guided-summary">
          {line.steps.map((step) => (
            <li key={step.index}>
              <strong>
                {sanToPortuguese(step.move)}
                {step.reply ? ` ${sanToPortuguese(step.reply)}` : ''}
              </strong>{' '}
              {step.explanation}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
