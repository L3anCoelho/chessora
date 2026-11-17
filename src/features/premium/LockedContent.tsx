import { Lock, LogIn } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { ButtonLink } from '@/components/ui/Button';
import type { AccessLevel } from '@/types/domain';
import { useAuth } from '@/features/authentication/AuthProvider';
import type { AccessDecision } from './access';

interface LockedContentProps {
  decision: Extract<AccessDecision, { allowed: false }>;
  access: AccessLevel;
  /** O que o conteúdo ensina, para mostrar o benefício mesmo bloqueado. */
  title: string;
  summary: string;
  benefits?: string[];
}

/**
 * Painel exibido no lugar de conteúdo bloqueado. Mostra a apresentação e o caminho para liberar,
 * nunca o conteúdo em si (que nem chega ao navegador sem permissão).
 */
export function LockedContent({ decision, access, title, summary, benefits }: LockedContentProps) {
  const { isConfigured } = useAuth();
  const location = useLocation();
  const redirect = encodeURIComponent(location.pathname);
  const isPremium = access === 'premium';

  return (
    <section className="locked" aria-labelledby="locked-title">
      <div className="locked-icon" aria-hidden="true">
        <Lock size={22} />
      </div>
      <h2 id="locked-title">{title}</h2>
      <p className="muted">{summary}</p>

      {benefits && benefits.length > 0 && (
        <ul className="locked-benefits">
          {benefits.map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>
      )}

      {decision.reason === 'requires-login' && !isPremium && !isConfigured && (
        <p>Este conteúdo é gratuito para quem tem conta, mas o cadastro ainda não está disponível neste ambiente.</p>
      )}

      {decision.reason === 'requires-login' && !isPremium && isConfigured && (
        <>
          <p>Este conteúdo é gratuito para quem tem conta. O cadastro leva menos de um minuto.</p>
          <div className="locked-actions">
            <ButtonLink to={`/cadastro?redirect=${redirect}`} icon={<LogIn size={16} />}>
              Criar conta gratuita
            </ButtonLink>
            <ButtonLink to={`/entrar?redirect=${redirect}`} variant="secondary">
              Já tenho conta
            </ButtonLink>
          </div>
        </>
      )}

      {isPremium && (
        <>
          <p>
            Este conteúdo faz parte do acesso premium, que será liberado pelo e-book Xadrez Inteligente. O e-book ainda
            está em produção e não está à venda.
            {decision.reason === 'requires-login' && isConfigured && ' Se você já tem acesso, entre na sua conta.'}
          </p>
          <div className="locked-actions">
            <ButtonLink to="/ebook">Conhecer o e-book</ButtonLink>
            {decision.reason === 'requires-login' && isConfigured && (
              <ButtonLink to={`/entrar?redirect=${redirect}`} variant="secondary">
                Entrar
              </ButtonLink>
            )}
          </div>
        </>
      )}
    </section>
  );
}
