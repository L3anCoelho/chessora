import { ShieldX } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Feedback';

export default function UnauthorizedPage() {
  return (
    <div className="container page">
      <EmptyState
        icon={<ShieldX size={24} />}
        title="Acesso não autorizado"
        description="Esta área é restrita a administradores. Se você deveria ter acesso, entre com a conta administradora."
        action={
          <>
            <ButtonLink to="/">Ir para o início</ButtonLink>
            <ButtonLink to="/entrar" variant="secondary">
              Entrar com outra conta
            </ButtonLink>
          </>
        }
      />
    </div>
  );
}
