import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env, isSupabaseConfigured } from '@/config/env';

/**
 * Cliente do Supabase com a chave pública (anon). A segurança dos dados depende das
 * políticas RLS definidas em supabase/migrations. A service_role key nunca entra aqui.
 *
 * null quando o projeto ainda não foi configurado: as telas mostram esse estado em vez
 * de simular login ou dados.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

export class BackendNotConfiguredError extends Error {
  constructor() {
    super('O Supabase ainda não foi configurado neste ambiente.');
    this.name = 'BackendNotConfiguredError';
  }
}

export function requireSupabase(): SupabaseClient {
  if (!supabase) throw new BackendNotConfiguredError();
  return supabase;
}
