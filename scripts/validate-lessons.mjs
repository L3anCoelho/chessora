/**
 * Confere as aulas premium: estrutura, FENs, legalidade e, com o Stockfish,
 * se o lance aceito em cada exercício tático é mesmo o melhor.
 *
 * Uso:
 *   node scripts/validate-lessons.mjs            (tudo)
 *   node scripts/validate-lessons.mjs taticas    (só um módulo)
 *   node scripts/validate-lessons.mjs --no-engine
 */
import { Chess } from 'chess.js';
import { analyse, scoreOf, stopEngine } from './lib/engine.mjs';
import { checkLesson, findBlock, matesInOne, readLessonFiles } from './lib/lessons.mjs';

const args = process.argv.slice(2);
const useEngine = !args.includes('--no-engine');
const filter = args.find((arg) => !arg.startsWith('--'));

const DEFAULT_TIE_CP = 30;
const DEFAULT_MIN_GAP_CP = 150;

const problems = [];
const notes = [];

const lessons = readLessonFiles().filter((lesson) => !filter || lesson.moduleId === filter || lesson.lessonId === filter);
if (lessons.length === 0) {
  console.error(`Nenhuma aula encontrada para "${filter}".`);
  process.exit(1);
}

const seenExerciseIds = new Map();

for (const lesson of lessons) {
  problems.push(...checkLesson(lesson));
  for (const block of lesson.body ?? []) {
    if (block.type !== 'exercise' && block.type !== 'guided-line') continue;
    const previous = seenExerciseIds.get(block.id);
    if (previous) problems.push(`id repetido "${block.id}" em ${previous} e ${lesson.lessonId}`);
    seenExerciseIds.set(block.id, lesson.lessonId);
  }
  // Todo exercício precisa de uma checagem declarada, para nada passar batido.
  const exercises = (lesson.body ?? []).filter((block) => block.type === 'exercise');
  const checks = lesson.checks ?? [];
  for (const exercise of exercises) {
    if (!checks.some((check) => check.exerciseId === exercise.id)) {
      problems.push(`${lesson.lessonId}: exercício ${exercise.id} sem entrada em "checks"`);
    }
  }
  for (const check of checks) {
    if (!findBlock(lesson, check.exerciseId)) {
      problems.push(`${lesson.lessonId}: check aponta para ${check.exerciseId}, que não existe`);
    }
  }
}

for (const lesson of lessons) {
  for (const check of lesson.checks ?? []) {
    const exercise = findBlock(lesson, check.exerciseId);
    if (!exercise || exercise.type !== 'exercise') continue;
    const label = `${lesson.lessonId}/${exercise.id}`;

    if (check.mode === 'mate') {
      const mates = matesInOne(exercise.fen).map(norm).sort();
      const accepted = exercise.acceptedMoves.map(norm).sort();
      if (JSON.stringify(mates) !== JSON.stringify(accepted)) {
        problems.push(`${label}: mates em 1 são [${mates}], mas acceptedMoves é [${accepted}]`);
      }
      continue;
    }

    if (check.mode === 'wins-material') {
      problems.push(...checkWinsMaterial(label, exercise, check));
      continue;
    }

    if (check.mode === 'theory') {
      notes.push(`${label}: conferido só por legalidade (lance de teoria/convenção).`);
      continue;
    }

    if (check.mode === 'best') {
      if (!useEngine) {
        notes.push(`${label}: motor desligado, pulei a checagem do melhor lance.`);
        continue;
      }
      const tie = check.tie ?? DEFAULT_TIE_CP;
      const minGap = check.minGap ?? DEFAULT_MIN_GAP_CP;
      const ranked = await analyse(exercise.fen, { depth: check.depth ?? 18, multipv: check.multipv ?? 6 });
      if (ranked.length === 0) {
        problems.push(`${label}: o motor não devolveu lances`);
        continue;
      }
      const best = scoreOf(ranked[0]);
      const tied = ranked.filter((entry) => best - scoreOf(entry) <= tie).map((entry) => norm(entry.san));
      const accepted = exercise.acceptedMoves.map(norm);
      const missing = tied.filter((san) => !accepted.includes(san));
      const extra = accepted.filter((san) => !tied.includes(san));
      if (missing.length) problems.push(`${label}: falta em acceptedMoves: ${missing.join(', ')}`);
      if (extra.length) problems.push(`${label}: acceptedMoves tem lance que não é o melhor: ${extra.join(', ')}`);
      const next = ranked.find((entry) => !tied.includes(norm(entry.san)));
      const gap = next ? best - scoreOf(next) : Infinity;
      if (gap < minGap) {
        problems.push(
          `${label}: diferença para o próximo lance é só ${gap}cp (mínimo ${minGap}). ` +
            `Ranking: ${ranked.map((entry) => `${entry.san}=${fmt(entry)}`).join(' ')}`,
        );
      } else {
        notes.push(`${label}: ${ranked[0].san} ${fmt(ranked[0])}, vantagem de ${gap}cp sobre ${next?.san ?? '—'}.`);
      }
      continue;
    }

    problems.push(`${label}: modo de checagem desconhecido "${check.mode}"`);
  }
}

if (useEngine) await stopEngine();

for (const note of notes) console.log(`  · ${note}`);
console.log('');
if (problems.length) {
  console.error(`${problems.length} problema(s):`);
  for (const problem of problems) console.error(`  ✗ ${problem}`);
  process.exit(1);
}
console.log(`OK: ${lessons.length} aula(s) conferida(s).`);

function norm(san) {
  return san.replace(/[+#?!]/g, '');
}

function fmt(entry) {
  return entry.mate !== null ? `mate em ${entry.mate}` : `${entry.cp}cp`;
}

/**
 * Checagem exaustiva: depois do lance aceito, toda resposta do adversário
 * permite capturar a peça alvo. Não depende do motor.
 */
function checkWinsMaterial(label, exercise, check) {
  const found = [];
  for (const san of exercise.acceptedMoves) {
    const chess = new Chess(exercise.fen);
    chess.move(san);
    for (const reply of chess.moves()) {
      chess.move(reply);
      const wins = chess.moves({ verbose: true }).some((move) => move.captured === check.piece);
      if (!wins) found.push(`${label}: depois de ${san} ${reply}, não dá para capturar a peça "${check.piece}"`);
      chess.undo();
    }
  }
  return found;
}
