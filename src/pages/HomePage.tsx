import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Check, Crown, Puzzle, Swords } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { AccessBadge, Badge } from '@/components/ui/Badge';
import { PuzzleBoard, type PuzzlePhase } from '@/features/challenges/components/PuzzleBoard';
import { evaluateChallengeMove } from '@/features/challenges/validate';
import { freeChallenges, CATEGORY_LABEL, DIFFICULTY_LABEL } from '@/data/challenges';
import { getLessonsForModule, getModules } from '@/services/contentRepository';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { plural } from '@/utils/format';

const HERO_CHALLENGE = freeChallenges.find((challenge) => challenge.id === 'mate-em-dois-corredor')!;

const HERO_MESSAGES: Record<PuzzlePhase, string> = {
  playing: 'Brancas jogam e dão mate em 2. Arraste ou clique numa peça.',
  replying: 'Boa. As pretas respondem…',
  wrong: 'Esse lance não força o mate. Tente outro.',
  solved: 'Mate. A torre preta não conseguia defender duas ameaças na mesma fileira.',
};

function HeroPuzzle() {
  const [phase, setPhase] = useState<PuzzlePhase>('playing');
  const [round, setRound] = useState(0);
  const [moved, setMoved] = useState(false);
  return (
    <div className="hero-puzzle">
      <PuzzleBoard
        key={round}
        fen={HERO_CHALLENGE.fen}
        label="Desafio: brancas jogam e dão mate em 2"
        evaluate={(ply, san, after) => evaluateChallengeMove(HERO_CHALLENGE, ply, san, after)}
        onPhaseChange={(next) => {
          setPhase(next);
          setMoved(true);
        }}
      />
      <div className={`hero-puzzle-caption is-${phase}`} role="status" aria-live="polite">
        <p>{HERO_MESSAGES[phase]}</p>
        {phase === 'solved' ? (
          <div className="hero-puzzle-actions">
            <Link to="/desafios">Mais desafios</Link>
            <button type="button" onClick={() => setRound((value) => value + 1)}>
              Jogar de novo
            </button>
          </div>
        ) : (
          moved && (
            <button type="button" className="hero-reset" onClick={() => setRound((value) => value + 1)}>
              Recomeçar
            </button>
          )
        )}
      </div>
    </div>
  );
}

const PATHS = [
  {
    icon: <Swords size={22} />,
    title: 'Jogar',
    text: 'Contra o Stockfish em três níveis, ou com outra pessoa no mesmo aparelho. A partida fica salva se você sair no meio.',
    to: '/jogar',
    cta: 'Abrir tabuleiro',
  },
  {
    icon: <BookOpen size={22} />,
    title: 'Aprender',
    text: 'Aulas curtas com diagramas e exercícios no tabuleiro. O módulo Fundamentos ensina todas as regras e é gratuito.',
    to: '/aprender',
    cta: 'Ver módulos',
  },
  {
    icon: <Puzzle size={22} />,
    title: 'Praticar',
    text: 'Posições com um objetivo: dar mate, ganhar uma peça, encontrar o garfo. A resposta é conferida na hora.',
    to: '/desafios',
    cta: 'Resolver desafios',
  },
];

const METHOD = [
  { title: 'Jogar', text: 'Uma partida mostra o que você ainda não sabe.' },
  { title: 'Aprender', text: 'Uma aula curta explica o padrão por trás do erro.' },
  { title: 'Praticar', text: 'Desafios repetem o padrão até ele ficar automático.' },
  { title: 'Evoluir', text: 'Meu Progresso mostra o que já foi feito e o próximo passo.' },
];

const BENEFITS = [
  'Comece sem cadastro',
  'Regras oficiais conferidas em cada lance',
  'Funciona no celular',
  'Progresso salvo, com ou sem conta',
];

export default function HomePage() {
  useDocumentTitle(null);
  const modules = getModules();
  const featuredChallenges = freeChallenges.filter((challenge) => challenge.id !== HERO_CHALLENGE.id).slice(0, 3);

  return (
    <div className="home">
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <h1>Xadrez se aprende com as peças na mão.</h1>
            <p className="hero-lead">
              Jogue contra o computador, estude em aulas curtas e treine com desafios corrigidos na hora. Do primeiro
              lance às primeiras vitórias.
            </p>
            <div className="hero-actions">
              <ButtonLink to="/jogar" size="lg">
                Jogar agora
              </ButtonLink>
              <ButtonLink to="/aprender" size="lg" variant="secondary">
                Começar a aprender
              </ButtonLink>
            </div>
            <ul className="hero-benefits">
              {BENEFITS.map((benefit) => (
                <li key={benefit}>
                  <Check size={16} aria-hidden="true" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          <HeroPuzzle />
        </div>
      </section>

      <section className="home-section">
        <div className="container">
          <h2 className="section-title">Três formas de evoluir</h2>
          <div className="paths">
            {PATHS.map((path) => (
              <article key={path.title} className="path">
                <span className="path-icon" aria-hidden="true">
                  {path.icon}
                </span>
                <h3>{path.title}</h3>
                <p className="muted">{path.text}</p>
                <Link to={path.to} className="path-link">
                  {path.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-method">
        <div className="container method-inner">
          <div>
            <h2 className="section-title">O método</h2>
            <p className="muted method-lead">
              Cada parte da plataforma leva à próxima. Você não precisa seguir uma ordem fixa, mas o ciclo é este.
            </p>
          </div>
          <ol className="method-steps">
            {METHOD.map((step, index) => (
              <li key={step.title}>
                <span className="method-number">{index + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p className="muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="home-section">
        <div className="container home-columns">
          <div>
            <div className="section-head">
              <h2 className="section-title">Módulos</h2>
              <Link to="/aprender">Ver todos</Link>
            </div>
            <ol className="home-modules">
              {modules.map((module) => {
                const lessons = getLessonsForModule(module);
                return (
                  <li key={module.id}>
                    <Link to={`/aprender/${module.slug}`} className="home-module">
                      <span className="home-module-order">{module.order}</span>
                      <span className="home-module-body">
                        <strong>{module.title}</strong>
                        <span className="muted">{module.summary}</span>
                      </span>
                      <span className="home-module-meta">
                        <AccessBadge access={module.access} />
                        <span className="faint">{plural(lessons.length, 'aula', 'aulas')}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
          <div>
            <div className="section-head">
              <h2 className="section-title">Desafios gratuitos</h2>
              <Link to="/desafios">Ver todos</Link>
            </div>
            <ul className="home-challenges">
              {featuredChallenges.map((challenge) => (
                <li key={challenge.id}>
                  <Link to={`/desafios/${challenge.id}`} className="home-challenge">
                    <strong>{challenge.title}</strong>
                    <span className="muted">{challenge.objective}</span>
                    <span className="home-challenge-tags">
                      <Badge>{CATEGORY_LABEL[challenge.category]}</Badge>
                      <Badge tone="blue">{DIFFICULTY_LABEL[challenge.difficulty]}</Badge>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="container">
          <div className="premium-band">
            <Crown size={26} aria-hidden="true" className="premium-band-icon" />
            <div>
              <h2>Conteúdo premium com o e-book</h2>
              <p className="muted">
                Os módulos Táticas, Estratégia, Aberturas e Finais completos, com desafios exclusivos, serão liberados
                pelo e-book Xadrez Inteligente. O livro está em produção.
              </p>
            </div>
            <ButtonLink to="/ebook" variant="secondary">
              Conhecer o e-book
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="home-section home-final">
        <div className="container final-cta">
          <h2>Sua primeira partida leva menos de um minuto para começar.</h2>
          <div className="hero-actions">
            <ButtonLink to="/jogar" size="lg">
              Jogar agora
            </ButtonLink>
            <ButtonLink to="/cadastro" size="lg" variant="ghost">
              Criar conta gratuita
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
