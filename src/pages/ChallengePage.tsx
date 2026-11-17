import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Eye, Lightbulb, RotateCcw } from 'lucide-react';
import type { Challenge } from '@/types/domain';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { EmptyState, ErrorState, LoadingState, Notice } from '@/components/ui/Feedback';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { CATEGORY_LABEL, DIFFICULTY_LABEL, freeChallenges } from '@/data/challenges';
import { PuzzleBoard, type PuzzlePhase } from '@/features/challenges/components/PuzzleBoard';
import { evaluateChallengeMove } from '@/features/challenges/validate';
import { LockedContent } from '@/features/premium/LockedContent';
import { useAccess } from '@/features/premium/useAccess';
import { useProgress } from '@/features/progress/ProgressProvider';
import { getChallengeSummary, loadChallenge, type ContentResult } from '@/services/contentRepository';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import NotFoundPage from './NotFoundPage';

function ChallengeSolver({ challenge }: { challenge: Challenge }) {
  const { progress, recordChallengeAttempt } = useProgress();
  const toast = useToast();
  const [phase, setPhase] = useState<PuzzlePhase>('playing');
  const [lastSan, setLastSan] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [confirmReveal, setConfirmReveal] = useState(false);
  const [demonstration, setDemonstration] = useState<string[] | null>(null);
  const alreadySolved = progress.challenges.some((item) => item.challengeId === challenge.id && item.solved);

  const nextChallenge = useMemo(() => {
    const index = freeChallenges.findIndex((item) => item.id === challenge.id);
    return index >= 0 ? freeChallenges[index + 1] : undefined;
  }, [challenge.id]);

  const save = (solved: boolean) =>
    recordChallengeAttempt(challenge.id, solved).catch((error: Error) => toast.show(error.message, 'danger'));

  const handlePhase = (next: PuzzlePhase, info: { lastSan: string | null }) => {
    setPhase(next);
    setLastSan(info.lastSan);
    if (next === 'wrong') save(false);
    // Depois de ver a solução, acertar não conta como resolvido.
    if (next === 'solved' && !revealed) save(true);
  };

  const restart = () => {
    setDemonstration(null);
    setPhase('playing');
    setLastSan(null);
    setRound((value) => value + 1);
  };

  const reveal = () => {
    setConfirmReveal(false);
    setRevealed(true);
    setDemonstration([...challenge.solution]);
    setRound((value) => value + 1);
  };

  const solutionText = challenge.solution
    .map((san, index) => (index % 2 === 0 ? `${san}` : `(${san})`))
    .join(' ');

  return (
    <div className="challenge-layout">
      <div className="challenge-board">
        <PuzzleBoard
          key={round}
          fen={challenge.fen}
          label={challenge.objective}
          evaluate={(ply, san, after) => evaluateChallengeMove(challenge, ply, san, after)}
          onPhaseChange={handlePhase}
          demonstration={demonstration}
        />
      </div>

      <aside className="challenge-side">
        <div className="challenge-objective">
          <span className={`side-swatch is-${challenge.sideToMove}`} aria-hidden="true" />
          <p>{challenge.objective}</p>
        </div>
        <p className="muted">{challenge.description}</p>

        <div role="status" aria-live="polite">
          {phase === 'wrong' && (
            <Notice tone="danger" title={`${lastSan} não resolve o desafio`}>
              A posição voltou ao início. Tente outro lance.
            </Notice>
          )}
          {phase === 'replying' && <Notice tone="info">Correto. O adversário responde…</Notice>}
          {phase === 'playing' && lastSan && !demonstration && (
            <Notice tone="success" title="Bom lance">
              Continue a sequência.
            </Notice>
          )}
          {phase === 'solved' && (
            <Notice tone="success" title={revealed ? 'Sequência concluída' : 'Desafio resolvido'}>
              <p>{challenge.explanation}</p>
              {revealed && <p>Como a solução foi exibida antes, este desafio não conta como resolvido no seu progresso.</p>}
            </Notice>
          )}
          {demonstration && phase !== 'solved' && (
            <Notice tone="info" title="Solução">
              <p>{solutionText}</p>
              <p>{challenge.explanation}</p>
            </Notice>
          )}
        </div>

        {showHint && challenge.hint && phase !== 'solved' && !demonstration && (
          <Notice tone="warning" title="Dica">
            {challenge.hint}
          </Notice>
        )}

        <div className="challenge-actions">
          {challenge.hint && !showHint && phase !== 'solved' && !demonstration && (
            <Button variant="secondary" size="sm" icon={<Lightbulb size={16} />} onClick={() => setShowHint(true)}>
              Ver dica
            </Button>
          )}
          {!demonstration && phase !== 'solved' && (
            <Button variant="ghost" size="sm" icon={<Eye size={16} />} onClick={() => setConfirmReveal(true)}>
              Mostrar solução
            </Button>
          )}
          {(phase === 'solved' || demonstration || lastSan) && (
            <Button variant="secondary" size="sm" icon={<RotateCcw size={16} />} onClick={restart}>
              Tentar de novo
            </Button>
          )}
        </div>

        {alreadySolved && phase !== 'solved' && (
          <p className="solved-mark">
            <CheckCircle2 size={16} aria-hidden="true" /> Você já resolveu este desafio.
          </p>
        )}

        <div className="challenge-next">
          {nextChallenge ? (
            <ButtonLink to={`/desafios/${nextChallenge.id}`} variant={phase === 'solved' ? 'primary' : 'ghost'}>
              Próximo desafio <ArrowRight size={16} aria-hidden="true" />
            </ButtonLink>
          ) : (
            <ButtonLink to="/desafios" variant="ghost">
              Ver todos os desafios
            </ButtonLink>
          )}
        </div>
      </aside>

      <ConfirmDialog
        open={confirmReveal}
        title="Mostrar a solução?"
        description="Vale tentar mais uma vez. Se você ver a solução agora, o desafio não será marcado como resolvido."
        confirmLabel="Mostrar solução"
        onConfirm={reveal}
        onCancel={() => setConfirmReveal(false)}
      />
    </div>
  );
}

export default function ChallengePage() {
  const { challengeId = '' } = useParams();
  const summary = getChallengeSummary(challengeId);
  useDocumentTitle(summary?.title ?? 'Desafio não encontrado');
  const { subject } = useAccess();
  const [result, setResult] = useState<ContentResult<Challenge> | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setResult(null);
    loadChallenge(challengeId, subject).then((value) => active && setResult(value));
    return () => {
      active = false;
    };
  }, [challengeId, subject, attempt]);

  if (!summary) {
    return <NotFoundPage title="Desafio não encontrado" description="Veja a lista completa em Desafios." />;
  }

  return (
    <div className="container page challenge-page">
      <nav className="breadcrumb" aria-label="Você está em">
        <Link to="/desafios">Desafios</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{summary.title}</span>
      </nav>
      <header className="challenge-header">
        <h1>{summary.title}</h1>
        <div className="module-header-meta">
          <Badge>{CATEGORY_LABEL[summary.category]}</Badge>
          <Badge tone="blue">{DIFFICULTY_LABEL[summary.difficulty]}</Badge>
        </div>
      </header>

      {!result && <LoadingState label="Carregando o desafio…" />}
      {result?.status === 'ok' && <ChallengeSolver key={result.data.id} challenge={result.data} />}
      {result?.status === 'locked' && (
        <LockedContent
          decision={result.decision}
          access={summary.access}
          title="Desafio exclusivo"
          summary={`${summary.description} ${summary.objective}`}
        />
      )}
      {result?.status === 'unavailable' && (
        <Notice tone="warning" title="Desafio indisponível neste ambiente">
          {result.message}
        </Notice>
      )}
      {result?.status === 'not-found' && (
        <EmptyState title="Desafio ainda não cadastrado" description="A posição deste desafio ainda não está no servidor." />
      )}
      {result?.status === 'error' && (
        <ErrorState
          title="O desafio não carregou"
          description={result.message}
          action={
            <Button variant="secondary" onClick={() => setAttempt((value) => value + 1)}>
              Tentar de novo
            </Button>
          }
        />
      )}
      {result?.status === 'coming-soon' && <EmptyState title="Desafio em produção" />}
    </div>
  );
}
