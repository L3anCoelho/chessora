/**
 * Persistência do progresso.
 * - Visitantes: salvo apenas neste navegador (localStorage), e a interface diz isso.
 * - Usuários logados: salvo no Supabase, nas tabelas game_results, challenge_progress
 *   e lesson_progress (cada usuário só lê e grava as próprias linhas, via RLS).
 */
import type { ChallengeRecord, GameRecord, LessonRecord, UserProgress } from '@/types/domain';
import { requireSupabase } from './supabase';
import { readJson, removeKey, writeJson } from '@/utils/storage';

export interface ProgressStore {
  readonly kind: 'local' | 'remote';
  load(): Promise<UserProgress>;
  recordGame(record: GameRecord): Promise<void>;
  recordChallengeAttempt(challengeId: string, solved: boolean): Promise<void>;
  completeLesson(lessonId: string): Promise<void>;
}

export const EMPTY_PROGRESS: UserProgress = { games: [], challenges: [], lessons: [] };

const LOCAL_KEY = 'xi:progress:v1';
const MAX_LOCAL_GAMES = 200;

/** Apaga o progresso salvo neste navegador (usado em Configurações). */
export function clearLocalProgress(): void {
  removeKey(LOCAL_KEY);
}

export class LocalProgressStore implements ProgressStore {
  readonly kind = 'local' as const;

  async load(): Promise<UserProgress> {
    const stored = readJson<UserProgress>(LOCAL_KEY);
    if (!stored || !Array.isArray(stored.games)) return { ...EMPTY_PROGRESS };
    return {
      games: stored.games ?? [],
      challenges: stored.challenges ?? [],
      lessons: stored.lessons ?? [],
    };
  }

  private async update(mutator: (progress: UserProgress) => UserProgress): Promise<void> {
    writeJson(LOCAL_KEY, mutator(await this.load()));
  }

  recordGame(record: GameRecord) {
    return this.update((progress) => ({
      ...progress,
      games: [record, ...progress.games].slice(0, MAX_LOCAL_GAMES),
    }));
  }

  recordChallengeAttempt(challengeId: string, solved: boolean) {
    return this.update((progress) => ({
      ...progress,
      challenges: upsertChallenge(progress.challenges, challengeId, solved),
    }));
  }

  completeLesson(lessonId: string) {
    return this.update((progress) =>
      progress.lessons.some((lesson) => lesson.lessonId === lessonId)
        ? progress
        : { ...progress, lessons: [...progress.lessons, { lessonId, completedAt: new Date().toISOString() }] },
    );
  }
}

export function upsertChallenge(list: ChallengeRecord[], challengeId: string, solved: boolean): ChallengeRecord[] {
  const now = new Date().toISOString();
  const existing = list.find((item) => item.challengeId === challengeId);
  if (!existing) return [...list, { challengeId, solved, attempts: 1, solvedAt: solved ? now : null }];
  return list.map((item) =>
    item.challengeId === challengeId
      ? {
          ...item,
          attempts: item.attempts + 1,
          solved: item.solved || solved,
          solvedAt: item.solvedAt ?? (solved ? now : null),
        }
      : item,
  );
}

export class SupabaseProgressStore implements ProgressStore {
  readonly kind = 'remote' as const;

  constructor(private readonly userId: string) {}

  async load(): Promise<UserProgress> {
    const client = requireSupabase();
    const [games, challenges, lessonRows] = await Promise.all([
      client
        .from('game_results')
        .select('id, mode, outcome, result, end_reason, engine_level, move_count, pgn, ended_at')
        .order('ended_at', { ascending: false })
        .limit(200),
      client.from('challenge_progress').select('challenge_id, solved, attempts, solved_at'),
      client.from('lesson_progress').select('lesson_id, completed_at'),
    ]);
    const error = games.error ?? challenges.error ?? lessonRows.error;
    if (error) throw new Error('Não foi possível carregar seu progresso.');
    return {
      games: (games.data ?? []).map(
        (row): GameRecord => ({
          id: row.id,
          mode: row.mode,
          outcome: row.outcome,
          result: row.result,
          endReason: row.end_reason,
          engineLevel: row.engine_level ?? undefined,
          moveCount: row.move_count,
          pgn: row.pgn,
          endedAt: row.ended_at,
        }),
      ),
      challenges: (challenges.data ?? []).map(
        (row): ChallengeRecord => ({
          challengeId: row.challenge_id,
          solved: row.solved,
          attempts: row.attempts,
          solvedAt: row.solved_at,
        }),
      ),
      lessons: (lessonRows.data ?? []).map((row): LessonRecord => ({ lessonId: row.lesson_id, completedAt: row.completed_at })),
    };
  }

  async recordGame(record: GameRecord) {
    const { error } = await requireSupabase().from('game_results').insert({
      user_id: this.userId,
      mode: record.mode,
      outcome: record.outcome,
      result: record.result,
      end_reason: record.endReason,
      engine_level: record.engineLevel ?? null,
      move_count: record.moveCount,
      pgn: record.pgn,
      ended_at: record.endedAt,
    });
    if (error) throw new Error('Não foi possível salvar a partida.');
  }

  async recordChallengeAttempt(challengeId: string, solved: boolean) {
    // A função SQL faz a contagem de tentativas de forma atômica no servidor.
    const { error } = await requireSupabase().rpc('record_challenge_attempt', {
      p_challenge_id: challengeId,
      p_solved: solved,
    });
    if (error) throw new Error('Não foi possível salvar o resultado do desafio.');
  }

  async completeLesson(lessonId: string) {
    const { error } = await requireSupabase()
      .from('lesson_progress')
      .upsert({ user_id: this.userId, lesson_id: lessonId }, { onConflict: 'user_id,lesson_id', ignoreDuplicates: true });
    if (error) throw new Error('Não foi possível salvar a aula concluída.');
  }
}
