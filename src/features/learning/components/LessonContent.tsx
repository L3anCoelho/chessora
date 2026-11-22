import { useMemo, useState } from 'react';
import { Chess, type Square } from 'chess.js';
import { CheckCircle2, Lightbulb, RotateCcw } from 'lucide-react';
import type { LessonBlock } from '@/types/domain';
import { ChessBoard } from '@/features/chess/components/ChessBoard';
import { legalTargets } from '@/features/chess/logic/rules';
import { PuzzleBoard, type PuzzlePhase } from '@/features/challenges/components/PuzzleBoard';
import { evaluateExerciseMove } from '@/features/challenges/validate';
import { GuidedLine } from './GuidedLine';
import { usePreferences } from '@/hooks/usePreferences';

type DiagramBlock = Extract<LessonBlock, { type: 'diagram' }>;
type ExerciseBlock = Extract<LessonBlock, { type: 'exercise' }>;

function LessonDiagram({ block }: { block: DiagramBlock }) {
  const { preferences } = usePreferences();
  const highlights = useMemo(() => {
    const squares = [...(block.highlights ?? [])];
    if (block.showMovesFrom) {
      try {
        squares.push(...legalTargets(new Chess(block.fen), block.showMovesFrom as Square));
      } catch {
        /* FEN de diagrama inválido: mostra só a posição */
      }
    }
    return squares;
  }, [block]);

  return (
    <figure className="lesson-figure">
      <div className="lesson-board">
        <ChessBoard
          fen={block.fen}
          orientation={block.orientation ?? 'w'}
          highlights={highlights}
          lastMove={block.showMovesFrom ? { from: block.showMovesFrom, to: block.showMovesFrom } : null}
          showCoordinates={preferences.showCoordinates}
          label={block.caption}
        />
      </div>
      <figcaption>{block.caption}</figcaption>
    </figure>
  );
}

function LessonExercise({ block, onSolved }: { block: ExerciseBlock; onSolved?: (id: string) => void }) {
  const [phase, setPhase] = useState<PuzzlePhase>('playing');
  const [round, setRound] = useState(0);
  return (
    <figure className={`lesson-figure lesson-exercise is-${phase}`}>
      <p className="exercise-prompt">
        <strong>Exercício.</strong> {block.prompt}
      </p>
      <div className="lesson-board">
        <PuzzleBoard
          key={round}
          fen={block.fen}
          label={block.prompt}
          evaluate={(_ply, san, after) => (evaluateExerciseMove(block, san, after) ? { kind: 'solved' } : { kind: 'wrong' })}
          onPhaseChange={(next) => {
            setPhase(next);
            if (next === 'solved') onSolved?.(block.id);
          }}
        />
      </div>
      <figcaption role="status" aria-live="polite">
        {phase === 'solved' && (
          <span className="exercise-feedback is-success">
            <CheckCircle2 size={18} aria-hidden="true" /> {block.successText}
            <button type="button" className="link-button" onClick={() => setRound((value) => value + 1)}>
              <RotateCcw size={14} aria-hidden="true" /> Repetir
            </button>
          </span>
        )}
        {phase === 'wrong' && <span className="exercise-feedback is-wrong">Não é esse lance. Tente de novo.</span>}
        {phase === 'playing' && (
          <span className="faint">Vez das {block.fen.split(' ')[1] === 'b' ? 'pretas' : 'brancas'}. Mova no tabuleiro.</span>
        )}
      </figcaption>
    </figure>
  );
}

export function LessonContent({
  blocks,
  onExerciseSolved,
  onGuidedLineFinished,
}: {
  blocks: LessonBlock[];
  onExerciseSolved?: (id: string) => void;
  onGuidedLineFinished?: (id: string) => void;
}) {
  return (
    <div className="lesson-content">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'paragraph':
            return <p key={index}>{block.text}</p>;
          case 'heading':
            return <h2 key={index}>{block.text}</h2>;
          case 'list': {
            const List = block.ordered ? 'ol' : 'ul';
            return (
              <List key={index}>
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </List>
            );
          }
          case 'tip':
            return (
              <aside key={index} className="lesson-tip">
                <Lightbulb size={18} aria-hidden="true" />
                <div>
                  <strong>{block.title}</strong>
                  <p>{block.text}</p>
                </div>
              </aside>
            );
          case 'diagram':
            return <LessonDiagram key={index} block={block} />;
          case 'exercise':
            return <LessonExercise key={block.id} block={block} onSolved={onExerciseSolved} />;
          case 'guided-line':
            return <GuidedLine key={block.id} block={block} onFinished={onGuidedLineFinished} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
