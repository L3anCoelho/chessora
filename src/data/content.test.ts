import { describe, expect, it } from 'vitest';
import { Chess } from 'chess.js';
import { lessons, modules } from './course';
import { freeChallenges, premiumChallengeSummaries } from './challenges';
import { evaluateChallengeMove, evaluateExerciseMove } from '@/features/challenges/validate';
import { ebookProduct } from '@/config/ebook';

/** Todas as respostas de mate em 1 da posição. */
function matesInOne(fen: string): string[] {
  const chess = new Chess(fen);
  return chess.moves().filter((move) => {
    chess.move(move);
    const mate = chess.isCheckmate();
    chess.undo();
    return mate;
  });
}

/** Primeiros lances que forçam mate em 2. */
function mateInTwoKeys(fen: string): string[] {
  const chess = new Chess(fen);
  return chess.moves().filter((move) => {
    chess.move(move);
    const replies = chess.moves();
    const forced =
      !chess.isCheckmate() &&
      replies.length > 0 &&
      replies.every((reply) => {
        chess.move(reply);
        const hasMate = matesInOne(chess.fen()).length > 0;
        chess.undo();
        return hasMate;
      });
    chess.undo();
    return forced;
  });
}

describe('catálogo do curso', () => {
  it('cada módulo aponta para aulas existentes do próprio módulo', () => {
    for (const module of modules) {
      for (const id of module.lessonIds) {
        const lesson = lessons.find((item) => item.id === id);
        expect(lesson, `aula ${id}`).toBeDefined();
        expect(lesson?.moduleId).toBe(module.id);
      }
    }
  });

  it('slugs de aula são únicos dentro do módulo', () => {
    for (const module of modules) {
      const slugs = lessons.filter((lesson) => lesson.moduleId === module.id).map((lesson) => lesson.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });

  it('conteúdo premium nunca traz o corpo no pacote do site', () => {
    for (const lesson of lessons.filter((item) => item.access === 'premium')) {
      expect(lesson.body, lesson.id).toBeUndefined();
      expect(lesson.requiredScope, lesson.id).toBeTruthy();
    }
    for (const module of modules.filter((item) => item.access === 'premium')) {
      expect(ebookProduct.grantsScopes).toContain(module.requiredScope);
    }
  });

  it('aulas publicadas e gratuitas têm corpo', () => {
    for (const lesson of lessons.filter((item) => item.status === 'published' && item.access !== 'premium')) {
      expect(lesson.body?.length, lesson.id).toBeGreaterThan(0);
    }
  });

  it('diagramas e exercícios usam posições válidas e respostas legais', () => {
    for (const lesson of lessons) {
      for (const block of lesson.body ?? []) {
        if (block.type === 'diagram' && block.showMovesFrom) {
          const chess = new Chess(block.fen);
          expect(chess.moves({ square: block.showMovesFrom as never }).length, `${lesson.id} diagrama`).toBeGreaterThan(0);
        }
        if (block.type === 'exercise') {
          for (const answer of block.acceptedMoves) {
            const chess = new Chess(block.fen);
            const move = chess.move(answer);
            expect(evaluateExerciseMove(block, move.san, chess), `${block.id}: ${answer}`).toBe(true);
          }
        }
      }
    }
  });
});

describe('desafios gratuitos', () => {
  it('ids são únicos entre gratuitos e premium', () => {
    const ids = [...freeChallenges, ...premiumChallengeSummaries].map((challenge) => challenge.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const challenge of freeChallenges) {
    it(`${challenge.id}: a solução é legal e resolve o desafio`, () => {
      const chess = new Chess(challenge.fen);
      expect(chess.turn()).toBe(challenge.sideToMove);
      challenge.solution.forEach((san, index) => {
        const move = chess.move(san);
        if (index % 2 === 0) {
          const verdict = evaluateChallengeMove(challenge, index, move.san, chess);
          expect(verdict.kind).toBe(index === challenge.solution.length - 1 ? 'solved' : 'continue');
        }
      });
      if (challenge.goal === 'checkmate') expect(chess.isCheckmate()).toBe(true);
    });
  }

  it('o mate em 2 tem um único primeiro lance', () => {
    const challenge = freeChallenges.find((item) => item.id === 'mate-em-dois-corredor')!;
    expect(matesInOne(challenge.fen)).toEqual([]);
    expect(mateInTwoKeys(challenge.fen)).toEqual(['Rd8+']);
  });

  it('aceita mates alternativos e recusa lances errados', () => {
    const challenge = freeChallenges.find((item) => item.id === 'mate-dama-canto')!;
    const chess = new Chess(challenge.fen);
    expect(matesInOne(challenge.fen).sort()).toEqual(['Qb7#', 'Qh8#']);
    chess.move('Qb7#');
    expect(evaluateChallengeMove(challenge, 0, 'Qb7#', chess).kind).toBe('solved');
    const wrong = new Chess(challenge.fen);
    wrong.move('Qa1+');
    expect(evaluateChallengeMove(challenge, 0, 'Qa1+', wrong).kind).toBe('wrong');
  });

  it('desafios de ganhar material: toda defesa perde a peça', () => {
    const cases: [string, string, 'q' | 'n'][] = [
      ['garfo-rei-dama', 'Nf7+', 'q'],
      ['espeto-torre', 'Rh5+', 'q'],
      ['cravada-peao', 'd5', 'n'],
    ];
    for (const [id, key, target] of cases) {
      const chess = new Chess(freeChallenges.find((item) => item.id === id)!.fen);
      chess.move(key);
      for (const reply of chess.moves()) {
        chess.move(reply);
        const wins = chess.moves({ verbose: true }).some((move) => move.captured === target);
        expect(wins, `${id} depois de ${reply}`).toBe(true);
        chess.undo();
      }
    }
  });
});
