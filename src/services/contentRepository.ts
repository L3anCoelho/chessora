/**
 * Camada de dados do conteúdo (aulas e desafios).
 *
 * Toda leitura de conteúdo passa por aqui, e o acesso é verificado ANTES de entregar o dado.
 * Conteúdo premium vem do banco, onde o RLS repete a verificação no servidor; mesmo que alguém
 * altere o JavaScript no navegador, o banco não entrega o conteúdo sem o direito de acesso.
 */
import type { AccessSubject, Challenge, ChallengeSummary, Lesson, LessonBlock, Module } from '@/types/domain';
import { lessons, modules } from '@/data/course';
import { freeChallenges, premiumChallengeSummaries } from '@/data/challenges';
import { canAccess, type AccessDecision } from '@/features/premium/access';
import { supabase } from './supabase';

export type ContentResult<T> =
  | { status: 'ok'; data: T }
  | { status: 'locked'; decision: Extract<AccessDecision, { allowed: false }> }
  | { status: 'coming-soon' }
  | { status: 'unavailable'; message: string }
  | { status: 'not-found' }
  | { status: 'error'; message: string };

const BACKEND_MISSING =
  'O conteúdo premium é entregue pelo servidor, que ainda não foi configurado neste ambiente.';

/* ---------- Módulos e aulas ---------- */

export function getModules(): Module[] {
  return [...modules].sort((a, b) => a.order - b.order);
}

export function getModuleBySlug(slug: string): Module | undefined {
  return modules.find((module) => module.slug === slug);
}

export function getModuleById(id: string): Module | undefined {
  return modules.find((module) => module.id === id);
}

export function getLessonsForModule(module: Module): Lesson[] {
  return module.lessonIds
    .map((id) => lessons.find((lesson) => lesson.id === id))
    .filter((lesson): lesson is Lesson => Boolean(lesson))
    .sort((a, b) => a.order - b.order);
}

export function getLessonBySlug(module: Module, slug: string): Lesson | undefined {
  return getLessonsForModule(module).find((lesson) => lesson.slug === slug);
}

export function getAllLessons(): Lesson[] {
  return lessons;
}

export async function loadLessonBody(lesson: Lesson, subject: AccessSubject): Promise<ContentResult<LessonBlock[]>> {
  if (lesson.status === 'coming-soon') return { status: 'coming-soon' };
  const decision = canAccess(subject, lesson);
  if (!decision.allowed) return { status: 'locked', decision };
  if (lesson.body) return { status: 'ok', data: lesson.body };
  if (!supabase) return { status: 'unavailable', message: BACKEND_MISSING };

  const { data, error } = await supabase
    .from('lesson_contents')
    .select('body')
    .eq('lesson_id', lesson.id)
    .maybeSingle();
  if (error) return { status: 'error', message: 'Não foi possível carregar a aula. Tente novamente.' };
  // Sem linha: ou o RLS negou (o servidor discorda da interface) ou o conteúdo ainda não foi cadastrado.
  if (!data) return { status: 'not-found' };
  return { status: 'ok', data: data.body as LessonBlock[] };
}

/* ---------- Desafios ---------- */

export type ChallengeListItem = ChallengeSummary & { isFree: boolean };

export function listChallenges(): ChallengeListItem[] {
  return [
    ...freeChallenges.map((challenge) => ({ ...summarize(challenge), isFree: true })),
    ...premiumChallengeSummaries.map((summary) => ({ ...summary, isFree: false })),
  ];
}

export function getChallengeSummary(id: string): ChallengeSummary | undefined {
  const free = freeChallenges.find((challenge) => challenge.id === id);
  return free ? summarize(free) : premiumChallengeSummaries.find((summary) => summary.id === id);
}

export async function loadChallenge(id: string, subject: AccessSubject): Promise<ContentResult<Challenge>> {
  const free = freeChallenges.find((challenge) => challenge.id === id);
  if (free) {
    const decision = canAccess(subject, free);
    return decision.allowed ? { status: 'ok', data: free } : { status: 'locked', decision };
  }
  const summary = premiumChallengeSummaries.find((item) => item.id === id);
  if (!summary) return { status: 'not-found' };
  const decision = canAccess(subject, summary);
  if (!decision.allowed) return { status: 'locked', decision };
  if (!supabase) return { status: 'unavailable', message: BACKEND_MISSING };

  const { data, error } = await supabase
    .from('challenge_contents')
    .select('fen, solution, alternative_first_moves, explanation, hint')
    .eq('challenge_id', id)
    .maybeSingle();
  if (error) return { status: 'error', message: 'Não foi possível carregar o desafio. Tente novamente.' };
  if (!data) return { status: 'not-found' };
  const fen = data.fen as string;
  return {
    status: 'ok',
    data: {
      ...summary,
      fen,
      sideToMove: (fen.split(' ')[1] as 'w' | 'b') ?? 'w',
      solution: data.solution as string[],
      alternativeFirstMoves: (data.alternative_first_moves as string[] | null) ?? undefined,
      explanation: data.explanation as string,
      hint: (data.hint as string | null) ?? undefined,
    },
  };
}

function summarize(challenge: Challenge): ChallengeSummary {
  const { id, title, description, objective, difficulty, category, access, requiredScope, goal } = challenge;
  return { id, title, description, objective, difficulty, category, access, requiredScope, goal };
}
