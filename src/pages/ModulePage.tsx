import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Clock, Lock } from 'lucide-react';
import { AccessBadge, Badge } from '@/components/ui/Badge';
import { Notice } from '@/components/ui/Feedback';
import { useAccess } from '@/features/premium/useAccess';
import { LockedContent } from '@/features/premium/LockedContent';
import { useProgress } from '@/features/progress/ProgressProvider';
import { getLessonsForModule, getModuleBySlug } from '@/services/contentRepository';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import NotFoundPage from './NotFoundPage';

export default function ModulePage() {
  const { moduleSlug = '' } = useParams();
  const module = getModuleBySlug(moduleSlug);
  useDocumentTitle(module?.title ?? 'Módulo não encontrado');
  const { check } = useAccess();
  const { progress } = useProgress();

  if (!module) {
    return <NotFoundPage title="Módulo não encontrado" description="Confira a lista completa de módulos em Aprender." />;
  }

  const lessons = getLessonsForModule(module);
  const moduleDecision = check(module);
  const done = new Set(progress.lessons.map((lesson) => lesson.lessonId));

  return (
    <div className="container page module-page">
      <nav className="breadcrumb" aria-label="Você está em">
        <Link to="/aprender">Aprender</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{module.title}</span>
      </nav>

      <header className="page-header">
        <div className="module-header-meta">
          <Badge>Módulo {module.order}</Badge>
          <AccessBadge access={module.access} locked={!moduleDecision.allowed} />
          {module.ebookChapter && <Badge tone="neutral">Capítulo {module.ebookChapter} do e-book</Badge>}
        </div>
        <h1>{module.title}</h1>
        <p>{module.summary}</p>
      </header>

      <div className="module-layout">
        <section aria-labelledby="lessons-title">
          <h2 id="lessons-title" className="section-title-sm">
            Aulas
          </h2>
          <ol className="lesson-list">
            {lessons.map((lesson) => {
              const decision = check(lesson);
              const isDone = done.has(lesson.id);
              const comingSoon = lesson.status === 'coming-soon';
              const content = (
                <>
                  <span className="lesson-index">{isDone ? <CheckCircle2 size={18} aria-label="Concluída" /> : lesson.order}</span>
                  <span className="lesson-text">
                    <strong>{lesson.title}</strong>
                    <span className="muted">{lesson.summary}</span>
                  </span>
                  <span className="lesson-meta">
                    {comingSoon ? (
                      <Badge>Em breve</Badge>
                    ) : !decision.allowed ? (
                      <AccessBadge access={lesson.access} locked />
                    ) : lesson.access !== module.access ? (
                      <AccessBadge access={lesson.access} />
                    ) : null}
                    <span className="faint lesson-duration">
                      <Clock size={13} aria-hidden="true" /> {lesson.durationMinutes} min
                    </span>
                  </span>
                </>
              );
              return (
                <li key={lesson.id}>
                  {comingSoon ? (
                    <div className="lesson-item is-disabled" aria-disabled="true">
                      {content}
                    </div>
                  ) : (
                    <Link to={`/aprender/${module.slug}/${lesson.slug}`} className={`lesson-item${isDone ? ' is-done' : ''}`}>
                      {content}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        <aside className="module-aside">
          {moduleDecision.allowed ? (
            <div className="panel panel-padded">
              <h2 className="section-title-sm">Ao final do módulo</h2>
              <ul className="check-list">
                {module.outcomes.map((outcome) => (
                  <li key={outcome}>{outcome}</li>
                ))}
              </ul>
            </div>
          ) : (
            <LockedContent
              decision={moduleDecision}
              access={module.access}
              title="O que este módulo ensina"
              summary={module.summary}
              benefits={module.outcomes}
            />
          )}
          {!moduleDecision.allowed && lessons.some((lesson) => check(lesson).allowed && lesson.status === 'published') && (
            <Notice tone="info" title="Há uma aula aberta neste módulo">
              Experimente a primeira aula antes de decidir.
            </Notice>
          )}
          {lessons.some((lesson) => lesson.status === 'coming-soon') && (
            <p className="faint module-note">
              <Lock size={13} aria-hidden="true" /> Aulas marcadas como Em breve ainda estão sendo escritas.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
