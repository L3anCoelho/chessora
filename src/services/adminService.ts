/**
 * Consultas da área administrativa. Todas dependem de funções SQL que verificam
 * public.is_admin() no servidor: um usuário comum recebe erro mesmo chamando direto.
 */
import type { EntitlementSource, EntitlementStatus } from '@/types/domain';
import { requireSupabase } from './supabase';

export interface AdminProduct {
  id: string;
  name: string;
}

export interface AdminEntitlement {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  source: EntitlementSource;
  status: EntitlementStatus;
  startsAt: string;
  expiresAt: string | null;
  note: string | null;
}

/** Traduz erros das funções admin_* do banco para mensagens em português. */
export function translateAdminError(error: { message?: string } | null | undefined): string {
  const text = (error?.message ?? '').toLowerCase();
  if (/access denied|not authorized|not admin|permission denied|acesso negado|forbidden|insufficient/.test(text)) {
    return 'Acesso negado: sua conta não tem permissão de administrador.';
  }
  if (/user.*not found|usu[aá]rio.*n[aã]o encontrado|profile.*not found/.test(text)) return 'Usuário não encontrado.';
  if (/product.*not found|produto.*n[aã]o encontrado/.test(text)) return 'Produto não encontrado.';
  if (/entitlement.*not found|acesso.*n[aã]o encontrado/.test(text)) return 'Acesso não encontrado.';
  if (/future|futura|expires|validade/.test(text)) return 'A validade precisa ser uma data futura.';
  if (/not found|n[aã]o encontrado/.test(text)) return 'Registro não encontrado.';
  return 'Não foi possível concluir a operação. Tente novamente.';
}

export interface AdminUserRow {
  userId: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
  createdAt: string;
  activeEntitlements: number;
  lessonsCompleted: number;
  challengesSolved: number;
  gamesPlayed: number;
}

export const adminService = {
  async listUsers(): Promise<AdminUserRow[]> {
    const { data, error } = await requireSupabase().rpc('admin_list_users');
    if (error) throw new Error('Não foi possível carregar os usuários. Confirme que sua conta é administradora.');
    return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
      userId: row.user_id as string,
      email: row.email as string,
      displayName: (row.display_name as string | null) ?? '',
      role: row.role as 'user' | 'admin',
      createdAt: row.created_at as string,
      activeEntitlements: Number(row.active_entitlements ?? 0),
      lessonsCompleted: Number(row.lessons_completed ?? 0),
      challengesSolved: Number(row.challenges_solved ?? 0),
      gamesPlayed: Number(row.games_played ?? 0),
    }));
  },

  /** IDs de aulas e desafios premium que já têm conteúdo cadastrado no banco. */
  async listStoredPremiumContent(): Promise<{ lessons: Set<string>; challenges: Set<string> }> {
    const client = requireSupabase();
    const [lessonRows, challengeRows] = await Promise.all([
      client.from('lesson_contents').select('lesson_id'),
      client.from('challenge_contents').select('challenge_id'),
    ]);
    if (lessonRows.error || challengeRows.error) throw new Error('Não foi possível consultar o conteúdo no banco.');
    return {
      lessons: new Set((lessonRows.data ?? []).map((row) => row.lesson_id as string)),
      challenges: new Set((challengeRows.data ?? []).map((row) => row.challenge_id as string)),
    };
  },

  async listProducts(): Promise<AdminProduct[]> {
    const { data, error } = await requireSupabase().from('products').select('id, name').order('name');
    if (error) throw new Error('Não foi possível carregar a lista de produtos.');
    return (data ?? []).map((row) => ({ id: row.id as string, name: row.name as string }));
  },

  async listEntitlements(userId: string): Promise<AdminEntitlement[]> {
    const { data, error } = await requireSupabase()
      .from('entitlements')
      .select('*, products(name)')
      .eq('user_id', userId)
      .order('starts_at', { ascending: false });
    if (error) throw new Error('Não foi possível carregar os acessos desta pessoa.');
    return (data ?? []).map((row) => {
      const record = row as Record<string, unknown>;
      const product = record.products as { name?: string } | { name?: string }[] | null;
      const name = Array.isArray(product) ? product[0]?.name : product?.name;
      return {
        id: record.id as string,
        userId: record.user_id as string,
        productId: record.product_id as string,
        productName: name ?? (record.product_id as string),
        source: record.source as EntitlementSource,
        status: record.status as EntitlementStatus,
        startsAt: record.starts_at as string,
        expiresAt: (record.expires_at as string | null) ?? null,
        note: (record.note as string | null) ?? null,
      };
    });
  },

  async grantProduct(input: { userId: string; productId: string; expiresAt: string | null; note: string }): Promise<string> {
    const { data, error } = await requireSupabase().rpc('admin_grant_product', {
      p_user_id: input.userId,
      p_product_id: input.productId,
      p_expires_at: input.expiresAt,
      p_note: input.note.trim() || null,
    });
    if (error) throw new Error(translateAdminError(error));
    return data as string;
  },

  async revokeEntitlement(entitlementId: string): Promise<void> {
    const { error } = await requireSupabase().rpc('admin_revoke_entitlement', { p_entitlement_id: entitlementId });
    if (error) throw new Error(translateAdminError(error));
  },
};
