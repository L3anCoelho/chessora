import { useCallback } from 'react';
import { useAuth } from '@/features/authentication/AuthProvider';
import { canAccess, type AccessDecision, type ProtectedResource } from './access';

/** Atalho para componentes: decide o acesso com o usuário atual. */
export function useAccess() {
  const { subject } = useAuth();
  const check = useCallback((resource: ProtectedResource): AccessDecision => canAccess(subject, resource), [subject]);
  return { subject, check };
}
