import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { AccessSubject, UserEntitlement, UserProfile } from '@/types/domain';
import { isSupabaseConfigured } from '@/config/env';
import { authService } from '@/services/authService';
import { buildSubject, VISITOR } from '@/features/premium/access';

export type AuthStatus = 'unconfigured' | 'loading' | 'signed-out' | 'signed-in';

interface AuthState {
  status: AuthStatus;
  user: { id: string; email: string } | null;
  profile: UserProfile | null;
  entitlements: UserEntitlement[];
  /** Erro ao carregar perfil ou direitos (a sessão continua válida). */
  loadError: string | null;
}

export interface AuthContextValue extends AuthState {
  subject: AccessSubject;
  isConfigured: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SIGNED_OUT: AuthState = { status: 'signed-out', user: null, profile: null, entitlements: [], loadError: null };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(
    isSupabaseConfigured ? { ...SIGNED_OUT, status: 'loading' } : { ...SIGNED_OUT, status: 'unconfigured' },
  );

  const loadUserData = useCallback(async (session: Session | null) => {
    if (!session) {
      setState(SIGNED_OUT);
      return;
    }
    const user = { id: session.user.id, email: session.user.email ?? '' };
    try {
      const [profile, entitlements] = await Promise.all([
        authService.fetchProfile(user.id),
        authService.fetchEntitlements(user.id),
      ]);
      setState({ status: 'signed-in', user, profile, entitlements, loadError: null });
    } catch {
      // Sem perfil/direitos carregados, o usuário fica com acesso de conta gratuita.
      setState({
        status: 'signed-in',
        user,
        profile: null,
        entitlements: [],
        loadError: 'Não foi possível carregar seu perfil e seus acessos. Recarregue a página.',
      });
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    authService.getSession().then((session) => {
      if (active) void loadUserData(session);
    });
    const unsubscribe = authService.onAuthChange((session) => {
      // Adia para fora do callback do Supabase, como recomenda a documentação.
      window.setTimeout(() => {
        if (active) void loadUserData(session);
      }, 0);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [loadUserData]);

  const refresh = useCallback(async () => {
    loadUserData(await authService.getSession());
  }, [loadUserData]);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setState(SIGNED_OUT);
  }, []);

  const subject = useMemo(
    () =>
      state.user ? buildSubject(state.user.id, state.profile?.role ?? 'user', state.entitlements) : VISITOR,
    [state.user, state.profile, state.entitlements],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, subject, isConfigured: isSupabaseConfigured, refresh, signOut }),
    [state, subject, refresh, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth precisa estar dentro de AuthProvider');
  return context;
}
