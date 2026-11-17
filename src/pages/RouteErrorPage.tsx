import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { ErrorState } from '@/components/ui/Feedback';

/** Página de erro inesperado. Fica fora do layout para funcionar mesmo se o layout falhar. */
export function RouteErrorPage() {
  const error = useRouteError();
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;
  const isChunkError = error instanceof Error && /dynamically imported module|Loading chunk/i.test(error.message);

  return (
    <div className="container page">
      <ErrorState
        title={isNotFound ? 'Página não encontrada' : 'Esta página não carregou'}
        description={
          isChunkError
            ? 'Uma nova versão do site foi publicada enquanto você navegava. Recarregue para continuar.'
            : 'Ocorreu um erro inesperado. Recarregue a página; se continuar, volte ao início.'
        }
        action={
          <>
            <button type="button" className="btn btn-primary btn-md" onClick={() => window.location.reload()}>
              Recarregar
            </button>
            <a className="btn btn-secondary btn-md" href={import.meta.env.BASE_URL}>
              Ir para o início
            </a>
          </>
        }
      />
    </div>
  );
}
