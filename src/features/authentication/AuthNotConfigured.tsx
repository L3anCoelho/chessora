import { KeyRound } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Feedback';

/** Estado mostrado quando o Supabase ainda não foi configurado. */
export function AuthNotConfigured({ compact }: { compact?: boolean }) {
  return (
    <div className={compact ? undefined : 'container page'}>
      <EmptyState
        icon={<KeyRound size={24} />}
        title="Contas ainda não estão disponíveis"
        description={
          <>
            O login depende do Supabase, que não foi configurado neste ambiente. Partidas, aulas gratuitas e desafios
            gratuitos funcionam normalmente sem conta, e o progresso fica salvo neste navegador.
          </>
        }
        action={
          <>
            <ButtonLink to="/jogar">Jogar agora</ButtonLink>
            <ButtonLink to="/aprender" variant="secondary">
              Ver aulas gratuitas
            </ButtonLink>
          </>
        }
      />
    </div>
  );
}
