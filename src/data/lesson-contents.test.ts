/**
 * Confere o conteúdo premium lendo os arquivos SQL que vão para o banco.
 *
 * O teste roda sobre o artefato final (a migração e o seed), não sobre a fonte
 * de autoria: se o gerador errar, o teste falha. Toda posição e todo lance
 * passam pelo chess.js e pelos mesmos validadores que o site usa.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { Chess } from 'chess.js';
import type { LessonBlock } from '@/types/domain';
import { evaluateExerciseMove } from '@/features/challenges/validate';
import { compileGuidedLine } from '@/features/learning/logic/guidedLine';
import { lessons as catalog } from './course';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const MIGRATION = join(ROOT, 'supabase', 'migrations', '20261122120000_aulas_premium.sql');
const SEED = join(ROOT, 'supabase', 'seed.sql');
const LESSONS_DIR = join(ROOT, 'content', 'lessons');

interface StoredLesson {
  lessonId: string;
  moduleId: string;
  requiredScope: string;
  body: LessonBlock[];
  source: string;
}

/** Lê os insert ... into lesson_contents de um arquivo SQL. */
function parseLessonContents(file: string, label: string): StoredLesson[] {
  const sql = readFileSync(file, 'utf8');
  const pattern =
    /insert into public\.lesson_contents[\s\S]*?values \(\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*\$json\$([\s\S]*?)\$json\$::jsonb/g;
  const found: StoredLesson[] = [];
  for (const match of sql.matchAll(pattern)) {
    found.push({
      lessonId: match[1],
      moduleId: match[2],
      requiredScope: match[3],
      body: JSON.parse(match[4]) as LessonBlock[],
      source: label,
    });
  }
  return found;
}

const fromMigration = parseLessonContents(MIGRATION, 'migração');
const fromSeed = parseLessonContents(SEED, 'seed');
// O seed inclui o mesmo bloco gerado; a migração manda.
const stored = new Map<string, StoredLesson>();
for (const lesson of [...fromSeed, ...fromMigration]) stored.set(lesson.lessonId, lesson);
const all = [...stored.values()];

const SQUARE = /^[a-h][1-8]$/;

describe('aulas premium no banco', () => {
  it('a migração traz pelo menos uma aula e o SQL é legível', () => {
    expect(fromMigration.length).toBeGreaterThan(0);
    for (const lesson of all) {
      expect(Array.isArray(lesson.body), lesson.lessonId).toBe(true);
      expect(lesson.body.length, lesson.lessonId).toBeGreaterThan(0);
    }
  });

  it('toda aula premium publicada tem corpo no banco, e vice-versa', () => {
    const published = catalog
      .filter((lesson) => lesson.access === 'premium' && lesson.status === 'published')
      .map((lesson) => lesson.id)
      .sort();
    const inDatabase = all.map((lesson) => lesson.lessonId).sort();
    expect(inDatabase).toEqual(published);
  });

  it('módulo e escopo batem com o catálogo', () => {
    for (const lesson of all) {
      const entry = catalog.find((item) => item.id === lesson.lessonId);
      expect(entry, lesson.lessonId).toBeDefined();
      expect(lesson.moduleId, lesson.lessonId).toBe(entry!.moduleId);
      expect(lesson.requiredScope, lesson.lessonId).toBe(entry!.requiredScope);
    }
  });

  it('cada aula tem de 6 a 9 blocos e pelo menos 2 exercícios', () => {
    // As duas aulas de demonstração escritas à mão no seed (cravada e
    // controle-do-centro) são mais curtas e ficam de fora desta regra.
    for (const lesson of all.filter((item) => item.source === 'migração')) {
      expect(lesson.body.length, `${lesson.lessonId}: blocos`).toBeGreaterThanOrEqual(6);
      expect(lesson.body.length, `${lesson.lessonId}: blocos`).toBeLessThanOrEqual(9);
      const exercises = lesson.body.filter((block) => block.type === 'exercise');
      expect(exercises.length, `${lesson.lessonId}: exercícios`).toBeGreaterThanOrEqual(2);
    }
  });

  it('ids de exercício e de guia são únicos em todo o curso', () => {
    const ids = all.flatMap((lesson) =>
      lesson.body
        .filter((block) => block.type === 'exercise' || block.type === 'guided-line')
        .map((block) => (block as { id: string }).id),
    );
    expect(new Set(ids).size, `ids repetidos em ${ids.join(', ')}`).toBe(ids.length);
  });

  it('todo diagrama usa um FEN válido e casas que existem', () => {
    for (const lesson of all) {
      for (const block of lesson.body) {
        if (block.type !== 'diagram') continue;
        const label = `${lesson.lessonId}: diagrama`;
        expect(() => new Chess(block.fen), label).not.toThrow();
        for (const square of block.highlights ?? []) {
          expect(SQUARE.test(square), `${label}: destaque ${square}`).toBe(true);
        }
        if (block.showMovesFrom) {
          const chess = new Chess(block.fen);
          expect(chess.moves({ square: block.showMovesFrom as never }).length, label).toBeGreaterThan(0);
        }
        expect(block.caption.length, label).toBeGreaterThan(0);
      }
    }
  });

  it('todo exercício tem posição válida e respostas legais, aceitas pelo validador do site', () => {
    for (const lesson of all) {
      for (const block of lesson.body) {
        if (block.type !== 'exercise') continue;
        const label = `${lesson.lessonId}/${block.id}`;
        expect(() => new Chess(block.fen), label).not.toThrow();
        expect(block.acceptedMoves.length, label).toBeGreaterThan(0);
        for (const answer of block.acceptedMoves) {
          const chess = new Chess(block.fen);
          const move = chess.move(answer); // lance ilegal lança e quebra o teste
          expect(evaluateExerciseMove(block, move.san, chess), `${label}: ${answer}`).toBe(true);
          if (block.goal === 'checkmate') {
            expect(chess.isCheckmate(), `${label}: ${answer} precisa dar mate`).toBe(true);
          }
        }
        expect(block.successText.length, label).toBeGreaterThan(0);
      }
    }
  });

  it('exercícios de mate aceitam todos os mates em um da posição', () => {
    for (const lesson of all) {
      for (const block of lesson.body) {
        if (block.type !== 'exercise' || block.goal !== 'checkmate') continue;
        const chess = new Chess(block.fen);
        const mates = chess.moves().filter((san) => {
          chess.move(san);
          const mate = chess.isCheckmate();
          chess.undo();
          return mate;
        });
        expect(mates.length, `${lesson.lessonId}/${block.id}: a posição precisa ter mate`).toBeGreaterThan(0);
        // O validador do site aceita qualquer mate, então a lista declarada não pode mentir.
        for (const accepted of block.acceptedMoves) {
          expect(mates.map(strip), `${lesson.lessonId}/${block.id}`).toContain(strip(accepted));
        }
      }
    }
  });

  it('todo guia lance a lance roda inteiro no chess.js', () => {
    for (const lesson of all) {
      for (const block of lesson.body) {
        if (block.type !== 'guided-line') continue;
        const label = `${lesson.lessonId}/${block.id}`;
        const line = compileGuidedLine(block);
        expect(line.steps.length, label).toBe(block.steps.length);
        for (const step of line.steps) {
          expect(step.explanation.length, `${label}: passo ${step.index + 1}`).toBeGreaterThan(0);
          expect(() => new Chess(step.fenAfter), label).not.toThrow();
        }
        // A posição de cada passo é a posição final do passo anterior.
        for (let index = 1; index < line.steps.length; index += 1) {
          expect(line.steps[index].fenBefore, `${label}: passo ${index + 1}`).toBe(line.steps[index - 1].fenAfter);
        }
      }
    }
  });

  it('o SQL gerado bate com os arquivos de autoria em content/lessons', async () => {
    const { readdirSync } = await import('node:fs');
    const files = readdirSync(LESSONS_DIR).filter((name) => name.endsWith('.json'));
    expect(files.length, 'arquivos de autoria').toBeGreaterThan(0);
    for (const name of files) {
      const source = JSON.parse(readFileSync(join(LESSONS_DIR, name), 'utf8'));
      const target = stored.get(source.lessonId);
      expect(target, `${name}: não está no SQL`).toBeDefined();
      expect(JSON.parse(JSON.stringify(source.body)), `${name}: o SQL está desatualizado`).toEqual(target!.body);
    }
  });
});

function strip(san: string): string {
  return san.replace(/[+#?!]/g, '');
}
