import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LoadingState } from '@/components/ui/Feedback';
import { AuthNotConfigured } from './AuthNotConfigured';
import { useAuth } from './AuthProvider';

/** Exige usuário logado. Sem Supabase configurado, explica o motivo em vez de simular login. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'unconfigured') return <AuthNotConfigured />;
  if (status === 'loading') return <LoadingState label="Verificando sua sessão…" />;
  if (status === 'signed-out') {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/entrar?redirect=${redirect}`} replace />;
  }
  return <>{children}</>;
}

/**
 * Exige perfil administrador (coluna role em public.profiles). É uma barreira de interface:
 * as consultas administrativas também são verificadas no banco por public.is_admin().
 */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { status, subject } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <LoadingState label="Verificando permissões…" />;
  if (status === 'signed-out') {
    return <Navigate to={`/entrar?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  if (subject.kind !== 'admin') return <Navigate to="/acesso-negado" replace />;
  return <>{children}</>;
}
