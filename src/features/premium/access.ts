/**
 * Serviço central de permissões.
 *
 * Todas as decisões de acesso da interface passam por aqui. Isso controla o que a interface
 * mostra; a proteção real do conteúdo premium está no banco (RLS em lesson_contents e
 * challenge_contents), que aplica a mesma regra com a função SQL public.has_scope().
 */
import type { AccessLevel, AccessScope, AccessSubject, UserEntitlement, UserRole } from '@/types/domain';

export interface ProtectedResource {
  access: AccessLevel;
  requiredScope?: AccessScope;
}

export type AccessDecision =
  | { allowed: true; reason: 'public' | 'registered' | 'entitled' | 'admin' }
  | { allowed: false; reason: 'requires-login' | 'requires-entitlement' };

export const VISITOR: AccessSubject = { kind: 'visitor', userId: null, role: null, scopes: new Set() };

/** Um direito de acesso só conta se estiver ativo e dentro da validade. */
export function isEntitlementActive(entitlement: UserEntitlement, now: Date = new Date()): boolean {
  if (entitlement.status !== 'active') return false;
  if (new Date(entitlement.startsAt) > now) return false;
  if (entitlement.expiresAt && new Date(entitlement.expiresAt) <= now) return false;
  return true;
}

export function buildSubject(
  userId: string | null,
  role: UserRole | null,
  entitlements: UserEntitlement[],
  now: Date = new Date(),
): AccessSubject {
  if (!userId) return VISITOR;
  const scopes = new Set<AccessScope>();
  for (const entitlement of entitlements) {
    if (entitlement.userId !== userId || !isEntitlementActive(entitlement, now)) continue;
    entitlement.scopes.forEach((scope) => scopes.add(scope));
  }
  const kind: AccessSubject['kind'] = role === 'admin' ? 'admin' : scopes.size > 0 ? 'premium' : 'registered';
  return { kind, userId, role, scopes };
}

export function canAccess(subject: AccessSubject, resource: ProtectedResource): AccessDecision {
  if (subject.kind === 'admin') return { allowed: true, reason: 'admin' };

  switch (resource.access) {
    case 'public':
      return { allowed: true, reason: 'public' };
    case 'registered':
      return subject.userId ? { allowed: true, reason: 'registered' } : { allowed: false, reason: 'requires-login' };
    case 'premium': {
      if (!subject.userId) return { allowed: false, reason: 'requires-login' };
      // Conteúdo premium sem escopo declarado é tratado como bloqueado: falha fechada.
      if (resource.requiredScope && subject.scopes.has(resource.requiredScope)) {
        return { allowed: true, reason: 'entitled' };
      }
      return { allowed: false, reason: 'requires-entitlement' };
    }
  }
}

export function canManageContent(subject: AccessSubject): boolean {
  return subject.kind === 'admin';
}

export const ACCESS_LABEL: Record<AccessLevel, string> = {
  public: 'Gratuito',
  registered: 'Gratuito com cadastro',
  premium: 'Premium',
};

export const SUBJECT_LABEL: Record<AccessSubject['kind'], string> = {
  visitor: 'Visitante',
  registered: 'Conta gratuita',
  premium: 'Acesso premium',
  admin: 'Administrador',
};
