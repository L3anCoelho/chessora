import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PieceSymbol, Square } from 'chess.js';
import { CheckCircle2, CornerUpLeft, Lightbulb, RotateCcw, Swords, Trophy } from 'lucide-react';
import type { GuidedGameBlock } from '@/types/domain';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Feedback';
import { ChessBoard } from '@/features/chess/components/ChessBoard';
import { useChessGame } from '@/features/chess/hooks/useChessGame';
import { findKingSquare, isPromotionMove, legalTargets, toMovePairs } from '@/features/chess/logic/rules';
import { pieceWithArticle, sanToPortuguese } from '@/features/chess/logic/notation';
import { playSound } from '@/features/chess/logic/sound';
import { buildGuidedGame, isExpectedMove, pickReply, type GuidedNode } from '@/features/learning/logic/guidedGame';
import { usePreferences } from '@/hooks/usePreferences';

type Phase = 'playing' | 'wrong' | 'replying' | 'leaf' | 'complete';

const WRONG_MOVE_MS = 750;
const REPLY_DELAY_MS = 600;
const CONFIRM_MS = 1600;

const COLOR_LABEL = { w: 'brancas', b: 'pretas' } as const;

export function GuidedGame({ block, onFinished }: { block: GuidedGameBlock; onFinished?: (id: string) => void }) {
  const built = useMemo(() => {
    try {
      return { ok: true as const, game: buildGuidedGame(block) };
    } catch (error) {
      return { ok: false as const, message: (error as Error).message };
    }
  }, [block]);

  if (!built.ok) {
    return (
      <Notice tone="warning" title="Partida guiada indisponível">
        Esta sequência tem um problema e não pode ser treinada agora. {built.message}
      </Notice>
    );
  }
  return <GuidedGameBoard block={block} tree={built.game} onFinished={onFinished} />;
}

function GuidedGameBoard({
  block,
  tree,
  onFinished,
}: {
  block: GuidedGameBlock;
  tree: ReturnType<typeof buildGuidedGame>;
  onFinished?: (id: string) => void;
}) {
  const game = useChessGame(tree.startFen);
  const { preferences } = usePreferences();
  const [node, setNode] = useState<GuidedNode>(tree.root);
  const [trail, setTrail] = useState<GuidedNode[]>([]);
  const [visited, setVisited] = useState<ReadonlySet<string>>(new Set());
  const [phase, setPhase] = useState<Phase>('playing');
  const [hintLevel, setHintLevel] = useState(0);
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [lastReply, setLastReply] = useState<GuidedNode | null>(null);
  const [leaf, setLeaf] = useState<GuidedNode | null>(null);
  const timers = useRef<number[]>([]);
  const announced = useRef(false);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  const total = tree.leaves.length;
  const beaten = visited.size;
  const expected = node.children[0] ?? null;

  /** Recomeça a partida do início, mantendo o que já foi vencido. */
  const restart = useCallback(
    (clearProgress: boolean) => {
      clearTimers();
      game.reset(tree.startFen);
      setNode(tree.root);
      setTrail([]);
      setPhase('playing');
      setHintLevel(0);
      setConfirmed(null);
      setLastReply(null);
      setLeaf(null);
      if (clearProgress) setVisited(new Set());
    },
    [clearTimers, game, tree],
  );

  const reachLeaf = useCallback(
    (reached: GuidedNode) => {
      setLeaf(reached);
      setPhase('leaf');
      playSound('finish', preferences.sounds);
      setVisited((current) => {
        const next = new Set(current);
        next.add(reached.path);
        if (next.size >= total && !announced.current) {
          announced.current = true;
          onFinished?.(block.id);
        }
        return next;
      });
    },
    [block.id, onFinished, preferences.sounds, total],
  );

  const handleMove = (from: Square, to: Square, promotion?: PieceSymbol) => {
    if (phase !== 'playing' || !expected) return;
    const move = game.move({ from, to, promotion });
    if (!move) return;

    if (!isExpectedMove(expected.san ?? '', move.san)) {
      playSound('wrong', preferences.sounds);
      setConfirmed(null);
      setHintLevel((level) => Math.max(level, 1));
      setPhase('wrong');
      later(() => {
        game.undo(1);
        setPhase('playing');
      }, WRONG_MOVE_MS);
      return;
    }

    playSound('correct', preferences.sounds);
    setConfirmed(sanToPortuguese(move.san));
    later(() => setConfirmed(null), CONFIRM_MS);
    setHintLevel(0);
    setTrail((current) => [...current, node]);

    // O lance do aluno já terminou a partida?
    if (expected.ending) {
      reachLeaf(expected);
      return;
    }

    setPhase('replying');
    later(() => {
      const reply = pickReply(expected, visited);
      game.move(reply.san ?? '');
      setLastReply(reply);
      if (reply.ending) {
        reachLeaf(reply);
        return;
      }
      setNode(reply);
      setPhase('playing');
    }, REPLY_DELAY_MS);
  };

  const stepBack = () => {
    if (trail.length === 0) return;
    clearTimers();
    // Desfaz o lance do aluno e, se houve, a resposta do adversário.
    game.undo(lastReply ? 2 : 1);
    const previous = trail[trail.length - 1];
    setTrail((current) => current.slice(0, -1));
    setNode(previous);
    setPhase('playing');
    setHintLevel(0);
    setConfirmed(null);
    setLeaf(null);
    setLastReply(null);
  };

  const status = game.status;
  const startNumber = Number(tree.startFen.split(' ')[5] ?? 1) || 1;
  const pairs = toMovePairs(game.sanMoves, tree.playerColor, startNumber);
  const allDone = beaten >= total;
  const hintText =
    expected && phase !== 'leaf'
      ? hintLevel >= 2
        ? `O lance é ${sanToPortuguese(expected.san ?? '')}.`
        : hintLevel === 1
          ? pieceHint(expected.san ?? '')
          : null
      : null;

  return (
    <section className="guided-line guided-game" aria-label={`Partida guiada: ${block.title}`}>
      <header className="guided-head">
        <h3>{block.title}</h3>
        <p className="faint">
          {allDone ? 'Todas as defesas vencidas' : `Defesas vencidas: ${beaten} de ${total}`}
        </p>
      </header>
      {block.intro && <p className="guided-intro">{block.intro}</p>}

      <div className="guided-body">
        <div className="lesson-board">
          <ChessBoard
            fen={game.fen}
            orientation={block.orientation ?? tree.playerColor}
            movableColor={phase === 'playing' ? tree.playerColor : null}
            getTargets={(square) => legalTargets(game.chess, square)}
            isPromotion={(from, to) => isPromotionMove(game.chess, from, to)}
            onMove={handleMove}
            lastMove={game.lastMove}
            checkSquare={status.inCheck ? findKingSquare(game.chess, status.turn) : null}
            showCoordinates={preferences.showCoordinates}
            showLegalMoves={preferences.showLegalMoves}
            label={`${block.title}. ${phase === 'leaf' ? 'Partida encerrada.' : `Jogue com as ${COLOR_LABEL[tree.playerColor]}.`}`}
          />
        </div>

        <div className="guided-side">
          <div className="guided-feedback" role="status" aria-live="polite">
            {confirmed && phase !== 'leaf' && (
              <p className="guided-correct">
                <CheckCircle2 size={16} aria-hidden="true" /> Certo! {confirmed}
              </p>
            )}
            {phase === 'wrong' && <p className="guided-wrong">Não é esse lance aqui. Tente de novo.</p>}

            {phase === 'leaf' && leaf && (
              <div className="guided-leaf">
                <p className={allDone ? 'guided-done' : 'guided-correct'}>
                  {allDone ? <Trophy size={16} aria-hidden="true" /> : <CheckCircle2 size={16} aria-hidden="true" />}{' '}
                  {leaf.ending?.outcome === 'mate' ? 'Xeque-mate!' : 'Posição ganha!'}
                </p>
                {leaf.ending?.text && <p className="guided-explanation">{leaf.ending.text}</p>}
                {allDone ? (
                  <p className="guided-explanation">{block.conclusion ?? 'Você venceu todas as defesas desta partida.'}</p>
                ) : (
                  <p className="guided-explanation">
                    {total - beaten === 1
                      ? 'Falta uma defesa.'
                      : `Faltam ${total - beaten} defesas.`}{' '}
                    Jogue de novo: o adversário vai tentar outra coisa.
                  </p>
                )}
              </div>
            )}

            {phase !== 'leaf' && lastReply && (
              <p className="guided-explanation">
                <Swords size={14} aria-hidden="true" /> Ele respondeu <strong>{sanToPortuguese(lastReply.san ?? '')}</strong>
                {lastReply.note ? ` — ${lastReply.note}` : '.'}
              </p>
            )}
            {phase !== 'leaf' && !lastReply && expected?.note && (
              <p className="guided-explanation faint">{expected.note}</p>
            )}
            {hintText && (
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
            {phase === 'leaf' && !allDone ? (
              <Button size="sm" icon={<Swords size={14} />} onClick={() => restart(false)}>
                Próxima defesa
              </Button>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                icon={<Lightbulb size={14} />}
                onClick={() => setHintLevel((level) => Math.min(level + 1, 2))}
                disabled={phase === 'leaf' || hintLevel >= 2}
              >
                Dica
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              icon={<CornerUpLeft size={14} />}
              onClick={stepBack}
              disabled={trail.length === 0 || phase === 'leaf'}
            >
              Voltar um lance
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={<RotateCcw size={14} />}
              onClick={() => restart(true)}
              disabled={trail.length === 0 && beaten === 0}
            >
              Recomeçar tudo
            </Button>
          </div>

          <ol className="guided-defences" aria-label="Defesas desta partida">
            {tree.leaves.map((item, index) => (
              <li key={item.path} className={visited.has(item.path) ? 'is-done' : undefined}>
                {visited.has(item.path) ? <CheckCircle2 size={13} aria-hidden="true" /> : <span className="dot" aria-hidden="true" />}
                {item.ending?.label ?? `Defesa ${index + 1}`}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/** Dica de primeiro nível: diz qual peça mexer, sem entregar a casa. */
function pieceHint(san: string): string {
  const piece = pieceWithArticle(san);
  if (!piece) return 'O lance é um roque.';
  return `Mova ${piece}.`;
}
