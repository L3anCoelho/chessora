import type { Lesson, Module, UserProgress } from '@/types/domain';

export interface ProgressStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  /** Partidas locais entre duas pessoas: não contam como vitória ou derrota do usuário. */
  localGames: number;
  challengesSolved: number;
  challengesAttempted: number;
  lessonsCompleted: number;
}

export function computeStats(progress: UserProgress): ProgressStats {
  const computerGames = progress.games.filter((game) => game.mode === 'computer');
  return {
    gamesPlayed: progress.games.length,
    wins: computerGames.filter((game) => game.outcome === 'win').length,
    losses: computerGames.filter((game) => game.outcome === 'loss').length,
    draws: computerGames.filter((game) => game.outcome === 'draw').length,
    localGames: progress.games.filter((game) => game.mode === 'local').length,
    challengesSolved: progress.challenges.filter((challenge) => challenge.solved).length,
    challengesAttempted: progress.challenges.length,
    lessonsCompleted: progress.lessons.length,
  };
}

export interface ModuleProgress {
  module: Module;
  completed: number;
  available: number;
  total: number;
}

/** Progresso por módulo considerando apenas aulas publicadas. */
export function computeModuleProgress(
  module: Module,
  moduleLessons: Lesson[],
  progress: UserProgress,
): ModuleProgress {
  const done = new Set(progress.lessons.map((lesson) => lesson.lessonId));
  const published = moduleLessons.filter((lesson) => lesson.status === 'published');
  return {
    module,
    completed: published.filter((lesson) => done.has(lesson.id)).length,
    available: published.length,
    total: moduleLessons.length,
  };
}

/** Próxima aula publicada e não concluída, na ordem do curso. */
export function findNextLesson(
  orderedModules: { module: Module; lessons: Lesson[] }[],
  progress: UserProgress,
  isAllowed: (lesson: Lesson) => boolean,
): { module: Module; lesson: Lesson } | null {
  const done = new Set(progress.lessons.map((lesson) => lesson.lessonId));
  for (const { module, lessons } of orderedModules) {
    for (const lesson of lessons) {
      if (lesson.status === 'published' && !done.has(lesson.id) && isAllowed(lesson)) return { module, lesson };
    }
  }
  return null;
}
