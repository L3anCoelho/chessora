import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Lock } from 'lucide-react';
import type { ChallengeCategory } from '@/types/domain';
import { AccessBadge, Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/Feedback';
import { SegmentedControl } from '@/components/ui/Form';
import { CATEGORY_LABEL, DIFFICULTY_LABEL } from '@/data/challenges';
import { useAccess } from '@/features/premium/useAccess';
import { useProgress } from '@/features/progress/ProgressProvider';
import { listChallenges } from '@/services/contentRepository';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

type AccessFilter = 'all' | 'free' | 'premium';

export default function ChallengesPage() {
  useDocumentTitle('Desafios');
  const { check } = useAccess();
  const { progress } = useProgress();
  const [accessFilter, setAccessFilter] = useState<AccessFilter>('all');
  const [category, setCategory] = useState<ChallengeCategory | 'all'>('all');

  const all = listChallenges();
  const solved = new Set(progress.challenges.filter((item) => item.solved).map((item) => item.challengeId));
  const categories = Array.from(new Set(all.map((item) => item.category)));
  const visible = all.filter(
    (item) =>
      (accessFilter === 'all' || (accessFilter === 'free' ? item.isFree : !item.isFree)) &&
      (category === 'all' || item.category === category),
  );
  const freeCount = all.filter((item) => item.isFree).length;
  const solvedFree = all.filter((item) => item.isFree && solved.has(item.id)).length;

  return (
    <div className="container page">
      <header className="page-header">
        <h1>Desafios</h1>
        <p>
          Cada desafio é uma posição com um objetivo. Mova as peças no tabuleiro: a resposta é conferida na hora e você
          pode tentar quantas vezes quiser.
        </p>
      </header>

      <div className="challenge-toolbar">
        <SegmentedControl<AccessFilter>
          label="Mostrar"
          value={accessFilter}
          onChange={setAccessFilter}
          options={[
            { value: 'all', label: 'Todos' },
            { value: 'free', label: 'Gratuitos' },
            { value: 'premium', label: 'Premium' },
          ]}
        />
        <div className="chip-group" role="group" aria-label="Filtrar por tema">
          <button type="button" className={`chip${category === 'all' ? ' is-active' : ''}`} onClick={() => setCategory('all')}>
            Todos os temas
          </button>
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={`chip${category === item ? ' is-active' : ''}`}
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
            >
              {CATEGORY_LABEL[item]}
            </button>
          ))}
        </div>
        <p className="faint challenge-count">
          {solvedFree} de {freeCount} gratuitos resolvidos
        </p>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="Nenhum desafio com esses filtros"
          description="Troque o tema ou mostre todos os desafios."
          action={
            <button
              type="button"
              className="btn btn-secondary btn-md"
              onClick={() => {
                setCategory('all');
                setAccessFilter('all');
              }}
            >
              Limpar filtros
            </button>
          }
        />
      ) : (
        <ul className="challenge-grid">
          {visible.map((item) => {
            const locked = !check(item).allowed;
            const isSolved = solved.has(item.id);
            return (
              <li key={item.id}>
                <Link to={`/desafios/${item.id}`} className={`challenge-card${isSolved ? ' is-solved' : ''}`}>
                  <span className="challenge-card-top">
                    <Badge>{CATEGORY_LABEL[item.category]}</Badge>
                    {isSolved ? (
                      <span className="solved-mark">
                        <CheckCircle2 size={16} aria-hidden="true" /> Resolvido
                      </span>
                    ) : (
                      !item.isFree && <AccessBadge access="premium" locked={locked} />
                    )}
                  </span>
                  <strong>{item.title}</strong>
                  <span className="muted">{item.objective}</span>
                  <span className="challenge-card-bottom">
                    <span className="faint">{DIFFICULTY_LABEL[item.difficulty]}</span>
                    {locked && (
                      <span className="faint locked-hint">
                        <Lock size={13} aria-hidden="true" /> Ver como liberar
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
