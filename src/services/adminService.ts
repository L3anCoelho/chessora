/**
 * Consultas da área administrativa. Todas dependem de funções SQL que verificam
 * public.is_admin() no servidor: um usuário comum recebe erro mesmo chamando direto.
 */
import { requireSupabase } from './supabase';

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
};
