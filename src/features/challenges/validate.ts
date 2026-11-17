import type { Chess } from 'chess.js';
import type { Challenge, LessonBlock } from '@/types/domain';
import { normalizeSan } from '@/features/chess/logic/rules';

export type ChallengeVerdict =
  | { kind: 'solved' }
  | { kind: 'continue'; reply: string }
  | { kind: 'wrong' };

/**
 * Avalia um lance do jogador num desafio.
 * @param plyIndex posição do lance na linha de solução (0, 2, 4…)
 * @param playedSan lance jogado, em SAN
 * @param after posição depois do lance (para reconhecer mates alternativos)
 */
export function evaluateChallengeMove(
  challenge: Pick<Challenge, 'solution' | 'alternativeFirstMoves' | 'goal'>,
  plyIndex: number,
  playedSan: string,
  after: Chess,
): ChallengeVerdict {
  const expected = challenge.solution[plyIndex];
  if (expected === undefined) return { kind: 'wrong' };
  const isLast = plyIndex === challenge.solution.length - 1;

  // Em desafios de mate, qualquer lance que dê mate no último passo resolve.
  if (challenge.goal === 'checkmate' && isLast && after.isCheckmate()) return { kind: 'solved' };

  const played = normalizeSan(playedSan);
  const accepted = [expected, ...(plyIndex === 0 ? (challenge.alternativeFirstMoves ?? []) : [])].map(normalizeSan);
  if (!accepted.includes(played)) return { kind: 'wrong' };
  if (isLast) return { kind: 'solved' };
  const reply = challenge.solution[plyIndex + 1];
  return reply ? { kind: 'continue', reply } : { kind: 'solved' };
}

type Exercise = Extract<LessonBlock, { type: 'exercise' }>;

export function evaluateExerciseMove(exercise: Exercise, playedSan: string, after: Chess): boolean {
  if (exercise.goal === 'checkmate' && after.isCheckmate()) return true;
  return exercise.acceptedMoves.map(normalizeSan).includes(normalizeSan(playedSan));
}
