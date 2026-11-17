import { useState } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Feedback';
import { useAuth } from '@/features/authentication/AuthProvider';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/**
 * Página de retorno do checkout. Voltar para cá NÃO libera nada: o acesso só aparece
 * quando o webhook do servidor registra o pagamento confirmado.
 */
export default function CheckoutReturnPage() {
  useDocumentTitle('Pagamento em processamento');
  const { subject, refresh, status } = useAuth();
  const [checking, setChecking] = useState(false);
  const hasAccess = subject.kind === 'premium' || subject.kind === 'admin';

  if (hasAccess) {
    return (
      <div className="container page">
        <EmptyState
          icon={<CheckCircle2 size={24} />}
          title="Acesso premium liberado"
          description="Seu pagamento foi confirmado. Os módulos premium já estão disponíveis na sua conta."
          action={<ButtonLink to="/aprender">Ir para as aulas</ButtonLink>}
        />
      </div>
    );
  }

  return (
    <div className="container page">
      <EmptyState
        icon={<Clock size={24} />}
        title="Aguardando a confirmação do pagamento"
        description="Assim que a plataforma de pagamento confirmar a compra, o acesso é liberado automaticamente na sua conta. Pagamentos por boleto podem levar até 3 dias úteis."
        action={
          status === 'signed-in' ? (
            <Button
              variant="secondary"
              loading={checking}
              onClick={async () => {
                setChecking(true);
                await refresh();
                setChecking(false);
              }}
            >
              Verificar meu acesso
            </Button>
          ) : (
            <ButtonLink to="/entrar?redirect=%2Febook%2Fobrigado">Entrar na conta usada na compra</ButtonLink>
          )
        }
      />
    </div>
  );
}
