import { Compass } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Feedback';

export default function NotFoundPage({
  title = 'Página não encontrada',
  description = 'O endereço pode ter mudado ou estar digitado errado.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="container page">
      <EmptyState
        icon={<Compass size={24} />}
        title={title}
        description={description}
        action={
          <>
            <ButtonLink to="/">Ir para o início</ButtonLink>
            <ButtonLink to="/aprender" variant="secondary">
              Ver aulas
            </ButtonLink>
          </>
        }
      />
    </div>
  );
}
