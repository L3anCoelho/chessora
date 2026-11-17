import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { GameRecord, UserProgress } from '@/types/domain';
import { useAuth } from '@/features/authentication/AuthProvider';
import {
  EMPTY_PROGRESS,
  LocalProgressStore,
  SupabaseProgressStore,
  upsertChallenge,
  type ProgressStore,
} from '@/services/progressStore';

interface ProgressContextValue {
  progress: UserProgress;
  storage: 'local' | 'remote';
  loading: boolean;
  error: string | null;
  recordGame: (record: GameRecord) => Promise<void>;
  recordChallengeAttempt: (challengeId: string, solved: boolean) => Promise<void>;
  completeLesson: (lessonId: string) => Promise<void>;
  reload: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const store = useMemo<ProgressStore | null>(() => {
    if (status === 'loading') return null;
    return status === 'signed-in' && user ? new SupabaseProgressStore(user.id) : new LocalProgressStore();
  }, [status, user]);

  const [progress, setProgress] = useState<UserProgress>(EMPTY_PROGRESS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!store) return;
    let active = true;
    setLoading(true);
    setError(null);
    store
      .load()
      .then((data) => active && setProgress(data))
      .catch((loadError: Error) => {
        if (!active) return;
        setProgress(EMPTY_PROGRESS);
        setError(loadError.message);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [store, reloadKey]);

  // As gravações atualizam a tela na hora e persistem em seguida; se a gravação falhar,
  // o erro sobe para quem chamou mostrar um aviso.
  const recordGame = useCallback(
    async (record: GameRecord) => {
      setProgress((current) => ({ ...current, games: [record, ...current.games] }));
      await store?.recordGame(record);
    },
    [store],
  );

  const recordChallengeAttempt = useCallback(
    async (challengeId: string, solved: boolean) => {
      setProgress((current) => ({ ...current, challenges: upsertChallenge(current.challenges, challengeId, solved) }));
      await store?.recordChallengeAttempt(challengeId, solved);
    },
    [store],
  );

  const completeLesson = useCallback(
    async (lessonId: string) => {
      setProgress((current) =>
        current.lessons.some((lesson) => lesson.lessonId === lessonId)
          ? current
          : { ...current, lessons: [...current.lessons, { lessonId, completedAt: new Date().toISOString() }] },
      );
      await store?.completeLesson(lessonId);
    },
    [store],
  );

  const value = useMemo<ProgressContextValue>(
    () => ({
      progress,
      storage: store?.kind ?? 'local',
      loading: loading || !store,
      error,
      recordGame,
      recordChallengeAttempt,
      completeLesson,
      reload: () => setReloadKey((key) => key + 1),
    }),
    [progress, store, loading, error, recordGame, recordChallengeAttempt, completeLesson],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress precisa estar dentro de ProgressProvider');
  return context;
}
