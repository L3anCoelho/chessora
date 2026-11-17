import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, Puzzle, Swords, TrendingUp } from 'lucide-react';
import type { GameRecord } from '@/types/domain';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState, ErrorState, LoadingState, Notice } from '@/components/ui/Feedback';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/authentication/AuthProvider';
import { useAccess } from '@/features/premium/useAccess';
import { useProgress } from '@/features/progress/ProgressProvider';
import { computeModuleProgress, computeStats, findNextLesson } from '@/features/progress/stats';
import { ENGINE_LEVELS } from '@/features/chess/engine/stockfishEngine';
import { END_REASON_LABEL } from '@/features/chess/logic/rules';
import { getAllLessons, getChallengeSummary, getLessonsForModule, getModuleById, getModules } from '@/services/contentRepository';
import { formatDateTime } from '@/utils/format';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const OUTCOME_LABEL = { win: 'Vitória', loss: 'Derrota', draw: 'Empate' } as const;

function describeGame(game: GameRecord): string {
  const reason = END_REASON_LABEL[game.endReason];
  if (game.mode === 'local') {
    const winner = game.result === 'white' ? 'brancas venceram' : game.result === 'black' ? 'pretas venceram' : 'empate';
    return `Partida entre duas pessoas: ${winner} (${reason.toLowerCase()})`;
  }
  const level = game.engineLevel ? ENGINE_LEVELS[game.engineLevel].label.toLowerCase() : '';
  const outcome = game.outcome ? OUTCOME_LABEL[game.outcome] : 'Partida';
  return `${outcome} contra o computador, nível ${level} (${reason.toLowerCase()})`;
}

type Activity = { id: string; date: string; icon: ReactNode; text: string; to?: string };

export default function ProgressPage() {
  useDocumentTitle('Meu Progresso');
  const { status } = useAuth();
  const { check } = useAccess();
  const { progress, loading, error, storage, reload } = useProgress();

  if (loading) return <LoadingState label="Carregando seu progresso…" />;

  const stats = computeStats(progress);
  const modules = getModules().map((module) => ({ module, lessons: getLessonsForModule(module) }));
  const next = findNextLesson(modules, progress, (lesson) => check(lesson).allowed);
  const lessonsById = new Map(getAllLessons().map((lesson) => [lesson.id, lesson]));
  const hasAnyData = progress.games.length + progress.challenges.length + progress.lessons.length > 0;

  const activities: Activity[] = [
    ...progress.games.map((game) => ({
      id: `g-${game.id}`,
      date: game.endedAt,
      icon: <Swords size={16} />,
      text: describeGame(game),
    })),
    ...progress.challenges
      .filter((item) => item.solvedAt)
      .map((item) => ({
        id: `c-${item.challengeId}`,
        date: item.solvedAt as string,
        icon: <Puzzle size={16} />,
        text: `Desafio resolvido: ${getChallengeSummary(item.challengeId)?.title ?? item.challengeId}`,
        to: `/desafios/${item.challengeId}`,
      })),
    ...progress.lessons.map((item) => {
      const lesson = lessonsById.get(item.lessonId);
      const module = lesson ? getModuleById(lesson.moduleId) : undefined;
      return {
        id: `l-${item.lessonId}`,
        date: item.completedAt,
        icon: <BookOpen size={16} />,
        text: `Aula concluída: ${lesson?.title ?? item.lessonId}`,
        to: lesson && module ? `/aprender/${module.slug}/${lesson.slug}` : undefined,
      };
    }),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  const statCards = [
    { label: 'Partidas jogadas', value: stats.gamesPlayed },
    { label: 'Vitórias', value: stats.wins, note: 'contra o computador' },
    { label: 'Derrotas', value: stats.losses, note: 'contra o computador' },
    { label: 'Empates', value: stats.draws, note: 'contra o computador' },
    { label: 'Desafios resolvidos', value: stats.challengesSolved },
    { label: 'Aulas concluídas', value: stats.lessonsCompleted },
  ];

  return (
    <div className="container page">
      <header className="page-header">
        <h1>Meu Progresso</h1>
        <p>Partidas, aulas e desafios que você já fez, e o próximo passo.</p>
      </header>

      {error && (
        <ErrorState
          title="Seu progresso não carregou"
          description={error}
          action={
            <Button variant="secondary" onClick={reload}>
              Tentar de novo
            </Button>
          }
        />
      )}

      {storage === 'local' && (
        <Notice tone="info" title="Salvo apenas neste navegador">
          {status === 'unconfigured'
            ? 'Sem conta, seu progresso fica neste navegador e não aparece em outros dispositivos.'
            : 'Crie uma conta gratuita para guardar o progresso e acessar de outros dispositivos. O que você fizer a partir daí fica salvo na conta.'}
        </Notice>
      )}

      {!error && !hasAnyData ? (
        <EmptyState
          icon={<TrendingUp size={24} />}
          title="Nada registrado ainda"
          description="Termine uma partida, resolva um desafio ou conclua uma aula. Tudo aparece aqui."
          action={
            <>
              <ButtonLink to="/jogar">Jogar uma partida</ButtonLink>
              <ButtonLink to="/aprender" variant="secondary">
                Começar uma aula
              </ButtonLink>
            </>
          }
        />
      ) : (
        !error && (
          <>
            <dl className="stat-grid">
              {statCards.map((card) => (
                <div key={card.label} className="stat-card">
                  <dt>{card.label}</dt>
                  <dd>{card.value}</dd>
                  {card.note && <span className="faint">{card.note}</span>}
                </div>
              ))}
            </dl>

            <div className="progress-columns">
              <section className="panel">
                <div className="panel-header">
                  <h2>Aprendizado</h2>
                </div>
                <div className="settings-body">
                  {next ? (
                    <Link to={`/aprender/${next.module.slug}/${next.lesson.slug}`} className="next-lesson">
                      <span className="faint">Continue de onde parou</span>
                      <strong>{next.lesson.title}</strong>
                      <span className="muted">{next.module.title}</span>
                    </Link>
                  ) : (
                    <p className="muted">Você concluiu todas as aulas disponíveis para sua conta.</p>
                  )}
                  <ul className="module-progress-list">
                    {modules.map(({ module, lessons }) => {
                      const moduleStats = computeModuleProgress(module, lessons, progress);
                      const allowed = check(module).allowed || lessons.some((lesson) => check(lesson).allowed);
                      const percent =
                        moduleStats.available > 0 ? Math.round((moduleStats.completed / moduleStats.available) * 100) : 0;
                      return (
                        <li key={module.id}>
                          <span>{module.title}</span>
                          {allowed && moduleStats.available > 0 ? (
                            <div className="progress-meter">
                              <div className="progress-track">
                                <div className="progress-fill" style={{ width: `${percent}%` }} />
                              </div>
                              <span>
                                {moduleStats.completed}/{moduleStats.available}
                              </span>
                            </div>
                          ) : (
                            <span className="faint">Bloqueado</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </section>

              <section className="panel">
                <div className="panel-header">
                  <h2>Últimas atividades</h2>
                </div>
                {activities.length === 0 ? (
                  <p className="muted settings-body">Nenhuma atividade ainda.</p>
                ) : (
                  <ul className="activity-list">
                    {activities.map((activity) => (
                      <li key={activity.id}>
                        <span className="activity-icon" aria-hidden="true">
                          {activity.icon}
                        </span>
                        <span className="activity-text">
                          {activity.to ? <Link to={activity.to}>{activity.text}</Link> : activity.text}
                          <span className="faint">{formatDateTime(activity.date)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            {stats.challengesSolved > 0 && (
              <p className="faint progress-footnote">
                <CheckCircle2 size={14} aria-hidden="true" /> Desafios resolvidos depois de ver a solução não entram na contagem.
              </p>
            )}
          </>
        )
      )}
    </div>
  );
}
