import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { AccessBadge } from '@/components/ui/Badge';
import { useAccess } from '@/features/premium/useAccess';
import { useProgress } from '@/features/progress/ProgressProvider';
import { computeModuleProgress } from '@/features/progress/stats';
import { getLessonsForModule, getModules } from '@/services/contentRepository';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { plural } from '@/utils/format';

export default function LearnPage() {
  useDocumentTitle('Aprender');
  const { check } = useAccess();
  const { progress } = useProgress();
  const modules = getModules();

  return (
    <div className="container page">
      <header className="page-header">
        <h1>Aprender</h1>
        <p>Cinco módulos, do tabuleiro vazio às aberturas e finais. Cada aula tem diagramas e exercícios no tabuleiro.</p>
      </header>

      <dl className="access-legend">
        <div>
          <dt>
            <AccessBadge access="public" />
          </dt>
          <dd>Aberto para todos, sem cadastro.</dd>
        </div>
        <div>
          <dt>
            <AccessBadge access="registered" />
          </dt>
          <dd>Basta criar uma conta.</dd>
        </div>
        <div>
          <dt>
            <AccessBadge access="premium" />
          </dt>
          <dd>Liberado pelo futuro e-book.</dd>
        </div>
      </dl>

      <ol className="module-list">
        {modules.map((module) => {
          const lessons = getLessonsForModule(module);
          const stats = computeModuleProgress(module, lessons, progress);
          const locked = !check(module).allowed;
          const percent = stats.available > 0 ? Math.round((stats.completed / stats.available) * 100) : 0;
          return (
            <li key={module.id} className="module-row">
              <span className="module-order" aria-hidden="true">
                {module.order}
              </span>
              <div className="module-main">
                <div className="module-title-row">
                  <h2>
                    <Link to={`/aprender/${module.slug}`}>{module.title}</Link>
                  </h2>
                  <AccessBadge access={module.access} locked={locked} />
                </div>
                <p className="muted">{module.summary}</p>
                <ul className="module-outcomes">
                  {module.outcomes.map((outcome) => (
                    <li key={outcome}>{outcome}</li>
                  ))}
                </ul>
              </div>
              <div className="module-side">
                <span className="faint">
                  {plural(lessons.length, 'aula', 'aulas')}
                  {stats.available < lessons.length && `, ${stats.available} publicadas`}
                </span>
                {stats.available > 0 && !locked && (
                  <div className="progress-meter" aria-label={`${stats.completed} de ${stats.available} aulas concluídas`}>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${percent}%` }} />
                    </div>
                    <span>
                      {stats.completed}/{stats.available}
                    </span>
                  </div>
                )}
                <Link to={`/aprender/${module.slug}`} className="module-cta">
                  {locked ? (
                    <>
                      <Lock size={14} aria-hidden="true" /> Ver apresentação
                    </>
                  ) : stats.completed > 0 ? (
                    'Continuar'
                  ) : (
                    'Começar'
                  )}
                </Link>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
