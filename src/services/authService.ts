import type { AuthError, Session } from '@supabase/supabase-js';
import type { EntitlementSource, EntitlementStatus, UserEntitlement, UserProfile, UserRole } from '@/types/domain';
import { requireSupabase, supabase } from './supabase';

/** Traduz os erros mais comuns do Supabase Auth para mensagens claras. */
export function describeAuthError(error: AuthError | Error | null | undefined): string {
  if (!error) return 'Algo deu errado. Tente novamente.';
  const message = error.message.toLowerCase();
  if (message.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (message.includes('email not confirmed')) return 'Confirme seu e-mail pelo link que enviamos antes de entrar.';
  if (message.includes('already registered') || message.includes('already been registered'))
    return 'Já existe uma conta com este e-mail. Entre ou recupere a senha.';
  if (message.includes('password should be at least')) return 'A senha precisa ter pelo menos 8 caracteres.';
  if (message.includes('rate limit')) return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos.';
  if (message.includes('failed to fetch') || message.includes('network'))
    return 'Sem conexão com o servidor. Verifique sua internet.';
  return error.message;
}

function redirectUrl(path: string): string {
  return `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`;
}

export const authService = {
  async getSession(): Promise<Session | null> {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  onAuthChange(callback: (session: Session | null) => void): () => void {
    if (!supabase) return () => undefined;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
    return () => data.subscription.unsubscribe();
  },

  async signUp(email: string, password: string, displayName: string) {
    const { data, error } = await requireSupabase().auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName }, emailRedirectTo: redirectUrl('/progresso') },
    });
    if (error) throw new Error(describeAuthError(error));
    return { needsEmailConfirmation: !data.session };
  },

  async signIn(email: string, password: string) {
    const { error } = await requireSupabase().auth.signInWithPassword({ email, password });
    if (error) throw new Error(describeAuthError(error));
  },

  async signOut() {
    const { error } = await requireSupabase().auth.signOut();
    if (error) throw new Error(describeAuthError(error));
  },

  async requestPasswordReset(email: string) {
    const { error } = await requireSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl('/redefinir-senha'),
    });
    if (error) throw new Error(describeAuthError(error));
  },

  async updatePassword(password: string) {
    const { error } = await requireSupabase().auth.updateUser({ password });
    if (error) throw new Error(describeAuthError(error));
  },

  async fetchProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await requireSupabase()
      .from('profiles')
      .select('id, display_name, role, created_at')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      userId: data.id as string,
      displayName: (data.display_name as string | null) ?? '',
      role: (data.role as UserRole) ?? 'user',
      createdAt: data.created_at as string,
    };
  },

  async updateDisplayName(userId: string, displayName: string) {
    const { error } = await requireSupabase().from('profiles').update({ display_name: displayName }).eq('id', userId);
    if (error) throw new Error('Não foi possível salvar o nome. Tente novamente.');
  },

  /**
   * Direitos de acesso do usuário. A tabela só aceita leitura das próprias linhas (RLS);
   * criação e alteração acontecem apenas no backend.
   */
  async fetchEntitlements(userId: string): Promise<UserEntitlement[]> {
    const { data, error } = await requireSupabase()
      .from('entitlements')
      .select('id, user_id, product_id, source, status, external_reference, starts_at, expires_at, products(name, grants_scopes)')
      .eq('user_id', userId);
    if (error) throw error;
    return (data ?? []).map((row) => {
      const raw = row.products as unknown as
        | { name?: string; grants_scopes: string[] }
        | { name?: string; grants_scopes: string[] }[]
        | null;
      const product = Array.isArray(raw) ? raw[0] : raw;
      const grants = product?.grants_scopes ?? [];
      return {
        id: row.id as string,
        userId: row.user_id as string,
        productId: row.product_id as string,
        productName: product?.name,
        scopes: grants,
        source: row.source as EntitlementSource,
        status: row.status as EntitlementStatus,
        externalReference: (row.external_reference as string | null) ?? null,
        startsAt: row.starts_at as string,
        expiresAt: (row.expires_at as string | null) ?? null,
      };
    });
  },
};
