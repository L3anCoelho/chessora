import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Hourglass } from 'lucide-react';
import type { LessonBlock } from '@/types/domain';
import { Button } from '@/components/ui/Button';
import { AccessBadge } from '@/components/ui/Badge';
import { EmptyState, ErrorState, LoadingState, Notice } from '@/components/ui/Feedback';
import { useToast } from '@/components/ui/Toast';
import { LessonContent } from '@/features/learning/components/LessonContent';
import { LockedContent } from '@/features/premium/LockedContent';
import { useAccess } from '@/features/premium/useAccess';
import { useProgress } from '@/features/progress/ProgressProvider';
import {
  getLessonBySlug,
  getLessonsForModule,
  getModuleBySlug,
  loadLessonBody,
  type ContentResult,
} from '@/services/contentRepository';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import NotFoundPage from './NotFoundPage';

export default function LessonPage() {
  const { moduleSlug = '', lessonSlug = '' } = useParams();
  const module = getModuleBySlug(moduleSlug);
  const lesson = module ? getLessonBySlug(module, lessonSlug) : undefined;
  useDocumentTitle(lesson?.title ?? 'Aula não encontrada');
  const { subject } = useAccess();
  const { progress, completeLesson } = useProgress();
  const toast = useToast();
  const [result, setResult] = useState<ContentResult<LessonBlock[]> | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!lesson) return;
    let active = true;
    setResult(null);
    loadLessonBody(lesson, subject).then((value) => active && setResult(value));
    return () => {
      active = false;
    };
  }, [lesson, subject, attempt]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [lessonSlug]);

  if (!module || !lesson) {
    return <NotFoundPage title="Aula não encontrada" description="A aula pode ter mudado de lugar. Volte à lista de módulos." />;
  }

  const lessons = getLessonsForModule(module);
  const index = lessons.findIndex((item) => item.id === lesson.id);
  const findNeighbour = (step: 1 | -1) => {
    for (let i = index + step; i >= 0 && i < lessons.length; i += step) {
      if (lessons[i].status === 'published') return lessons[i];
    }
    return undefined;
  };
  const previous = findNeighbour(-1);
  const next = findNeighbour(1);
  const isDone = progress.lessons.some((item) => item.lessonId === lesson.id);

  const markDone = async () => {
    setSaving(true);
    try {
      await completeLesson(lesson.id);
      toast.show('Aula marcada como concluída.');
    } catch (error) {
      toast.show(error instanceof Error ? error.message : 'Não foi possível salvar.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container page lesson-page">
      <nav className="breadcrumb" aria-label="Você está em">
        <Link to="/aprender">Aprender</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/aprender/${module.slug}`}>{module.title}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{lesson.title}</span>
      </nav>

      <header className="lesson-header">
        <div className="module-header-meta">
          <span className="faint">
            Aula {lesson.order} de {lessons.length}
          </span>
          <span className="faint lesson-duration">
            <Clock size={13} aria-hidden="true" /> {lesson.durationMinutes} min
          </span>
          <AccessBadge access={lesson.access} locked={result?.status === 'locked'} />
        </div>
        <h1>{lesson.title}</h1>
        <p className="lesson-summary">{lesson.summary}</p>
      </header>

      {!result && <LoadingState label="Carregando a aula…" />}

      {result?.status === 'ok' && (
        <>
          <LessonContent
            blocks={result.data}
            onExerciseSolved={() => toast.show('Exercício resolvido.')}
          />
          <div className="lesson-complete">
            {isDone ? (
              <p className="lesson-done">
                <CheckCircle2 size={18} aria-hidden="true" /> Aula concluída
              </p>
            ) : (
              <Button onClick={markDone} loading={saving} icon={<CheckCircle2 size={16} />}>
                Marcar como concluída
              </Button>
            )}
          </div>
        </>
      )}

      {result?.status === 'locked' && (
        <LockedContent
          decision={result.decision}
          access={lesson.access}
          title={`Aula: ${lesson.title}`}
          summary={lesson.summary}
          benefits={module.outcomes}
        />
      )}

      {result?.status === 'coming-soon' && (
        <EmptyState
          icon={<Hourglass size={24} />}
          title="Aula em produção"
          description="Esta aula ainda está sendo escrita. As outras aulas do módulo já podem ser estudadas."
        />
      )}

      {result?.status === 'unavailable' && (
        <Notice tone="warning" title="Conteúdo indisponível neste ambiente">
          {result.message}
        </Notice>
      )}

      {result?.status === 'not-found' && (
        <EmptyState
          title="Conteúdo não encontrado"
          description="Esta aula ainda não foi cadastrada no servidor, ou sua conta não tem acesso a ela."
        />
      )}

      {result?.status === 'error' && (
        <ErrorState
          title="A aula não carregou"
          description={result.message}
          action={
            <Button variant="secondary" onClick={() => setAttempt((value) => value + 1)}>
              Tentar de novo
            </Button>
          }
        />
      )}

      <nav className="lesson-nav" aria-label="Navegação entre aulas">
        {previous ? (
          <Link to={`/aprender/${module.slug}/${previous.slug}`} className="lesson-nav-link">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>
              <span className="faint">Anterior</span>
              {previous.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/aprender/${module.slug}/${next.slug}`} className="lesson-nav-link is-next">
            <span>
              <span className="faint">Próxima</span>
              {next.title}
            </span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        ) : (
          <Link to={`/aprender/${module.slug}`} className="lesson-nav-link is-next">
            <span>
              <span className="faint">Fim das aulas publicadas</span>
              Voltar ao módulo
            </span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        )}
      </nav>
    </div>
  );
}
