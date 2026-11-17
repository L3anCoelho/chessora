import { useEffect, useState } from 'react';
import { AccessBadge, Badge } from '@/components/ui/Badge';
import { Notice } from '@/components/ui/Feedback';
import { CATEGORY_LABEL, DIFFICULTY_LABEL } from '@/data/challenges';
import { adminService } from '@/services/adminService';
import { getLessonsForModule, getModules, listChallenges } from '@/services/contentRepository';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

type StoredContent = { lessons: Set<string>; challenges: Set<string> };

export default function AdminContentPage() {
  useDocumentTitle('Conteúdo');
  const [stored, setStored] = useState<StoredContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminService
      .listStoredPremiumContent()
      .then(setStored)
      .catch((loadError: Error) => setError(loadError.message));
  }, []);

  /** Onde o conteúdo de cada item está guardado: no código (gratuito) ou no banco (premium). */
  const storedBadge = (id: string, kind: 'lessons' | 'challenges', inBundle: boolean) => {
    if (inBundle) return <Badge tone="neutral">No código</Badge>;
    if (!stored) return <Badge tone="neutral">Banco não consultado</Badge>;
    return stored[kind].has(id) ? <Badge tone="green">No banco</Badge> : <Badge tone="danger">Falta no banco</Badge>;
  };

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>Conteúdo</h1>
        <p>Módulos, aulas e desafios, com o nível de acesso e onde o conteúdo está guardado.</p>
      </header>
      {error && <Notice tone="danger">{error}</Notice>}

      {getModules().map((module) => (
        <section key={module.id} className="panel admin-table-panel">
          <div className="panel-header">
            <h2>
              {module.order}. {module.title}
            </h2>
            <AccessBadge access={module.access} />
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Aula</th>
                  <th scope="col">Acesso</th>
                  <th scope="col">Situação</th>
                  <th scope="col">Conteúdo</th>
                </tr>
              </thead>
              <tbody>
                {getLessonsForModule(module).map((lesson) => (
                  <tr key={lesson.id}>
                    <td>
                      <strong>{lesson.title}</strong>
                      <span className="faint table-sub">{lesson.id}</span>
                    </td>
                    <td>
                      <AccessBadge access={lesson.access} />
                    </td>
                    <td>{lesson.status === 'published' ? <Badge tone="green">Publicada</Badge> : <Badge>Em breve</Badge>}</td>
                    <td>{lesson.status === 'published' ? storedBadge(lesson.id, 'lessons', Boolean(lesson.body)) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <section className="panel admin-table-panel">
        <div className="panel-header">
          <h2>Desafios</h2>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Desafio</th>
                <th scope="col">Tema</th>
                <th scope="col">Nível</th>
                <th scope="col">Acesso</th>
                <th scope="col">Conteúdo</th>
              </tr>
            </thead>
            <tbody>
              {listChallenges().map((challenge) => (
                <tr key={challenge.id}>
                  <td>
                    <strong>{challenge.title}</strong>
                    <span className="faint table-sub">{challenge.id}</span>
                  </td>
                  <td>{CATEGORY_LABEL[challenge.category]}</td>
                  <td>{DIFFICULTY_LABEL[challenge.difficulty]}</td>
                  <td>
                    <AccessBadge access={challenge.access} />
                  </td>
                  <td>{storedBadge(challenge.id, 'challenges', challenge.isFree)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
