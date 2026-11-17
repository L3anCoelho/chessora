import { describe, expect, it } from 'vitest';
import type { UserEntitlement } from '@/types/domain';
import { buildSubject, canAccess, isEntitlementActive, VISITOR } from './access';

const entitlement = (patch: Partial<UserEntitlement> = {}): UserEntitlement => ({
  id: 'e1',
  userId: 'u1',
  productId: 'ebook',
  scopes: ['module:taticas'],
  source: 'purchase',
  status: 'active',
  externalReference: null,
  startsAt: '2026-01-01T00:00:00Z',
  expiresAt: null,
  ...patch,
});

const NOW = new Date('2026-06-01T00:00:00Z');
const premiumTaticas = { access: 'premium' as const, requiredScope: 'module:taticas' };

describe('controle de acesso', () => {
  it('visitante vê conteúdo público e nada mais', () => {
    expect(canAccess(VISITOR, { access: 'public' }).allowed).toBe(true);
    expect(canAccess(VISITOR, { access: 'registered' })).toEqual({ allowed: false, reason: 'requires-login' });
    expect(canAccess(VISITOR, premiumTaticas)).toEqual({ allowed: false, reason: 'requires-login' });
  });

  it('conta gratuita acessa conteúdo com cadastro, mas não premium', () => {
    const subject = buildSubject('u1', 'user', [], NOW);
    expect(subject.kind).toBe('registered');
    expect(canAccess(subject, { access: 'registered' }).allowed).toBe(true);
    expect(canAccess(subject, premiumTaticas)).toEqual({ allowed: false, reason: 'requires-entitlement' });
  });

  it('direito ativo libera apenas os escopos do produto', () => {
    const subject = buildSubject('u1', 'user', [entitlement()], NOW);
    expect(subject.kind).toBe('premium');
    expect(canAccess(subject, premiumTaticas).allowed).toBe(true);
    expect(canAccess(subject, { access: 'premium', requiredScope: 'module:finais' }).allowed).toBe(false);
  });

  it('reembolso, revogação, validade e início futuro não liberam acesso', () => {
    for (const patch of [
      { status: 'refunded' as const },
      { status: 'revoked' as const },
      { expiresAt: '2026-05-01T00:00:00Z' },
      { startsAt: '2026-07-01T00:00:00Z' },
    ]) {
      expect(isEntitlementActive(entitlement(patch), NOW)).toBe(false);
      expect(canAccess(buildSubject('u1', 'user', [entitlement(patch)], NOW), premiumTaticas).allowed).toBe(false);
    }
  });

  it('ignora direitos de outro usuário', () => {
    const subject = buildSubject('u2', 'user', [entitlement()], NOW);
    expect(canAccess(subject, premiumTaticas).allowed).toBe(false);
  });

  it('premium sem escopo declarado fica bloqueado (falha fechada)', () => {
    const subject = buildSubject('u1', 'user', [entitlement()], NOW);
    expect(canAccess(subject, { access: 'premium' }).allowed).toBe(false);
  });

  it('administrador acessa tudo', () => {
    const admin = buildSubject('a1', 'admin', [], NOW);
    expect(admin.kind).toBe('admin');
    expect(canAccess(admin, { access: 'premium' }).allowed).toBe(true);
  });
});
